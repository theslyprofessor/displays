import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FONT_SANS =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif";
const FONT_MONO = "'SF Mono', 'JetBrains Mono', Menlo, monospace";

export interface CameraPose {
  /** Frame at which transition to this pose begins */
  startFrame: number;
  /** Duration of the smooth cubic-bezier camera glide */
  durationFrames: number;
  /** Target zoom factor (1.0 = full window, 2.0 = 2x zoomed into widget) */
  scale: number;
  /** Target focal offset X in canvas pixels (positive moves camera right -> shifts canvas left) */
  focusX: number;
  /** Target focal offset Y in canvas pixels */
  focusY: number;
  /** Subtle 3D perspective tilt in degrees */
  rotateX?: number;
  rotateY?: number;
}

export interface CursorAction {
  moveStartFrame: number;
  moveDurationFrames: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  clickFrame?: number;
  label?: string;
}

export interface CaptionBeat {
  startFrame: number;
  endFrame: number;
  stepTag: string;
  headline: string;
  accentColor: string;
}

/**
 * Computes a smooth, Blacksmith / Screen Studio style interpolated camera state
 * across a sequence of keyframes using exponential cubic-bezier easing.
 */
export function useFluidCamera(poses: CameraPose[]) {
  const frame = useCurrentFrame();

  let scale = poses[0]?.scale ?? 1;
  let focusX = poses[0]?.focusX ?? 0;
  let focusY = poses[0]?.focusY ?? 0;
  let rotateX = poses[0]?.rotateX ?? 0;
  let rotateY = poses[0]?.rotateY ?? 0;

  const smoothEase = Easing.bezier(0.22, 1, 0.36, 1);

  for (let i = 1; i < poses.length; i++) {
    const prev = poses[i - 1];
    const curr = poses[i];
    if (frame >= curr.startFrame) {
      const p = interpolate(
        frame,
        [curr.startFrame, curr.startFrame + curr.durationFrames],
        [0, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: smoothEase,
        }
      );
      scale = interpolate(p, [0, 1], [scale, curr.scale]);
      focusX = interpolate(p, [0, 1], [focusX, curr.focusX]);
      focusY = interpolate(p, [0, 1], [focusY, curr.focusY]);
      rotateX = interpolate(p, [0, 1], [rotateX, curr.rotateX ?? 0]);
      rotateY = interpolate(p, [0, 1], [rotateY, curr.rotateY ?? 0]);
    } else {
      break;
    }
    void prev;
  }

  return { scale, focusX, focusY, rotateX, rotateY };
}

/**
 * Animated macOS pointer with smooth bezier glide, spring click press, and ripple ring.
 */
