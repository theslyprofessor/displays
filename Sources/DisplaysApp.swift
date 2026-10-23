// Displays.app: Native macOS menu bar + window app for organizing and switching
// multi-monitor display presets by classroom/machine folder (84-101, 84-102, 84-105, etc.).
//
// Standalone native SwiftUI app (no SwiftBar/Hammerspoon dependencies), signed with
// Apple Development identity so Login Item and system permissions persist across rebuilds.

import AppKit
import CoreGraphics
import ServiceManagement
import SwiftUI

// MARK: - Models

enum DisplayRole: String, CaseIterable, Codable, Identifiable {
    case main = "main"
    case mirrorMain = "mirror_main"
    case extendRight = "extend_right"
    case extendLeft = "extend_left"
    case off = "off"

    var id: String { rawValue }

    var label: String {
        switch self {
        case .main: return "Main (Primary)"
        case .mirrorMain: return "Mirror Main (Broadcast)"
        case .extendRight: return "Extend Right"
        case .extendLeft: return "Extend Left"
        case .off: return "Off (Privacy)"
        }
    }

    var badgeColor: Color {
        switch self {
        case .main: return .blue
        case .mirrorMain: return .green
        case .extendRight, .extendLeft: return .purple
        case .off: return .secondary
        }
    }
}

struct ConnectedDisplay: Identifiable, Equatable {
    let id: String          // Persistent UUID from displayplacer / CoreGraphics
    let cgID: UInt32        // Contextual CGDirectDisplayID
    let name: String        // Human-readable name (e.g. "C27-30", "MacBook Pro", "Blackmagic")
    let typeLabel: String   // e.g. "27 inch external screen"
    let resolution: String  // e.g. "1920x1080"
    let hz: Int             // e.g. 75, 120, 60
    let scaling: Bool
    let enabled: Bool
    let isMain: Bool
    let isBuiltIn: Bool
    let mirrorMasterID: UInt32
}

struct DisplayPreset: Identifiable, Codable, Equatable {
    var id: String
    var name: String
    var subtitle: String
    var icon: String
    /// Either a literal `displayplacer "..."` command or a dynamic template:
    /// - `@dynamic:mirror_all`
    /// - `@dynamic:extend_all`
    /// - `@dynamic:laptop_only`
    /// - `@dynamic:broadcast_main_extend_builtin`
    var command: String
}

struct MachineFolder: Identifiable, Codable, Equatable {
    var id: String
    var name: String           // e.g. "84-101", "84-102", "84-105"
    var description: String    // e.g. "3 monitors: C27-30 + MacBook + Blackmagic"
    var signatureUUIDs: [String] // Screen UUIDs that auto-identify this room/machine
    var displayAliases: [String: String] // UUID -> friendly name
    var presets: [DisplayPreset]
}

struct PresetsRoot: Codable, Equatable {
    var version: Int = 1
    var selectedFolderID: String
    var lastAppliedPresetID: String?
    var folders: [MachineFolder]
}

// MARK: - Default Seed Data (84-101, 84-102, 84-105)

enum SeedData {
    // 84-101 Display UUIDs (verified live from this machine)
    static let c27UUID = "62965DD7-A85F-4301-AAAF-57ACDD304B01"      // Lenovo C27-30 (27" Desk Monitor, 75Hz)
    static let mbpUUID = "37D8832A-2D66-02CA-B9F7-8F30A301B230"      // MacBook Pro 16" Built-in Liquid Retina XDR
    static let bmdUUID = "9D513093-8CA9-4BEB-9D4E-B22ABE9D9996"      // Blackmagic (Room Broadcast / Projector, 60Hz)

    // 84-102 Display UUIDs (from ~/.config/displayplacer/presets.conf & 20-display.zsh)
    static let ls32UUID = "3EC6A2A1-980C-4833-9DFB-1C7E6DB86474"     // Samsung 32" External
    static let extronUUID = "59881A55-35CB-4FF8-A3E4-1477F91FC986"   // ExtronScalerD Classroom Projector
    static let r102MonAUUID = "862BBDA6-F3BA-44EF-89C9-1B04C8BF492F" // 84-102 Monitor A
    static let r102MonBUUID = "7E9A1BE6-39AD-4C09-9E9D-EE8D44400E05" // 84-102 Monitor B

