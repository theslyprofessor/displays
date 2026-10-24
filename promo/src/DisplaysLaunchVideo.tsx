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
import { BRAND } from "./brandConfig";
import {
  KineticWords,
  LaptopSvg,
  MonitorSvg,
  PlatformBadgesRow,
  ScreenStageLogo,
  TvSvg,
} from "./KineticPrimitives";

const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif";
const MONO_FONT = "'SF Mono', 'JetBrains Mono', Menlo, monospace";

const CyberBackground: React.FC<{ accent?: string }> = ({
  accent = "#38bdf8",
}) => {
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
          filter: "blur(50px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 780,
          height: 780,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, transparent 70%)",
          bottom: -260,
          right: 180 + Math.cos(frame / 32) * 70,
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "-40%",
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          backgroundPosition: `0px ${shift}px`,
          transform: "perspective(900px) rotateX(62deg) translateY(220px)",
          maskImage:
            "radial-gradient(ellipse at 50% 50%, black 25%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 50%, black 25%, transparent 72%)",
        }}
      />
    </AbsoluteFill>
  );
};

// Scene 1: The Multi-Monitor Chaos Hook -> Snap into Clean Roles (410 frames = 6.83s)
const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const SNAP_FRAME = 185;

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8 },
  });
  const subSpring = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 16, mass: 0.9 },
  });

  const monitors = [
    {
      label: 'Primary 27" 4K Desk',
      sub: "Thunderbolt / DisplayPort · 60Hz",
      badge: "WRONG ORIGIN (-1920,0)",
      color: "#ef4444",
      x: -510,
      y: 80,
      rot: -8,
      delay: 16,
      icon: (c: string) => <MonitorSvg size={38} color={c} />,
    },
    {
      label: "Control Room TV (KVM)",
      sub: "HDMI Broadcast · 1080p @ 60Hz",
      badge: "UNMIRRORED DESKTOP",
      color: "#f59e0b",
      x: 0,
      y: 45,
      rot: 3,
      delay: 28,
      icon: (c: string) => <TvSvg size={38} color={c} />,
    },
    {
      label: "Laptop Display",
      sub: "Closed in Dock · Can't See Screen",
      badge: "STOLE MAIN MENU BAR",
      color: "#ec4899",
      x: 510,
      y: 85,
      rot: 7,
      delay: 40,
      icon: (c: string) => <LaptopSvg size={38} color={c} />,
    },
  ];

  const snapProgress = spring({
    frame: Math.max(0, frame - SNAP_FRAME),
    fps,
    config: { damping: 13, stiffness: 145 },
  });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY, color: "white" }}>
      <CyberBackground accent={frame < SNAP_FRAME ? "#f43f5e" : "#38bdf8"} />

      <div
        style={{
          position: "absolute",
          top: 64,
          width: "100%",
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            padding: "10px 26px",
            borderRadius: 999,
            background: "rgba(15, 23, 42, 0.88)",
            border: "2px solid rgba(56, 189, 248, 0.45)",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 1.4,
            color: "#38bdf8",
            textTransform: "uppercase",
            transform: `scale(${titleSpring})`,
            marginBottom: 22,
          }}
        >
          <ScreenStageLogo size={42} />
          <span>{BRAND.productName} v1.1</span>
          <span style={{ opacity: 0.45 }}>•</span>
          <span style={{ color: "#e2e8f0" }}>MAC · WINDOWS · LINUX</span>
        </div>

        {frame < SNAP_FRAME ? (
          <KineticWords
            fontSize={88}
            startFrame={6}
            staggerFrames={6}
            lineHeight={1.04}
            letterSpacing={-2.8}
            words={[
              { text: "Multi-Monitor" },
              { text: "Setups", newlineAfter: true },
              {
                text: "Break",
                gradient: "linear-gradient(90deg, #fb7185, #f59e0b)",
              },
              {
                text: "Every",
                gradient: "linear-gradient(90deg, #fb7185, #f59e0b)",
              },
              {
                text: "Room.",
                gradient: "linear-gradient(90deg, #fb7185, #f59e0b)",
              },
            ]}
          />
        ) : (
          <KineticWords
            fontSize={88}
            startFrame={SNAP_FRAME}
            staggerFrames={6}
            lineHeight={1.04}
            letterSpacing={-2.8}
            words={[
              { text: "Now" },
              { text: "Every" },
              { text: "Room", newlineAfter: true },
              {
                text: "Remembers",
                gradient: "linear-gradient(90deg, #38bdf8, #34d399)",
              },
              {
                text: "Everything.",
                gradient: "linear-gradient(90deg, #38bdf8, #34d399)",
              },
            ]}
          />
        )}

        <p
          style={{
            fontSize: 34,
            fontWeight: 600,
            color: "#cbd5e1",
            margin: "20px 0 0",
            opacity: subSpring,
            letterSpacing: -0.5,
          }}
        >
          {frame < SNAP_FRAME
            ? "Scrambled screens. Closed laptops stealing Main. Dragging display boxes every day."
            : "Automatic room detection · Monitor history · 1-click plain-English presets."}
        </p>
      </div>

      {/* Animated Monitor Cards with Custom Vector SVGs */}
      <div
        style={{
          position: "absolute",
          top: 470,
          left: "50%",
          width: 0,
          height: 0,
        }}
      >
        {monitors.map((m, i) => {
          const enter = spring({
            frame: Math.max(0, frame - m.delay),
            fps,
            config: { damping: 12 },
          });
          const jitterX =
            frame < SNAP_FRAME ? Math.sin((frame + i * 25) / 6) * 8 : 0;
          const jitterY =
            frame < SNAP_FRAME ? Math.cos((frame + i * 19) / 5) * 6 : 0;

          const curX = interpolate(
            snapProgress,
            [0, 1],
            [m.x + jitterX, (i - 1) * 515]
          );
          const curY = interpolate(snapProgress, [0, 1], [m.y + jitterY, 60]);
          const curRot = interpolate(snapProgress, [0, 1], [m.rot, 0]);

          const fixedBadges = [
            "MAIN DESK (0,0)",
            "MIRRORS MAIN",
            "HIDDEN IN SPACE",
          ];
          const fixedColors = ["#38bdf8", "#34d399", "#94a3b8"];
          const activeColor = frame < SNAP_FRAME ? m.color : fixedColors[i];
          const activeBadge = frame < SNAP_FRAME ? m.badge : fixedBadges[i];

          return (
            <div
              key={m.label}
              style={{
                position: "absolute",
                width: 475,
                height: 270,
                left: -237,
                top: 0,
                transform: `translate(${curX}px, ${curY}px) rotate(${curRot}deg) scale(${enter})`,
                borderRadius: 26,
                background:
                  "linear-gradient(165deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.97))",
                border: `2.5px solid ${activeColor}`,
                boxShadow: `0 28px 65px -15px ${activeColor}55`,
                padding: "28px 32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 16,
                    background: `${activeColor}22`,
                    border: `1.5px solid ${activeColor}66`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {m.icon(activeColor)}
                </div>
                <span
                  style={{
                    fontFamily: MONO_FONT,
                    fontSize: 18,
                    fontWeight: 900,
                    padding: "8px 16px",
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
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    color: "#f8fafc",
                    marginBottom: 6,
                    letterSpacing: -0.5,
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{ fontSize: 21, fontWeight: 600, color: "#cbd5e1" }}
                >
                  {m.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Platform Row */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          width: "100%",
        }}
      >
        <PlatformBadgesRow startFrame={55} />
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: Real Uncrowded v1.1.0 App Showcase (450 frames = 7.5s)
const Scene2NativeUI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 110 },
  });
  const secondCardSpring = spring({
    frame: Math.max(0, frame - 45),
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  const floatY = Math.sin(frame / 24) * 7;

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY, color: "white" }}>
      <CyberBackground accent="#38bdf8" />

      {/* Left Column: Kinetic Headline & Feature Cards */}
      <div
        style={{
          position: "absolute",
          left: 88,
          top: 86,
          width: 790,
          opacity: cardSpring,
          transform: `translateX(${interpolate(cardSpring, [0, 1], [-50, 0])}px)`,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 18px",
            borderRadius: 10,
            background: "rgba(56, 189, 248, 0.16)",
            border: "1.5px solid rgba(56, 189, 248, 0.45)",
            color: "#38bdf8",
            fontSize: 19,
            fontWeight: 800,
            letterSpacing: 1.2,
            marginBottom: 18,
          }}
        >
          <ScreenStageLogo size={32} />
          <span>UNCROWDED NATIVE v1.1 INTERFACE</span>
        </div>

        <KineticWords
          fontSize={72}
          startFrame={4}
          staggerFrames={6}
          align="left"
          lineHeight={1.04}
          letterSpacing={-2.4}
          words={[
            { text: "Built" },
            { text: "for" },
            { text: "Real", newlineAfter: true },
            {
              text: "Studios",
              gradient: "linear-gradient(90deg, #38bdf8, #34d399)",
            },
            { text: "&" },
            {
              text: "KVM",
              gradient: "linear-gradient(90deg, #38bdf8, #818cf8)",
            },
            { text: "Rooms." },
          ]}
        />

        <p
          style={{
            fontSize: 27,
            fontWeight: 600,
            lineHeight: 1.4,
            color: "#cbd5e1",
            margin: "18px 0 28px",
          }}
        >
          Remembers every monitor ever plugged into each room, edits
          plain-English notes, and updates in one click.
        </p>

        {[
          {
            badge: "AUTO-DETECT",
            color: "#10b981",
            title: "Automatic Room Recognition",
            desc: "Recognizes your Home Office, Recording Studio, or Conference Room on plug-in.",
          },
          {
            badge: "SMART HIDE",
            color: "#38bdf8",
            title: "Hide Closed or Docked Screens",
            desc: "Laptop closed on a shelf? Hide it per room so preset buttons stay clean.",
          },
          {
            badge: "BUILTIN UPDATES",
            color: "#c084fc",
            title: "1-Click Updates & Diagnostic Support",
            desc: "Built-in software updater and 1-click bug reporting right in the app.",
          },
        ].map((item, idx) => {
          const itemSpring = spring({
            frame: Math.max(0, frame - 22 - idx * 16),
            fps,
            config: { damping: 15 },
          });
          return (
            <div
              key={item.title}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 18,
                marginBottom: 18,
                padding: "18px 22px",
                borderRadius: 18,
                background: "rgba(15, 23, 42, 0.85)",
                border: `1.5px solid ${item.color}55`,
                opacity: itemSpring,
                transform: `translateY(${interpolate(itemSpring, [0, 1], [24, 0])}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: MONO_FONT,
                  fontSize: 15,
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
                <div
                  style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc" }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: 19,
                    color: "#cbd5e1",
                    marginTop: 4,
                    fontWeight: 500,
                  }}
                >
                  {item.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Column: 3D Perspective Real v1.1.0 App Screenshots */}
      <div
        style={{
          position: "absolute",
          right: 65,
          top: 78,
          width: 940,
          height: 920,
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 250,
            top: 20,
            width: 620,
            transform: `perspective(1400px) rotateY(-12deg) rotateX(3deg) scale(${interpolate(
              secondCardSpring,
              [0, 1],
              [0.85, 0.92]
            )}) translateY(${-floatY * 0.7}px)`,
            opacity: interpolate(secondCardSpring, [0, 1], [0, 0.8]),
            filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.68))",
          }}
        >
          <Img
            src={staticFile("displays-single-space.png")}
            style={{ width: "100%", borderRadius: 20 }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            right: 0,
            top: 90,
            width: 700,
            transform: `perspective(1400px) rotateY(-8deg) rotateX(2deg) scale(${cardSpring}) translateY(${floatY}px)`,
            filter:
              "drop-shadow(0 40px 80px rgba(2, 6, 23, 0.92)) drop-shadow(0 0 40px rgba(56, 189, 248, 0.28))",
          }}
        >
          <Img
            src={staticFile("displays-multi-space.png")}
            style={{ width: "100%", borderRadius: 22 }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 3: Self-Explanatory Visual Role Chips + Cross-Platform CLI Companion (430 frames = 7.16s)
const Scene3Architecture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const presets = [
    {
      title: "Mirror Primary Desk to Room TV",
      desc: "Primary Desk Monitor and Room TV show the same 1080p screen",
      chips: [
        { name: "Primary Desk", role: "MAIN", color: "#38bdf8" },
        { name: "Room TV (KVM)", role: "MIRROR", color: "#34d399" },
      ],
    },
    {
      title: "Extend Primary Desk + Room TV (2 Screens)",
      desc: "Primary Desk is Main; Room TV extends right as a 2nd desktop",
      chips: [
        { name: "Primary Desk", role: "MAIN", color: "#38bdf8" },
        { name: "Room TV (KVM)", role: "EXTEND", color: "#c084fc" },
      ],
    },
    {
      title: "TV Off · Primary Desk Only",
      desc: "Mutes Room TV for privacy; keeps Primary Desk Monitor active",
      chips: [
        { name: "Primary Desk", role: "MAIN", color: "#38bdf8" },
        { name: "Room TV (KVM)", role: "OFF", color: "#94a3b8" },
      ],
    },
  ];

  const typedChars = Math.min(
    48,
    Math.max(0, Math.floor((frame - 35) * 0.85))
  );
  const cmdText = `$ screenstage --apply "Mirror Primary Desk"`.slice(0, typedChars);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY, color: "white" }}>
      <CyberBackground accent="#a855f7" />

      <div
        style={{
          position: "absolute",
          top: 64,
          width: "100%",
          textAlign: "center",
        }}
      >
        <KineticWords
          fontSize={74}
          startFrame={4}
          staggerFrames={6}
          lineHeight={1.04}
          letterSpacing={-2.4}
          words={[
            { text: "Self-Explanatory" },
            { text: "Presets." },
            { text: "GUI", color: "#38bdf8" },
            { text: "+" },
            { text: "CLI.", color: "#34d399" },
          ]}
        />
        <p
          style={{
            fontSize: 29,
            fontWeight: 600,
            color: "#cbd5e1",
            marginTop: 14,
          }}
        >
          See what every monitor will do at a glance across macOS, Windows
          10/11, and Linux.
        </p>
      </div>

      {/* Left Interactive Preset Stack */}
      <div
        style={{
          position: "absolute",
          top: 255,
          left: 96,
          width: 980,
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {presets.map((p, idx) => {
          const s = spring({
            frame: Math.max(0, frame - 18 - idx * 16),
            fps,
            config: { damping: 14 },
          });
          const isSelected = idx === 0 && frame > 95;
          return (
            <div
              key={p.title}
              style={{
                padding: "26px 32px",
                borderRadius: 22,
                background: isSelected
                  ? "linear-gradient(90deg, rgba(56, 189, 248, 0.22), rgba(15, 23, 42, 0.95))"
                  : "rgba(15, 23, 42, 0.88)",
                border: isSelected
                  ? "2.5px solid #38bdf8"
                  : "1.5px solid rgba(148, 163, 184, 0.22)",
                boxShadow: isSelected
                  ? "0 22px 55px rgba(56, 189, 248, 0.25)"
                  : "0 12px 32px rgba(0,0,0,0.45)",
                transform: `scale(${s}) translateX(${interpolate(
                  s,
                  [0, 1],
                  [-40, 0]
                )}px)`,
                opacity: s,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 28, fontWeight: 800 }}>
                    {p.title}
                  </span>
                  {isSelected && (
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 900,
                        padding: "5px 12px",
                        borderRadius: 999,
                        background: "rgba(16, 185, 129, 0.24)",
                        border: "1.5px solid #34d399",
                        color: "#34d399",
                      }}
                    >
                      ACTIVE
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 500,
                    color: "#cbd5e1",
                    margin: "8px 0 16px",
                  }}
                >
                  {p.desc}
                </div>
                <div style={{ display: "flex", gap: 14 }}>
                  {p.chips.map((c) => (
                    <div
                      key={c.name}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 16px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.08)",
                        fontSize: 19,
                        fontWeight: 700,
                      }}
                    >
                      <span>{c.name}</span>
                      <span
                        style={{
                          fontFamily: MONO_FONT,
                          fontSize: 16,
                          fontWeight: 900,
                          padding: "4px 10px",
                          borderRadius: 8,
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
                  padding: "14px 28px",
                  borderRadius: 14,
                  background: isSelected ? "#38bdf8" : "rgba(255,255,255,0.1)",
                  color: isSelected ? "#020617" : "#f8fafc",
                  fontSize: 21,
                  fontWeight: 900,
                }}
              >
                {isSelected ? "Applied ✓" : "Apply"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Cross-Platform Terminal Window */}
      <div
        style={{
          position: "absolute",
          top: 255,
          right: 88,
          width: 710,
          height: 590,
          borderRadius: 24,
          background: "#090d16",
          border: "2px solid rgba(148, 163, 184, 0.3)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.75)",
          padding: 32,
          fontFamily: MONO_FONT,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              background: "#ef4444",
            }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              background: "#f59e0b",
            }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              background: "#10b981",
            }}
          />
          <span
            style={{
              marginLeft: 10,
              fontSize: 17,
              fontWeight: 700,
              color: "#94a3b8",
            }}
          >
            macOS · Windows · Linux CLI
          </span>
        </div>

        <div
          style={{
            fontSize: 23,
            fontWeight: 800,
            color: "#38bdf8",
            marginBottom: 22,
          }}
        >
          {cmdText}
          <span
            style={{
              opacity: frame % 20 < 10 ? 1 : 0,
              background: "#38bdf8",
              marginLeft: 4,
            }}
          >
            &nbsp;
          </span>
        </div>

        {frame > 95 && (
          <div style={{ fontSize: 19, lineHeight: 1.75, color: "#e2e8f0" }}>
            <div style={{ color: "#34d399", fontWeight: 800 }}>
              ✓ Auto-Detected Space: Studio Control Room
            </div>
            <div>• Primary Desk: MAIN (2560x1440 @ 60Hz)</div>
            <div>• Room TV (KVM): MIRROR (1920x1080 @ 60Hz)</div>
            <div style={{ color: "#94a3b8" }}>
              • Docked Laptop: HIDDEN IN SPACE
            </div>
            <div
              style={{
                marginTop: 26,
                padding: 20,
                borderRadius: 16,
                background: "rgba(56, 189, 248, 0.1)",
                border: "1.5px solid rgba(56, 189, 248, 0.35)",
                color: "#7dd3fc",
                fontSize: 18,
                lineHeight: 1.6,
              }}
            >
              <div>• macOS: Menu Bar + Desktop App</div>
              <div>• Windows 10/11: Desktop + KVM TV Switcher</div>
              <div>• Linux: X11 &amp; Wayland Display Engine</div>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// Scene 4: Launch & Pricing CTA on buildforwardtech.com (405 frames = 6.75s)
const Scene4CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scaleIn = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 105 },
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        color: "white",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CyberBackground accent="#10b981" />

      <div
        style={{
          textAlign: "center",
          transform: `scale(${scaleIn})`,
          maxWidth: 1440,
          padding: "0 40px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            padding: "12px 28px",
            borderRadius: 999,
            background: "rgba(16, 185, 129, 0.16)",
            border: "2px solid rgba(16, 185, 129, 0.5)",
            color: "#34d399",
            fontSize: 22,
            fontWeight: 900,
            marginBottom: 22,
          }}
        >
          <ScreenStageLogo size={44} />
          <span>AVAILABLE NOW AT BUILD FORWARD TECH LABS</span>
        </div>

        <KineticWords
          fontSize={86}
          startFrame={6}
          staggerFrames={6}
          lineHeight={1.03}
          letterSpacing={-2.6}
          words={[
            { text: BRAND.productName },
            { text: "for" },
            { text: "Mac,", color: "#38bdf8" },
            { text: "Windows", color: "#34d399" },
            { text: "&" },
            { text: "Linux", color: "#c084fc" },
          ]}
        />

        <div style={{ margin: "24px 0 36px" }}>
          <PlatformBadgesRow startFrame={30} />
        </div>

        {/* Pricing / Edition Cards (Commercial Tiers Only) */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            marginBottom: 42,
          }}
        >
          <div
            style={{
              width: 540,
              padding: "32px 38px",
              borderRadius: 26,
              background:
                "linear-gradient(145deg, rgba(14, 165, 233, 0.26), rgba(15, 23, 42, 0.92))",
              border: "2.5px solid #38bdf8",
              boxShadow: "0 25px 60px rgba(56, 189, 248, 0.25)",
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 20, color: "#38bdf8", fontWeight: 900 }}>
                PERSONAL LICENSE (3 COMPUTERS)
              </span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 900,
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: "#38bdf8",
                  color: "#020617",
                }}
              >
                ONE-TIME
              </span>
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 900,
                margin: "8px 0 12px",
                color: "#f8fafc",
              }}
            >
              {BRAND.priceIndividual}{" "}
              <span style={{ fontSize: 24, fontWeight: 600, color: "#cbd5e1" }}>
                / lifetime license
              </span>
            </div>
            <div
              style={{
                fontSize: 21,
                color: "#e2e8f0",
                lineHeight: 1.45,
                fontWeight: 500,
              }}
            >
              Activate on up to 3 personal Macs, Windows PCs, or Linux machines
              with unlimited rooms and presets.
            </div>
          </div>

          <div
            style={{
              width: 560,
              padding: "32px 38px",
              borderRadius: 26,
              background:
                "linear-gradient(145deg, rgba(16, 185, 129, 0.24), rgba(15, 23, 42, 0.92))",
              border: "2.5px solid #34d399",
              boxShadow: "0 25px 60px rgba(16, 185, 129, 0.25)",
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 20, color: "#34d399", fontWeight: 900 }}>
                STUDIO &amp; TEAM PACK (15 COMPUTERS)
              </span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 900,
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: "#34d399",
                  color: "#020617",
                }}
              >
                LABS &amp; STUDIOS
              </span>
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 900,
                margin: "8px 0 12px",
                color: "#ffffff",
              }}
            >
              {BRAND.priceTeam}{" "}
              <span style={{ fontSize: 24, fontWeight: 600, color: "#e2e8f0" }}>
                / 15-seat pack
              </span>
            </div>
            <div
              style={{
                fontSize: 21,
                color: "#f1f5f9",
                lineHeight: 1.45,
                fontWeight: 500,
              }}
            >
              Standardize multi-monitor control rooms, classrooms, and edit bays
              across Mac, Windows, and Linux.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "inline-block",
            padding: "18px 46px",
            borderRadius: 18,
            background: "linear-gradient(90deg, #38bdf8, #10b981)",
            color: "#020617",
            fontSize: 32,
            fontWeight: 900,
            fontFamily: MONO_FONT,
            boxShadow: "0 20px 50px rgba(16, 185, 129, 0.38)",
          }}
        >
          {BRAND.url}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const DisplaysLaunchVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#020409" }}>
      <Audio src={staticFile("soundtrack.mp3")} volume={0.9} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={410}>
          <Scene1Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 18 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={450}>
          <Scene2NativeUI />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 18 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={430}>
          <Scene3Architecture />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 18 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={405}>
          <Scene4CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
