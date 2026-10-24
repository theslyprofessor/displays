//go:build linux

package main

import (
	"bytes"
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
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"sync"
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

func loadVerifiedLicense() *LicensePayload {
	data, err := os.ReadFile(licenseKeyFilePath())
	if err != nil {
		return nil
	}
	return verifyLicenseKey(string(data))
}

// --- Schema v3 (100% compatible with macOS Displays.app & Windows ScreenStage.exe ~/.config/displays/presets.json) ---

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

// Parse EDID 128-byte binary block from /sys/class/drm/card*-*/edid for monitor model & PnP ID
func parseEDIDMonitorName(edid []byte) (modelName string, pnpID string) {
	if len(edid) < 128 {
		return "", ""
	}
	// PnP 3-letter manufacturer ID at bytes 8..9
	mfgWord := (uint16(edid[8]) << 8) | uint16(edid[9])
	c1 := byte(((mfgWord >> 10) & 0x1F) + 'A' - 1)
	c2 := byte(((mfgWord >> 5) & 0x1F) + 'A' - 1)
	c3 := byte((mfgWord & 0x1F) + 'A' - 1)
	if c1 >= 'A' && c1 <= 'Z' && c2 >= 'A' && c2 <= 'Z' && c3 >= 'A' && c3 <= 'Z' {
		pnpID = string([]byte{c1, c2, c3})
	}
	// 4 x 18-byte descriptor blocks starting at byte 54
	for offset := 54; offset+18 <= 126; offset += 18 {
		if edid[offset] == 0 && edid[offset+1] == 0 && edid[offset+2] == 0 && edid[offset+3] == 0xFC {
			raw := edid[offset+5 : offset+18]
			if nl := bytes.IndexByte(raw, '\n'); nl >= 0 {
				raw = raw[:nl]
			}
			modelName = strings.TrimSpace(string(raw))
			break
		}
	}
	return modelName, pnpID
}

func readDRMMonitorMetadata() map[string]struct{ Model, ID string } {
	out := make(map[string]struct{ Model, ID string })
	matches, _ := filepath.Glob("/sys/class/drm/card*-*/edid")
	for _, edidPath := range matches {
		dir := filepath.Dir(edidPath)
		base := filepath.Base(dir) // e.g. card0-DP-1 or card1-HDMI-A-1
		parts := strings.SplitN(base, "-", 2)
		if len(parts) < 2 {
			continue
		}
		conn := parts[1]
		normConn := strings.ReplaceAll(conn, "HDMI-A-", "HDMI-")
		data, err := os.ReadFile(edidPath)
		if err != nil || len(data) < 128 {
			continue
		}
		model, pnp := parseEDIDMonitorName(data)
		hwID := conn
		if pnp != "" && model != "" {
			cleanModel := strings.ReplaceAll(model, " ", "")
			hwID = fmt.Sprintf("%s-%s-%s", pnp, cleanModel, normConn)
		} else if pnp != "" {
			hwID = fmt.Sprintf("%s-%s", pnp, normConn)
		}
		out[conn] = struct{ Model, ID string }{Model: model, ID: hwID}
		out[normConn] = struct{ Model, ID string }{Model: model, ID: hwID}
	}
	return out
}

var xrandrHeaderRe = regexp.MustCompile(`^([A-Za-z0-9_-]+)\s+connected\s+(primary\s+)?(?:(\d+)x(\d+)\+(\d+)\+(\d+))?`)
var xrandrModeRe = regexp.MustCompile(`^\s+(\d+)x(\d+)\s+([0-9.]+)\*`)

func enumerateLinuxDisplays(aliases map[string]string) []ConnectedDisplay {
	drmMeta := readDRMMonitorMetadata()
	var list []ConnectedDisplay
	origins := make(map[string]int)

	// 1. Try xrandr --query (works on X11 and XWayland across GNOME, KDE, XFCE, i3, Sway)
	if out, err := exec.Command("xrandr", "--query").Output(); err == nil {
		lines := strings.Split(string(out), "\n")
		var cur *ConnectedDisplay
		for _, line := range lines {
			if m := xrandrHeaderRe.FindStringSubmatch(line); m != nil {
				if cur != nil {
					list = append(list, *cur)
				}
				devName := m[1]
				isPrimary := strings.TrimSpace(m[2]) == "primary"
				w, _ := strconv.Atoi(m[3])
				h, _ := strconv.Atoi(m[4])
				ox, _ := strconv.Atoi(m[5])
				oy, _ := strconv.Atoi(m[6])
				enabled := w > 0 && h > 0
				if !enabled {
					w, h = 1920, 1080
				}
				meta := drmMeta[devName]
				hwID := meta.ID
				if hwID == "" {
					hwID = devName
				}
				label := aliases[hwID]
				if label == "" {
					label = aliases[devName]
				}
				if label == "" {
					if meta.Model != "" {
						label = fmt.Sprintf("%s (%s)", meta.Model, devName)
					} else {
						label = devName
					}
				}
				isBuiltIn := strings.HasPrefix(strings.ToLower(devName), "edp") ||
					strings.HasPrefix(strings.ToLower(devName), "lvds") ||
					strings.HasPrefix(strings.ToLower(devName), "dsi")

				if enabled {
					origins[fmt.Sprintf("%d,%d", ox, oy)]++
				}
				cur = &ConnectedDisplay{
					ID:         hwID,
					DeviceName: devName,
					Name:       label,
					Resolution: fmt.Sprintf("%dx%d", w, h),
					Width:      w,
					Height:     h,
					Hz:         60,
					OriginX:    ox,
					OriginY:    oy,
					Enabled:    enabled,
					IsMain:     isPrimary,
					IsMirrored: false,
					IsBuiltIn:  isBuiltIn,
				}
			} else if cur != nil {
				if mm := xrandrModeRe.FindStringSubmatch(line); mm != nil {
					if f, err := strconv.ParseFloat(mm[3], 64); err == nil {
						cur.Hz = int(f + 0.5)
					}
				}
			}
		}
		if cur != nil {
			list = append(list, *cur)
		}
	}

	// 2. Fallback to /sys/class/drm if xrandr returned nothing (pure headless/Wayland without XWayland)
	if len(list) == 0 {
		statusFiles, _ := filepath.Glob("/sys/class/drm/card*-*/status")
		for idx, sf := range statusFiles {
			b, err := os.ReadFile(sf)
			if err != nil || strings.TrimSpace(string(b)) != "connected" {
				continue
			}
			dir := filepath.Dir(sf)
			base := filepath.Base(dir)
			parts := strings.SplitN(base, "-", 2)
			if len(parts) < 2 {
				continue
			}
			devName := parts[1]
			meta := drmMeta[devName]
			hwID := meta.ID
			if hwID == "" {
				hwID = devName
			}
			label := aliases[hwID]
			if label == "" && meta.Model != "" {
				label = fmt.Sprintf("%s (%s)", meta.Model, devName)
			}
			if label == "" {
				label = devName
			}
			w, h := 1920, 1080
			if modesRaw, err := os.ReadFile(filepath.Join(dir, "modes")); err == nil {
				firstLine := strings.Split(strings.TrimSpace(string(modesRaw)), "\n")[0]
				fmt.Sscanf(firstLine, "%dx%d", &w, &h)
			}
			isBuiltIn := strings.HasPrefix(strings.ToLower(devName), "edp") || strings.HasPrefix(strings.ToLower(devName), "lvds")
			list = append(list, ConnectedDisplay{
				ID:         hwID,
				DeviceName: devName,
				Name:       label,
				Resolution: fmt.Sprintf("%dx%d", w, h),
				Width:      w,
				Height:     h,
				Hz:         60,
				OriginX:    idx * w,
				OriginY:    0,
				Enabled:    true,
				IsMain:     idx == 0,
				IsMirrored: false,
				IsBuiltIn:  isBuiltIn,
			})
		}
	}

	for idx := range list {
		key := fmt.Sprintf("%d,%d", list[idx].OriginX, list[idx].OriginY)
		if list[idx].Enabled && origins[key] > 1 {
			list[idx].IsMirrored = true
		}
	}

	return list
}

// Execute preset command on Linux using xrandr (X11) or wlr-randr (Wayland)
func executeLinuxPresetCommand(cmd string, displays []ConnectedDisplay) error {
	trimmed := strings.TrimSpace(cmd)
	if len(displays) == 0 {
		return nil
	}

	useWlr := os.Getenv("WAYLAND_DISPLAY") != "" && hasBinary("wlr-randr") && !hasBinary("xrandr")

	// Direct xrandr or wlr-randr pass-through
	if strings.HasPrefix(trimmed, "xrandr ") || strings.HasPrefix(trimmed, "wlr-randr ") || strings.HasPrefix(trimmed, "kscreen-doctor ") {
		return exec.Command("sh", "-c", trimmed).Run()
	}

	// Dynamic cross-platform shortcuts
	switch trimmed {
	case "@win:clone", "@dynamic:mirror_all":
		var args []string
		primary := displays[0].DeviceName
		for i, d := range displays {
			args = append(args, "--output", d.DeviceName, "--auto")
			if i == 0 {
				args = append(args, "--primary", "--pos", "0x0")
			} else {
				args = append(args, "--same-as", primary)
			}
		}
		return exec.Command("xrandr", args...).Run()

	case "@win:extend", "@dynamic:extend_all":
		var args []string
		curX := 0
		for i, d := range displays {
			args = append(args, "--output", d.DeviceName, "--auto", "--pos", fmt.Sprintf("%dx0", curX))
			if i == 0 {
				args = append(args, "--primary")
			}
			curX += d.Width
		}
		return exec.Command("xrandr", args...).Run()

	case "@win:internal", "@dynamic:laptop_only":
		var args []string
		for i, d := range displays {
			if d.IsBuiltIn || i == 0 {
				args = append(args, "--output", d.DeviceName, "--auto", "--primary", "--pos", "0x0")
			} else {
				args = append(args, "--output", d.DeviceName, "--off")
			}
		}
		return exec.Command("xrandr", args...).Run()

	case "@win:external":
		var args []string
		primarySet := false
		for _, d := range displays {
			if d.IsBuiltIn && len(displays) > 1 {
				args = append(args, "--output", d.DeviceName, "--off")
			} else {
				args = append(args, "--output", d.DeviceName, "--auto", "--pos", "0x0")
				if !primarySet {
					args = append(args, "--primary")
					primarySet = true
				}
			}
		}
		return exec.Command("xrandr", args...).Run()
	}

	// Translate displayplacer segments ("id:A+B res:1920x1080 origin:(0,0)") into xrandr / wlr-randr args
	segments := parseQuotedSegments(trimmed)
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

	var xrandrArgs []string
	var wlrArgs []string

	for segIdx, seg := range segments {
		tokens := strings.Fields(seg)
		var idPart, resPart string
		var ox, oy int
		isOff := strings.Contains(strings.ToLower(seg), "enabled:false")

		for _, tok := range tokens {
			if strings.HasPrefix(tok, "id:") {
				idPart = strings.TrimPrefix(tok, "id:")
			} else if strings.HasPrefix(tok, "res:") {
				resPart = strings.TrimPrefix(tok, "res:")
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
			if isOff {
				xrandrArgs = append(xrandrArgs, "--output", d.DeviceName, "--off")
				wlrArgs = append(wlrArgs, "--output", d.DeviceName, "--off")
			} else {
				xrandrArgs = append(xrandrArgs, "--output", d.DeviceName)
				wlrArgs = append(wlrArgs, "--output", d.DeviceName, "--on")
				if resPart != "" {
					xrandrArgs = append(xrandrArgs, "--mode", resPart)
					wlrArgs = append(wlrArgs, "--mode", resPart)
				} else {
					xrandrArgs = append(xrandrArgs, "--auto")
				}
				xrandrArgs = append(xrandrArgs, "--pos", fmt.Sprintf("%dx%d", ox, oy))
				wlrArgs = append(wlrArgs, "--pos", fmt.Sprintf("%d,%d", ox, oy))
				if segIdx == 0 && uIdx == 0 && ox == 0 {
					xrandrArgs = append(xrandrArgs, "--primary")
				}
			}
		}
	}

	if useWlr && len(wlrArgs) > 0 {
		return exec.Command("wlr-randr", wlrArgs...).Run()
	}
	if len(xrandrArgs) > 0 {
		return exec.Command("xrandr", xrandrArgs...).Run()
	}
	return nil
}

func hasBinary(name string) bool {
	_, err := exec.LookPath(name)
	return err == nil
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

func defaultStudioSeed() PresetsRoot {
	studio := MachineFolder{
		ID:             "studio-workstation",
		Name:           "Studio Workstation",
		Description:    "Studio Workstation · Primary Desk Monitor + Room TV (KVM) + Secondary Screen",
		SignatureUUIDs: []string{},
		DisplayAliases: map[string]string{
			"DESK-MONITOR": "Desk Monitor",
			"KVM-ROOM-TV":  "Room TV (KVM)",
			"LAPTOP-PANEL": "Laptop / Secondary",
		},
		Monitors: []MonitorRecord{
			{ID: "DESK-MONITOR", Label: "Desk Monitor", Note: "Primary Desk", Icon: "display", IgnoredInSpace: false},
			{ID: "KVM-ROOM-TV", Label: "Room TV (KVM)", Note: "Room TV via KVM", Icon: "tv.fill", IgnoredInSpace: false},
			{ID: "LAPTOP-PANEL", Label: "Laptop / Secondary", Note: "Nearby on Desk", Icon: "laptopcomputer", IgnoredInSpace: false},
		},
		Presets: []DisplayPreset{
			{
				ID:       "extend-all-3",
				Name:     "All Displays Extended · Desk Monitor + Secondary + TV (KVM)",
				Subtitle: "Uses Desk Monitor as Main with Secondary screen and KVM Room TV as separate extended desktops",
				Icon:     "rectangle.split.3x1.fill",
				Command:  `displayplacer "id:DESK-MONITOR res:1920x1080 origin:(0,0)" "id:LAPTOP-PANEL res:1920x1080 origin:(-1920,0)" "id:KVM-ROOM-TV res:1920x1080 origin:(1920,0)"`,
			},
			{
				ID:       "mirror-desk-tv",
				Name:     "Mirror Desk Monitor + TV (KVM)",
				Subtitle: "Desk Monitor and Room TV (via KVM) show the exact same 1080p screen",
				Icon:     "rectangle.on.rectangle.circle.fill",
				Command:  `displayplacer "id:DESK-MONITOR+KVM-ROOM-TV+LAPTOP-PANEL res:1920x1080 origin:(0,0)"`,
			},
			{
				ID:       "desk-only-tv-off",
				Name:     "Desk Monitor Only · Mute TV (KVM)",
				Subtitle: "Keeps Desk Monitor active; turns off KVM TV output",
				Icon:     "eye.slash.fill",
				Command:  `displayplacer "id:DESK-MONITOR res:1920x1080 origin:(0,0)" "id:LAPTOP-PANEL res:1920x1080 origin:(1920,0)" "id:KVM-ROOM-TV enabled:false"`,
			},
		},
	}

	return PresetsRoot{
		Version:          3,
		SelectedFolderID: studio.ID,
		Folders:          []MachineFolder{studio},
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
	s.Root = defaultStudioSeed()
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
	s.Connected = enumerateLinuxDisplays(aliases)
}

func launchAppWindow(url string) {
	browsers := []string{"chromium", "chromium-browser", "google-chrome", "brave-browser", "microsoft-edge"}
	for _, b := range browsers {
		if path, err := exec.LookPath(b); err == nil {
			_ = exec.Command(path, "--app="+url, "--window-size=680,760").Start()
			return
		}
	}
	_ = exec.Command("xdg-open", url).Start()
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
					_ = executeLinuxPresetCommand(p.Command, store.Connected)
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
			"license":   loadVerifiedLicense(),
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
		err := executeLinuxPresetCommand(req.Command, store.Connected)
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