    static func defaultRoot() -> PresetsRoot {
        let folder101 = MachineFolder(
            id: "84-101",
            name: "84-101",
            description: "3 Displays · C27-30 (Main) + MacBook Pro + Blackmagic Broadcast",
            signatureUUIDs: [c27UUID, bmdUUID],
            displayAliases: [
                c27UUID: "C27-30 (27\" Desk)",
                mbpUUID: "MacBook Pro (Built-in)",
                bmdUUID: "Blackmagic (Broadcast)",
            ],
            presets: [
                DisplayPreset(
                    id: "101-mirror-all-3",
                    name: "Broadcast All 3 (Mirror Everything)",
                    subtitle: "C27-30 + MacBook + Blackmagic all show the same 1080p screen",
                    icon: "rectangle.on.rectangle.circle.fill",
                    command: #"displayplacer "id:\#(c27UUID)+\#(mbpUUID)+\#(bmdUUID) res:1920x1080 hz:75 color_depth:8 enabled:true scaling:off origin:(0,0) degree:0""#
                ),
                DisplayPreset(
                    id: "101-broadcast-c27-extend-mbp",
                    name: "Broadcast C27-30 · MacBook Extended (Private Notes)",
                    subtitle: "C27-30 mirrored to Blackmagic for class; MacBook separate on right",
                    icon: "tv.and.mediabox",
                    command: #"displayplacer "id:\#(c27UUID)+\#(bmdUUID) res:1920x1080 hz:75 color_depth:8 enabled:true scaling:off origin:(0,0) degree:0" "id:\#(mbpUUID) res:1728x1117 hz:120 color_depth:8 enabled:true scaling:on origin:(1920,0) degree:0""#
                ),
                DisplayPreset(
                    id: "101-broadcast-mbp-extend-c27",
                    name: "Broadcast MacBook · C27-30 Extended (Private Desk)",
                    subtitle: "MacBook mirrored to Blackmagic for class; C27-30 separate on left",
                    icon: "laptopcomputer.and.ipad",
                    command: #"displayplacer "id:\#(mbpUUID)+\#(bmdUUID) res:1920x1080 hz:120 color_depth:8 enabled:true scaling:off origin:(0,0) degree:0" "id:\#(c27UUID) res:1920x1080 hz:75 color_depth:8 enabled:true scaling:off origin:(-1920,0) degree:0""#
                ),
                DisplayPreset(
                    id: "101-desk-mirror-extend-bmd",
                    name: "Mirror C27-30 + MacBook · Extend Blackmagic Stage",
                    subtitle: "C27-30 + MacBook mirrored on desk; Blackmagic is a 2nd extended desktop",
                    icon: "rectangle.split.2x1.fill",
                    command: #"displayplacer "id:\#(c27UUID)+\#(mbpUUID) res:1920x1080 hz:75 color_depth:8 enabled:true scaling:off origin:(0,0) degree:0" "id:\#(bmdUUID) res:1920x1080 hz:60 color_depth:8 enabled:true scaling:off origin:(1920,0) degree:0""#
                ),
                DisplayPreset(
                    id: "101-extend-all-3",
                    name: "All 3 Extended Side-by-Side (3 Separate Desktops)",
                    subtitle: "C27-30 (Center Main) · MacBook (Left) · Blackmagic (Right)",
                    icon: "rectangle.split.3x1.fill",
                    command: #"displayplacer "id:\#(c27UUID) res:1920x1080 hz:75 color_depth:8 enabled:true scaling:off origin:(0,0) degree:0" "id:\#(mbpUUID) res:1728x1117 hz:120 color_depth:8 enabled:true scaling:on origin:(-1728,0) degree:0" "id:\#(bmdUUID) res:1920x1080 hz:60 color_depth:8 enabled:true scaling:off origin:(1920,0) degree:0""#
                ),
                DisplayPreset(
                    id: "101-off-air-privacy",
                    name: "Off-Air Privacy (Blackmagic Off · C27-30 + MacBook Extended)",
                    subtitle: "Mutes Blackmagic broadcast output; keeps C27-30 + MacBook active",
                    icon: "eye.slash.fill",
                    command: #"displayplacer "id:\#(c27UUID) res:1920x1080 hz:75 color_depth:8 enabled:true scaling:off origin:(0,0) degree:0" "id:\#(mbpUUID) res:1728x1117 hz:120 color_depth:8 enabled:true scaling:on origin:(1920,0) degree:0" "id:\#(bmdUUID) enabled:false""#
                ),
            ]
        )

        let folder102 = MachineFolder(
            id: "84-102",
            name: "84-102",
            description: "2 External Displays · Teacher Desk + Extron Classroom Broadcast",
            signatureUUIDs: [ls32UUID, extronUUID, r102MonAUUID, r102MonBUUID],
            displayAliases: [
                ls32UUID: "Samsung 32\" Desk",
                extronUUID: "ExtronScalerD (Projector)",
                r102MonAUUID: "84-102 Broadcast",
                r102MonBUUID: "84-102 Desk Monitor",
                mbpUUID: "MacBook Pro (Built-in)",
            ],
            presets: [
                DisplayPreset(
                    id: "102-mirror-broadcast-extend-desk",
                    name: "Broadcast Mirror + Desk Extended (84-102 Standard)",
                    subtitle: "Mirrors MacBook to classroom broadcast; second monitor extended right",
                    icon: "tv.and.mediabox",
                    command: #"displayplacer "id:\#(r102MonAUUID)+\#(mbpUUID) res:1920x1080 hz:30 color_depth:8 enabled:true scaling:on origin:(0,0) degree:0" "id:\#(r102MonBUUID) res:1920x1080 hz:75 color_depth:8 enabled:true scaling:off origin:(1920,0) degree:0""#
                ),
                DisplayPreset(
                    id: "102-side-by-side",
                    name: "All Displays Side-by-Side (32\" + MacBook + Extron)",
                    subtitle: "Extended across 32\" desk monitor, MacBook, and ExtronScalerD",
                    icon: "rectangle.split.3x1.fill",
                    command: #"displayplacer "id:\#(ls32UUID) res:1920x1080 hz:30 color_depth:8 enabled:true scaling:on origin:(0,0) degree:0" "id:\#(mbpUUID) res:1920x1080 hz:120 color_depth:8 enabled:true scaling:on origin:(1920,0) degree:0" "id:\#(extronUUID) res:1920x1080 hz:60 color_depth:8 enabled:true scaling:on origin:(3840,0) degree:0""#
                ),
                DisplayPreset(
                    id: "102-dynamic-mirror-all",
                    name: "Mirror All Connected Displays (Broadcast Everything)",
                    subtitle: "Mirrors all connected monitors in 84-102 to the main 1080p screen",
                    icon: "rectangle.on.rectangle.circle.fill",
                    command: "@dynamic:mirror_all"
                ),
                DisplayPreset(
                    id: "102-dynamic-extend-all",
                    name: "Extend All Connected Displays (Side-by-Side)",
                    subtitle: "Places connected monitors left-to-right with no mirroring",
                    icon: "squares.leading.rectangle",
                    command: "@dynamic:extend_all"
                ),
                DisplayPreset(
                    id: "102-laptop-only",
                    name: "Laptop Only (Private / Unplugged)",
                    subtitle: "MacBook built-in Retina display at 1728x1117 @ 120Hz",
                    icon: "laptopcomputer",
                    command: "@dynamic:laptop_only"
                ),
            ]
        )

        let folder105 = MachineFolder(
            id: "84-105",
            name: "84-105",
            description: "2 Displays · MacBook Pro + 84-105 Classroom Broadcast",
            signatureUUIDs: [],
            displayAliases: [
                mbpUUID: "MacBook Pro (Built-in)",
            ],
            presets: [
                DisplayPreset(
                    id: "105-mirror-all",
                    name: "Broadcast Mirror (Mirror MacBook + Classroom Display)",
                    subtitle: "Mirrors MacBook and classroom projector/TV at 1080p",
                    icon: "rectangle.on.rectangle.circle.fill",
                    command: "@dynamic:mirror_all"
                ),
                DisplayPreset(
                    id: "105-extend-all",
                    name: "Extend Classroom Display (MacBook Private + Projector Right)",
                    subtitle: "MacBook as main screen (0,0) with classroom display extended to (1920,0)",
                    icon: "rectangle.split.2x1.fill",
                    command: "@dynamic:extend_all"
                ),
                DisplayPreset(
                    id: "105-broadcast-external-extend-mbp",
                    name: "External Main + MacBook Private Right",
                    subtitle: "External monitor as Main (0,0); MacBook extended to the right",
                    icon: "tv.and.mediabox",
                    command: "@dynamic:broadcast_main_extend_builtin"
                ),
                DisplayPreset(
                    id: "105-laptop-only",
                    name: "Off-Air Privacy (Laptop Only)",
                    subtitle: "Disables external broadcast display so only MacBook stays on",
                    icon: "eye.slash.fill",
                    command: "@dynamic:laptop_only"
                ),
            ]
        )

        return PresetsRoot(
            version: 1,
            selectedFolderID: "84-101",
            lastAppliedPresetID: "101-mirror-all-3",
            folders: [folder101, folder102, folder105]
        )
    }
}

