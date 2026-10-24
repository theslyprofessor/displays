import React from "react";
import { Composition } from "remotion";
import { DisplaysLaunchVideo } from "./DisplaysLaunchVideo";
import { DisplaysVerticalReel } from "./DisplaysVerticalReel";
import { DEFAULT_BRAND } from "./brandConfig";
import {
  ProductLaunch16x9,
  ProductVerticalReel9x16,
  QUIETPLEASE_SPEC,
  TRACKCASCADE_SPEC,
} from "./ProductPromoVideos";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DisplaysLaunch"
        component={DisplaysLaunchVideo}
        durationInFrames={1620}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="DisplaysVerticalReel"
        component={DisplaysVerticalReel}
        durationInFrames={1320}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{ brand: DEFAULT_BRAND }}
      />
      <Composition
        id="QuietPleaseLaunch"
        component={ProductLaunch16x9}
        durationInFrames={1620}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{ spec: QUIETPLEASE_SPEC }}
      />
      <Composition
        id="QuietPleaseVerticalReel"
        component={ProductVerticalReel9x16}
        durationInFrames={1320}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{ spec: QUIETPLEASE_SPEC }}
      />
      <Composition
        id="TrackCascadeLaunch"
        component={ProductLaunch16x9}
        durationInFrames={1620}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{ spec: TRACKCASCADE_SPEC }}
      />
      <Composition
        id="TrackCascadeVerticalReel"
        component={ProductVerticalReel9x16}
        durationInFrames={1320}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{ spec: TRACKCASCADE_SPEC }}
      />
    </>
  );
};
