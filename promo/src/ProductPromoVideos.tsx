import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { KineticWords, MonitorSvg, TvSvg, LaptopSvg } from "./KineticPrimitives";

const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif";
const MONO_FONT = "'SF Mono', 'JetBrains Mono', Menlo, monospace";

export interface ProductSpec {
  id: "quietplease" | "trackcascade";
  name: string;
  version: string;
  platformLabel: string;
  iconFile: string;
  uiPreviewFile: string;
  accent: string;
  secondaryAccent: string;
  websiteUrl: string;
  pricePersonal: string;
  priceTeam: string;
  hookQuestion: string;
  hookBeforeWords: { text: string; gradient?: string; color?: string; newlineAfter?: boolean }[];
  hookAfterWords: { text: string; gradient?: string; color?: string; newlineAfter?: boolean }[];
  hookSubBefore: string;
  hookSubAfter: string;
  cards: {
    label: string;
    sub: string;
    beforeBadge: string;
    afterBadge: string;
    beforeColor: string;
    afterColor: string;
  }[];
  scene2Badge: string;
  scene2Words: { text: string; gradient?: string; color?: string; newlineAfter?: boolean }[];
  scene2Sub: string;
  features: {
    badge: string;
    color: string;
    title: string;
    desc: string;
  }[];
  scene3Words: { text: string; gradient?: string; color?: string; newlineAfter?: boolean }[];
  scene3Sub: string;
  presets: {
    title: string;
    desc: string;
    chips: { name: string; role: string; color: string }[];
  }[];
  cliCommand: string;
  cliOutputLines: string[];
  bundleSubtitle: string;
}