// MARK: - Store

@MainActor
final class DisplayStore: ObservableObject {
    static let shared = DisplayStore()
    @Published var root: PresetsRoot
    @Published var connected: [ConnectedDisplay] = []
    @Published var currentCommand: String = ""
    @Published var detectedFolderID: String? = nil
    @Published var roleDraft: [String: DisplayRole] = [:]
    @Published var busy: Bool = false
    @Published var statusMessage: String? = nil
    @Published var errorMessage: String? = nil

    static let configDir = URL(fileURLWithPath: NSHomeDirectory() + "/.config/displays")
    static let configFile = configDir.appendingPathComponent("presets.json")

    init() {
        self.root = DisplayStore.loadOrSeed()
        refreshDisplays()
    }

    static func loadOrSeed() -> PresetsRoot {
        if let data = try? Data(contentsOf: configFile),
           let decoded = try? JSONDecoder().decode(PresetsRoot.self, from: data),
           !decoded.folders.isEmpty {
            return decoded
        }
        let seeded = SeedData.defaultRoot()
        saveRoot(seeded)
        return seeded
    }

    static func saveRoot(_ r: PresetsRoot) {
        try? FileManager.default.createDirectory(at: configDir, withIntermediateDirectories: true)
        let enc = JSONEncoder()
        enc.outputFormatting = [.prettyPrinted, .sortedKeys]
        if let data = try? enc.encode(r) {
            try? data.write(to: configFile, options: .atomic)
        }
    }

    func save() {
        DisplayStore.saveRoot(root)
    }

    var selectedFolder: MachineFolder? {
        root.folders.first(where: { $0.id == root.selectedFolderID }) ?? root.folders.first
    }

    // MARK: - Inspect Live Screens

    nonisolated static func runCommand(_ exe: String, _ args: [String]) -> (Int32, String, String) {
        let p = Process()
        p.executableURL = URL(fileURLWithPath: exe)
        p.arguments = args
        var env = ProcessInfo.processInfo.environment
        let home = NSHomeDirectory()
        env["PATH"] = "/opt/homebrew/bin:\(home)/.nix-profile/bin:\(home)/.local/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
        p.environment = env
        let out = Pipe(), err = Pipe()
        p.standardOutput = out
        p.standardError = err
        p.standardInput = FileHandle.nullDevice
        do {
            try p.run()
        } catch {
            return (127, "", "\(error)")
        }
        let o = out.fileHandleForReading.readDataToEndOfFile()
        let e = err.fileHandleForReading.readDataToEndOfFile()
        p.waitUntilExit()
        return (
            p.terminationStatus,
            String(decoding: o, as: UTF8.self),
            String(decoding: e, as: UTF8.self)
        )
    }

    nonisolated static func fetchSystemProfilerNames() -> [UInt32: String] {
        let (rc, out, _) = runCommand("/usr/sbin/system_profiler", ["SPDisplaysDataType", "-json"])
        guard rc == 0,
              let data = out.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let gpus = json["SPDisplaysDataType"] as? [[String: Any]] else {
            return [:]
        }
        var map: [UInt32: String] = [:]
        for gpu in gpus {
            guard let ndrvs = gpu["spdisplays_ndrvs"] as? [[String: Any]] else { continue }
            for d in ndrvs {
                if let idStr = d["_spdisplays_displayID"] as? String,
                   let cgID = UInt32(idStr),
                   let rawName = d["_name"] as? String {
                    let cleanName = (rawName == "Color LCD") ? "MacBook Pro" : rawName
                    map[cgID] = cleanName
                }
            }
        }
        return map
    }

