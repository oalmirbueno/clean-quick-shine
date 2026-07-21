import { Composition } from "remotion";
import { IosVideo, AndroidVideo, IOS_DURATION, AND_DURATION } from "./MainVideo";

export const RemotionRoot = () => (
  <>
    <Composition
      id="ios"
      component={IosVideo}
      durationInFrames={IOS_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="android"
      component={AndroidVideo}
      durationInFrames={AND_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
