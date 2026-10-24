//go:build windows

package main

import (
	"crypto/ed25519"
	"embed"
	"encoding/base64"
	"encoding/json"
	"flag"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"syscall"
	"time"
	"unsafe"
)

//go:embed ui.html
var uiFS embed.FS

// --- Self-Hosted Ed25519 Offline License Verifier ---

const musicMindPublicKeyBase64 = "lKfWuwe6m2o92MiIRoKZOf3u41hxthu9mO7m7oRa8vY="

type LicensePayload struct {
	V   int    `json:"v"`
	P   string `json:"p"`
	E   string `json:"e"`
	T   string `json:"t"`
	S   int    `json:"s"`
	Iat int64  `json:"iat"`
}

func licenseKeyFilePath() string {
	home, err := os.UserHomeDir()
	if err != nil {
		home = "."
	}
	return filepath.Join(home, ".config", "displays", "license.key")
}

func verifyLicenseKey(rawKey string) *LicensePayload {
	trimmed := strings.TrimSpace(rawKey)
	if !strings.HasPrefix(trimmed, "MM1-") {
		return nil
	}
	parts := strings.SplitN(strings.TrimPrefix(trimmed, "MM1-"), ".", 2)
	if len(parts) != 2 {
		return nil
	}
	pubBytes, err := base64.StdEncoding.DecodeString(musicMindPublicKeyBase64)
	if err != nil || len(pubBytes) != ed25519.PublicKeySize {
		return nil
	}
	sigBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil || len(sigBytes) != ed25519.SignatureSize {
		return nil
	}
	if !ed25519.Verify(ed25519.PublicKey(pubBytes), []byte(parts[0]), sigBytes) {
		return nil
	}
	payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return nil
	}
	var p LicensePayload
	if json.Unmarshal(payloadBytes, &p) != nil {
		return nil
	}
	return &p
}

func loadVerifiedWindowsLicense() *LicensePayload {
	data, err := os.ReadFile(licenseKeyFilePath())
	if err != nil {
		return nil
	}
	return verifyLicenseKey(string(data))
}

// --- Schema v3 (100% compatible with macOS Displays.app ~/.config/displays/presets.json) ---

type MonitorRecord struct {
	ID             string `json:"id"`
	Label          string `json:"label"`
	Note           string `json:"note"`
	Icon           string `json:"icon"`
	IgnoredInSpace bool   `json:"ignoredInSpace"`
}

type DisplayPreset struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Subtitle string `json:"subtitle"`
	Icon     string `json:"icon"`
	Command  string `json:"command"`
}

type MachineFolder struct {
	ID             string            `json:"id"`
	Name           string            `json:"name"`
	Description    string            `json:"description"`
	SignatureUUIDs []string          `json:"signatureUUIDs"`
	DisplayAliases map[string]string `json:"displayAliases"`
	Monitors       []MonitorRecord   `json:"monitors"`
	Presets        []DisplayPreset   `json:"presets"`
}

type PresetsRoot struct {
	Version             int             `json:"version"`
	SelectedFolderID    string          `json:"selectedFolderID"`
	LastAppliedPresetID string          `json:"lastAppliedPresetID,omitempty"`
	Folders             []MachineFolder `json:"folders"`
}

type ConnectedDisplay struct {
	ID         string `json:"id"`
	DeviceName string `json:"deviceName"`
	Name       string `json:"name"`
	Resolution string `json:"resolution"`
	Width      int    `json:"width"`
	Height     int    `json:"height"`
	Hz         int    `json:"hz"`
	OriginX    int    `json:"originX"`
	OriginY    int    `json:"originY"`
	Enabled    bool   `json:"enabled"`
	IsMain     bool   `json:"isMain"`
	IsMirrored bool   `json:"isMirrored"`
	IsBuiltIn  bool   `json:"isBuiltIn"`
}

// --- Win32 Display API (user32.dll) ---

var (
	user32                     = syscall.NewLazyDLL("user32.dll")
	procEnumDisplayDevicesW    = user32.NewProc("EnumDisplayDevicesW")
	procEnumDisplaySettingsExW = user32.NewProc("EnumDisplaySettingsExW")
	procChangeDisplaySettingsExW = user32.NewProc("ChangeDisplaySettingsExW")
)