    nonisolated static func parseDisplayplacerList(namesByCGID: [UInt32: String], aliases: [String: String]) -> ([ConnectedDisplay], String) {
        let (_, out, _) = runCommand("/usr/bin/env", ["displayplacer", "list"])
        var displays: [ConnectedDisplay] = []
        var finalCmd = ""

        var currentUUID = ""
        var currentCGID: UInt32 = 0
        var currentType = ""
        var currentRes = "1920x1080"
        var currentHz = 60
        var currentScaling = false
        var currentEnabled = true
        var currentMain = false

        func flushBlock() {
            guard !currentUUID.isEmpty else { return }
            let isBuiltIn = currentType.localizedCaseInsensitiveContains("MacBook") || CGDisplayIsBuiltin(currentCGID) != 0
            let mirrorMaster = CGDisplayMirrorsDisplay(currentCGID)
            let spName = namesByCGID[currentCGID]
            let alias = aliases[currentUUID]
            let displayName = spName ?? alias ?? (isBuiltIn ? "MacBook Pro" : currentType)
            displays.append(ConnectedDisplay(
                id: currentUUID,
                cgID: currentCGID,
                name: displayName,
                typeLabel: currentType,
                resolution: currentRes,
                hz: currentHz,
                scaling: currentScaling,
                enabled: currentEnabled,
                isMain: currentMain || (CGDisplayIsMain(currentCGID) != 0),
                isBuiltIn: isBuiltIn,
                mirrorMasterID: mirrorMaster
            ))
            currentUUID = ""
            currentCGID = 0
            currentType = ""
            currentRes = "1920x1080"
            currentHz = 60
            currentScaling = false
            currentEnabled = true
            currentMain = false
        }

        for rawLine in out.components(separatedBy: .newlines) {
            let line = rawLine.trimmingCharacters(in: .whitespaces)
            if line.hasPrefix("Persistent screen id:") {
                flushBlock()
                currentUUID = line.replacingOccurrences(of: "Persistent screen id:", with: "").trimmingCharacters(in: .whitespaces)
            } else if line.hasPrefix("Contextual screen id:") {
                let s = line.replacingOccurrences(of: "Contextual screen id:", with: "").trimmingCharacters(in: .whitespaces)
                currentCGID = UInt32(s) ?? 0
            } else if line.hasPrefix("Type:") {
                currentType = line.replacingOccurrences(of: "Type:", with: "").trimmingCharacters(in: .whitespaces)
            } else if line.hasPrefix("Resolution:") {
                currentRes = line.replacingOccurrences(of: "Resolution:", with: "").trimmingCharacters(in: .whitespaces)
            } else if line.hasPrefix("Hertz:") {
                let s = line.replacingOccurrences(of: "Hertz:", with: "").trimmingCharacters(in: .whitespaces)
                currentHz = Int(s) ?? 60
            } else if line.hasPrefix("Scaling:") {
                currentScaling = line.localizedCaseInsensitiveContains("on")
            } else if line.hasPrefix("Enabled:") {
                currentEnabled = line.localizedCaseInsensitiveContains("true")
            } else if line.hasPrefix("Origin:") {
                currentMain = line.localizedCaseInsensitiveContains("main display")
            } else if line.hasPrefix("displayplacer ") {
                finalCmd = line
            }
        }
        flushBlock()
        return (displays, finalCmd)
    }

    func refreshDisplays() {
        var allAliases: [String: String] = [:]
        for f in root.folders {
            for (k, v) in f.displayAliases { allAliases[k] = v }
        }
        Task {
            let result = await Task.detached { () -> ([ConnectedDisplay], String) in
                let names = DisplayStore.fetchSystemProfilerNames()
                return DisplayStore.parseDisplayplacerList(namesByCGID: names, aliases: allAliases)
            }.value

            let (list, cmd) = result
            self.connected = list
            self.currentCommand = cmd

            // Sync roleDraft for connected displays
            var newRoles: [String: DisplayRole] = [:]
            let mainDisp = list.first(where: { $0.isMain }) ?? list.first
            for d in list {
                if !d.enabled {
                    newRoles[d.id] = .off
                } else if d.id == mainDisp?.id {
                    newRoles[d.id] = .main
                } else if d.mirrorMasterID != 0 {
                    newRoles[d.id] = .mirrorMain
                } else {
                    newRoles[d.id] = .extendRight
                }
            }
            self.roleDraft = newRoles

            // Auto-detect folder by matching connected UUIDs against folder signatureUUIDs
            let connectedSet = Set(list.map(\.id))
            var bestFolder: String? = nil
            var bestScore = 0
            for folder in self.root.folders {
                let overlap = Set(folder.signatureUUIDs).intersection(connectedSet).count
                if overlap > bestScore {
                    bestScore = overlap
                    bestFolder = folder.id
                }
            }
            if let detected = bestFolder, self.detectedFolderID != detected {
                self.detectedFolderID = detected
                self.root.selectedFolderID = detected
                self.save()
            } else {
                self.detectedFolderID = bestFolder
            }
        }
    }

    // MARK: - Build & Execute displayplacer Commands