export const FluidCursor: React.FC<{
  actions: CursorAction[];
  accentColor: string;
}> = ({ actions, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (actions.length === 0) return null;

  const glideEase = Easing.bezier(0.25, 1, 0.35, 1);

  let x = actions[0].fromX;
  let y = actions[0].fromY;
  let activeClickFrame: number | undefined = undefined;
  let activeLabel: string | undefined = undefined;

  for (const act of actions) {
    if (frame >= act.moveStartFrame) {
      const p = interpolate(
        frame,
        [act.moveStartFrame, act.moveStartFrame + act.moveDurationFrames],
        [0, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: glideEase,
        }
      );
      // Slight arc on Y for organic human mouse movement
      const arc = Math.sin(p * Math.PI) * -18;
      x = interpolate(p, [0, 1], [act.fromX, act.toX]);
      y = interpolate(p, [0, 1], [act.fromY, act.toY]) + arc;
      if (act.clickFrame !== undefined && frame >= act.clickFrame - 4 && frame <= act.clickFrame + 40) {
        activeClickFrame = act.clickFrame;
      }
      if (act.label && frame >= act.moveStartFrame + act.moveDurationFrames * 0.5 && frame <= (act.clickFrame ?? act.moveStartFrame + 90) + 55) {
        activeLabel = act.label;
      }
    }
  }

  const isClicking =
    activeClickFrame !== undefined &&
    frame >= activeClickFrame &&
    frame <= activeClickFrame + 14;

  const clickScale = isClicking ? 0.84 : 1.0;

  const rippleProgress =
    activeClickFrame !== undefined && frame >= activeClickFrame
      ? interpolate(frame - activeClickFrame, [0, 28], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        })
      : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        pointerEvents: "none",
        zIndex: 90,
        transform: `translate(-4px, -4px) scale(${clickScale})`,
        transformOrigin: "4px 4px",
      }}
    >
      {/* Click Ripple Ring */}
      {rippleProgress > 0 && rippleProgress < 1 && (
        <div
          style={{
            position: "absolute",
            left: -26,
            top: -26,
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: `3px solid ${accentColor}`,
            background: `${accentColor}22`,
            transform: `scale(${interpolate(rippleProgress, [0, 1], [0.25, 1.9])})`,
            opacity: interpolate(rippleProgress, [0, 0.7, 1], [0.95, 0.45, 0]),
          }}
        />
      )}

      {/* Sleek macOS Vector Cursor */}
      <svg
        width="34"
        height="34"
        viewBox="0 0 28 28"
        style={{
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.65))",
        }}
      >
        <path
          d="M4 2L4 22L9.5 16.8L13.8 25L17.2 23.3L12.9 15.2L20.5 15.2L4 2Z"
          fill="#0f172a"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </svg>

      {/* Optional Floating Action Pill next to Cursor (flips left when near right window edge) */}
      {activeLabel && (
        <div
          style={{
            position: "absolute",
            ...(x > 900 ? { right: 16 } : { left: 28 }),
            top: 18,
            whiteSpace: "nowrap",
            padding: "5px 12px",
            borderRadius: 999,
            background: "rgba(15, 23, 42, 0.94)",
            border: `1.5px solid ${accentColor}`,
            boxShadow: `0 10px 24px -6px ${accentColor}66`,
            fontFamily: FONT_MONO,
            fontSize: 12,
            fontWeight: 700,
            color: "#f8fafc",
          }}
        >
          {activeLabel}
        </div>
      )}
    </div>
  );
};

/**
 * Single minimal glass caption pill at the bottom of the screen.
 * Keeps text short (1 line) so the viewer focuses on the zoomed animation.
 */
export const FluidCaptionOverlay: React.FC<{
  beats: CaptionBeat[];
  vertical?: boolean;
}> = ({ beats, vertical = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const active = beats.find((b) => frame >= b.startFrame && frame <= b.endFrame);
  if (!active) return null;

  const enter = spring({
    frame: Math.max(0, frame - active.startFrame),
    fps,
    config: { damping: 20, stiffness: 140 },
  });
  const exit = interpolate(
    frame,
    [active.endFrame - 16, active.endFrame],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = Math.min(enter, exit);
  const y = interpolate(enter, [0, 1], [22, 0]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: vertical ? 110 : 44,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        padding: vertical ? "0 44px" : "0 80px",
        pointerEvents: "none",
        zIndex: 100,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          flexDirection: vertical ? "column" : "row",
          alignItems: "center",
          gap: vertical ? 8 : 16,
          padding: vertical ? "18px 28px" : "14px 28px",
          borderRadius: 999,
          background: "rgba(9, 13, 24, 0.95)",
          border: `1.5px solid ${active.accentColor}66`,
          boxShadow: `0 20px 40px -12px rgba(0, 0, 0, 0.85)`,
        }}
      >
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: vertical ? 16 : 14,
            fontWeight: 800,
            letterSpacing: 1.2,
            padding: "5px 12px",
            borderRadius: 999,
            background: `${active.accentColor}24`,
            color: active.accentColor,
            border: `1px solid ${active.accentColor}66`,
          }}
        >
          {active.stepTag}
        </span>
        <span
          style={{
            fontFamily: FONT_SANS,
            fontSize: vertical ? 26 : 22,
            fontWeight: 700,
            color: "#f8fafc",
            letterSpacing: -0.3,
            textAlign: "center",
          }}
        >
          {active.headline}
        </span>
      </div>
    </div>
  );
};

/**
 * Blacksmith-style 3D Camera Stage that hosts a 1280x760 interactive macOS window
 * and smoothly zooms/pans into specific controls according to `poses`.
 */
