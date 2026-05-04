import { useEffect } from "react";

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

export function useViewportHeight() {
  useEffect(() => {
    const setViewportHeight = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as NavigatorWithStandalone).standalone === true;

      document.documentElement.classList.toggle("app-standalone", isStandalone);

      const visualViewportHeight = window.visualViewport?.height;
      const windowHeight = window.innerHeight;

      const activeEl = document.activeElement;
      const isInputFocused =
        !!activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true");

      const viewportHeight = visualViewportHeight && (isStandalone || isInputFocused)
        ? visualViewportHeight
        : windowHeight;

      document.documentElement.style.setProperty("--app-height", `${Math.round(viewportHeight)}px`);
    };

    const setViewportHeightDeferred = () => {
      setViewportHeight();
      requestAnimationFrame(setViewportHeight);
    };

    setViewportHeightDeferred();

    window.addEventListener("resize", setViewportHeightDeferred);
    window.addEventListener("orientationchange", setViewportHeightDeferred);
    window.addEventListener("pageshow", setViewportHeightDeferred);
    document.addEventListener("visibilitychange", setViewportHeightDeferred);

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setViewportHeightDeferred);
    }

    return () => {
      window.removeEventListener("resize", setViewportHeightDeferred);
      window.removeEventListener("orientationchange", setViewportHeightDeferred);
      window.removeEventListener("pageshow", setViewportHeightDeferred);
      document.removeEventListener("visibilitychange", setViewportHeightDeferred);

      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", setViewportHeightDeferred);
      }

      document.documentElement.classList.remove("app-standalone");
    };
  }, []);
}
