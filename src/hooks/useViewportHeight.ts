import { useEffect } from "react";

export function useViewportHeight() {
  useEffect(() => {
    const setViewportHeight = () => {
      const viewportHeight = window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${viewportHeight}px`);
    };

    setViewportHeight();
    window.addEventListener("resize", setViewportHeight);
    window.addEventListener("orientationchange", setViewportHeight);

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setViewportHeight);
    }

    return () => {
      window.removeEventListener("resize", setViewportHeight);
      window.removeEventListener("orientationchange", setViewportHeight);

      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", setViewportHeight);
      }
    };
  }, []);
}
