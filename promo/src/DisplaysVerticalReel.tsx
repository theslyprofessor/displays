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
import { BrandConfig, DEFAULT_BRAND } from "./brandConfig";

const COLORS = {
  bg: "#07090e",
  card: "rgba(19, 25, 38, 0.90)",
  border: "rgba(255, 255, 255, 0.14)",
  blue: "#38bdf8",
  green: "#34d399",
  purple: "#a855f7",
  amber: "#fbbf24",
  text: "#f8fafc",
  muted: "#94a3b8",
};

const RoleChip: React.FC<{
  icon: string;
  name: string;
  role: string;
  color: string;
  delay: number;
}> = ({ icon, name, role, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 12, stiffness: 170 },
  });

  return (
    <div
      style={{
        transform: `scale(${interpolate(pop, [0, 1], [0.75, 1])}) translateY(${interpolate(
          pop,
          [0, 1],
          [20, 0]
        )}px)`,
        opacity: pop,
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 20px",
        borderRadius: 16,
        background: "rgba(15, 23, 42, 0.92)",
        border: `2px solid ${color}66`,
        boxShadow: `0 14px 34px -8px ${color}44`,
      }}
    >
      <span style={{ fontSize: 26 }}>{icon}</span>
      <span
        style={{
          color: COLORS.text,
          fontSize: 23,
          fontWeight: 700,
          letterSpacing: -0.4,
        }}
      >
        {name}
      </span>
      <span
        style={{
          padding: "5px 12px",
          borderRadius: 9,
          background: `${color}28`,
          color,
          fontSize: 17,
          fontWeight: 800,
          letterSpacing: 0.7,
        }}
      >
        {role}
      </span>
    </div>
  );
};

