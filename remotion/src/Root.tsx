import { Composition } from "remotion";
import { IosChromeVideo, IOS_CHROME_DURATION } from "./IosChromeVideo";
import { IosSafariVideo, IOS_SAFARI_DURATION } from "./IosSafariVideo";
import { AndroidChromeVideo, ANDROID_CHROME_DURATION } from "./AndroidChromeVideo";

export const RemotionRoot = () => (
  <>
    <Composition
      id="ios-safari"
      component={IosSafariVideo}
      durationInFrames={IOS_SAFARI_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="ios-chrome"
      component={IosChromeVideo}
      durationInFrames={IOS_CHROME_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="android-chrome"
      component={AndroidChromeVideo}
      durationInFrames={ANDROID_CHROME_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
