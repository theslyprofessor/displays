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

const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif";
const MONO_FONT = "'SF Mono', 'JetBrains Mono', Menlo, monospace";

const CyberBackground: React.FC<{ accent?: string }> = ({
  accent = "#38bdf8",
}) => {
  const frame = useCurrentFrame();
  const shift = (frame * 1.2) % 80;
  const pulse = Math.sin(frame / 18) * 0.12 + 0.88;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 18%, #0f172a 0%, #050811 62%, #020409 100%)",
        overflow: "hidden",
      }}
    >
      {/* Glowing ambient orbs */}
      <div
        style={{
          position: "absolute",
          width: 960,
          height: 960,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}33 0%, transparent 68%)`,
          top: -280,
          left: 480 + Math.sin(frame / 35) * 90,
          transform: `scale(${pulse})`,
          filter: "blur(50px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 760,
          height: 760,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(168, 85, 247, 0.20) 0%, transparent 70%)",
          bottom: -260,
          right: 180 + Math.cos(frame / 30) * 70,
          filter: "blur(60px)",
        }}
      />
      {/* Perspective floor grid */}
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

// Scene 1: The Multi-Monitor Chaos Hook (0 - 4.2s = 252 frames)
const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const subSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 16, mass: 0.9 },
  });

  const monitors = [
    {
      label: "Studio A · C27-30 (2)",
      sub: "27\" HDMI · 1920x1080 @ 75Hz",
      badge: "WRONG ORIGIN (-1920,0)",
      color: "#ef4444",
      x: -440,
      y: 90,
      rot: -8,
      delay: 12,
    },
    {
      label: "Control Room TV (Blackmagic)",
      sub: "HDMI Broadcast · 1080p @ 60Hz",
      badge: "UNMIRRORED DESKTOP",
      color: "#f59e0b",
      x: 0,
      y: 55,
      rot: 2,
      delay: 22,
    },
    {
      label: "MacBook Pro (In Machine Room)",
      sub: "Closed Clamshell · Can't See Screen",
      badge: "STOLE MAIN MENU BAR",
      color: "#ec4899",
      x: 440,
      y: 95,
      rot: 7,
      delay: 32,
    },
  ];

  // At frame 135, snap all 3 monitors into clean alignment!
  const snapProgress = spring({
    frame: frame - 130,
    fps,
    config: { damping: 13, stiffness: 140 },
  });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY, color: "white" }}>
      <CyberBackground accent={frame < 130 ? "#f43f5e" : "#38bdf8"} />

      <div
        style={{
          position: "absolute",
          top: 96,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 20px",
            borderRadius: 999,
            background: "rgba(15, 23, 42, 0.78)",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 1.5,
            color: "#38bdf8",
            textTransform: "uppercase",
            transform: `scale(${titleSpring})`,
          }}
        >
          <span>BUILD FORWARD TECH LABS</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span>NATIVE MACOS UTILITY</span>
        </div>

        <h1
          style={{
            fontSize: 78,
            fontWeight: 800,
            margin: "22px 0 12px",
            letterSpacing: -2,
            lineHeight: 1.05,
            opacity: titleSpring,
            transform: `translateY(${interpolate(titleSpring, [0, 1], [35, 0])}px)`,
          }}
        >
          {frame < 130 ? (
            <>
              Multi-Monitor Setups{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #fb7185, #f59e0b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Break Every Room.
              </span>
            </>
          ) : (
            <>
              Now Every Room Just{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #38bdf8, #34d399)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Remembers Everything.
              </span>
            </>
          )}
        </h1>

        <p
          style={{
            fontSize: 28,
            color: "#94a3b8",
            margin: 0,
            opacity: subSpring,
          }}
        >
          {frame < 130
            ? "Scrambled origins. Hidden laptops stealing Main. Cryptic display IDs."
            : "Hardware UUID room detection • Monitor history • 1-click self-explanatory roles."}
        </p>
      </div>

      {/* Animated Monitor Cards */}
      <div
        style={{
          position: "absolute",
          top: 430,
          left: "50%",
          width: 0,
          height: 0,
        }}
      >
        {monitors.map((m, i) => {
          const enter = spring({
            frame: frame - m.delay,
            fps,
            config: { damping: 12 },
          });
          const jitterX =
            frame < 130 ? Math.sin((frame + i * 25) / 6) * 8 : 0;
          const jitterY =
            frame < 130 ? Math.cos((frame + i * 19) / 5) * 6 : 0;

          const curX = interpolate(snapProgress, [0, 1], [m.x + jitterX, (i - 1) * 430]);
          const curY = interpolate(snapProgress, [0, 1], [m.y + jitterY, 70]);
          const curRot = interpolate(snapProgress, [0, 1], [m.rot, 0]);

          const fixedBadges = ["MAIN DESK (0,0)", "MIRRORS MAIN", "HIDDEN IN SPACE"];
          const fixedColors = ["#3b82f6", "#10b981", "#64748b"];
          const activeColor = frame < 130 ? m.color : fixedColors[i];
          const activeBadge = frame < 130 ? m.badge : fixedBadges[i];

          return (
            <div
              key={m.label}
              style={{
                position: "absolute",
                width: 390,
                height: 230,
                left: -195,
                top: 0,
                transform: `translate(${curX}px, ${curY}px) rotate(${curRot}deg) scale(${enter})`,
                borderRadius: 22,
                background:
                  "linear-gradient(165deg, rgba(30, 41, 59, 0.92), rgba(15, 23, 42, 0.95))",
                border: `2px solid ${activeColor}`,
                boxShadow: `0 25px 60px -15px ${activeColor}44`,
                padding: 26,
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
                <div style={{ display: "flex", gap: 8 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      background: activeColor,
                    }}
                  />
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.18)",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: MONO_FONT,
                    fontSize: 13,
                    fontWeight: 700,
                    padding: "5px 10px",
                    borderRadius: 6,
                    background: `${activeColor}28`,
                    color: activeColor,
                  }}
                >
                  {activeBadge}
                </span>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 23,
                    fontWeight: 700,
                    color: "#f8fafc",
                    marginBottom: 6,
                  }}
                >
                  {m.label}
                </div>
                <div style={{ fontSize: 15, color: "#94a3b8" }}>{m.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: Real Native macOS App Showcase (Multi-Room + Single-Space Desktop Mode) (300 frames = 5.0s)
const Scene2NativeUI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 110 },
  });
  const secondCardSpring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  const floatY = Math.sin(frame / 22) * 8;

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY, color: "white" }}>
      <CyberBackground accent="#38bdf8" />

      {/* Left Column: Feature Copy & Badges */}
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 135,
          width: 680,
          opacity: cardSpring,
          transform: `translateX(${interpolate(cardSpring, [0, 1], [-50, 0])}px)`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "6px 14px",
            borderRadius: 8,
            background: "rgba(56, 189, 248, 0.16)",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            color: "#38bdf8",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 1.2,
            marginBottom: 20,
          }}
        >
          100% NATIVE SWIFTUI + APPKIT
        </div>

        <h2
          style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.06,
            letterSpacing: -1.8,
            margin: "0 0 22px",
          }}
        >
          Meet{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #38bdf8, #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {BRAND.productName}
          </span>{" "}
          for macOS &amp; PC.
        </h2>

        <p
          style={{
            fontSize: 24,
            lineHeight: 1.45,
            color: "#cbd5e1",
            marginBottom: 34,
          }}
        >
          A standalone menu bar and desktop app that learns every monitor in
          every space, lets you edit plain-English descriptions, and switches
          complex multi-screen setups in one click.
        </p>

        {[
          {
            badge: "AUTO-DETECT",
            color: "#10b981",
            title: "Hardware UUID Room Recognition",
            desc: "Recognizes Studio A (84-101), Lab 84-102, or your Home Desk the instant you plug in.",
          },
          {
            badge: "SMART HIDE",
            color: "#3b82f6",
            title: "Ignore Closed or Machine-Room Screens",
            desc: "Laptop tucked in a rack? Hide it per space so preset badges only show the screens in front of you.",
          },
          {
            badge: "ADAPTIVE UI",
            color: "#a855f7",
            title: "Single-Space Desktop or Multi-Room Laptop",
            desc: "Fixed studio Macs show a zero-clutter single-space view; road laptops get instant room tabs.",
          },
        ].map((item, idx) => {
          const itemSpring = spring({
            frame: frame - 18 - idx * 14,
            fps,
            config: { damping: 15 },
          });
          return (
            <div
              key={item.title}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                marginBottom: 20,
                padding: "16px 20px",
                borderRadius: 16,
                background: "rgba(15, 23, 42, 0.78)",
                border: "1px solid rgba(148, 163, 184, 0.16)",
                opacity: itemSpring,
                transform: `translateY(${interpolate(itemSpring, [0, 1], [24, 0])}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: MONO_FONT,
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "5px 10px",
                  borderRadius: 6,
                  background: `${item.color}25`,
                  color: item.color,
                  marginTop: 3,
                  whiteSpace: "nowrap",
                }}
              >
                {item.badge}
              </span>
              <div>
                <div
                  style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc" }}
                >
                  {item.title}
                </div>
                <div style={{ fontSize: 15.5, color: "#94a3b8", marginTop: 3 }}>
                  {item.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Column: 3D Perspective Real App Screenshots */}
      <div
        style={{
          position: "absolute",
          right: 75,
          top: 90,
          width: 960,
          height: 900,
        }}
      >
        {/* Background Card: Single-Space Desktop Mode */}
        <div
          style={{
            position: "absolute",
            right: 260,
            top: 20,
            width: 620,
            transform: `perspective(1400px) rotateY(-14deg) rotateX(4deg) scale(${interpolate(secondCardSpring, [0, 1], [0.85, 0.92])}) translateY(${-floatY * 0.7}px)`,
            opacity: interpolate(secondCardSpring, [0, 1], [0, 0.78]),
            filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.65))",
          }}
        >
          <Img
            src={staticFile("displays-single-space.png")}
            style={{ width: "100%", borderRadius: 20 }}
          />
        </div>

        {/* Foreground Card: Multi-Room Auto-Detected Mode */}
        <div
          style={{
            position: "absolute",
            right: 10,
            top: 95,
            width: 680,
            transform: `perspective(1400px) rotateY(-10deg) rotateX(3deg) scale(${cardSpring}) translateY(${floatY}px)`,
            filter:
              "drop-shadow(0 40px 80px rgba(2, 6, 23, 0.9)) drop-shadow(0 0 40px rgba(56, 189, 248, 0.25))",
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

// Scene 3: Self-Explanatory Visual Role Chips + CLI Companion (290 frames = 4.8s)
const Scene3Architecture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({ frame, fps, config: { damping: 14 } });

  const presets = [
    {
      title: "Mirror C27-30 (2) to TV",
      desc: "C27-30 (2) Main Desk and Room TV show the same 1080p screen",
      chips: [
        { name: "C27-30 (2)", role: "MAIN", color: "#3b82f6" },
        { name: "TV (Blackmagic)", role: "MIRROR", color: "#10b981" },
      ],
    },
    {
      title: "Extend C27-30 (2) + TV (2 Separate Desktops)",
      desc: "C27-30 (2) is Main Desk; Room TV is extended right as a 2nd desktop",
      chips: [
        { name: "C27-30 (2)", role: "MAIN", color: "#3b82f6" },
        { name: "TV (Blackmagic)", role: "EXTEND", color: "#a855f7" },
      ],
    },
    {
      title: "TV Off · C27-30 (2) Desk Only",
      desc: "Mutes Room TV for privacy; keeps C27-30 (2) Main Desk active",
      chips: [
        { name: "C27-30 (2)", role: "MAIN", color: "#3b82f6" },
        { name: "TV (Blackmagic)", role: "OFF", color: "#64748b" },
      ],
    },
  ];

  const typedChars = Math.min(
    46,
    Math.max(0, Math.floor((frame - 35) * 0.95))
  );
  const cmdText = `$ displays apply 84-101 "Mirror C27-30"`.slice(0, typedChars);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY, color: "white" }}>
      <CyberBackground accent="#a855f7" />

      <div
        style={{
          position: "absolute",
          top: 88,
          width: "100%",
          textAlign: "center",
          opacity: headerSpring,
        }}
      >
        <h2
          style={{
            fontSize: 62,
            fontWeight: 800,
            margin: 0,
            letterSpacing: -1.5,
          }}
        >
          Self-Explanatory Presets.{" "}
          <span style={{ color: "#38bdf8" }}>Menu Bar + CLI.</span>
        </h2>
        <p style={{ fontSize: 25, color: "#94a3b8", marginTop: 12 }}>
          Every preset shows live monitor role pills and plain-English
          descriptions you can edit anytime.
        </p>
      </div>

      {/* Center Interactive Preset Stack */}
      <div
        style={{
          position: "absolute",
          top: 265,
          left: 140,
          width: 960,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {presets.map((p, idx) => {
          const s = spring({
            frame: frame - 14 - idx * 14,
            fps,
            config: { damping: 14 },
          });
          const isSelected = idx === 0 && frame > 85;
          return (
            <div
              key={p.title}
              style={{
                padding: "24px 30px",
                borderRadius: 20,
                background: isSelected
                  ? "linear-gradient(90deg, rgba(56, 189, 248, 0.18), rgba(15, 23, 42, 0.92))"
                  : "rgba(15, 23, 42, 0.85)",
                border: isSelected
                  ? "2px solid #38bdf8"
                  : "1px solid rgba(148, 163, 184, 0.18)",
                boxShadow: isSelected
                  ? "0 20px 50px rgba(56, 189, 248, 0.22)"
                  : "0 10px 30px rgba(0,0,0,0.4)",
                transform: `scale(${s}) translateX(${interpolate(s, [0, 1], [-40, 0])}px)`,
                opacity: s,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 25, fontWeight: 700 }}>
                    {p.title}
                  </span>
                  {isSelected && (
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: "rgba(16, 185, 129, 0.2)",
                        color: "#34d399",
                      }}
                    >
                      ACTIVE
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 17,
                    color: "#94a3b8",
                    margin: "6px 0 14px",
                  }}
                >
                  {p.desc}
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  {p.chips.map((c) => (
                    <div
                      key={c.name}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "7px 14px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.06)",
                        fontSize: 16,
                        fontWeight: 600,
                      }}
                    >
                      <span>{c.name}</span>
                      <span
                        style={{
                          fontFamily: MONO_FONT,
                          fontSize: 13,
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: `${c.color}30`,
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
                  padding: "12px 26px",
                  borderRadius: 12,
                  background: isSelected ? "#38bdf8" : "rgba(255,255,255,0.08)",
                  color: isSelected ? "#020617" : "#f8fafc",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {isSelected ? "Applied ✓" : "Apply"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Terminal Window */}
      <div
        style={{
          position: "absolute",
          top: 265,
          right: 120,
          width: 640,
          height: 520,
          borderRadius: 20,
          background: "#090d16",
          border: "1px solid rgba(148, 163, 184, 0.25)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.7)",
          padding: 28,
          fontFamily: MONO_FONT,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              background: "#ef4444",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              background: "#f59e0b",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              background: "#10b981",
            }}
          />
          <span
            style={{
              marginLeft: 10,
              fontSize: 14,
              color: "#64748b",
            }}
          >
            zsh — displays CLI + ~/.config/displays/presets.json
          </span>
        </div>

        <div style={{ fontSize: 19, color: "#38bdf8", marginBottom: 18 }}>
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

        {frame > 85 && (
          <div style={{ fontSize: 16, lineHeight: 1.7, color: "#cbd5e1" }}>
            <div style={{ color: "#34d399", fontWeight: 700 }}>
              ✓ Detected Space: 84-101 (Studio A Control Room)
            </div>
            <div>• C27-30 (2) Desk: MAIN (1920x1080 @ 75Hz)</div>
            <div>• TV (Blackmagic): MIRROR (1920x1080 @ 60Hz)</div>
            <div style={{ color: "#64748b" }}>
              • MacBook: HIDDEN (In machine room)
            </div>
            <div
              style={{
                marginTop: 22,
                padding: 16,
                borderRadius: 12,
                background: "rgba(56, 189, 248, 0.08)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                color: "#7dd3fc",
                fontSize: 14.5,
              }}
            >
              Dotfiles-ready JSON config at{" "}
              <strong>~/.config/displays/presets.json</strong>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// Scene 4: Launch & Pricing CTA on buildforwardtech.com (285 frames = 4.75s)
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
          maxWidth: 1280,
          padding: "0 40px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 24px",
            borderRadius: 999,
            background: "rgba(16, 185, 129, 0.16)",
            border: "1px solid rgba(16, 185, 129, 0.45)",
            color: "#34d399",
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 28,
          }}
        >
          <span>AVAILABLE NOW AT BUILD FORWARD TECH LABS</span>
        </div>

        <h1
          style={{
            fontSize: 92,
            fontWeight: 900,
            letterSpacing: -2.5,
            margin: "0 0 18px",
            lineHeight: 1.02,
          }}
        >
          {BRAND.productName} for macOS &amp; Windows
        </h1>

        <p
          style={{
            fontSize: 32,
            color: "#cbd5e1",
            margin: "0 auto 48px",
            maxWidth: 960,
          }}
        >
          {BRAND.tagline} • Hardware UUID Room Detection • KVM Support
        </p>

        {/* Pricing / Edition Cards */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            marginBottom: 52,
          }}
        >
          <div
            style={{
              width: 440,
              padding: "32px 36px",
              borderRadius: 24,
              background: "rgba(15, 23, 42, 0.85)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: 18, color: "#94a3b8", fontWeight: 600 }}>
              OPEN SOURCE EDITION
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                margin: "8px 0 12px",
                color: "#f8fafc",
              }}
            >
              Free{" "}
              <span style={{ fontSize: 20, fontWeight: 500, color: "#64748b" }}>
                / MIT Source
              </span>
            </div>
            <div style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.5 }}>
              Full SwiftUI source code + CLI companion on GitHub. Build from
              source with Swift 6 & displayplacer.
            </div>
          </div>

          <div
            style={{
              width: 480,
              padding: "32px 36px",
              borderRadius: 24,
              background:
                "linear-gradient(145deg, rgba(14, 165, 233, 0.24), rgba(16, 185, 129, 0.18))",
              border: "2px solid #38bdf8",
              boxShadow: "0 25px 60px rgba(56, 189, 248, 0.28)",
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
              <span style={{ fontSize: 18, color: "#38bdf8", fontWeight: 700 }}>
                SIGNED MACOS APP + CLI BUNDLE
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#38bdf8",
                  color: "#020617",
                }}
              >
                INSTANT DOWNLOAD
              </span>
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                margin: "8px 0 12px",
                color: "#ffffff",
              }}
            >
              {BRAND.priceIndividual}{" "}
              <span style={{ fontSize: 20, fontWeight: 500, color: "#cbd5e1" }}>
                one-time Ed25519 license
              </span>
            </div>
            <div style={{ fontSize: 17, color: "#e2e8f0", lineHeight: 1.5 }}>
              Developer-signed macOS + Windows 10/11 bundle, offline Ed25519
              license key, CLI tool, and lifetime updates.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "inline-block",
            padding: "18px 42px",
            borderRadius: 16,
            background: "linear-gradient(90deg, #38bdf8, #10b981)",
            color: "#020617",
            fontSize: 28,
            fontWeight: 800,
            fontFamily: MONO_FONT,
            boxShadow: "0 20px 50px rgba(16, 185, 129, 0.35)",
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
        <TransitionSeries.Sequence durationInFrames={255}>
          <Scene1Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 16 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={310}>
          <Scene2NativeUI />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 16 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={295}>
          <Scene3Architecture />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 16 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={295}>
          <Scene4CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