// Scene 1: 0s - 3.5s (210 frames) — Cold Open Hook for Vertical Reels/Shorts
const Scene1VerticalHook: React.FC<{ brand: BrandConfig }> = ({ brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 18%, #1e293b 0%, #07090e 72%)",
        padding: "110px 64px",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
      }}
    >
      {/* Top Pill */}
      <div
        style={{
          padding: "10px 24px",
          borderRadius: 999,
          background: "rgba(56, 189, 248, 0.14)",
          border: "1.5px solid rgba(56, 189, 248, 0.45)",
          color: COLORS.blue,
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: 1.4,
          textTransform: "uppercase",
        }}
      >
        {brand.parentBrand}
      </div>

      {/* Center Kinetic Hook */}
      <div
        style={{
          textAlign: "center",
          transform: `translateY(${interpolate(titleSpring, [0, 1], [40, 0])}px)`,
          opacity: titleSpring,
        }}
      >
        <div
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: COLORS.amber,
            marginBottom: 18,
            letterSpacing: -0.3,
          }}
        >
          {brand.shortHook}
        </div>
        <h1
          style={{
            fontSize: 82,
            fontWeight: 900,
            color: COLORS.text,
            lineHeight: 1.02,
            letterSpacing: -2.8,
            margin: "0 0 24px 0",
          }}
        >
          Every Room
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #38bdf8 0%, #34d399 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Remembers
          </span>
          <br />
          Every Screen.
        </h1>
        <p
          style={{
            fontSize: 28,
            color: COLORS.muted,
            lineHeight: 1.38,
            margin: 0,
            fontWeight: 500,
          }}
        >
          Meet <strong style={{ color: COLORS.text }}>{brand.productName}</strong> for{" "}
          <strong style={{ color: COLORS.blue }}>macOS</strong> &amp;{" "}
          <strong style={{ color: COLORS.green }}>Windows 10/11</strong>.
        </p>
      </div>

      {/* Bottom Animated Role Badges */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <RoleChip
          icon="🖥"
          name='BenQ 32" 4K Desk'
          role="★ MAIN"
          color={COLORS.blue}
          delay={16}
        />
        <RoleChip
          icon="📺"
          name="Samsung TV (KVM)"
          role="⇄ MIRROR"
          color={COLORS.green}
          delay={28}
        />
        <RoleChip
          icon="💻"
          name="Nearby MacBook / PC"
          role="↗ EXTEND"
          color={COLORS.purple}
          delay={40}
        />
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: 3.5s - 9.0s (330 frames) — Multi-Room + Home KVM Auto-Detection
const Scene2RoomsAndKVM: React.FC<{ brand: BrandConfig }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardPop = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 105 },
  });

  const rooms = [
    {
      badge: "● Detected: CV Home",
      title: "Chula Vista Home (1 or 2 Monitors)",
      sub: 'BenQ 32" 4K + LG 2nd Display + MacBook (strips unplugged screens automatically)',
      color: COLORS.blue,
    },
    {
      badge: "● Poway Home (KVM + TV)",
      title: "Desk Monitor + KVM Samsung TV + Laptop",
      sub: "Extend all 3 screens, mirror Desk to KVM TV, or mute TV in 1 click",
      color: COLORS.green,
    },
    {
      badge: "● Studio A (84-101)",
      title: "Hides Closed Machine-Room Laptop",
      sub: "Only shows C27-30 (2) Main Desk and Room Broadcast TV on preset badges",
      color: COLORS.purple,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 25%, #0f172a 0%, #05070b 75%)",
        padding: "86px 54px",
        justifyContent: "space-between",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
      }}
    >
      <div>
        <div
          style={{
            color: COLORS.green,
            fontSize: 21,
            fontWeight: 800,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          EDID &amp; Hardware UUID Space Detection
        </div>
        <h2
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: COLORS.text,
            lineHeight: 1.06,
            letterSpacing: -1.8,
            margin: 0,
          }}
        >
          Plug In Anywhere.
          <br />
          <span style={{ color: COLORS.blue }}>It Knows the Room.</span>
        </h2>
      </div>

      {/* Real App Screenshot Card */}
      <div
        style={{
          transform: `scale(${interpolate(cardPop, [0, 1], [0.88, 1])})`,
          opacity: cardPop,
          borderRadius: 24,
          overflow: "hidden",
          border: "2px solid rgba(56, 189, 248, 0.4)",
          boxShadow: "0 30px 70px -15px rgba(0,0,0,0.85)",
          background: "#161922",
        }}
      >
        <Img
          src={staticFile("displays-multi-space.png")}
          style={{ width: "100%", display: "block" }}
        />
      </div>

      {/* 3 Room Callout Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rooms.map((r, i) => {
          const rPop = spring({
            frame: Math.max(0, frame - 20 - i * 16),
            fps,
            config: { damping: 14, stiffness: 140 },
          });
          return (
            <div
              key={r.title}
              style={{
                opacity: rPop,
                transform: `translateX(${interpolate(rPop, [0, 1], [-30, 0])}px)`,
                padding: "16px 22px",
                borderRadius: 18,
                background: COLORS.card,
                border: `1.5px solid ${r.color}55`,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: r.color,
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                {r.badge}
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: COLORS.text,
                  marginBottom: 3,
                }}
              >
                {r.title}
              </div>
              <div style={{ fontSize: 18, color: COLORS.muted }}>{r.sub}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Scene 3: 9.0s - 15.0s (360 frames) — Single-Space Desktop + macOS/Windows CTA
const Scene3CrossPlatformCTA: React.FC<{ brand: BrandConfig }> = ({ brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 115 },
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 35%, #172554 0%, #05070b 75%)",
        padding: "92px 56px",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            padding: "8px 20px",
            borderRadius: 999,
            background: "rgba(52, 211, 153, 0.16)",
            border: "1.5px solid rgba(52, 211, 153, 0.45)",
            color: COLORS.green,
            fontSize: 19,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          Single-Space Mode for Fixed Desktops
        </div>
        <h2
          style={{
            fontSize: 58,
            fontWeight: 900,
            color: COLORS.text,
            lineHeight: 1.06,
            letterSpacing: -2,
            margin: 0,
          }}
        >
          One Config.
          <br />
          <span style={{ color: COLORS.blue }}>Mac</span> &amp;{" "}
          <span style={{ color: COLORS.green }}>Windows.</span>
        </h2>
      </div>

      {/* Single-Space Screenshot */}
      <div
        style={{
          transform: `scale(${interpolate(pop, [0, 1], [0.86, 1])})`,
          opacity: pop,
          borderRadius: 22,
          overflow: "hidden",
          border: "2px solid rgba(168, 85, 247, 0.45)",
          boxShadow: "0 28px 65px -15px rgba(0,0,0,0.85)",
          width: "100%",
        }}
      >
        <Img
          src={staticFile("displays-single-space.png")}
          style={{ width: "100%", display: "block" }}
        />
      </div>

      {/* Pricing & CTA Card */}
      <div
        style={{
          width: "100%",
          padding: "28px 32px",
          borderRadius: 24,
          background:
            "linear-gradient(135deg, rgba(56,189,248,0.22) 0%, rgba(52,211,153,0.16) 100%)",
          border: "2px solid rgba(56, 189, 248, 0.55)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: COLORS.blue,
            marginBottom: 6,
          }}
        >
          Signed {brand.macBinaryName} + Native {brand.winBinaryName}
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: COLORS.text,
            letterSpacing: -1.5,
            marginBottom: 8,
          }}
        >
          {brand.price} One-Time · Or Free OSS
        </div>
        <div
          style={{
            fontSize: 25,
            fontWeight: 800,
            color: COLORS.green,
            fontFamily: "'SF Mono', Menlo, monospace",
          }}
        >
          {brand.websiteUrl}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const DisplaysVerticalReel: React.FC<{ brand?: BrandConfig }> = ({
  brand = DEFAULT_BRAND,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Audio src={staticFile("soundtrack.mp3")} volume={0.9} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={220}>
          <Scene1VerticalHook brand={brand} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 18 }, durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence durationInFrames={340}>
          <Scene2RoomsAndKVM brand={brand} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 20 }, durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence durationInFrames={380}>
          <Scene3CrossPlatformCTA brand={brand} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
