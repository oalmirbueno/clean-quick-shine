import { useEffect } from "react";

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

// Diferença mínima (px) entre innerHeight e visualViewport para considerar
// que o teclado virtual está aberto (evita falsos positivos de barras do SO).
const KEYBOARD_DELTA_THRESHOLD = 120;

export function useViewportHeight() {
  useEffect(() => {
    const setViewportHeight = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as NavigatorWithStandalone).standalone === true;

      document.documentElement.classList.toggle("app-standalone", isStandalone);

      const activeEl = document.activeElement;
      const isInputFocused =
        !!activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true");

      const visualViewport = window.visualViewport;
      const keyboardOpen =
        !!visualViewport &&
        isInputFocused &&
        window.innerHeight - visualViewport.height > KEYBOARD_DELTA_THRESHOLD;

      if (keyboardOpen && visualViewport) {
        // Teclado aberto: encolhe o app para a área visível, mantendo
        // botões/rodapés acima do teclado.
        document.documentElement.style.setProperty(
          "--app-height",
          `${Math.round(visualViewport.height)}px`
        );
      } else {
        // iOS 26 (PWA standalone) reporta window.innerHeight errado no cold
        // start — descontava uma barra inferior inexistente e deixava um vão
        // gigante no rodapé. Sem teclado aberto, quem manda é o 100dvh do CSS,
        // que o WebKit calcula corretamente.
        document.documentElement.style.removeProperty("--app-height");
      }
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
    document.addEventListener("focusin", setViewportHeightDeferred);
    document.addEventListener("focusout", setViewportHeightDeferred);

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setViewportHeightDeferred);
    }

    return () => {
      window.removeEventListener("resize", setViewportHeightDeferred);
      window.removeEventListener("orientationchange", setViewportHeightDeferred);
      window.removeEventListener("pageshow", setViewportHeightDeferred);
      document.removeEventListener("visibilitychange", setViewportHeightDeferred);
      document.removeEventListener("focusin", setViewportHeightDeferred);
      document.removeEventListener("focusout", setViewportHeightDeferred);

      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", setViewportHeightDeferred);
      }

      document.documentElement.classList.remove("app-standalone");
      document.documentElement.style.removeProperty("--app-height");
    };
  }, []);
}