export const QUIETPLEASE_SPEC: ProductSpec = {
  id: "quietplease",
  name: "QuietPlease",
  version: "v0.3",
  platformLabel: "NATIVE MACOS 14+ · SWIFTUI + ACCELERATE DSP",
  iconFile: "quietplease-icon-1024.png",
  uiPreviewFile: "quietplease-ui-preview.png",
  accent: "#34d399",
  secondaryAccent: "#f59e0b",
  websiteUrl: "buildforwardtech.com/quietplease",
  pricePersonal: "$15",
  priceTeam: "$149",
  hookQuestion:
    "How do you teach audio compression and keep a 30-student studio lab quiet at the same time?",
  hookBeforeWords: [
    { text: "Noisy" },
    { text: "Classrooms", newlineAfter: true },
    {
      text: "Drown",
      gradient: "linear-gradient(90deg, #fb7185, #f59e0b)",
    },
    {
      text: "Every",
      gradient: "linear-gradient(90deg, #fb7185, #f59e0b)",
    },
    {
      text: "Lesson.",
      gradient: "linear-gradient(90deg, #fb7185, #f59e0b)",
    },
  ],
  hookAfterWords: [
    { text: "A" },
    { text: "Real" },
    { text: "Compressor", newlineAfter: true },
    {
      text: "For",
      gradient: "linear-gradient(90deg, #34d399, #38bdf8)",
    },
    {
      text: "Your",
      gradient: "linear-gradient(90deg, #34d399, #38bdf8)",
    },
    {
      text: "Room.",
      gradient: "linear-gradient(90deg, #34d399, #38bdf8)",
    },
  ],
  hookSubBefore:
    "Students talking over mixes. Abstract compressor graphs nobody can feel in real life.",
  hookSubAfter:
    "Live room microphone -> Threshold, Ratio, Attack, Release & Sidechain -> Full-Screen Wall Sign.",
  cards: [
    {
      label: "Room Microphone Input",
      sub: "Calibrated dB SPL or dBFS · A-Weighting",
      beforeBadge: "UNMONITORED NOISE (78 dB)",
      afterBadge: "THRESHOLD 70.0 dB SPL",
      beforeColor: "#ef4444",
      afterColor: "#38bdf8",
    },
    {
      label: "Compressor Detector Engine",
      sub: "Threshold · Ratio · Knee · Attack · Release · Hold",
      beforeBadge: "ABSTRACT TEXTBOOK GRAPH",
      afterBadge: "4.0:1 · RMS + VOICE FILTER",
      beforeColor: "#f59e0b",
      afterColor: "#34d399",
    },
    {
      label: "Every Classroom Display",
      sub: "Automatic Full-Screen Visual Gain Reduction",
      beforeBadge: "SHOUTING OVER THE ROOM",
      afterBadge: "QUIET PLEASE SIGN ON WALL",
      beforeColor: "#ec4899",
      afterColor: "#c084fc",
    },
  ],
  scene2Badge: "REAL-TIME 4-SCOPE COMPRESSOR VISUALIZER",
  scene2Words: [
    { text: "Turn" },
    { text: "Any" },
    { text: "Knob.", newlineAfter: true },
    {
      text: "Watch",
      gradient: "linear-gradient(90deg, #34d399, #38bdf8)",
    },
    { text: "the" },
    {
      text: "Room",
      gradient: "linear-gradient(90deg, #38bdf8, #c084fc)",
    },
    { text: "React." },
  ],
  scene2Sub:
    "Every compressor parameter is drawn live across 4 synchronized scopes and felt by the whole room.",
  features: [
    {
      badge: "4 LIVE SCOPES",
      color: "#38bdf8",
      title: "Level History, Transfer Curve, Envelope & Spectrum",
      desc: "See Peak vs RMS step response, threshold knee bend, and 15-second room history simultaneously.",
    },
    {
      badge: "TRAIN MODE",
      color: "#34d399",
      title: "32-Band Matched Filter Sound Training",
      desc: "Record talking or applause for 3 seconds so music playback never triggers the sign.",
    },
    {
      badge: "SPL CALIBRATED",
      color: "#f59e0b",
      title: "True dB SPL Calibration & Menu Bar Monitor",
      desc: "Uses ~3% of one CPU core alongside Pro Tools, Logic, or Ableton Live without dropouts.",
    },
  ],
  scene3Words: [
    { text: "Classroom" },
    { text: "Presets." },
    { text: "DSP", color: "#34d399" },
    { text: "+" },
    { text: "Wall", color: "#38bdf8" },
    { text: "Sign.", color: "#f59e0b" },
  ],
  scene3Sub:
    "Zero cloud recording. Samples are measured in real-time Accelerate vDSP and immediately discarded.",
  presets: [
    {
      title: "Open Studio Lab · Conversation Guard",
      desc: "Allows quiet partner work up to 70 dB SPL; triggers sign when cross-talk builds",
      chips: [
        { name: "Thresh 70 dB", role: "4.0 : 1", color: "#38bdf8" },
        { name: "Voice Band", role: "300Hz-3.4kHz", color: "#34d399" },
      ],
    },
    {
      title: "Critical Mixing & Ear Training",
      desc: "Fast attack and sidechain voice filter catch whispers while music plays on monitors",
      chips: [
        { name: "Thresh 62 dB", role: "8.0 : 1", color: "#f59e0b" },
        { name: "Matched Filter", role: "VOICE ONLY", color: "#c084fc" },
      ],
    },
    {
      title: "Live Compressor Demonstration Mode",
      desc: "Tints every classroom screen deeper red proportional to dB gain reduction",
      chips: [
        { name: "Peak vs RMS", role: "DUAL SCOPE", color: "#38bdf8" },
        { name: "Wall Overlay", role: "GR TINT", color: "#ef4444" },
      ],
    },
  ],
  cliCommand: "$ open -a QuietPlease --args --preset studio-lab",
  cliOutputLines: [
    "✓ CoreAudio Input: SSL 2+ Room Mic (Ch 2 · 48kHz)",
    "✓ Accelerate vDSP: 1.6µs Biquad · 5.2µs 2048-pt FFT",
    "✓ Calibration: +94.0 dB SPL offset active (A-Weighted)",
    "✓ Overlay Armed: All 3 Classroom Displays + Projector",
  ],
  bundleSubtitle: "Signed Native macOS App (.dmg + .zip) · Zero Telemetry",
};

