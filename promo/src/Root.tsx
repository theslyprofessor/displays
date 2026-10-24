import React from "react";
import { Composition } from "remotion";
import { DisplaysLaunchVideo } from "./DisplaysLaunchVideo";
import { DisplaysVerticalReel } from "./DisplaysVerticalReel";
import { DEFAULT_BRAND } from "./brandConfig";

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
    </>
  );
};
