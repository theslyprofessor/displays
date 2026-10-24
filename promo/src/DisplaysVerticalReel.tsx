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
import {
  KineticWords,
  LaptopSvg,
  MonitorSvg,
  PlatformBadgesRow,
  ScreenStageLogo,
  TvSvg,
} from "./KineticPrimitives";

const COLORS = {
  bg: "#06080f",
  card: "rgba(15, 23, 42, 0.94)",
  border: "rgba(255, 255, 255, 0.16)",
  blue: "#38bdf8",
  green: "#34d399",
  purple: "#c084fc",
  amber: "#fbbf24",
  text: "#f8fafc",
  muted: "#cbd5e1",
};

const RoleCard: React.FC<{
  icon: React.ReactNode;
  name: string;
  sub: string;
  role: string;
  color: string;
  delay: number;
}> = ({ icon, name, sub, role, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 13, stiffness: 155, mass: 0.8 },
  });

  return (
    <div
      style={{
        transform: `scale(${interpolate(pop, [0, 1], [0.82, 1])}) translateY(${interpolate(
          pop,
          [0, 1],
          [28, 0]
        )}px)`,
        opacity: pop,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 28px",
        borderRadius: 22,
        background: "rgba(15, 23, 42, 0.95)",
        border: `2.5px solid ${color}88`,
        boxShadow: `0 18px 42px -10px ${color}44`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 16,
            background: `${color}1f`,
            border: `1.5px solid ${color}66`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <div>
          <div
            style={{
              color: COLORS.text,
              fontSize: 31,
              fontWeight: 800,
              letterSpacing: -0.6,
              marginBottom: 4,
            }}
          >
            {name}
          </div>
          <div
            style={{
              color: COLORS.muted,
              fontSize: 21,
              fontWeight: 600,
            }}
          >
            {sub}
          </div>
        </div>
      </div>
      <div
        style={{
          padding: "10px 20px",
          borderRadius: 14,
          background: `${color}2e`,
          border: `2px solid ${color}`,
          color,
          fontSize: 23,
          fontWeight: 900,
          letterSpacing: 1.0,
        }}
      >
        {role}
      </div>
    </div>
  );
};

// Scene 1: 0s - 6.3s (380 frames) — High-Impact Kinetic Hook + Custom Vector Role Cards
const Scene1VerticalHook: React.FC<{ brand: BrandConfig }> = ({ brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerPop = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  const hookPop = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 14, stiffness: 130 },
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 18%, #1e293b 0%, #06080f 72%)",
        padding: "78px 56px",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
      }}
    >
      {/* Top Brand Header with Custom ScreenStage App Icon */}
      <div
        style={{
          transform: `scale(${interpolate(headerPop, [0, 1], [0.85, 1])})`,
          opacity: headerPop,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "14px 28px",
          borderRadius: 999,
          background: "rgba(15, 23, 42, 0.9)",
          border: "2px solid rgba(56, 189, 248, 0.5)",
          boxShadow: "0 14px 36px rgba(56, 189, 248, 0.22)",
        }}
      >
        <ScreenStageLogo size={54} />
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              color: COLORS.text,
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: -0.6,
              lineHeight: 1.1,
            }}
          >
            {brand.productName} v1.1
          </div>
          <div
            style={{
              color: COLORS.blue,
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
          >
            {brand.parentBrand}
          </div>
        </div>
      </div>

      {/* Center Kinetic Typography Block */}
      <div style={{ textAlign: "center", width: "100%" }}>
        <div
          style={{
            transform: `translateY(${interpolate(hookPop, [0, 1], [24, 0])}px)`,
            opacity: hookPop,
            display: "inline-block",
            padding: "14px 26px",
            borderRadius: 20,
            background: "rgba(251, 191, 36, 0.14)",
            border: "2px solid rgba(251, 191, 36, 0.48)",
            fontSize: 35,
            fontWeight: 800,
            color: COLORS.amber,
            lineHeight: 1.25,
            marginBottom: 28,
            letterSpacing: -0.5,
          }}
        >
          Why does your computer forget which screen is your Desk and which is your TV?
        </div>

        <KineticWords
          fontSize={94}
          startFrame={22}
          staggerFrames={8}
          lineHeight={1.03}
          letterSpacing={-3.2}
          words={[
            { text: "Every" },
            { text: "Room", newlineAfter: true },
            {
              text: "Remembers",
              gradient: "linear-gradient(135deg, #38bdf8 0%, #34d399 100%)",
              newlineAfter: true,
            },
            { text: "Every" },
            { text: "Screen." },
          ]}
        />

        <div style={{ marginTop: 32 }}>
          <PlatformBadgesRow startFrame={65} compact />
        </div>
      </div>

      {/* Bottom Large Vector Monitor Role Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          width: "100%",
        }}
      >
        <RoleCard
          icon={<MonitorSvg size={38} color={COLORS.blue} />}
          name='Primary 32" 4K Desk'
          sub="Thunderbolt 4 / DisplayPort"
          role="MAIN DESK"
          color={COLORS.blue}
          delay={85}
        />
        <RoleCard
          icon={<TvSvg size={38} color={COLORS.green} />}
          name="Control Room TV (KVM)"
          sub="HDMI Broadcast Feed · 1080p @ 60Hz"
          role="MIRRORED"
          color={COLORS.green}
          delay={102}
        />
        <RoleCard
          icon={<LaptopSvg size={38} color={COLORS.purple} />}
          name="Workstation / Laptop"
          sub="Per-Room Show or Auto-Hide"
          role="EXTENDED"
          color={COLORS.purple}
          delay={119}
        />
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: 6.3s - 14.8s (510 frames) — Uncrowded v1.1.0 UI + Animated Zoom + Room Callouts
const Scene2RoomsAndKVM: React.FC<{ brand: BrandConfig }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardPop = spring({
    frame: Math.max(0, frame - 12),
    fps,
    config: { damping: 14, stiffness: 105 },
  });

  const zoom = interpolate(frame, [30, 380], [1.0, 1.07], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rooms = [
    {
      badge: "STUDIO CONTROL ROOM",
      title: "Hides Closed Docked Laptops Automatically",
      sub: "Only shows your Main Desk Monitor and Room TV on preset buttons",
      color: COLORS.blue,
    },
    {
      badge: "HOME OFFICE & KVM DESK",
      title: "Desk Monitor + KVM TV + Laptop",
      sub: "Works smoothly even when one monitor or TV is turned off",
      color: COLORS.green,
    },
    {
      badge: "CONFERENCE ROOM & CLASSROOM",
      title: "1-Click Mirror or Extended Desktop",
      sub: "Recognizes the room automatically the moment you plug in",
      color: COLORS.purple,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 25%, #0f172a 0%, #05070b 75%)",
        padding: "72px 52px",
        justifyContent: "space-between",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
      }}
    >
      <div>
          <div
            style={{
              color: COLORS.green,
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Automatic Room &amp; Monitor Detection
          </div>
        <KineticWords
          fontSize={68}
          startFrame={4}
          staggerFrames={6}
          align="left"
          lineHeight={1.05}
          letterSpacing={-2.2}
          words={[
            { text: "Plug" },
            { text: "In" },
            { text: "Anywhere.", newlineAfter: true },
            { text: "It", color: COLORS.blue },
            { text: "Knows", color: COLORS.blue },
            { text: "the", color: COLORS.blue },
            { text: "Room.", color: COLORS.blue },
          ]}
        />
      </div>

      {/* Real v1.1.0 Uncrowded App Screenshot Card with Subtle Zoom */}
      <div
        style={{
          transform: `scale(${interpolate(cardPop, [0, 1], [0.9, 1])})`,
          opacity: cardPop,
          borderRadius: 26,
          overflow: "hidden",
          border: "2.5px solid rgba(56, 189, 248, 0.55)",
          boxShadow: "0 30px 75px -12px rgba(0,0,0,0.9)",
          background: "#161922",
        }}
      >
        <Img
          src={staticFile("displays-multi-space.png")}
          style={{
            width: "100%",
            display: "block",
            transform: `scale(${zoom})`,
            transformOrigin: "50% 32%",
          }}
        />
      </div>

      {/* 3 Large Room Callout Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {rooms.map((r, i) => {
          const rPop = spring({
            frame: Math.max(0, frame - 42 - i * 22),
            fps,
            config: { damping: 14, stiffness: 140 },
          });
          return (
            <div
              key={r.title}
              style={{
                opacity: rPop,
                transform: `translateX(${interpolate(rPop, [0, 1], [-40, 0])}px)`,
                padding: "18px 26px",
                borderRadius: 20,
                background: COLORS.card,
                border: `2px solid ${r.color}77`,
              }}
            >
              <div
                style={{
                  fontSize: 19,
                  fontWeight: 900,
                  color: r.color,
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: 1.0,
                }}
              >
                ● {r.badge}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: COLORS.text,
                  marginBottom: 4,
                  letterSpacing: -0.4,
                }}
              >
                {r.title}
              </div>
              <div style={{ fontSize: 21, color: COLORS.muted, fontWeight: 500 }}>
                {r.sub}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Scene 3: 14.8s - 22.0s (470 frames) — macOS + Windows + Linux CTA
const Scene3CrossPlatformCTA: React.FC<{ brand: BrandConfig }> = ({ brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame: Math.max(0, frame - 14),
    fps,
    config: { damping: 13, stiffness: 115 },
  });

  const ctaPop = spring({
    frame: Math.max(0, frame - 45),
    fps,
    config: { damping: 13, stiffness: 135 },
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 35%, #172554 0%, #05070b 75%)",
        padding: "76px 54px",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
      }}
    >
      <div style={{ textAlign: "center", width: "100%" }}>
        <div
          style={{
            display: "inline-block",
            padding: "10px 24px",
            borderRadius: 999,
            background: "rgba(52, 211, 153, 0.16)",
            border: "2px solid rgba(52, 211, 153, 0.5)",
            color: COLORS.green,
            fontSize: 21,
            fontWeight: 900,
            letterSpacing: 1.3,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Cross-Platform Multi-Monitor App
        </div>
        <KineticWords
          fontSize={68}
          startFrame={6}
          staggerFrames={6}
          lineHeight={1.05}
          letterSpacing={-2.2}
          words={[
            { text: "One" },
            { text: "License.", newlineAfter: true },
            { text: "Mac,", color: COLORS.blue },
            { text: "Windows", color: COLORS.green },
            { text: "&" },
            { text: "Linux.", color: COLORS.purple },
          ]}
        />
        <div style={{ marginTop: 22 }}>
          <PlatformBadgesRow startFrame={32} compact />
        </div>
      </div>

      {/* Single-Space Screenshot */}
      <div
        style={{
          transform: `scale(${interpolate(pop, [0, 1], [0.88, 1])})`,
          opacity: pop,
          borderRadius: 24,
          overflow: "hidden",
          border: "2.5px solid rgba(168, 85, 247, 0.55)",
          boxShadow: "0 28px 65px -15px rgba(0,0,0,0.9)",
          width: "100%",
        }}
      >
        <Img
          src={staticFile("displays-single-space.png")}
          style={{ width: "100%", display: "block" }}
        />
      </div>

      {/* Pricing & CTA Card with Custom Brand Logo */}
      <div
        style={{
          transform: `scale(${interpolate(ctaPop, [0, 1], [0.9, 1])})`,
          opacity: ctaPop,
          width: "100%",
          padding: "30px 34px",
          borderRadius: 28,
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(15, 23, 42, 0.92) 100%)",
          border: "2.5px solid rgba(56, 189, 248, 0.7)",
          boxShadow: "0 24px 60px rgba(56, 189, 248, 0.28)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginBottom: 12,
          }}
        >
          <ScreenStageLogo size={58} />
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: COLORS.text,
                letterSpacing: -0.5,
              }}
            >
              {brand.productName} v1.1
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.blue,
              }}
            >
              macOS App + Windows .exe + Linux CLI/GUI
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 46,
            fontWeight: 900,
            color: COLORS.text,
            letterSpacing: -1.4,
            marginBottom: 12,
          }}
        >
          {brand.priceIndividual} Personal · {brand.priceTeam} Team Pack (15 Seats)
        </div>
        <div
          style={{
            display: "inline-block",
            padding: "12px 28px",
            borderRadius: 14,
            background: "linear-gradient(90deg, #38bdf8, #34d399)",
            fontSize: 27,
            fontWeight: 900,
            color: "#020617",
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
        <TransitionSeries.Sequence durationInFrames={380}>
          <Scene1VerticalHook brand={brand} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 18 }, durationInFrames: 25 })}
        />

        <TransitionSeries.Sequence durationInFrames={510}>
          <Scene2RoomsAndKVM brand={brand} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 20 }, durationInFrames: 25 })}
        />

        <TransitionSeries.Sequence durationInFrames={480}>
          <Scene3CrossPlatformCTA brand={brand} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