const (
	DISPLAY_DEVICE_ATTACHED_TO_DESKTOP = 0x00000001
	DISPLAY_DEVICE_PRIMARY_DEVICE      = 0x00000004
	DISPLAY_DEVICE_MIRRORING_DRIVER    = 0x00000008

	ENUM_CURRENT_SETTINGS  = 0xFFFFFFFF
	ENUM_REGISTRY_SETTINGS = 0xFFFFFFFE

	DM_POSITION         = 0x00000020
	DM_PELSWIDTH        = 0x00080000
	DM_PELSHEIGHT       = 0x00100000
	DM_DISPLAYFREQUENCY = 0x00400000

	CDS_UPDATEREGISTRY = 0x00000001
	CDS_SET_PRIMARY    = 0x00000010
	CDS_NORESET        = 0x10000000
)

type DISPLAY_DEVICEW struct {
	Cb           uint32
	DeviceName   [32]uint16
	DeviceString [128]uint16
	StateFlags   uint32
	DeviceID     [128]uint16
	DeviceKey    [128]uint16
}

type DEVMODEW struct {
	DeviceName         [32]uint16
	SpecVersion        uint16
	DriverVersion      uint16
	Size               uint16
	DriverExtra        uint16
	Fields             uint32
	PositionX          int32
	PositionY          int32
	DisplayOrientation uint32
	DisplayFixedOutput uint32
	Color              int16
	Duplex             int16
	YResolution        int16
	TTOption           int16
	Collate            int16
	FormName           [32]uint16
	LogPixels          uint16
	BitsPerPel         uint32
	PelsWidth          uint32
	PelsHeight         uint32
	DisplayFlags       uint32
	DisplayFrequency   uint32
	ICMMethod          uint32
	ICMIntent          uint32
	MediaType          uint32
	DitherType         uint32
	Reserved1          uint32
	Reserved2          uint32
	PanningWidth       uint32
	PanningHeight      uint32
}

func utf16ToString(buf []uint16) string {
	return syscall.UTF16ToString(buf)
}

