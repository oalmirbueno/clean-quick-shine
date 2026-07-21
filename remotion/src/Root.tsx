import { Composition } from "remotion";
import { IosChromeVideo, IOS_CHROME_DURATION } from "./IosChromeVideo";

export const RemotionRoot = () => (
  <>
    <Composition
      id="ios-chrome"
      component={IosChromeVideo}
      durationInFrames={IOS_CHROME_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