    func resolveCommand(_ raw: String) -> String {
        guard raw.hasPrefix("@dynamic:") else { return raw }
        let mode = raw.replacingOccurrences(of: "@dynamic:", with: "")
        let active = connected
        guard !active.isEmpty else { return "" }

        let builtIn = active.first(where: { $0.isBuiltIn })
        let externals = active.filter { !$0.isBuiltIn }

        switch mode {
        case "mirror_all":
            let ordered = (externals + (builtIn.map { [$0] } ?? [])).map(\.id)
            let joined = ordered.joined(separator: "+")
            return #"displayplacer "id:\#(joined) res:1920x1080 enabled:true scaling:off origin:(0,0) degree:0""#

        case "extend_all":
            var parts: [String] = []
            var x = 0
            let ordered = (builtIn.map { [$0] } ?? []) + externals
            for d in ordered {
                let res = d.isBuiltIn ? "1728x1117" : "1920x1080"
                let width = d.isBuiltIn ? 1728 : 1920
                let scale = d.isBuiltIn ? "on" : "off"
                parts.append(#""id:\#(d.id) res:\#(res) enabled:true scaling:\#(scale) origin:(\#(x),0) degree:0""#)
                x += width
            }
            return "displayplacer " + parts.joined(separator: " ")

        case "broadcast_main_extend_builtin":
            var parts: [String] = []
            if !externals.isEmpty {
                let extIDs = externals.map(\.id).joined(separator: "+")
                parts.append(#""id:\#(extIDs) res:1920x1080 enabled:true scaling:off origin:(0,0) degree:0""#)
            }
            if let mbp = builtIn {
                let x = externals.isEmpty ? 0 : 1920
                parts.append(#""id:\#(mbp.id) res:1728x1117 enabled:true scaling:on origin:(\#(x),0) degree:0""#)
            }
            return "displayplacer " + parts.joined(separator: " ")

        case "laptop_only":
            var parts: [String] = []
            if let mbp = builtIn {
                parts.append(#""id:\#(mbp.id) res:1728x1117 hz:120 color_depth:8 enabled:true scaling:on origin:(0,0) degree:0""#)
            }
            for ext in externals {
                parts.append(#""id:\#(ext.id) enabled:false""#)
            }
            return "displayplacer " + parts.joined(separator: " ")

        default:
            return raw
        }
    }

    func buildRoleDraftCommand() -> String {
        guard !connected.isEmpty else { return "" }
        let mainDisplay = connected.first(where: { roleDraft[$0.id] == .main })
            ?? connected.first(where: { roleDraft[$0.id] != .off })
            ?? connected[0]

        let mirrors = connected.filter { $0.id != mainDisplay.id && roleDraft[$0.id] == .mirrorMain }
        let lefts = connected.filter { $0.id != mainDisplay.id && roleDraft[$0.id] == .extendLeft }
        let rights = connected.filter { $0.id != mainDisplay.id && roleDraft[$0.id] == .extendRight }
        let offs = connected.filter { roleDraft[$0.id] == .off && $0.id != mainDisplay.id }

        var args: [String] = []

        // 1. Main + Mirror group at origin (0,0)
        let mainGroupIDs = ([mainDisplay.id] + mirrors.map(\.id)).joined(separator: "+")
        if !mirrors.isEmpty {
            args.append(#""id:\#(mainGroupIDs) res:1920x1080 enabled:true scaling:off origin:(0,0) degree:0""#)
        } else {
            let res = mainDisplay.isBuiltIn ? "1728x1117" : "1920x1080"
            let scale = mainDisplay.isBuiltIn ? "on" : "off"
            args.append(#""id:\#(mainDisplay.id) res:\#(res) enabled:true scaling:\#(scale) origin:(0,0) degree:0""#)
        }

        // 2. Extend Left displays
        var leftX = 0
        for d in lefts {
            let w = d.isBuiltIn ? 1728 : 1920
            let res = d.isBuiltIn ? "1728x1117" : "1920x1080"
            let scale = d.isBuiltIn ? "on" : "off"
            leftX -= w
            args.append(#""id:\#(d.id) res:\#(res) enabled:true scaling:\#(scale) origin:(\#(leftX),0) degree:0""#)
        }

        // 3. Extend Right displays
        var rightX = (!mirrors.isEmpty || !mainDisplay.isBuiltIn) ? 1920 : 1728
        for d in rights {
            let w = d.isBuiltIn ? 1728 : 1920
            let res = d.isBuiltIn ? "1728x1117" : "1920x1080"
            let scale = d.isBuiltIn ? "on" : "off"
            args.append(#""id:\#(d.id) res:\#(res) enabled:true scaling:\#(scale) origin:(\#(rightX),0) degree:0""#)
            rightX += w
        }

        // 4. Disabled displays
        for d in offs {
            args.append(#""id:\#(d.id) enabled:false""#)
        }

        return "displayplacer " + args.joined(separator: " ")
    }

    func applyPreset(_ preset: DisplayPreset) {
        let cmd = resolveCommand(preset.command)
        guard !cmd.isEmpty else { return }
        executeDisplayplacerCommand(cmd, presetID: preset.id, label: preset.name)
    }

    func applyRoleDraft() {
        let cmd = buildRoleDraftCommand()
        guard !cmd.isEmpty else { return }
        executeDisplayplacerCommand(cmd, presetID: nil, label: "Custom Display Roles")
    }

    func executeDisplayplacerCommand(_ cmd: String, presetID: String?, label: String) {
        busy = true
        errorMessage = nil
        statusMessage = "Applying \(label)…"
        Task {
            let (rc, out, err) = await Task.detached {
                DisplayStore.runCommand("/bin/zsh", ["-c", cmd])
            }.value
            self.busy = false
            let combined = (out + "\n" + err).trimmingCharacters(in: .whitespacesAndNewlines)
            if rc == 0 || !combined.localizedCaseInsensitiveContains("error") {
                if let pid = presetID {
                    self.root.lastAppliedPresetID = pid
                    self.save()
                }
                self.statusMessage = "Applied: \(label)"
            } else {
                self.errorMessage = "Warning applying \(label): \(combined)"
            }
            try? await Task.sleep(nanoseconds: 700_000_000)
            self.refreshDisplays()
        }
    }

    // MARK: - Folder & Preset CRUD

    func addFolder(name: String, description: String) {
        let clean = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !clean.isEmpty else { return }
        let id = clean.lowercased().replacingOccurrences(of: " ", with: "-") + "-\(Int(Date().timeIntervalSince1970) % 10000)"
        let sig = connected.filter { !$0.isBuiltIn }.map(\.id)
        var aliases: [String: String] = [:]
        for d in connected { aliases[d.id] = d.name }
        let newFolder = MachineFolder(
            id: id,
            name: clean,
            description: description.isEmpty ? "\(connected.count) displays" : description,
            signatureUUIDs: sig,
            displayAliases: aliases,
            presets: []
        )
        root.folders.append(newFolder)
        root.selectedFolderID = id
        save()
    }

    func deleteFolder(id: String) {
        root.folders.removeAll { $0.id == id }
        if root.selectedFolderID == id, let first = root.folders.first {
            root.selectedFolderID = first.id
        }
        save()
    }

    func saveNewPreset(inFolder folderID: String, name: String, subtitle: String, command: String) {
        guard let idx = root.folders.firstIndex(where: { $0.id == folderID }) else { return }
        let cleanName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanName.isEmpty, !command.isEmpty else { return }
        let preset = DisplayPreset(
            id: "\(folderID)-\(Int(Date().timeIntervalSince1970))",
            name: cleanName,
            subtitle: subtitle.isEmpty ? "Saved display arrangement" : subtitle,
            icon: command.contains("+") ? "rectangle.on.rectangle.circle.fill" : "rectangle.split.3x1.fill",
            command: command
        )
        root.folders[idx].presets.append(preset)
        for d in connected where !d.isBuiltIn {
            if !root.folders[idx].signatureUUIDs.contains(d.id) {
                root.folders[idx].signatureUUIDs.append(d.id)
            }
            root.folders[idx].displayAliases[d.id] = d.name
        }
        save()
        statusMessage = "Saved '\(cleanName)' to \(root.folders[idx].name)"
    }

    func overwritePresetWithCurrent(folderID: String, presetID: String) {
        guard !currentCommand.isEmpty,
              let fIdx = root.folders.firstIndex(where: { $0.id == folderID }),
              let pIdx = root.folders[fIdx].presets.firstIndex(where: { $0.id == presetID }) else { return }
        root.folders[fIdx].presets[pIdx].command = currentCommand
        save()
        statusMessage = "Updated '\(root.folders[fIdx].presets[pIdx].name)' with current display layout"
    }

    func movePreset(fromFolderID: String, presetID: String, toFolderID: String) {
        guard fromFolderID != toFolderID,
              let fromIdx = root.folders.firstIndex(where: { $0.id == fromFolderID }),
              let toIdx = root.folders.firstIndex(where: { $0.id == toFolderID }),
              let pIdx = root.folders[fromIdx].presets.firstIndex(where: { $0.id == presetID }) else { return }
        let preset = root.folders[fromIdx].presets.remove(at: pIdx)
        root.folders[toIdx].presets.append(preset)
        save()
    }

    func deletePreset(folderID: String, presetID: String) {
        guard let fIdx = root.folders.firstIndex(where: { $0.id == folderID }) else { return }
        root.folders[fIdx].presets.removeAll { $0.id == presetID }
        save()
    }
}

// MARK: - Views

struct ConnectedDisplaysCard: View {
    @ObservedObject var store: DisplayStore
    @State private var showingSaveSheet = false
    @State private var newPresetName = ""
    @State private var newPresetSubtitle = ""
    @State private var saveSourceIsDraft = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Label("CONNECTED MONITORS (\(store.connected.count))", systemImage: "display.2")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundStyle(.secondary)
                Spacer()
                if let detected = store.detectedFolderID,
                   let f = store.root.folders.first(where: { $0.id == detected }) {
                    HStack(spacing: 4) {
                        Circle().fill(Color.green).frame(width: 6, height: 6)
                        Text("Room \(f.name)")
                            .font(.system(size: 10, weight: .semibold))
                    }
                    .padding(.horizontal, 7)
                    .padding(.vertical, 2)
                    .background(Capsule().fill(Color.green.opacity(0.15)))
                    .foregroundStyle(.green)
                }
                Button {
                    store.refreshDisplays()
                } label: {
                    Image(systemName: "arrow.clockwise")
                        .font(.system(size: 11))
                }
                .buttonStyle(.borderless)
                .help("Re-scan connected monitors")
            }

            if store.connected.isEmpty {
                Text("Scanning connected displays…")
                    .font(.system(size: 12))
                    .foregroundStyle(.secondary)
            } else {
                ForEach(store.connected) { d in
                    HStack(spacing: 8) {
                        Image(systemName: d.isBuiltIn ? "laptopcomputer" : (d.name.localizedCaseInsensitiveContains("Blackmagic") ? "tv.and.mediabox" : "display"))
                            .font(.system(size: 13, weight: .medium))
                            .foregroundStyle(d.isMain ? .blue : .primary)
                            .frame(width: 20)

                        VStack(alignment: .leading, spacing: 1) {
                            HStack(spacing: 5) {
                                Text(d.name)
                                    .font(.system(size: 12, weight: .semibold))
                                if d.isMain {
                                    Text("MAIN")
                                        .font(.system(size: 9, weight: .bold))
                                        .padding(.horizontal, 4)
                                        .padding(.vertical, 1)
                                        .background(RoundedRectangle(cornerRadius: 3).fill(Color.blue.opacity(0.2)))
                                        .foregroundStyle(.blue)
                                }
                                if d.mirrorMasterID != 0 {
                                    Text("MIRRORED")
                                        .font(.system(size: 9, weight: .bold))
                                        .padding(.horizontal, 4)
                                        .padding(.vertical, 1)
                                        .background(RoundedRectangle(cornerRadius: 3).fill(Color.green.opacity(0.2)))
                                        .foregroundStyle(.green)
                                }
                            }
                            Text("\(d.resolution) @ \(d.hz)Hz · \(d.typeLabel)")
                                .font(.system(size: 10))
                                .foregroundStyle(.secondary)
                        }

                        Spacer()

                        Picker("", selection: Binding(
                            get: { store.roleDraft[d.id] ?? .main },
                            set: { newRole in
                                if newRole == .main {
                                    for other in store.connected where other.id != d.id && store.roleDraft[other.id] == .main {
                                        store.roleDraft[other.id] = .mirrorMain
                                    }
                                }
                                store.roleDraft[d.id] = newRole
                            }
                        )) {
                            ForEach(DisplayRole.allCases) { role in
                                Text(role.label).tag(role)
                            }
                        }
                        .labelsHidden()
                        .controlSize(.small)
                        .frame(width: 165)
                    }
                    .padding(.vertical, 2)
                }

                HStack(spacing: 8) {
                    Button {
                        store.applyRoleDraft()
                    } label: {
                        Label("Apply Roles Now", systemImage: "play.fill")
                            .font(.system(size: 11, weight: .semibold))
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
                    .disabled(store.busy)

                    Button {
                        saveSourceIsDraft = true
                        newPresetName = ""
                        newPresetSubtitle = ""
                        showingSaveSheet = true
                    } label: {
                        Label("Save Roles as Preset…", systemImage: "plus.square.on.square")
                            .font(.system(size: 11))
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)

                    Spacer()

                    Button {
                        saveSourceIsDraft = false
                        newPresetName = ""
                        newPresetSubtitle = ""
                        showingSaveSheet = true
                    } label: {
                        Label("Snapshot Current OS Layout…", systemImage: "camera")
                            .font(.system(size: 11))
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                }
                .padding(.top, 2)
            }
        }
        .padding(10)
        .background(RoundedRectangle(cornerRadius: 8).fill(Color(nsColor: .controlBackgroundColor)))
        .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.primary.opacity(0.08), lineWidth: 1))
        .sheet(isPresented: $showingSaveSheet) {
            SavePresetSheet(
                store: store,
                isDraft: saveSourceIsDraft,
                presetName: $newPresetName,
                presetSubtitle: $newPresetSubtitle,
                isPresented: $showingSaveSheet
            )
        }
    }
}

struct SavePresetSheet: View {
    @ObservedObject var store: DisplayStore
    let isDraft: Bool
    @Binding var presetName: String
    @Binding var presetSubtitle: String
    @Binding var isPresented: Bool
    @State private var targetFolderID: String = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(isDraft ? "Save Custom Roles to Folder" : "Snapshot Current Display Layout")
                .font(.headline)

            Picker("Machine Folder", selection: $targetFolderID) {
                ForEach(store.root.folders) { f in
                    Text(f.name).tag(f.id)
                }
            }

            TextField("Preset Name (e.g. Broadcast C27-30 + Private MacBook)", text: $presetName)
                .textFieldStyle(.roundedBorder)

            TextField("Description / Subtitle (optional)", text: $presetSubtitle)
                .textFieldStyle(.roundedBorder)

            let cmd = isDraft ? store.buildRoleDraftCommand() : store.currentCommand
            Text(cmd)
                .font(.system(size: 10, design: .monospaced))
                .foregroundStyle(.secondary)
                .lineLimit(3)
                .padding(6)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 6).fill(Color.secondary.opacity(0.1)))

            HStack {
                Spacer()
                Button("Cancel") { isPresented = false }
                Button("Save Preset") {
                    store.saveNewPreset(
                        inFolder: targetFolderID.isEmpty ? store.root.selectedFolderID : targetFolderID,
                        name: presetName,
                        subtitle: presetSubtitle,
                        command: cmd
                    )
                    isPresented = false
                }
                .buttonStyle(.borderedProminent)
                .disabled(presetName.trimmingCharacters(in: .whitespaces).isEmpty)
            }
        }
        .padding(16)
        .frame(width: 420)
        .onAppear {
            targetFolderID = store.root.selectedFolderID
        }
    }
}

struct PresetRowView: View {
    let folder: MachineFolder
    let preset: DisplayPreset
    @ObservedObject var store: DisplayStore

    var isActive: Bool {
        if !store.currentCommand.isEmpty && store.currentCommand == preset.command {
            return true
        }
        return store.root.lastAppliedPresetID == preset.id
    }

    var body: some View {
        HStack(spacing: 10) {
            Button {
                store.applyPreset(preset)
            } label: {
                HStack(spacing: 10) {
                    Image(systemName: preset.icon)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(isActive ? .green : .accentColor)
                        .frame(width: 24)

                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 6) {
                            Text(preset.name)
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(.primary)
                            if isActive {
                                Text("ACTIVE")
                                    .font(.system(size: 9, weight: .bold))
                                    .padding(.horizontal, 5)
                                    .padding(.vertical, 1)
                                    .background(Capsule().fill(Color.green.opacity(0.2)))
                                    .foregroundStyle(.green)
                            }
                        }
                        Text(preset.subtitle)
                            .font(.system(size: 11))
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                    Spacer()
                }
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)

            Button("Apply") {
                store.applyPreset(preset)
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
            .disabled(store.busy)

            Menu {
                Button("Apply Preset") {
                    store.applyPreset(preset)
                }
                Button("Overwrite with Current Screen Layout") {
                    store.overwritePresetWithCurrent(folderID: folder.id, presetID: preset.id)
                }
                Button("Copy displayplacer Command") {
                    NSPasteboard.general.clearContents()
                    NSPasteboard.general.setString(store.resolveCommand(preset.command), forType: .string)
                    store.statusMessage = "Copied command to clipboard"
                }
                Divider()
                Menu("Move to Folder") {
                    ForEach(store.root.folders.filter { $0.id != folder.id }) { target in
                        Button(target.name) {
                            store.movePreset(fromFolderID: folder.id, presetID: preset.id, toFolderID: target.id)
                        }
                    }
                }
                Divider()
                Button("Delete Preset", role: .destructive) {
                    store.deletePreset(folderID: folder.id, presetID: preset.id)
                }
            } label: {
                Image(systemName: "ellipsis.circle")
                    .font(.system(size: 13))
                    .foregroundStyle(.secondary)
            }
            .menuStyle(.borderlessButton)
            .frame(width: 22)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 7)
        .background(
            RoundedRectangle(cornerRadius: 7)
                .fill(isActive ? Color.accentColor.opacity(0.10) : Color(nsColor: .controlBackgroundColor))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 7)
                .stroke(isActive ? Color.accentColor.opacity(0.45) : Color.primary.opacity(0.06), lineWidth: 1)
        )
    }
}

struct MainPanelView: View {
    @ObservedObject var store: DisplayStore
    let isStandaloneWindow: Bool
    @State private var atLogin = SMAppService.mainApp.status == .enabled
    @State private var showingNewFolder = false
    @State private var newFolderName = ""
    @State private var newFolderDesc = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Header
            HStack {
                Image(systemName: "display.2")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(Color.accentColor)
                Text("Display Presets")
                    .font(.system(size: 15, weight: .bold))
                Text("by Machine / Room")
                    .font(.system(size: 12))
                    .foregroundStyle(.secondary)
                Spacer()
                if store.busy {
                    ProgressView().controlSize(.small)
                }
                if !isStandaloneWindow {
                    Button {
                        WindowManager.shared.openMainWindow(store: store)
                    } label: {
                        Label("Window", systemImage: "macwindow")
                            .font(.system(size: 11))
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                }
            }

            // Connected Monitors + Quick Role Matrix
            ConnectedDisplaysCard(store: store)

            // Folder Tabs (84-101, 84-102, 84-105, etc.)
            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 6) {
                    Image(systemName: "folder.fill")
                        .font(.system(size: 11))
                        .foregroundStyle(.secondary)
                    Text("MACHINE / CLASSROOM FOLDERS")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(.secondary)
                    Spacer()
                    Button {
                        newFolderName = ""
                        newFolderDesc = ""
                        showingNewFolder = true
                    } label: {
                        Label("New Folder", systemImage: "folder.badge.plus")
                            .font(.system(size: 11))
                    }
                    .buttonStyle(.borderless)
                }

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        ForEach(store.root.folders) { folder in
                            let selected = store.root.selectedFolderID == folder.id
                            let isHere = store.detectedFolderID == folder.id
                            Button {
                                store.root.selectedFolderID = folder.id
                                store.save()
                            } label: {
                                HStack(spacing: 5) {
                                    Image(systemName: selected ? "folder.fill" : "folder")
                                        .font(.system(size: 11))
                                    Text(folder.name)
                                        .font(.system(size: 12, weight: selected ? .bold : .medium))
                                    if isHere {
                                        Circle()
                                            .fill(Color.green)
                                            .frame(width: 6, height: 6)
                                            .help("Connected monitors match \(folder.name)")
                                    }
                                    Text("\(folder.presets.count)")
                                        .font(.system(size: 10, weight: .semibold))
                                        .padding(.horizontal, 5)
                                        .padding(.vertical, 1)
                                        .background(Capsule().fill(Color.primary.opacity(0.1)))
                                }
                                .padding(.horizontal, 10)
                                .padding(.vertical, 5)
                                .background(
                                    RoundedRectangle(cornerRadius: 7)
                                        .fill(selected ? Color.accentColor : Color(nsColor: .controlBackgroundColor))
                                )
                                .foregroundStyle(selected ? Color.white : Color.primary)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }

            // Presets inside Selected Folder
            if let folder = store.selectedFolder {
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("\(folder.name) — \(folder.description)")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundStyle(.secondary)
                        Spacer()
                        if store.root.folders.count > 1 {
                            Menu {
                                Button("Reset Default Presets (84-101, 84-102, 84-105)") {
                                    store.root = SeedData.defaultRoot()
                                    store.save()
                                    store.refreshDisplays()
                                }
                                Divider()
                                Button("Delete Folder '\(folder.name)'", role: .destructive) {
                                    store.deleteFolder(id: folder.id)
                                }
                            } label: {
                                Image(systemName: "gearshape")
                                    .font(.system(size: 11))
                                    .foregroundStyle(.secondary)
                            }
                            .menuStyle(.borderlessButton)
                            .frame(width: 20)
                        }
                    }

                    ScrollView {
                        VStack(alignment: .leading, spacing: 6) {
                            ForEach(folder.presets) { preset in
                                PresetRowView(folder: folder, preset: preset, store: store)
                            }
                        }
                    }
                    .frame(maxHeight: isStandaloneWindow ? .infinity : 270)
                }
            }

            // Status / Error Banner
            if let err = store.errorMessage {
                Text(err)
                    .font(.system(size: 11))
                    .foregroundStyle(.orange)
                    .textSelection(.enabled)
            } else if let msg = store.statusMessage {
                Text(msg)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(.green)
            }

            Divider()

            // Footer
            HStack {
                Button("System Display Settings…") {
                    NSWorkspace.shared.open(URL(string: "x-apple.systempreferences:com.apple.Displays-Settings.extension")!)
                }
                .buttonStyle(.link)
                .font(.system(size: 11))

                Spacer()

                Toggle("Open at login", isOn: Binding(get: { atLogin }, set: { v in
                    do {
                        if v { try SMAppService.mainApp.register() }
                        else { try SMAppService.mainApp.unregister() }
                    } catch {}
                    atLogin = SMAppService.mainApp.status == .enabled
                }))
                .toggleStyle(.checkbox)
                .font(.system(size: 11))

                Button("Quit") {
                    NSApp.terminate(nil)
                }
                .buttonStyle(.borderless)
                .font(.system(size: 11))
            }
        }
        .padding(12)
        .frame(width: isStandaloneWindow ? nil : 520)
        .frame(minWidth: 520, minHeight: isStandaloneWindow ? 640 : nil)
        .sheet(isPresented: $showingNewFolder) {
            VStack(alignment: .leading, spacing: 12) {
                Text("New Machine / Classroom Folder")
                    .font(.headline)
                TextField("Folder Name (e.g. 84-101, 84-102, 84-105, Home Studio)", text: $newFolderName)
                    .textFieldStyle(.roundedBorder)
                TextField("Description (e.g. 3 Monitors · Main + Laptop + Broadcast)", text: $newFolderDesc)
                    .textFieldStyle(.roundedBorder)
                HStack {
                    Spacer()
                    Button("Cancel") { showingNewFolder = false }
                    Button("Create Folder") {
                        store.addFolder(name: newFolderName, description: newFolderDesc)
                        showingNewFolder = false
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(newFolderName.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .padding(16)
            .frame(width: 380)
        }
    }
}

// MARK: - Standalone Window Controller

@MainActor
final class WindowManager: NSObject, NSWindowDelegate {
    static let shared = WindowManager()
    private var window: NSWindow?

    func openMainWindow(store: DisplayStore? = nil) {
        let activeStore = store ?? DisplayStore.shared
        if window == nil {
            let rootView = MainPanelView(store: activeStore, isStandaloneWindow: true)
            let w = NSWindow(contentViewController: NSHostingController(rootView: rootView))
            w.title = "Displays — Machine & Classroom Monitor Presets"
            w.styleMask = [.titled, .closable, .miniaturizable, .resizable]
            w.setContentSize(NSSize(width: 600, height: 680))
            w.isReleasedWhenClosed = false
            w.center()
            window = w
        }
        window?.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }
}

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            WindowManager.shared.openMainWindow()
        }
    }

    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        WindowManager.shared.openMainWindow()
        return false
    }
}

struct MenuBarLabelView: View {
    @ObservedObject var store: DisplayStore

    var body: some View {
        HStack(spacing: 3) {
            Image(systemName: "display.2")
            if let detected = store.detectedFolderID {
                Text(detected.replacingOccurrences(of: "84-", with: ""))
                    .font(.system(size: 11, weight: .semibold, design: .rounded))
            }
        }
    }
}

@main
struct DisplaysApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @StateObject private var store = DisplayStore.shared

    var body: some Scene {
        MenuBarExtra {
            MainPanelView(store: store, isStandaloneWindow: false)
        } label: {
            MenuBarLabelView(store: store)
        }
        .menuBarExtraStyle(.window)
    }
}