export const TRACKCASCADE_SPEC: ProductSpec = {
  id: "trackcascade",
  name: "TrackCascade",
  version: "v1.0",
  platformLabel: "ABLETON LIVE 11 & 12 · MACOS & WINDOWS",
  iconFile: "trackcascade-icon-1024.png",
  uiPreviewFile: "trackcascade-ui-preview.png",
  accent: "#fb923c",
  secondaryAccent: "#38bdf8",
  websiteUrl: "buildforwardtech.com/trackcascade",
  pricePersonal: "$29",
  priceTeam: "$249",
  hookQuestion:
    "Why does setting up 16 drum and synth tracks in Ableton Live still take 40 manual menu clicks?",
  hookBeforeWords: [
    { text: "Manual" },
    { text: "Track", newlineAfter: true },
    {
      text: "Routing",
      gradient: "linear-gradient(90deg, #fb7185, #f59e0b)",
    },
    {
      text: "Kills",
      gradient: "linear-gradient(90deg, #fb7185, #f59e0b)",
    },
    {
      text: "Sessions.",
      gradient: "linear-gradient(90deg, #fb7185, #f59e0b)",
    },
  ],
  hookAfterWords: [
    { text: "Pro" },
    { text: "Tools" },
    { text: "Speed", newlineAfter: true },
    {
      text: "Inside",
      gradient: "linear-gradient(90deg, #fb923c, #38bdf8)",
    },
    {
      text: "Ableton",
      gradient: "linear-gradient(90deg, #fb923c, #38bdf8)",
    },
    {
      text: "Live.",
      gradient: "linear-gradient(90deg, #fb923c, #38bdf8)",
    },
  ],
  hookSubBefore:
    "Clicking Ext. In 1, Ext. In 2, Ext. In 3 one track at a time while musicians wait.",
  hookSubAfter:
    "Batch-create Audio & MIDI tracks and cascade stereo/mono hardware I/O in one keystroke.",
  cards: [
    {
      label: "Track 1 · Drum Overheads (Stereo)",
      sub: "Batch Created + Auto-Named + Record Armed",
      beforeBadge: "MANUAL EXT. OUT MENU",
      afterBadge: "AUTO -> EXT. OUT 1/2",
      beforeColor: "#ef4444",
      afterColor: "#38bdf8",
    },
    {
      label: "Tracks 2 & 3 · Kick + Snare (Mono)",
      sub: "Smart Mono Channel Allocation",
      beforeBadge: "OVERLAPPED CHANNELS",
      afterBadge: "AUTO -> EXT. OUT 3 & 4",
      beforeColor: "#f59e0b",
      afterColor: "#34d399",
    },
    {
      label: "Track 4 · Room Mics (Stereo Pair)",
      sub: "Continues cleanly at next stereo pair",
      beforeBadge: " TEDIOUS RE-PATCHING",
      afterBadge: "AUTO -> EXT. OUT 5/6",
      beforeColor: "#ec4899",
      afterColor: "#c084fc",
    },
  ],
  scene2Badge: "BATCH TRACK DIALOG (.ABLX) + CASCADE ROUTER (.AMXD)",
  scene2Words: [
    { text: "Batch" },
    { text: "Create." },
    { text: "Cascade", newlineAfter: true },
    {
      text: "Stereo",
      gradient: "linear-gradient(90deg, #fb923c, #fbbf24)",
    },
    { text: "&" },
    {
      text: "Mono",
      gradient: "linear-gradient(90deg, #38bdf8, #34d399)",
    },
    { text: "I/O." },
  ],
  scene2Sub:
    "The 'New Tracks' dialog Ableton Live never had, paired with pair-aware hardware input/output cascading.",
  features: [
    {
      badge: "NEW TRACKS MODAL",
      color: "#fb923c",
      title: "Create N Audio & MIDI Tracks in One Undo Step",
      desc: "Right-click any track to batch-create rows by count, type, prefix name, and record-arm.",
    },
    {
      badge: "PAIR-AWARE I/O",
      color: "#38bdf8",
      title: "Smart Stereo Pair + Mono Channel Cascading",
      desc: "Stereo tracks grab 1/2 and 5/6 while mono tracks grab 3 and 4 without channel collisions.",
    },
    {
      badge: "M4L + CLI + SDK",
      color: "#34d399",
      title: "Works in Live 11 & 12 on macOS and Windows",
      desc: "Includes signed .ablx extension, Max for Live cascade device, and terminal preset CLI.",
    },
  ],
  scene3Words: [
    { text: "One-Click" },
    { text: "Tracking" },
    { text: "Templates.", color: "#fb923c" },
  ],
  scene3Sub:
    "Spin up 16-channel drum dates, SSL console stem pairs, or hardware synth racks in under a second.",
  presets: [
    {
      title: "16-Channel Live Drum Tracking Session",
      desc: "2 Stereo Overheads/Rooms + 12 Mono Close Mics, armed and cascaded across Inputs 1-16",
      chips: [
        { name: "OH + Room", role: "IN 1/2, 3/4", color: "#38bdf8" },
        { name: "12 Close Mics", role: "IN 5..16", color: "#34d399" },
      ],
    },
    {
      title: "Console Mixing · 12 Stereo Stem Pairs",
      desc: "Routes 12 stereo group buses sequentially across Hardware Outputs 1/2 through 23/24",
      chips: [
        { name: "12 Stereo Buses", role: "OUT 1/2..23/24", color: "#fb923c" },
        { name: "Auto-Numbered", role: "1 UNDO STEP", color: "#c084fc" },
      ],
    },
    {
      title: "Hybrid Hardware Synth Patchbay",
      desc: "Creates 8 MIDI tracks + 8 paired Audio return tracks cascaded to interface inputs",
      chips: [
        { name: "8 MIDI + 8 Audio", role: "PAIRED I/O", color: "#38bdf8" },
        { name: "Record Armed", role: "READY", color: "#34d399" },
      ],
    },
  ],
  cliCommand: "$ trackcascade --preset drum-bus-pairs --apply",
  cliOutputLines: [
    "✓ Connected to Ableton Live 12.1 via Control Surface",
    "✓ Created 14 tracks (2 Stereo, 8 Mono, 4 MIDI) in 1 undo step",
    "✓ Cascaded Hardware Inputs: 1/2 -> 3..10 -> 11/12..17/18",
    "✓ Armed 10 audio tracks for immediate tracking",
  ],
  bundleSubtitle: "Signed .ablx Extension + Max for Live .amxd + CLI Bundle",
};

