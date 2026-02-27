import { useEffect } from "react";

export function useViewportHeight() {
  useEffect(() => {
    const setViewportHeight = () => {
      const visualViewportHeight = window.visualViewport?.height;
      const windowHeight = window.innerHeight;

      const activeEl = document.activeElement;
      const isInputFocused =
        !!activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true");

      // Keep a stable app height during browser chrome/UI movements.
      // Only use visualViewport when keyboard/input is actually active.
      const viewportHeight =
        isInputFocused && visualViewportHeight
          ? visualViewportHeight
          : windowHeight;

      document.documentElement.style.setProperty(
        "--app-height",
        `${Math.round(viewportHeight)}px`
      );
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
    };
  }, []);
}
