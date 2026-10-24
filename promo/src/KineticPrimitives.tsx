import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export interface WordToken {
  text: string;
  color?: string;
  gradient?: string;
  newlineAfter?: boolean;
}

export const KineticWords: React.FC<{
  words: WordToken[];
  fontSize: number;
  startFrame?: number;
  staggerFrames?: number;
  lineHeight?: number;
  letterSpacing?: number;
  align?: "left" | "center" | "right";
}> = ({
  words,
  fontSize,
  startFrame = 0,
  staggerFrames = 6,
  lineHeight = 1.06,
  letterSpacing = -2.2,
  align = "center",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        textAlign: align,
        lineHeight,
        fontSize,
        fontWeight: 900,
        letterSpacing,
        color: "#f8fafc",
      }}
    >
      {words.map((w, i) => {
        const p = spring({
          frame: Math.max(0, frame - startFrame - i * staggerFrames),
          fps,
          config: { damping: 13, stiffness: 155, mass: 0.72 },
        });
        const y = interpolate(p, [0, 1], [38, 0]);
        const sc = interpolate(p, [0, 1], [0.82, 1]);

        return (
          <React.Fragment key={`${w.text}-${i}`}>
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${y}px) scale(${sc})`,
                opacity: p,
                marginRight: "0.24em",
                ...(w.gradient
                  ? {
                      background: w.gradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }
                  : w.color
                  ? { color: w.color }
                  : {}),
              }}
            >
              {w.text}
            </span>
            {w.newlineAfter && <br />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const ScreenStageLogo: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <Img
    src={staticFile("screenstage-icon.svg")}
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.22),
      boxShadow: "0 12px 30px rgba(56, 189, 248, 0.35)",
      flexShrink: 0,
    }}
  />
);

export const MonitorSvg: React.FC<{ size?: number; color?: string }> = ({
  size = 34,
  color = "#38bdf8",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2.5" fill={`${color}22`} />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

export const TvSvg: React.FC<{ size?: number; color?: string }> = ({
  size = 34,
  color = "#34d399",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2.5" fill={`${color}22`} />
    <polyline points="17 2 12 5 7 2" />
    <line x1="7" y1="22" x2="17" y2="22" />
  </svg>
);

export const LaptopSvg: React.FC<{ size?: number; color?: string }> = ({
  size = 34,
  color = "#a855f7",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="12" rx="2" fill={`${color}22`} />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);

export const AppleSvg: React.FC<{ size?: number; color?: string }> = ({
  size = 26,
  color = "#38bdf8",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.64-.78 1.08-1.86.96-2.94-.93.04-2.06.62-2.72 1.4-.58.68-1.1 1.79-.96 2.84 1.04.08 2.08-.52 2.72-1.3z" />
  </svg>
);

export const WindowsSvg: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = "#34d399",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <rect x="2" y="2" width="9" height="9" rx="1.5" />
    <rect x="13" y="2" width="9" height="9" rx="1.5" />
    <rect x="2" y="13" width="9" height="9" rx="1.5" />
    <rect x="13" y="13" width="9" height="9" rx="1.5" />
  </svg>
);

export const LinuxSvg: React.FC<{ size?: number; color?: string }> = ({
  size = 26,
  color = "#c084fc",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="18" rx="3" fill={`${color}22`} />
    <polyline points="7 9 11 12 7 15" />
    <line x1="13" y1="15" x2="17" y2="15" />
  </svg>
);

export const PlatformBadgesRow: React.FC<{ startFrame?: number; compact?: boolean }> = ({
  startFrame = 20,
  compact = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const items = [
    { label: "macOS SwiftUI", color: "#38bdf8", icon: <AppleSvg size={compact ? 24 : 28} color="#38bdf8" /> },
    { label: "Windows 10/11", color: "#34d399", icon: <WindowsSvg size={compact ? 22 : 26} color="#34d399" /> },
    { label: "Linux X11 & Wayland", color: "#c084fc", icon: <LinuxSvg size={compact ? 24 : 28} color="#c084fc" /> },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: compact ? 14 : 20,
      }}
    >
      {items.map((it, idx) => {
        const pop = spring({
          frame: Math.max(0, frame - startFrame - idx * 8),
          fps,
          config: { damping: 13, stiffness: 160 },
        });
        return (
          <div
            key={it.label}
            style={{
              transform: `scale(${interpolate(pop, [0, 1], [0.78, 1])})`,
              opacity: pop,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: compact ? "10px 18px" : "12px 24px",
              borderRadius: 999,
              background: "rgba(15, 23, 42, 0.92)",
              border: `2px solid ${it.color}77`,
              boxShadow: `0 12px 28px -8px ${it.color}44`,
            }}
          >
            {it.icon}
            <span
              style={{
                fontSize: compact ? 22 : 25,
                fontWeight: 800,
                color: "#f8fafc",
                letterSpacing: -0.3,
              }}
            >
              {it.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