func enumerateWindowsDisplays(aliases map[string]string) []ConnectedDisplay {
	var list []ConnectedDisplay
	var origins = make(map[string]int)

	for i := uint32(0); i < 16; i++ {
		var dd DISPLAY_DEVICEW
		dd.Cb = uint32(unsafe.Sizeof(dd))
		r, _, _ := procEnumDisplayDevicesW.Call(0, uintptr(i), uintptr(unsafe.Pointer(&dd)), 0)
		if r == 0 {
			break
		}
		if (dd.StateFlags & DISPLAY_DEVICE_MIRRORING_DRIVER) != 0 {
			continue
		}
		devName := utf16ToString(dd.DeviceName[:])
		adapterStr := utf16ToString(dd.DeviceString[:])
		attached := (dd.StateFlags & DISPLAY_DEVICE_ATTACHED_TO_DESKTOP) != 0
		isPrimary := (dd.StateFlags & DISPLAY_DEVICE_PRIMARY_DEVICE) != 0

		// Query monitor child device for friendly monitor name
		var monDD DISPLAY_DEVICEW
		monDD.Cb = uint32(unsafe.Sizeof(monDD))
		devNamePtr, _ := syscall.UTF16PtrFromString(devName)
		rMon, _, _ := procEnumDisplayDevicesW.Call(uintptr(unsafe.Pointer(devNamePtr)), 0, uintptr(unsafe.Pointer(&monDD)), 0)
		monName := ""
		monHardwareID := devName
		if rMon != 0 {
			monName = utf16ToString(monDD.DeviceString[:])
			rawID := utf16ToString(monDD.DeviceID[:])
			if rawID != "" {
				parts := strings.Split(rawID, "\\")
				if len(parts) >= 2 {
					monHardwareID = parts[1] + "-" + strings.TrimPrefix(devName, "\\\\.\\")
				}
			}
		}
		if !attached && monName == "" {
			continue
		}

		var dm DEVMODEW
		dm.Size = uint16(unsafe.Sizeof(dm))
		rSet, _, _ := procEnumDisplaySettingsExW.Call(
			uintptr(unsafe.Pointer(devNamePtr)),
			uintptr(ENUM_CURRENT_SETTINGS),
			uintptr(unsafe.Pointer(&dm)),
			0,
		)
		if rSet == 0 {
			procEnumDisplaySettingsExW.Call(
				uintptr(unsafe.Pointer(devNamePtr)),
				uintptr(ENUM_REGISTRY_SETTINGS),
				uintptr(unsafe.Pointer(&dm)),
				0,
			)
		}

		width := int(dm.PelsWidth)
		height := int(dm.PelsHeight)
		if width == 0 {
			width = 1920
			height = 1080
		}
		hz := int(dm.DisplayFrequency)
		if hz == 0 {
			hz = 60
		}
		ox := int(dm.PositionX)
		oy := int(dm.PositionY)
		coordKey := fmt.Sprintf("%d,%d", ox, oy)
		if attached {
			origins[coordKey]++
		}

		label := aliases[monHardwareID]
		if label == "" {
			label = aliases[devName]
		}
		if label == "" {
			if monName != "" && monName != "Generic PnP Monitor" {
				label = monName
			} else if adapterStr != "" {
				label = fmt.Sprintf("Display %d (%s)", len(list)+1, strings.TrimPrefix(devName, "\\\\.\\"))
			} else {
				label = strings.TrimPrefix(devName, "\\\\.\\")
			}
		}

		isBuiltIn := strings.Contains(strings.ToLower(monName), "internal") ||
			strings.Contains(strings.ToLower(monName), "integrated") ||
			(i == 0 && strings.Contains(strings.ToLower(label), "laptop"))

		list = append(list, ConnectedDisplay{
			ID:         monHardwareID,
			DeviceName: devName,
			Name:       label,
			Resolution: fmt.Sprintf("%dx%d", width, height),
			Width:      width,
			Height:     height,
			Hz:         hz,
			OriginX:    ox,
			OriginY:    oy,
			Enabled:    attached,
			IsMain:     isPrimary,
			IsMirrored: false,
			IsBuiltIn:  isBuiltIn,
		})
	}

	for idx := range list {
		key := fmt.Sprintf("%d,%d", list[idx].OriginX, list[idx].OriginY)
		if list[idx].Enabled && origins[key] > 1 {
			list[idx].IsMirrored = true
		}
	}

	return list
}