export const FluidStage: React.FC<{
  poses: CameraPose[];
  actions: CursorAction[];
  captions: CaptionBeat[];
  accentColor: string;
  secondaryColor?: string;
  productName: string;
  productTagline: string;
  websiteUrl: string;
  vertical?: boolean;
  children: React.ReactNode;
}> = ({
  poses,
  actions,
  captions,
  accentColor,
  secondaryColor = "#38bdf8",
  productName,
  productTagline,
  websiteUrl,
  vertical = false,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cam = useFluidCamera(poses);

  // Subtle ambient background glow drift
  const glowDriftX = Math.sin(frame / 45) * 60;
  const glowDriftY = Math.cos(frame / 55) * 40;

  // End-card outro overlay in the final 165 frames (2.75 seconds)
  const outroStart = durationInFrames - 165;
  const outroOpacity = interpolate(frame, [outroStart, outroStart + 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const baseScale = vertical ? 0.78 : 1.0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#04070f",
        fontFamily: FONT_SANS,
        color: "#f8fafc",
        overflow: "hidden",
      }}
    >
      <Audio src={staticFile("soundtrack.mp3")} volume={0.8} />

      {/* Sleek Dark Studio Gradient + Subtle Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 35%, #0f172a 0%, #060a14 58%, #020409 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}24 0%, ${accentColor}0c 38%, transparent 70%)`,
          left: `calc(50% - 450px + ${glowDriftX}px)`,
          top: `calc(42% - 450px + ${glowDriftY}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.045) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Top Subtle Product Pill (fades out on 16:9 close-up zooms so it never overlaps window headers) */}
      <div
        style={{
          position: "absolute",
          top: vertical ? 74 : 28,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 80,
          pointerEvents: "none",
          opacity: vertical
            ? 1
            : interpolate(cam.scale, [1.15, 1.32], [1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 20px",
            borderRadius: 999,
            background: "rgba(15, 23, 42, 0.82)",
            border: `1px solid ${accentColor}55`,
            fontSize: vertical ? 18 : 15,
            fontWeight: 700,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: accentColor,
              boxShadow: `0 0 10px ${accentColor}`,
            }}
          />
          <span style={{ color: "#ffffff", fontWeight: 800 }}>{productName}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ color: "#94a3b8" }}>{productTagline}</span>
        </div>
      </div>

      {/* 3D Perspective Camera Rig */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: "1600px",
        }}
      >
        <div
          style={{
            width: 1280,
            height: 760,
            position: "relative",
            transformStyle: "preserve-3d",
            transform: `
              scale(${cam.scale * baseScale})
              rotateX(${cam.rotateX}deg)
              rotateY(${cam.rotateY}deg)
              translate3d(${-cam.focusX}px, ${-cam.focusY}px, 0px)
            `,
            transformOrigin: "center center",
            willChange: "transform",
          }}
        >
          {children}
          <FluidCursor actions={actions} accentColor={accentColor} />
        </div>
      </div>

      {/* Single-Line Explanatory Caption Pill */}
      <FluidCaptionOverlay beats={captions} vertical={vertical} />

      {/* Clean Final End Card (Last 2.75s) */}
      {outroOpacity > 0.01 && (
        <AbsoluteFill
          style={{
            backgroundColor: `rgba(4, 7, 15, ${outroOpacity * 0.96})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 120,
            opacity: outroOpacity,
            padding: 60,
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
              background: `${accentColor}20`,
              border: `1.5px solid ${accentColor}`,
              color: accentColor,
              fontFamily: FONT_MONO,
              fontSize: vertical ? 18 : 16,
              fontWeight: 800,
              marginBottom: 22,
            }}
          >
            NATIVE MACOS STUDIO TOOL · FREE FOREVER DOWNLOAD
          </div>
          <div
            style={{
              fontSize: vertical ? 68 : 76,
              fontWeight: 900,
              letterSpacing: -2.2,
              lineHeight: 1.05,
              marginBottom: 16,
            }}
          >
            {productName}
          </div>
          <div
            style={{
              fontSize: vertical ? 30 : 32,
              fontWeight: 600,
              color: "#cbd5e1",
              maxWidth: 820,
              marginBottom: 34,
            }}
          >
            {productTagline}
          </div>
          <div
            style={{
              padding: "18px 38px",
              borderRadius: 999,
              background: `linear-gradient(90deg, ${accentColor}, ${secondaryColor})`,
              color: "#020617",
              fontFamily: FONT_MONO,
              fontSize: vertical ? 24 : 26,
              fontWeight: 900,
              boxShadow: `0 24px 60px -12px ${accentColor}88`,
            }}
          >
            {websiteUrl}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
