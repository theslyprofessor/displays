import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraPose, CaptionBeat, CursorAction, FluidStage } from "./FluidCameraRig";

const FONT_MONO = "'SF Mono', 'JetBrains Mono', Menlo, monospace";

// ============================================================================
// 1. BLACKBOX — 24-BIT LOSSLESS FLAC / WAV MULTITRACK DAW SAFETY RECORDER
// ============================================================================

const BLACKBOX_POSES: CameraPose[] = [
  // Initial overview
  { startFrame: 0, durationFrames: 1, scale: 1.0, focusX: 0, focusY: 0, rotateX: 5, rotateY: -3 },
  // Beat 1: Smooth zoom into top Recording Header & CoreAudio AUHAL status
  { startFrame: 35, durationFrames: 55, scale: 1.95, focusX: -150, focusY: -225, rotateX: 1.5, rotateY: 1 },
  // Beat 2: Glide to 8-Channel Live dBFS Meter Grid (SSL 2+ Mk II)
  { startFrame: 360, durationFrames: 60, scale: 1.88, focusX: -130, focusY: -35, rotateX: 1, rotateY: -1.5 },
  // Beat 3: Glide right to Format Picker (WAV -> 24-bit Lossless FLAC) & Storage Compression Gauge
  { startFrame: 750, durationFrames: 60, scale: 1.98, focusX: 255, focusY: -95, rotateX: 1.5, rotateY: -2 },
  // Beat 4: Glide down-right to Sample-Exact `blackbox join` + /Volumes/tank Archive
  { startFrame: 1170, durationFrames: 60, scale: 1.95, focusX: 255, focusY: 165, rotateX: 1, rotateY: 1.5 },
  // Beat 5: Pull back to full studio view before end card
  { startFrame: 1540, durationFrames: 65, scale: 1.0, focusX: 0, focusY: 0, rotateX: 3, rotateY: 0 },
];

const BLACKBOX_ACTIONS: CursorAction[] = [
  // Click Enable Toggle in Header
  { moveStartFrame: 50, moveDurationFrames: 42, fromX: 640, fromY: 360, toX: 565, toY: 138, clickFrame: 96, label: "Enable Always-On AUHAL Capture" },
  // Click Channel 1-8 Preset in Meter Grid
  { moveStartFrame: 380, moveDurationFrames: 45, fromX: 565, fromY: 138, toX: 515, toY: 332, clickFrame: 430, label: "8 Channels Armed · 0 Lost Samples" },
  // Click 24-bit Lossless FLAC Format Button
  { moveStartFrame: 770, moveDurationFrames: 48, fromX: 515, fromY: 332, toX: 830, toY: 165, clickFrame: 824, label: "Switch to 24-Bit Lossless FLAC (-88.6%)" },
  // Click Join Today's Chunks Button
  { moveStartFrame: 1190, moveDurationFrames: 48, fromX: 830, fromY: 165, toX: 1120, toY: 505, clickFrame: 1244, label: "Stitch Sample-Exact Stems" },
];

const BLACKBOX_CAPTIONS: CaptionBeat[] = [
  {
    startFrame: 20,
    endFrame: 350,
    stepTag: "01 · COREAUDIO AUHAL ENGINE",
    headline: "Records your audio interface input-only with 0 lost samples and 0 DAW impact.",
    accentColor: "#10b981",
  },
  {
    startFrame: 365,
    endFrame: 740,
    stepTag: "02 · MULTITRACK METER GRID",
    headline: "Captures every interface channel independently, even if your DAW stops or crashes.",
    accentColor: "#38bdf8",
  },
  {
    startFrame: 755,
    endFrame: 1160,
    stepTag: "03 · 24-BIT LOSSLESS FLAC",
    headline: "Native 24-bit FLAC shrinks an 8-channel studio day from 33.2 GB down to 3.7 GB.",
    accentColor: "#a855f7",
  },
  {
    startFrame: 1175,
    endFrame: 1600,
    stepTag: "04 · SAMPLE-EXACT STEM JOIN",
    headline: "Stitches 10-minute chunks into one continuous per-channel stem ready for any DAW.",
    accentColor: "#f59e0b",
  },
];