// Execute preset command on Windows using DisplaySwitch.exe and Win32 ChangeDisplaySettingsExW
func executeWindowsPresetCommand(cmd string, displays []ConnectedDisplay) error {
	trimmed := strings.TrimSpace(cmd)

	// 1. Direct Windows DisplaySwitch shortcuts
	switch trimmed {
	case "@win:clone", "@dynamic:mirror_all":
		return exec.Command("DisplaySwitch.exe", "/clone").Run()
	case "@win:extend", "@dynamic:extend_all":
		return exec.Command("DisplaySwitch.exe", "/extend").Run()
	case "@win:internal", "@dynamic:laptop_only":
		return exec.Command("DisplaySwitch.exe", "/internal").Run()
	case "@win:external":
		return exec.Command("DisplaySwitch.exe", "/external").Run()
	}

	// 2. Parse displayplacer-compatible command segments: "id:A+B res:1920x1080 ... origin:(0,0)" or "id:C enabled:false"
	// If all screens are in a single mirrored group, invoke DisplaySwitch.exe /clone
	segments := parseQuotedSegments(trimmed)
	if len(segments) == 1 && strings.Contains(segments[0], "+") && !strings.Contains(segments[0], "enabled:false") {
		return exec.Command("DisplaySwitch.exe", "/clone").Run()
	}

	// Map symbolic IDs (POWAY-DESK-MONITOR, POWAY-KVM-TV, etc.) to connected Windows displays
	dispByID := make(map[string]ConnectedDisplay)
	var unmatched []ConnectedDisplay
	for _, d := range displays {
		dispByID[d.ID] = d
		dispByID[d.DeviceName] = d
		if !strings.Contains(trimmed, d.ID) && !strings.Contains(trimmed, d.DeviceName) {
			unmatched = append(unmatched, d)
		}
	}

	resolveDisp := func(rawID string) (ConnectedDisplay, bool) {
		if d, ok := dispByID[rawID]; ok {
			return d, true
		}
		if len(unmatched) > 0 {
			d := unmatched[0]
			unmatched = unmatched[1:]
			dispByID[rawID] = d
			return d, true
		}
		return ConnectedDisplay{}, false
	}

	// First ensure extended desktop is active when positioning multiple displays
	if len(segments) > 1 {
		_ = exec.Command("DisplaySwitch.exe", "/extend").Run()
		time.Sleep(350 * time.Millisecond)
	}

	for segIdx, seg := range segments {
		tokens := strings.Fields(seg)
		var idPart string
		var ox, oy int
		isOff := strings.Contains(strings.ToLower(seg), "enabled:false")

		for _, tok := range tokens {
			if strings.HasPrefix(tok, "id:") {
				idPart = strings.TrimPrefix(tok, "id:")
			} else if strings.HasPrefix(tok, "origin:(") {
				coords := strings.TrimSuffix(strings.TrimPrefix(tok, "origin:("), ")")
				fmt.Sscanf(coords, "%d,%d", &ox, &oy)
			}
		}

		ids := strings.Split(idPart, "+")
		for uIdx, rawID := range ids {
			d, ok := resolveDisp(rawID)
			if !ok {
				continue
			}
			devPtr, _ := syscall.UTF16PtrFromString(d.DeviceName)
			var dm DEVMODEW
			dm.Size = uint16(unsafe.Sizeof(dm))
			procEnumDisplaySettingsExW.Call(uintptr(unsafe.Pointer(devPtr)), uintptr(ENUM_CURRENT_SETTINGS), uintptr(unsafe.Pointer(&dm)), 0)

			if isOff {
				dm.Fields = DM_POSITION | DM_PELSWIDTH | DM_PELSHEIGHT
				dm.PelsWidth = 0
				dm.PelsHeight = 0
				procChangeDisplaySettingsExW.Call(
					uintptr(unsafe.Pointer(devPtr)),
					uintptr(unsafe.Pointer(&dm)),
					0,
					uintptr(CDS_UPDATEREGISTRY|CDS_NORESET),
					0,
				)
			} else {
				dm.Fields = DM_POSITION | DM_PELSWIDTH | DM_PELSHEIGHT
				if dm.PelsWidth == 0 {
					dm.PelsWidth = 1920
					dm.PelsHeight = 1080
				}
				dm.PositionX = int32(ox)
				dm.PositionY = int32(oy)
				flags := uint32(CDS_UPDATEREGISTRY | CDS_NORESET)
				if segIdx == 0 && uIdx == 0 && ox == 0 {
					flags |= CDS_SET_PRIMARY
				}
				procChangeDisplaySettingsExW.Call(
					uintptr(unsafe.Pointer(devPtr)),
					uintptr(unsafe.Pointer(&dm)),
					0,
					uintptr(flags),
					0,
				)
			}
		}
	}

	// Commit all display changes atomically
	procChangeDisplaySettingsExW.Call(0, 0, 0, 0, 0)
	return nil
}

func parseQuotedSegments(cmd string) []string {
	var out []string
	inQuote := false
	var cur strings.Builder
	for _, ch := range cmd {
		if ch == '"' {
			if inQuote {
				out = append(out, cur.String())
				cur.Reset()
				inQuote = false
			} else {
				inQuote = true
			}
		} else if inQuote {
			cur.WriteRune(ch)
		}
	}
	return out
}

// --- Store & Config Persistence ---

type Store struct {
	mu         sync.Mutex
	ConfigPath string
	Root       PresetsRoot
	Connected  []ConnectedDisplay
}

func configFilePath() string {
	home, err := os.UserHomeDir()
	if err != nil {
		home = "."
	}
	return filepath.Join(home, ".config", "displays", "presets.json")
}

