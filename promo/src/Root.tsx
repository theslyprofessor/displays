import React from "react";
import { Composition } from "remotion";
import { DisplaysLaunchVideo } from "./DisplaysLaunchVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DisplaysLaunch"
      component={DisplaysLaunchVideo}
      durationInFrames={1080}
      fps={60}
      width={1920}
      height={1080}
    />
  );
};