const CyberBackground: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const shift = (frame * 1.1) % 80;
  const pulse = Math.sin(frame / 22) * 0.12 + 0.88;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 18%, #0f172a 0%, #050811 62%, #020409 100%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 980,
          height: 980,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}33 0%, transparent 68%)`,
          top: -280,
          left: 480 + Math.sin(frame / 38) * 90,
          transform: `scale(${pulse})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          backgroundPosition: `0px ${shift}px`,
        }}
      />
    </AbsoluteFill>
  );
};

export const ProductLaunch16x9: React.FC<{ spec: ProductSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#020409", fontFamily: FONT_FAMILY, color: "white" }}>
      <Audio src={staticFile("soundtrack.mp3")} volume={0.85} />
      <TransitionSeries>
        {/* Scene 1: 410 frames */}
        <TransitionSeries.Sequence durationInFrames={410}>
          <Scene1Hook16x9 spec={spec} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />

        {/* Scene 2: 450 frames */}
        <TransitionSeries.Sequence durationInFrames={450}>
          <Scene2UI16x9 spec={spec} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />

        {/* Scene 3: 430 frames */}
        <TransitionSeries.Sequence durationInFrames={430}>
          <Scene3Presets16x9 spec={spec} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />

        {/* Scene 4: 405 frames */}
        <TransitionSeries.Sequence durationInFrames={405}>
          <Scene4CTA16x9 spec={spec} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

const Scene1Hook16x9: React.FC<{ spec: ProductSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const SNAP_FRAME = 185;

  const snapProgress = spring({
    frame: Math.max(0, frame - SNAP_FRAME),
    fps,
    config: { damping: 13, stiffness: 145 },
  });

  const icons = [
    (c: string) => <MonitorSvg size={38} color={c} />,
    (c: string) => <TvSvg size={38} color={c} />,
    (c: string) => <LaptopSvg size={38} color={c} />,
  ];

  return (
    <AbsoluteFill>
      <CyberBackground accent={frame < SNAP_FRAME ? "#f43f5e" : spec.accent} />
      <div style={{ position: "absolute", top: 60, width: "100%", textAlign: "center", padding: "0 80px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            padding: "10px 26px",
            borderRadius: 999,
            background: "rgba(15, 23, 42, 0.9)",
            border: `2px solid ${spec.accent}77`,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 1.3,
            color: spec.accent,
            marginBottom: 22,
          }}
        >
          <Img src={staticFile(spec.iconFile)} style={{ width: 42, height: 42, borderRadius: 10 }} />
          <span>{spec.name} {spec.version}</span>
          <span style={{ opacity: 0.45 }}>•</span>
          <span style={{ color: "#e2e8f0" }}>{spec.platformLabel}</span>
        </div>

        {frame < SNAP_FRAME ? (
          <KineticWords
            fontSize={86}
            startFrame={6}
            staggerFrames={6}
            lineHeight={1.04}
            letterSpacing={-2.8}
            words={spec.hookBeforeWords}
          />
        ) : (
          <KineticWords
            fontSize={86}
            startFrame={SNAP_FRAME}
            staggerFrames={6}
            lineHeight={1.04}
            letterSpacing={-2.8}
            words={spec.hookAfterWords}
          />
        )}

        <p style={{ fontSize: 32, fontWeight: 600, color: "#cbd5e1", margin: "20px 0 0" }}>
          {frame < SNAP_FRAME ? spec.hookSubBefore : spec.hookSubAfter}
        </p>
      </div>

      <div style={{ position: "absolute", top: 485, left: "50%", width: 0, height: 0 }}>
        {spec.cards.map((c, i) => {
          const enter = spring({ frame: Math.max(0, frame - 16 - i * 12), fps, config: { damping: 12 } });
          const startX = (i - 1) * 510;
          const startRot = (i - 1) * 6;
          const curX = interpolate(snapProgress, [0, 1], [startX, (i - 1) * 515]);
          const curY = interpolate(snapProgress, [0, 1], [65, 50]);
          const curRot = interpolate(snapProgress, [0, 1], [startRot, 0]);
          const activeColor = frame < SNAP_FRAME ? c.beforeColor : c.afterColor;
          const activeBadge = frame < SNAP_FRAME ? c.beforeBadge : c.afterBadge;

          return (
            <div
              key={c.label}
              style={{
                position: "absolute",
                width: 475,
                height: 265,
                left: -237,
                top: 0,
                transform: `translate(${curX}px, ${curY}px) rotate(${curRot}deg) scale(${enter})`,
                borderRadius: 26,
                background: "linear-gradient(165deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.97))",
                border: `2.5px solid ${activeColor}`,
                boxShadow: `0 28px 65px -15px ${activeColor}55`,
                padding: "28px 32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 16,
                    background: `${activeColor}22`,
                    border: `1.5px solid ${activeColor}66`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {icons[i](activeColor)}
                </div>
                <span
                  style={{
                    fontFamily: MONO_FONT,
                    fontSize: 16,
                    fontWeight: 900,
                    padding: "8px 14px",
                    borderRadius: 10,
                    background: `${activeColor}28`,
                    border: `1.5px solid ${activeColor}`,
                    color: activeColor,
                  }}
                >
                  {activeBadge}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#f8fafc", marginBottom: 6 }}>
                  {c.label}
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: "#cbd5e1" }}>{c.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Scene2UI16x9: React.FC<{ spec: ProductSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardSpring = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });
  const floatY = Math.sin(frame / 24) * 7;

  return (
    <AbsoluteFill>
      <CyberBackground accent={spec.accent} />
      <div
        style={{
          position: "absolute",
          left: 82,
          top: 82,
          width: 790,
          opacity: cardSpring,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 18px",
            borderRadius: 10,
            background: `${spec.accent}22`,
            border: `1.5px solid ${spec.accent}77`,
            color: spec.accent,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: 1.2,
            marginBottom: 18,
          }}
        >
          <Img src={staticFile(spec.iconFile)} style={{ width: 30, height: 30, borderRadius: 7 }} />
          <span>{spec.scene2Badge}</span>
        </div>

        <KineticWords
          fontSize={70}
          startFrame={4}
          staggerFrames={6}
          align="left"
          lineHeight={1.04}
          letterSpacing={-2.4}
          words={spec.scene2Words}
        />

        <p style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.38, color: "#cbd5e1", margin: "18px 0 26px" }}>
          {spec.scene2Sub}
        </p>

        {spec.features.map((item, idx) => {
          const itemSpring = spring({ frame: Math.max(0, frame - 22 - idx * 16), fps, config: { damping: 15 } });
          return (
            <div
              key={item.title}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 18,
                marginBottom: 16,
                padding: "18px 22px",
                borderRadius: 18,
                background: "rgba(15, 23, 42, 0.88)",
                border: `1.5px solid ${item.color}55`,
                opacity: itemSpring,
                transform: `translateY(${interpolate(itemSpring, [0, 1], [24, 0])}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: MONO_FONT,
                  fontSize: 14,
                  fontWeight: 900,
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: `${item.color}28`,
                  border: `1.5px solid ${item.color}`,
                  color: item.color,
                  marginTop: 3,
                  whiteSpace: "nowrap",
                }}
              >
                {item.badge}
              </span>
              <div>
                <div style={{ fontSize: 23, fontWeight: 800, color: "#f8fafc" }}>{item.title}</div>
                <div style={{ fontSize: 18, color: "#cbd5e1", marginTop: 4, fontWeight: 500 }}>{item.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          right: 64,
          top: 150,
          width: 920,
          borderRadius: 22,
          overflow: "hidden",
          border: `2.5px solid ${spec.accent}88`,
          transform: `scale(${cardSpring}) translateY(${floatY}px)`,
          boxShadow: "0 30px 60px rgba(2, 6, 23, 0.9)",
        }}
      >
        <Img src={staticFile(spec.uiPreviewFile)} style={{ width: "100%", display: "block" }} />
      </div>
    </AbsoluteFill>
  );
};

const Scene3Presets16x9: React.FC<{ spec: ProductSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const typedChars = Math.min(spec.cliCommand.length, Math.max(0, Math.floor((frame - 30) * 0.9)));
  const cmdText = spec.cliCommand.slice(0, typedChars);

  return (
    <AbsoluteFill>
      <CyberBackground accent={spec.secondaryAccent} />
      <div style={{ position: "absolute", top: 60, width: "100%", textAlign: "center" }}>
        <KineticWords
          fontSize={72}
          startFrame={4}
          staggerFrames={6}
          lineHeight={1.04}
          letterSpacing={-2.4}
          words={spec.scene3Words}
        />
        <p style={{ fontSize: 28, fontWeight: 600, color: "#cbd5e1", marginTop: 14 }}>{spec.scene3Sub}</p>
      </div>

      <div
        style={{
          position: "absolute",
          top: 250,
          left: 88,
          width: 980,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {spec.presets.map((p, idx) => {
          const s = spring({ frame: Math.max(0, frame - 18 - idx * 16), fps, config: { damping: 14 } });
          const isSelected = idx === 0 && frame > 85;
          return (
            <div
              key={p.title}
              style={{
                padding: "24px 30px",
                borderRadius: 22,
                background: isSelected
                  ? `linear-gradient(90deg, ${spec.accent}28, rgba(15, 23, 42, 0.95))`
                  : "rgba(15, 23, 42, 0.88)",
                border: isSelected ? `2.5px solid ${spec.accent}` : "1.5px solid rgba(148, 163, 184, 0.22)",
                opacity: s,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#f8fafc" }}>{p.title}</div>
                <div style={{ fontSize: 19, color: "#cbd5e1", margin: "6px 0 14px" }}>{p.desc}</div>
                <div style={{ display: "flex", gap: 12 }}>
                  {p.chips.map((c) => (
                    <div
                      key={c.name}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "6px 14px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.08)",
                        fontSize: 18,
                        fontWeight: 700,
                      }}
                    >
                      <span>{c.name}</span>
                      <span
                        style={{
                          fontFamily: MONO_FONT,
                          fontSize: 15,
                          fontWeight: 900,
                          padding: "3px 10px",
                          borderRadius: 7,
                          background: `${c.color}30`,
                          border: `1.5px solid ${c.color}`,
                          color: c.color,
                        }}
                      >
                        {c.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  padding: "12px 24px",
                  borderRadius: 12,
                  background: isSelected ? spec.accent : "rgba(255,255,255,0.1)",
                  color: isSelected ? "#020617" : "#f8fafc",
                  fontSize: 20,
                  fontWeight: 900,
                }}
              >
                {isSelected ? "✓ Active" : "Apply"}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          top: 250,
          right: 82,
          width: 710,
          height: 620,
          borderRadius: 24,
          background: "rgba(9, 13, 22, 0.96)",
          border: `2px solid ${spec.accent}66`,
          padding: 34,
          fontFamily: MONO_FONT,
        }}
      >
        <div style={{ fontSize: 19, color: "#94a3b8", marginBottom: 24, fontWeight: 700 }}>
          {spec.name.toLowerCase()} — automated workflow
        </div>
        <div style={{ fontSize: 22, color: "#f8fafc", fontWeight: 700, marginBottom: 24 }}>{cmdText}</div>
        {frame > 90 && (
          <div style={{ fontSize: 20, lineHeight: 1.75, color: "#34d399", fontWeight: 600 }}>
            {spec.cliOutputLines.map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

const Scene4CTA16x9: React.FC<{ spec: ProductSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 13, stiffness: 110 } });

  return (
    <AbsoluteFill>
      <CyberBackground accent={spec.accent} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 100px",
        }}
      >
        <div style={{ transform: `scale(${pop})`, marginBottom: 20 }}>
          <Img src={staticFile(spec.iconFile)} style={{ width: 118, height: 118, borderRadius: 26 }} />
        </div>

        <KineticWords
          fontSize={86}
          startFrame={8}
          staggerFrames={6}
          lineHeight={1.04}
          letterSpacing={-2.8}
          words={[
            { text: "Get" },
            {
              text: `${spec.name}.`,
              gradient: `linear-gradient(90deg, ${spec.accent}, ${spec.secondaryAccent})`,
            },
          ]}
        />

        <p style={{ fontSize: 32, fontWeight: 600, color: "#cbd5e1", margin: "18px 0 36px" }}>
          {spec.bundleSubtitle} · Instant Ed25519 License Key
        </p>

        <div style={{ display: "flex", gap: 36, marginBottom: 38 }}>
          <div
            style={{
              width: 500,
              padding: "30px 36px",
              borderRadius: 26,
              background: "rgba(15, 23, 42, 0.92)",
              border: `2.5px solid ${spec.accent}`,
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900, color: spec.accent, letterSpacing: 1.4 }}>
              PERSONAL &amp; EDUCATOR LICENSE
            </div>
            <div style={{ fontSize: 56, fontWeight: 900, margin: "8px 0" }}>
              {spec.pricePersonal}{" "}
              <span style={{ fontSize: 22, fontWeight: 600, color: "#94a3b8" }}>one-time · 3 computers</span>
            </div>
            <div style={{ fontSize: 20, color: "#cbd5e1", fontWeight: 500 }}>
              Instant signed download + offline Ed25519 license key + built-in updates.
            </div>
          </div>

          <div
            style={{
              width: 500,
              padding: "30px 36px",
              borderRadius: 26,
              background: "rgba(15, 23, 42, 0.92)",
              border: `2.5px solid ${spec.secondaryAccent}`,
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900, color: spec.secondaryAccent, letterSpacing: 1.4 }}>
              CLASSROOM &amp; STUDIO PACK (25 SEATS)
            </div>
            <div style={{ fontSize: 56, fontWeight: 900, margin: "8px 0" }}>
              {spec.priceTeam}{" "}
              <span style={{ fontSize: 22, fontWeight: 600, color: "#94a3b8" }}>one-time · 25 computers</span>
            </div>
            <div style={{ fontSize: 20, color: "#cbd5e1", fontWeight: 500 }}>
              Multi-seat lab activation key for recording studios, classrooms, and departments.
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "16px 38px",
            borderRadius: 16,
            background: `linear-gradient(90deg, ${spec.accent}, ${spec.secondaryAccent})`,
            color: "#020617",
            fontSize: 30,
            fontWeight: 900,
            fontFamily: MONO_FONT,
          }}
        >
          https://{spec.websiteUrl}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ProductVerticalReel9x16: React.FC<{ spec: ProductSpec }> = ({ spec }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#06080f", fontFamily: FONT_FAMILY, color: "white" }}>
      <Audio src={staticFile("soundtrack.mp3")} volume={0.9} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={380}>
          <VerticalScene1 spec={spec} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 18 }, durationInFrames: 25 })}
        />

        <TransitionSeries.Sequence durationInFrames={510}>
          <VerticalScene2 spec={spec} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 20 }, durationInFrames: 25 })}
        />

        <TransitionSeries.Sequence durationInFrames={480}>
          <VerticalScene3 spec={spec} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

const VerticalScene1: React.FC<{ spec: ProductSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14, stiffness: 140 } });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 18%, #1e293b 0%, #06080f 72%)",
        padding: "78px 54px",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${pop})`,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "14px 28px",
          borderRadius: 999,
          background: "rgba(15, 23, 42, 0.92)",
          border: `2px solid ${spec.accent}`,
        }}
      >
        <Img src={staticFile(spec.iconFile)} style={{ width: 54, height: 54, borderRadius: 12 }} />
        <div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{spec.name} {spec.version}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: spec.accent, letterSpacing: 1.1 }}>
            MUSICMIND.BIZ × BUILD FORWARD TECH
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", width: "100%" }}>
        <div
          style={{
            display: "inline-block",
            padding: "14px 24px",
            borderRadius: 20,
            background: "rgba(251, 191, 36, 0.14)",
            border: "2px solid rgba(251, 191, 36, 0.48)",
            fontSize: 33,
            fontWeight: 800,
            color: "#fbbf24",
            lineHeight: 1.25,
            marginBottom: 26,
          }}
        >
          {spec.hookQuestion}
        </div>

        <KineticWords
          fontSize={88}
          startFrame={20}
          staggerFrames={7}
          lineHeight={1.04}
          letterSpacing={-3.0}
          words={spec.hookAfterWords}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%" }}>
        {spec.cards.map((c, idx) => {
          const cPop = spring({ frame: Math.max(0, frame - 75 - idx * 16), fps, config: { damping: 14 } });
          return (
            <div
              key={c.label}
              style={{
                opacity: cPop,
                transform: `translateY(${interpolate(cPop, [0, 1], [24, 0])}px)`,
                padding: "20px 26px",
                borderRadius: 22,
                background: "rgba(15, 23, 42, 0.95)",
                border: `2.5px solid ${c.afterColor}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 27, fontWeight: 800, color: "#f8fafc" }}>{c.label}</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: "#cbd5e1", marginTop: 4 }}>{c.sub}</div>
              </div>
              <div
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  background: `${c.afterColor}28`,
                  border: `2px solid ${c.afterColor}`,
                  color: c.afterColor,
                  fontSize: 20,
                  fontWeight: 900,
                  whiteSpace: "nowrap",
                }}
              >
                {c.afterBadge}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const VerticalScene2: React.FC<{ spec: ProductSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 14 } });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 25%, #0f172a 0%, #05070b 75%)",
        padding: "72px 52px",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            color: spec.accent,
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          {spec.scene2Badge}
        </div>
        <KineticWords
          fontSize={66}
          startFrame={4}
          staggerFrames={6}
          align="left"
          lineHeight={1.05}
          letterSpacing={-2.2}
          words={spec.scene2Words}
        />
      </div>

      <div
        style={{
          transform: `scale(${interpolate(pop, [0, 1], [0.92, 1])})`,
          opacity: pop,
          borderRadius: 24,
          overflow: "hidden",
          border: `2.5px solid ${spec.accent}`,
          boxShadow: "0 30px 75px -12px rgba(0,0,0,0.9)",
        }}
      >
        <Img src={staticFile(spec.uiPreviewFile)} style={{ width: "100%", display: "block" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {spec.features.map((f, i) => {
          const fPop = spring({ frame: Math.max(0, frame - 36 - i * 20), fps, config: { damping: 14 } });
          return (
            <div
              key={f.title}
              style={{
                opacity: fPop,
                padding: "18px 24px",
                borderRadius: 20,
                background: "rgba(15, 23, 42, 0.94)",
                border: `2px solid ${f.color}88`,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900, color: f.color, marginBottom: 4 }}>
                ● {f.badge}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#f8fafc", marginBottom: 4 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 20, color: "#cbd5e1", fontWeight: 500 }}>{f.desc}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const VerticalScene3: React.FC<{ spec: ProductSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ctaPop = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 13 } });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 35%, #172554 0%, #05070b 75%)",
        padding: "76px 54px",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center", width: "100%" }}>
        <div
          style={{
            display: "inline-block",
            padding: "10px 24px",
            borderRadius: 999,
            background: `${spec.accent}22`,
            border: `2px solid ${spec.accent}`,
            color: spec.accent,
            fontSize: 21,
            fontWeight: 900,
            letterSpacing: 1.3,
            marginBottom: 16,
          }}
        >
          {spec.platformLabel}
        </div>
        <KineticWords
          fontSize={68}
          startFrame={6}
          staggerFrames={6}
          lineHeight={1.05}
          letterSpacing={-2.2}
          words={spec.scene3Words}
        />
      </div>

      <div
        style={{
          width: "100%",
          borderRadius: 24,
          overflow: "hidden",
          border: `2.5px solid ${spec.secondaryAccent}`,
          boxShadow: "0 28px 65px -15px rgba(0,0,0,0.9)",
        }}
      >
        <Img src={staticFile(spec.uiPreviewFile)} style={{ width: "100%", display: "block" }} />
      </div>

      <div
        style={{
          transform: `scale(${interpolate(ctaPop, [0, 1], [0.9, 1])})`,
          opacity: ctaPop,
          width: "100%",
          padding: "30px 34px",
          borderRadius: 28,
          background: "rgba(15, 23, 42, 0.96)",
          border: `2.5px solid ${spec.accent}`,
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 12 }}>
          <Img src={staticFile(spec.iconFile)} style={{ width: 58, height: 58, borderRadius: 14 }} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#f8fafc" }}>
              {spec.name} {spec.version}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: spec.accent }}>{spec.bundleSubtitle}</div>
          </div>
        </div>
        <div style={{ fontSize: 44, fontWeight: 900, color: "#f8fafc", marginBottom: 14 }}>
          {spec.pricePersonal} Personal · {spec.priceTeam} Team Pack (25 Seats)
        </div>
        <div
          style={{
            display: "inline-block",
            padding: "12px 28px",
            borderRadius: 14,
            background: `linear-gradient(90deg, ${spec.accent}, ${spec.secondaryAccent})`,
            fontSize: 27,
            fontWeight: 900,
            color: "#020617",
            fontFamily: MONO_FONT,
          }}
        >
          {spec.websiteUrl}
        </div>
      </div>
    </AbsoluteFill>
  );
};