func defaultPowaySeed() PresetsRoot {
	poway := MachineFolder{
		ID:             "poway-home",
		Name:           "Poway Home",
		Description:    "Poway Home · Desk Monitor + Samsung TV (via KVM Switch) + PC / Laptop Display",
		SignatureUUIDs: []string{},
		DisplayAliases: map[string]string{
			"POWAY-DESK-MONITOR": "Desk Monitor",
			"POWAY-KVM-TV":       "Samsung TV (KVM)",
			"POWAY-PC-SCREEN":    "PC / Laptop",
		},
		Monitors: []MonitorRecord{
			{ID: "POWAY-DESK-MONITOR", Label: "Desk Monitor", Note: "Poway Desk", Icon: "display", IgnoredInSpace: false},
			{ID: "POWAY-KVM-TV", Label: "Samsung TV (KVM)", Note: "Room TV via KVM", Icon: "tv.fill", IgnoredInSpace: false},
			{ID: "POWAY-PC-SCREEN", Label: "PC / Laptop", Note: "Nearby on Desk", Icon: "laptopcomputer", IgnoredInSpace: false},
		},
		Presets: []DisplayPreset{
			{
				ID:       "poway-extend-all-3",
				Name:     "All Displays Extended · Desk Monitor + PC + TV (KVM)",
				Subtitle: "Uses Desk Monitor as Main with PC screen and KVM Samsung TV as separate extended desktops",
				Icon:     "rectangle.split.3x1.fill",
				Command:  `displayplacer "id:POWAY-DESK-MONITOR res:1920x1080 origin:(0,0)" "id:POWAY-PC-SCREEN res:1920x1080 origin:(-1920,0)" "id:POWAY-KVM-TV res:1920x1080 origin:(1920,0)"`,
			},
			{
				ID:       "poway-mirror-desk-tv",
				Name:     "Mirror Desk Monitor + TV (KVM)",
				Subtitle: "Desk Monitor and Samsung TV (via KVM) show the exact same 1080p screen",
				Icon:     "rectangle.on.rectangle.circle.fill",
				Command:  `displayplacer "id:POWAY-DESK-MONITOR+POWAY-KVM-TV+POWAY-PC-SCREEN res:1920x1080 origin:(0,0)"`,
			},
			{
				ID:       "poway-desk-only-tv-off",
				Name:     "Desk Monitor + PC Only · Mute TV (KVM)",
				Subtitle: "Keeps Desk Monitor and PC screen active; turns off KVM TV output",
				Icon:     "eye.slash.fill",
				Command:  `displayplacer "id:POWAY-DESK-MONITOR res:1920x1080 origin:(0,0)" "id:POWAY-PC-SCREEN res:1920x1080 origin:(1920,0)" "id:POWAY-KVM-TV enabled:false"`,
			},
			{
				ID:       "poway-tv-main",
				Name:     "Samsung TV (KVM) Only · Big Screen Watch Mode",
				Subtitle: "Routes picture exclusively to Samsung TV via KVM",
				Icon:     "tv.and.mediabox",
				Command:  `@win:external`,
			},
		},
	}

	return PresetsRoot{
		Version:          3,
		SelectedFolderID: poway.ID,
		Folders:          []MachineFolder{poway},
	}
}

func NewStore() *Store {
	s := &Store{ConfigPath: configFilePath()}
	s.loadOrSeed()
	s.Refresh()
	return s
}

func (s *Store) loadOrSeed() {
	data, err := os.ReadFile(s.ConfigPath)
	if err == nil {
		var root PresetsRoot
		if json.Unmarshal(data, &root) == nil && len(root.Folders) > 0 {
			s.Root = root
			return
		}
	}
	s.Root = defaultPowaySeed()
	s.Save()
}

func (s *Store) Save() {
	_ = os.MkdirAll(filepath.Dir(s.ConfigPath), 0755)
	data, err := json.MarshalIndent(s.Root, "", "  ")
	if err == nil {
		_ = os.WriteFile(s.ConfigPath, data, 0644)
	}
}

func (s *Store) Refresh() {
	s.mu.Lock()
	defer s.mu.Unlock()
	aliases := make(map[string]string)
	for _, f := range s.Root.Folders {
		for k, v := range f.DisplayAliases {
			aliases[k] = v
		}
		for _, m := range f.Monitors {
			aliases[m.ID] = m.Label
		}
	}
	s.Connected = enumerateWindowsDisplays(aliases)
}