const BlackboxInteractiveWindow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flacSelected = frame >= 824;
  const flacProgress = spring({
    frame: Math.max(0, frame - 824),
    fps,
    config: { damping: 18, stiffness: 95 },
  });

  const joinTriggered = frame >= 1244;
  const joinProgress = spring({
    frame: Math.max(0, frame - 1244),
    fps,
    config: { damping: 18, stiffness: 90 },
  });

  const gbPerDay = interpolate(flacProgress, [0, 1], [33.2, 3.7]);
  const freeHours = interpolate(flacProgress, [0, 1], [58, 520]);
  const barWidthPct = interpolate(flacProgress, [0, 1], [88, 14]);

  const channels = [
    { ch: 1, name: "Lead Vocal", active: true, baseDb: -14 },
    { ch: 2, name: "Acoustic Gtr", active: true, baseDb: -19 },
    { ch: 3, name: "SM57 Snare", active: false, baseDb: -118 },
    { ch: 4, name: "Kick Out", active: false, baseDb: -118 },
    { ch: 5, name: "Synth L", active: false, baseDb: -118 },
    { ch: 6, name: "Synth R", active: false, baseDb: -118 },
    { ch: 7, name: "Room L", active: false, baseDb: -118 },
    { ch: 8, name: "Room R", active: false, baseDb: -118 },
  ];

  return (
    <div
      style={{
        width: 1280,
        height: 760,
        borderRadius: 24,
        background: "linear-gradient(165deg, #0f172a 0%, #090d16 100%)",
        border: "1.5px solid rgba(148, 163, 184, 0.22)",
        boxShadow: "0 45px 100px -20px rgba(0, 0, 0, 0.85)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* macOS Window Title Bar */}
      <div
        style={{
          height: 46,
          padding: "0 20px",
          background: "rgba(15, 23, 42, 0.95)",
          borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#10b981" }} />
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: "#cbd5e1" }}>
          Blackbox · Multitrack CoreAudio Safety Recorder
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: "#10b981", fontWeight: 700 }}>
          AUHAL INPUT-ONLY · 1.3% CPU
        </div>
      </div>

      {/* Main 2-Column Studio Body */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.08fr 0.92fr", gap: 22, padding: 24 }}>
        {/* Left Column: Recording Status + 8-Channel Meter Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Card 1: Live Capture Header */}
          <div
            style={{
              padding: 22,
              borderRadius: 18,
              background: "rgba(15, 23, 42, 0.78)",
              border: "1.5px solid rgba(16, 185, 129, 0.45)",
              boxShadow: "0 18px 40px -15px rgba(16, 185, 129, 0.22)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#10b981",
                    boxShadow: "0 0 16px #10b981",
                  }}
                />
                <div>
                  <div style={{ fontSize: 19, fontWeight: 800, color: "#f8fafc" }}>
                    Recording SSL 2+ Mk II · 8 Channels @ 48 kHz
                  </div>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
                    ~/Recordings/Blackbox/2026-10-26/204741/Ch01..Ch08.{flacSelected ? "flac" : "wav"}
                  </div>
                </div>
              </div>

              {/* Animated Switch */}
              <div
                style={{
                  width: 54,
                  height: 30,
                  borderRadius: 999,
                  background: "#10b981",
                  padding: 3,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#ffffff" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "rgba(16, 185, 129, 0.16)",
                  color: "#34d399",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                }}
              >
                LOST SAMPLES: 0
              </span>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "rgba(56, 189, 248, 0.16)",
                  color: "#38bdf8",
                  border: "1px solid rgba(56, 189, 248, 0.4)",
                }}
              >
                DAW BUFFER IMPACT: ZERO
              </span>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "rgba(168, 85, 247, 0.16)",
                  color: "#c084fc",
                  border: "1px solid rgba(168, 85, 247, 0.4)",
                }}
              >
                RING BUFFER: 10.0s LOCK-FREE
              </span>
            </div>
          </div>

          {/* Card 2: 8-Channel Live dBFS Meter Grid */}
          <div
            style={{
              flex: 1,
              padding: 22,
              borderRadius: 18,
              background: "rgba(15, 23, 42, 0.72)",
              border: "1.5px solid rgba(56, 189, 248, 0.32)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc" }}>
                  8-Channel Live Input Meters (SSL 2+ Mk II)
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                  Active analog inputs compress to ~45%; idle channels compress to 0.4 KB in FLAC
                </div>
              </div>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#38bdf8",
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: "rgba(56, 189, 248, 0.14)",
                }}
              >
                CHANNELS 1-8 ARMED
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10, margin: "16px 0" }}>
              {channels.map((c, idx) => {
                const wave = c.active
                  ? Math.sin(frame / (5 + idx * 1.7) + idx) * 9 + Math.cos(frame / 3.2) * 4
                  : 0;
                const db = c.active ? Math.min(-2, c.baseDb + wave) : -120;
                const frac = c.active ? Math.max(0.08, Math.min(0.95, (db + 60) / 60)) : 0.04;
                return (
                  <div
                    key={c.ch}
                    style={{
                      padding: "12px 8px",
                      borderRadius: 12,
                      background: "rgba(2, 6, 23, 0.75)",
                      border: `1.5px solid ${c.active ? "#38bdf877" : "rgba(148,163,184,0.15)"}`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 155,
                        borderRadius: 6,
                        background: "rgba(30, 41, 59, 0.65)",
                        display: "flex",
                        alignItems: "flex-end",
                        padding: 2,
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: `${frac * 100}%`,
                          borderRadius: 4,
                          background: c.active
                            ? "linear-gradient(180deg, #38bdf8 0%, #10b981 100%)"
                            : "rgba(148, 163, 184, 0.25)",
                        }}
                      />
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 800, color: "#f8fafc" }}>
                      Ch {c.ch}
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: c.active ? "#34d399" : "#64748b" }}>
                      {c.active ? `${db.toFixed(0)} dB` : "-inf"}
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: c.active ? "rgba(16, 185, 129, 0.16)" : "rgba(148, 163, 184, 0.1)",
                        color: c.active ? "#34d399" : "#94a3b8",
                      }}
                    >
                      {flacSelected ? (c.active ? "180 KB" : "0.4 KB") : "397 KB"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8 }}>
                {["All 8 Channels", "Ch 1-2 Stereo", "Ch 1-4"].map((t, i) => (
                  <span
                    key={t}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      background: i === 0 ? "#38bdf8" : "rgba(30, 41, 59, 0.85)",
                      color: i === 0 ? "#020617" : "#cbd5e1",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: "#94a3b8" }}>
                10 Hz Ballistics · Zero Device Re-Open
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Format & Storage Card + Sample-Exact Join Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Card 3: Format Picker (24-bit Lossless FLAC vs WAV) */}
          <div
            style={{
              padding: 22,
              borderRadius: 18,
              background: "rgba(15, 23, 42, 0.78)",
              border: `1.5px solid ${flacSelected ? "#a855f788" : "rgba(148, 163, 184, 0.25)"}`,
              boxShadow: flacSelected ? "0 20px 50px -15px rgba(168, 85, 247, 0.28)" : "none",
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc", marginBottom: 4 }}>
              Recording Format & Daily Storage Footprint
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>
              Native Apple AudioToolbox 24-bit FLAC encoding on the writer thread
            </div>

            {/* Segmented Format Picker */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                padding: 5,
                borderRadius: 12,
                background: "#020617",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 9,
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  background: flacSelected
                    ? "linear-gradient(90deg, #a855f7, #38bdf8)"
                    : "transparent",
                  color: flacSelected ? "#020617" : "#94a3b8",
                }}
              >
                24-Bit Lossless FLAC (-88%)
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 9,
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  background: !flacSelected ? "rgba(51, 65, 85, 0.9)" : "transparent",
                  color: !flacSelected ? "#f8fafc" : "#64748b",
                }}
              >
                24-Bit Uncompressed WAV
              </div>
            </div>

            {/* Animated Storage Comparison Bar */}
            <div
              style={{
                padding: 16,
                borderRadius: 14,
                background: "rgba(2, 6, 23, 0.8)",
                border: "1px solid rgba(148, 163, 184, 0.16)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#cbd5e1" }}>
                  8-Channel 8-Hour Studio Day:
                </span>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 18,
                    fontWeight: 900,
                    color: flacSelected ? "#34d399" : "#f59e0b",
                  }}
                >
                  {gbPerDay.toFixed(1)} GB / day
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 14,
                  borderRadius: 999,
                  background: "rgba(30, 41, 59, 0.8)",
                  overflow: "hidden",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: `${barWidthPct}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: flacSelected
                      ? "linear-gradient(90deg, #10b981, #38bdf8)"
                      : "linear-gradient(90deg, #f59e0b, #ef4444)",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT_MONO, fontSize: 12 }}>
                <span style={{ color: "#94a3b8" }}>245 GB Free on SSD</span>
                <span style={{ color: "#38bdf8", fontWeight: 700 }}>
                  ~{freeHours.toFixed(0)} hours of 8-ch recording
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Sample-Exact `blackbox join` & /Volumes/tank Archive */}
          <div
            style={{
              flex: 1,
              padding: 22,
              borderRadius: 18,
              background: "rgba(15, 23, 42, 0.78)",
              border: `1.5px solid ${joinTriggered ? "#f59e0b88" : "rgba(148, 163, 184, 0.25)"}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc" }}>
                  Sample-Exact Stem Stitcher (`blackbox join`)
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                  Joins 10-minute chunk folders into continuous DAW stems with 0 frame drift
                </div>
              </div>
              <div
                style={{
                  padding: "9px 18px",
                  borderRadius: 10,
                  background: joinTriggered ? "#10b981" : "#f59e0b",
                  color: "#020617",
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                {joinTriggered ? "✓ Joined 8 Stems" : "Join Today's Chunks"}
              </div>
            </div>

            {/* Visual Chunk -> Continuous Stem Animation */}
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                background: "rgba(2, 6, 23, 0.8)",
                border: "1px solid rgba(148, 163, 184, 0.16)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: interpolate(joinProgress, [0, 1], [10, 0]),
                  marginBottom: 10,
                }}
              >
                {["201000 (10m)", "202000 (10m)", "203000 (10m)", "204000 (10m)"].map((c, i) => (
                  <div
                    key={c}
                    style={{
                      flex: 1,
                      padding: "8px 6px",
                      borderRadius: interpolate(joinProgress, [0, 1], [8, i === 0 || i === 3 ? 8 : 0]),
                      background: joinTriggered
                        ? "linear-gradient(90deg, rgba(16,185,129,0.35), rgba(56,189,248,0.35))"
                        : "rgba(30, 41, 59, 0.9)",
                      border: `1px solid ${joinTriggered ? "#10b981" : "rgba(148,163,184,0.25)"}`,
                      textAlign: "center",
                      fontFamily: FONT_MONO,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#f8fafc",
                    }}
                  >
                    {joinTriggered && i === 1
                      ? "joined/201000-204000/Ch01..08.flac"
                      : joinTriggered
                      ? "✓"
                      : c}
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: joinTriggered ? "#34d399" : "#94a3b8" }}>
                {joinTriggered
                  ? "✓ 4 chunks -> 40.0 min exact (115,200,000 / 115,200,000 frames) + synced to /Volumes/tank"
                  : "Ready: 4 contiguous chunks in 2026-10-26 · Auto-archives nightly to 81 TB NAS"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BlackboxFluidLaunch: React.FC<{ vertical?: boolean }> = ({ vertical = false }) => (
  <FluidStage
    poses={BLACKBOX_POSES}
    actions={BLACKBOX_ACTIONS}
    captions={BLACKBOX_CAPTIONS}
    accentColor="#10b981"
    secondaryColor="#38bdf8"
    productName="Blackbox"
    productTagline="Always-On 24-Bit Lossless FLAC Multitrack Safety Recorder"
    websiteUrl="buildforwardtech.com/blackbox"
    vertical={vertical}
  >
    <BlackboxInteractiveWindow />
  </FluidStage>
);

// ============================================================================
// 2. AMBIENT — ALWAYS-ON STUDIO AUDIO RECORDER, LIVE WHISPER & NAS ARCHIVE
// ============================================================================

const AMBIENT_POSES: CameraPose[] = [
  { startFrame: 0, durationFrames: 1, scale: 1.0, focusX: 0, focusY: 0, rotateX: 5, rotateY: -3 },
  // Beat 1: Zoom into Menu Bar Status Item + Live MBP & SSL dBFS Meters
  { startFrame: 35, durationFrames: 55, scale: 1.98, focusX: -120, focusY: -235, rotateX: 1.5, rotateY: 1 },
  // Beat 2: Glide to Audio Recordings Browser & In-App Opus/WAV Player + 7-Day Retention
  { startFrame: 360, durationFrames: 60, scale: 1.88, focusX: -110, focusY: 55, rotateX: 1, rotateY: -1.5 },
  // Beat 3: Glide to Instant Whisper Transcript Search & 1-Click Copy
  { startFrame: 760, durationFrames: 60, scale: 1.95, focusX: 230, focusY: 35, rotateX: 1.5, rotateY: -2 },
  // Beat 4: Glide to Mac mini 81 TB /Volumes/tank Automatic Archive
  { startFrame: 1170, durationFrames: 60, scale: 1.98, focusX: 250, focusY: -215, rotateX: 1, rotateY: 1 },
  // Beat 5: Pull back to full Studio Window
  { startFrame: 1540, durationFrames: 65, scale: 1.0, focusX: 0, focusY: 0, rotateX: 3, rotateY: 0 },
];

const AMBIENT_ACTIONS: CursorAction[] = [
  // Click Menu Bar Item / Meter Header
  { moveStartFrame: 48, moveDurationFrames: 42, fromX: 640, fromY: 360, toX: 430, toY: 96, clickFrame: 94, label: "Live MBP Mic + SSL 2+ Meters" },
  // Click Play on SSL 2+ Recording
  { moveStartFrame: 380, moveDurationFrames: 46, fromX: 430, fromY: 96, toX: 48, toY: 368, clickFrame: 432, label: "Play 5-Min SSL 2+ Recording" },
  // Click Copy on Matched Whisper Transcript Line
  { moveStartFrame: 785, moveDurationFrames: 48, fromX: 48, fromY: 368, toX: 1185, toY: 245, clickFrame: 838, label: "Copy Exact Timestamped Quote" },
  // Click Archive to /Volumes/tank Now
  { moveStartFrame: 1190, moveDurationFrames: 48, fromX: 1185, fromY: 245, toX: 1095, toY: 156, clickFrame: 1244, label: "Sync to 81 TB NAS (/Volumes/tank)" },
];

const AMBIENT_CAPTIONS: CaptionBeat[] = [
  {
    startFrame: 20,
    endFrame: 350,
    stepTag: "01 · NATIVE MENU BAR + DUAL METERS",
    headline: "Always-on macOS menu bar item monitoring MacBook Mic and SSL 2+ simultaneously.",
    accentColor: "#ef4444",
  },
  {
    startFrame: 365,
    endFrame: 750,
    stepTag: "02 · BROWSE & PLAY EVERY RECORDING",
    headline: "Play 5-minute Opus chunks, F5 WAV dictations, and live 24-bit WAVs right in the Studio.",
    accentColor: "#38bdf8",
  },
  {
    startFrame: 765,
    endFrame: 1160,
    stepTag: "03 · ON-DEVICE WHISPER METAL SEARCH",
    headline: "Search 31+ days of local Whisper transcripts in milliseconds and copy any quote.",
    accentColor: "#10b981",
  },
  {
    startFrame: 1175,
    endFrame: 1600,
    stepTag: "04 · 7-DAY LOCAL + PERMANENT NAS ARCHIVE",
    headline: "Keeps 7 days on your laptop SSD while archiving every recording forever to /Volumes/tank.",
    accentColor: "#a855f7",
  },
];

const AmbientInteractiveWindow: React.FC = () => {
  const frame = useCurrentFrame();
  const isPlaying = frame >= 432 && frame < 1150;
  const copied = frame >= 838;
  const archived = frame >= 1244;

  const queryText = "bus compressor threshold";
  const typedChars =
    frame < 775
      ? 0
      : Math.min(queryText.length, Math.floor((frame - 775) / 1.8));
  const currentQuery = queryText.slice(0, typedChars);

  return (
    <div
      style={{
        width: 1280,
        height: 760,
        borderRadius: 24,
        background: "linear-gradient(165deg, #111827 0%, #070b14 100%)",
        border: "1.5px solid rgba(148, 163, 184, 0.24)",
        boxShadow: "0 45px 100px -20px rgba(0, 0, 0, 0.88)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Simulated macOS Menu Bar Strip */}
      <div
        style={{
          height: 38,
          padding: "0 22px",
          background: "rgba(2, 6, 23, 0.95)",
          borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: FONT_MONO,
          fontSize: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontWeight: 800, color: "#f8fafc" }}> Ambient Studio</span>
          <span style={{ color: "#94a3b8" }}>Audio Recordings</span>
          <span style={{ color: "#94a3b8" }}>Transcripts</span>
          <span style={{ color: "#94a3b8" }}>Blackbox</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "3px 10px",
              borderRadius: 6,
              background: "rgba(239, 68, 68, 0.18)",
              border: "1px solid rgba(239, 68, 68, 0.55)",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
            <span style={{ color: "#f8fafc", fontWeight: 800 }}>REC · MBP + SSL</span>
          </div>
          <span style={{ color: "#cbd5e1" }}>Mon Oct 26 9:42 PM</span>
        </div>
      </div>

      {/* Studio Header with Live Meters & Retention Controls */}
      <div
        style={{
          padding: "18px 24px",
          background: "rgba(15, 23, 42, 0.9)",
          borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#ef4444",
                boxShadow: "0 0 14px #ef4444",
              }}
            />
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#f8fafc" }}>
                AMBIENT RECORDING (MBP + SSL 2+ MK II)
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                Capture engine: blackbox-engine (CoreAudio AUHAL · 0 lost samples · ~1.3% CPU)
              </div>
            </div>
          </div>

          {/* Live dBFS Meters */}
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            {[
              { label: "MBP MIC", db: -24 + Math.sin(frame / 4) * 6, color: "#10b981" },
              { label: "SSL 1-2", db: -16 + Math.cos(frame / 3.5) * 7, color: "#38bdf8" },
            ].map((m) => (
              <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 800, color: "#cbd5e1" }}>
                  {m.label}
                </span>
                <div
                  style={{
                    width: 96,
                    height: 10,
                    borderRadius: 4,
                    background: "rgba(30, 41, 59, 0.9)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(15, Math.min(95, ((m.db + 60) / 60) * 100))}%`,
                      height: "100%",
                      background: m.color,
                    }}
                  />
                </div>
                <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 800, color: m.color }}>
                  {m.db.toFixed(0)} dB
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <span
              style={{
                padding: "8px 14px",
                borderRadius: 9,
                background: "rgba(30, 41, 59, 0.9)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Keep Audio: 7 Days (168h)
            </span>
            <span
              style={{
                padding: "8px 16px",
                borderRadius: 9,
                background: archived
                  ? "linear-gradient(90deg, #10b981, #38bdf8)"
                  : "rgba(168, 85, 247, 0.25)",
                border: `1.5px solid ${archived ? "#10b981" : "#a855f7"}`,
                color: archived ? "#020617" : "#e9d5ff",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {archived ? "✓ Synced to /Volumes/tank (81 TB)" : "Archive to /Volumes/tank Now"}
            </span>
          </div>
        </div>
      </div>

      {/* Split View: Left = Audio Recordings Player, Right = Live Whisper Transcripts Search */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        {/* Left Pane: Audio Recordings */}
        <div
          style={{
            padding: 20,
            borderRight: "1px solid rgba(148, 163, 184, 0.15)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#f8fafc" }}>
              Audio Recordings (157 Files · Opus + 24-Bit WAV + Dictations)
            </div>
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#38bdf8" }}>
              ~/ambient/audio/
            </span>
          </div>

          {[
            {
              tag: "RAW",
              color: "#f59e0b",
              title: "2026-10-26 214000 (Recording now)",
              path: "~/ambient/raw/ssl/2026-10-26/214000/Ch01.wav",
              meta: "24-BIT WAV · 14.2 MB",
              active: false,
            },
            {
              tag: "SSL",
              color: "#38bdf8",
              title: "Mon Oct 26 · 9:35:00 PM (SSL 2+ Mk II Ch 1-2)",
              path: "~/ambient/audio/ssl/20261026-213500.opus",
              meta: isPlaying ? "PLAYING 01:42 / 05:00 · OPUS" : "OPUS · 482 KB",
              active: isPlaying,
            },
            {
              tag: "MBP",
              color: "#10b981",
              title: "Mon Oct 26 · 9:35:00 PM (MacBook Pro Mic)",
              path: "~/ambient/audio/mbp/20261026-213500.opus",
              meta: "OPUS · 512 KB",
              active: false,
            },
            {
              tag: "DIC",
              color: "#a855f7",
              title: "Mon Oct 26 · 8:54:12 PM (F5 Voice Dictation)",
              path: "~/ambient/audio/dic/20261026-205412.wav",
              meta: "WAV · 1.8 MB",
              active: false,
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                background: item.active
                  ? "rgba(56, 189, 248, 0.14)"
                  : "rgba(15, 23, 42, 0.65)",
                border: `1.5px solid ${item.active ? "#38bdf8" : "rgba(148, 163, 184, 0.14)"}`,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: item.active ? "#38bdf8" : "rgba(56, 189, 248, 0.18)",
                  color: item.active ? "#020617" : "#38bdf8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 15,
                }}
              >
                {item.active ? "■" : "▶"}
              </div>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: `${item.color}22`,
                  color: item.color,
                }}
              >
                {item.tag}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>{item.title}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#94a3b8" }}>{item.path}</div>
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: item.active ? "#38bdf8" : "#cbd5e1" }}>
                {item.meta}
              </div>
            </div>
          ))}
        </div>

        {/* Right Pane: Instant Whisper Transcripts Search */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#f8fafc" }}>
              Whisper Metal Transcripts (31 Days · Silero VAD)
            </div>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                background: "rgba(2, 6, 23, 0.9)",
                border: "1.5px solid #10b98188",
                fontFamily: FONT_MONO,
                fontSize: 12,
                color: "#34d399",
                minWidth: 235,
              }}
            >
              🔍 {currentQuery || "Search transcripts…"}
            </div>
          </div>

          {[
            {
              time: "21:32:14",
              src: "ssl",
              color: "#38bdf8",
              text: "Set the mix bus compressor threshold so the needle barely kisses 2 dB on the chorus.",
              highlight: true,
            },
            {
              time: "21:33:02",
              src: "ssl",
              color: "#38bdf8",
              text: "Keep a slow 30 ms attack so the snare transient punches right through.",
              highlight: false,
            },
            {
              time: "21:34:19",
              src: "mbp",
              color: "#10b981",
              text: "Print both the main mix and the instrumental stem in 24-bit FLAC.",
              highlight: false,
            },
          ].map((line, i) => (
            <div
              key={i}
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                background:
                  line.highlight && typedChars > 4
                    ? "rgba(16, 185, 129, 0.16)"
                    : "rgba(15, 23, 42, 0.65)",
                border: `1.5px solid ${
                  line.highlight && typedChars > 4 ? "#10b981" : "rgba(148, 163, 184, 0.14)"
                }`,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: "#94a3b8" }}>
                [{line.time}]
              </span>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 6,
                  background: `${line.color}22`,
                  color: line.color,
                }}
              >
                {line.src.toUpperCase()}
              </span>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#f8fafc", lineHeight: 1.4 }}>
                {line.text}
              </div>
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: line.highlight && copied ? "#10b981" : "rgba(30, 41, 59, 0.9)",
                  color: line.highlight && copied ? "#020617" : "#cbd5e1",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {line.highlight && copied ? "✓ Copied" : "Copy"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AmbientFluidLaunch: React.FC<{ vertical?: boolean }> = ({ vertical = false }) => (
  <FluidStage
    poses={AMBIENT_POSES}
    actions={AMBIENT_ACTIONS}
    captions={AMBIENT_CAPTIONS}
    accentColor="#ef4444"
    secondaryColor="#38bdf8"
    productName="Ambient"
    productTagline="Always-On Studio Audio Recorder, Whisper Search & 81 TB NAS Archive"
    websiteUrl="buildforwardtech.com/ambient"
    vertical={vertical}
  >
    <AmbientInteractiveWindow />
  </FluidStage>
);

// ============================================================================
// 3. BARSTAGE — PIXEL-ACCURATE MACOS MENU BAR MIRROR, NOTCH RESCUE & REORDER
// ============================================================================

const BARSTAGE_POSES: CameraPose[] = [
  { startFrame: 0, durationFrames: 1, scale: 1.0, focusX: 0, focusY: 0, rotateX: 5, rotateY: -3 },
  // Beat 1: Zoom into Live Menu Bar Mirror & Preset Switcher
  { startFrame: 35, durationFrames: 55, scale: 1.98, focusX: -140, focusY: -185, rotateX: 1.5, rotateY: 1 },
  // Beat 2: Glide to Notch Rescue Bar (Icons Hidden Behind Camera Notch)
  { startFrame: 480, durationFrames: 60, scale: 2.02, focusX: 120, focusY: -35, rotateX: 1, rotateY: -1.5 },
  // Beat 3: Glide down to Physical #1 Rightmost -> Leftmost Slot Reorder
  { startFrame: 960, durationFrames: 60, scale: 1.95, focusX: 0, focusY: 175, rotateX: 1.5, rotateY: 1 },
  // Beat 4: Pull back to full view
  { startFrame: 1480, durationFrames: 65, scale: 1.0, focusX: 0, focusY: 0, rotateX: 3, rotateY: 0 },
];

const BARSTAGE_ACTIONS: CursorAction[] = [
  // Click "Studio + My Apps" Favorite Pill
  { moveStartFrame: 50, moveDurationFrames: 42, fromX: 640, fromY: 360, toX: 345, toY: 112, clickFrame: 96, label: "Activate Studio + My Apps Preset" },
  // Click Notch-Hidden Icon to Open Its Menu
  { moveStartFrame: 500, moveDurationFrames: 46, fromX: 345, fromY: 112, toX: 790, toY: 295, clickFrame: 552, label: "Open Hidden Icon via AXPress" },
  // Click "Apply Slot Order to macOS Menu Bar"
  { moveStartFrame: 985, moveDurationFrames: 48, fromX: 790, fromY: 295, toX: 1110, toY: 495, clickFrame: 1038, label: "Physical Command-Drag Reorder" },
];

const BARSTAGE_CAPTIONS: CaptionBeat[] = [
  {
    startFrame: 20,
    endFrame: 470,
    stepTag: "01 · LIVE PIXEL-ACCURATE MIRROR",
    headline: "Mirrors your real macOS menu bar with 1-click favorites for Studio, Teaching, and DAW.",
    accentColor: "#38bdf8",
  },
  {
    startFrame: 485,
    endFrame: 950,
    stepTag: "02 · 1-CLICK NOTCH RESCUE",
    headline: "Detects icons swallowed behind the MacBook camera notch and opens their menus directly.",
    accentColor: "#f59e0b",
  },
  {
    startFrame: 965,
    endFrame: 1580,
    stepTag: "03 · PHYSICAL SLOT REORDERING",
    headline: "Pins your own apps to Slots #1-#8 rightmost via automated Command-drag.",
    accentColor: "#10b981",
  },
];

const BarStageInteractiveWindow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const notchClicked = frame >= 552;
  const orderApplied = frame >= 1038;
  const reorderSpring = spring({
    frame: Math.max(0, frame - 1038),
    fps,
    config: { damping: 16, stiffness: 105 },
  });

  const slots = [
    { slot: "#1", name: "BarStage", badge: "MY APP", color: "#38bdf8" },
    { slot: "#2", name: "Ambient", badge: "MY APP", color: "#ef4444" },
    { slot: "#3", name: "ScreenStage (CV)", badge: "MY APP", color: "#10b981" },
    { slot: "#4", name: "QuietPlease", badge: "MY APP", color: "#a855f7" },
    { slot: "#5", name: "Tidy · 16! CPU · Mem", badge: "MY APP", color: "#f59e0b" },
    { slot: "#6", name: "Loops", badge: "MY APP", color: "#38bdf8" },
  ];

  return (
    <div
      style={{
        width: 1280,
        height: 760,
        borderRadius: 24,
        background: "linear-gradient(165deg, #0f172a 0%, #070b14 100%)",
        border: "1.5px solid rgba(148, 163, 184, 0.24)",
        boxShadow: "0 45px 100px -20px rgba(0, 0, 0, 0.88)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: 24,
        gap: 20,
      }}
    >
      {/* Top Header + Dependent Preset Dropdown & Favorites Bar */}
      <div
        style={{
          padding: "16px 22px",
          borderRadius: 16,
          background: "rgba(15, 23, 42, 0.9)",
          border: "1px solid rgba(56, 189, 248, 0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc" }}>BarStage</div>
          <span
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: "rgba(56, 189, 248, 0.16)",
              border: "1px solid #38bdf8",
              fontSize: 13,
              fontWeight: 800,
              color: "#38bdf8",
            }}
          >
            Preset: Studio + My Apps ▾
          </span>
          {["★ Studio + My Apps", "★ Teaching Clean", "★ DAW Tracking"].map((fav, idx) => (
            <span
              key={fav}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                background: idx === 0 ? "#10b981" : "rgba(30, 41, 59, 0.85)",
                color: idx === 0 ? "#020617" : "#cbd5e1",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {fav}
            </span>
          ))}
        </div>
        <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: "#34d399", fontWeight: 700 }}>
          22 VISIBLE · 10 HIDDEN
        </span>
      </div>

      {/* Section 1: Live Menu Bar Mirror Strip */}
      <div
        style={{
          padding: 20,
          borderRadius: 18,
          background: "rgba(15, 23, 42, 0.78)",
          border: "1.5px solid rgba(56, 189, 248, 0.3)",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, color: "#94a3b8", marginBottom: 12 }}>
          LIVE MACOS MENU BAR MIRROR (1:1 SPATIAL COORDINATES)
        </div>
        <div
          style={{
            height: 48,
            borderRadius: 12,
            background: "linear-gradient(90deg, #1e1b4b 0%, #0f172a 50%, #172554 100%)",
            border: "1px solid rgba(255,255,255,0.16)",
            padding: "0 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: FONT_MONO,
            fontSize: 13,
          }}
        >
          <span style={{ fontWeight: 800 }}> BarStage File View Presets</span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ color: "#38bdf8", fontWeight: 800 }}>Loops</span>
            <span style={{ color: "#f59e0b", fontWeight: 800 }}>16! CPU 14% · Mem 68%</span>
            <span style={{ color: "#a855f7", fontWeight: 800 }}>QuietPlease</span>
            <span style={{ color: "#10b981", fontWeight: 800 }}>🖥 CV</span>
            <span style={{ color: "#ef4444", fontWeight: 800 }}>● REC</span>
            <span style={{ color: "#f8fafc", fontWeight: 800 }}>Wi-Fi · Mon 9:42 PM</span>
          </div>
        </div>
      </div>

      {/* Section 2: Notch Rescue Strip */}
      <div
        style={{
          padding: 20,
          borderRadius: 18,
          background: "rgba(15, 23, 42, 0.78)",
          border: `1.5px solid ${notchClicked ? "#10b981" : "rgba(245, 158, 11, 0.45)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b" }}>
            Swallowed Behind Camera Notch (x &lt; 575) · 1-Click AXPress Rescue
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            Click any notch-blocked icon below to pop open its live macOS menu immediately
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {["Docker Desktop", "Tailscale", "1Password", "Dropbox"].map((name, i) => (
            <div
              key={name}
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                background:
                  notchClicked && i === 1
                    ? "rgba(16, 185, 129, 0.25)"
                    : "rgba(245, 158, 11, 0.14)",
                border: `1.5px solid ${notchClicked && i === 1 ? "#10b981" : "#f59e0b77"}`,
                fontFamily: FONT_MONO,
                fontSize: 12,
                fontWeight: 800,
                color: notchClicked && i === 1 ? "#34d399" : "#fde68a",
              }}
            >
              {notchClicked && i === 1 ? `✓ ${name} Menu Opened` : `⚠ ${name}`}
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Physical Slot Ordering (#1 Rightmost -> Leftmost) */}
      <div
        style={{
          flex: 1,
          padding: 20,
          borderRadius: 18,
          background: "rgba(15, 23, 42, 0.78)",
          border: "1.5px solid rgba(16, 185, 129, 0.35)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#f8fafc" }}>
              My App Bar & Physical Slot Order (#1 Rightmost next to Clock to Leftmost)
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              Your own apps are automatically pinned first and physically Command-dragged into place
            </div>
          </div>
          <div
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              background: orderApplied ? "#10b981" : "#38bdf8",
              color: "#020617",
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            {orderApplied ? "✓ Applied to macOS Menu Bar" : "Apply Order to Menu Bar"}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
          {slots.map((s, idx) => {
            const lift = orderApplied ? Math.sin(reorderSpring * Math.PI) * 6 : 0;
            return (
              <div
                key={s.slot}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "rgba(2, 6, 23, 0.85)",
                  border: `1.5px solid ${s.color}88`,
                  transform: `translateY(${-lift}px)`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 900, color: s.color }}>
                    SLOT {s.slot}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: `${s.color}22`,
                      color: s.color,
                    }}
                  >
                    {s.badge}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>{s.name}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#10b981" }}>
                  {orderApplied ? "✓ Pinned Rightmost" : "Ready"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const BarStageFluidLaunch: React.FC<{ vertical?: boolean }> = ({ vertical = false }) => (
  <FluidStage
    poses={BARSTAGE_POSES}
    actions={BARSTAGE_ACTIONS}
    captions={BARSTAGE_CAPTIONS}
    accentColor="#38bdf8"
    secondaryColor="#10b981"
    productName="BarStage"
    productTagline="Pin Your Own Apps First & Rescue Every Notch-Hidden Menu Bar Icon"
    websiteUrl="buildforwardtech.com/barstage"
    vertical={vertical}
  >
    <BarStageInteractiveWindow />
  </FluidStage>
);