func launchAppWindow(url string) {
	// Try Microsoft Edge in frameless native --app mode (pre-installed on all Windows 10/11 PCs)
	edgePaths := []string{
		`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`,
		`C:\Program Files\Microsoft\Edge\Application\msedge.exe`,
	}
	for _, p := range edgePaths {
		if _, err := os.Stat(p); err == nil {
			_ = exec.Command(p, "--app="+url, "--window-size=680,760").Start()
			return
		}
	}
	_ = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
}

func main() {
	listFlag := flag.Bool("list", false, "List configured spaces and presets")
	applyFlag := flag.String("apply", "", "Apply preset by ID or name substring")
	portFlag := flag.Int("port", 0, "Local UI port (0 = auto)")
	flag.Parse()

	store := NewStore()

	if *listFlag || (len(os.Args) > 1 && os.Args[1] == "list") {
		for _, f := range store.Root.Folders {
			fmt.Printf("Space: %s (%s)\n", f.Name, f.Description)
			for i, p := range f.Presets {
				fmt.Printf("  [%d] %s (%s)\n      %s\n", i+1, p.Name, p.ID, p.Subtitle)
			}
		}
		return
	}

	if *applyFlag != "" || (len(os.Args) > 2 && os.Args[1] == "apply") {
		target := *applyFlag
		if target == "" {
			target = strings.Join(os.Args[2:], " ")
		}
		q := strings.ToLower(target)
		for _, f := range store.Root.Folders {
			for _, p := range f.Presets {
				if strings.ToLower(p.ID) == q || strings.Contains(strings.ToLower(p.Name), q) {
					_ = executeWindowsPresetCommand(p.Command, store.Connected)
					store.Root.LastAppliedPresetID = p.ID
					store.Save()
					fmt.Printf("Applied: %s\n", p.Name)
					return
				}
			}
		}
		os.Exit(1)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/state", func(w http.ResponseWriter, r *http.Request) {
		store.Refresh()
		store.mu.Lock()
		defer store.mu.Unlock()
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"platform":  runtime.GOOS,
			"root":      store.Root,
			"connected": store.Connected,
			"license":   loadVerifiedWindowsLicense(),
		})
	})

	mux.HandleFunc("/api/license", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Key string `json:"key"`
		}
		_ = json.NewDecoder(r.Body).Decode(&req)
		w.Header().Set("Content-Type", "application/json")
		payload := verifyLicenseKey(req.Key)
		if payload == nil {
			_ = json.NewEncoder(w).Encode(map[string]any{"ok": false, "error": "Invalid Ed25519 signature or malformed MM1- key"})
			return
		}
		_ = os.MkdirAll(filepath.Dir(licenseKeyFilePath()), 0755)
		_ = os.WriteFile(licenseKeyFilePath(), []byte(strings.TrimSpace(req.Key)), 0644)
		_ = json.NewEncoder(w).Encode(map[string]any{"ok": true, "license": payload})
	})

	mux.HandleFunc("/api/apply", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			PresetID string `json:"presetId"`
			Command  string `json:"command"`
		}
		_ = json.NewDecoder(r.Body).Decode(&req)
		store.Refresh()
		err := executeWindowsPresetCommand(req.Command, store.Connected)
		store.mu.Lock()
		if req.PresetID != "" {
			store.Root.LastAppliedPresetID = req.PresetID
			store.Save()
		}
		store.mu.Unlock()
		store.Refresh()
		w.Header().Set("Content-Type", "application/json")
		if err != nil {
			_ = json.NewEncoder(w).Encode(map[string]any{"ok": false, "error": err.Error()})
			return
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"ok": true})
	})

	mux.HandleFunc("/api/save", func(w http.ResponseWriter, r *http.Request) {
		var updated PresetsRoot
		if err := json.NewDecoder(r.Body).Decode(&updated); err == nil && len(updated.Folders) > 0 {
			store.mu.Lock()
			store.Root = updated
			store.Save()
			store.mu.Unlock()
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{"ok": true})
	})

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		data, _ := uiFS.ReadFile("ui.html")
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write(data)
	})

	ln, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", *portFlag))
	if err != nil {
		return
	}
	url := "http://" + ln.Addr().String()
	go launchAppWindow(url)
	_ = http.Serve(ln, mux)
}
