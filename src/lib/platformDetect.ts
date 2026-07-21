/**
 * Platform + browser detection for the /install PWA flow.
 * Runs only in the browser; safe to call from useEffect.
 */

export type OS = "ios" | "ipados" | "android" | "windows" | "macos" | "linux" | "other";
export type Browser =
  | "safari"
  | "chrome"
  | "edge"
  | "firefox"
  | "samsung"
  | "opera"
  | "brave"
  | "other";

export interface PlatformInfo {
  os: OS;
  browser: Browser;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isStandalone: boolean;
  /** true when beforeinstallprompt is expected to fire (Android Chrome-family, Desktop Chrome-family). */
  supportsBeforeInstallPrompt: boolean;
  /** iOS restricts PWA install to Safari; other browsers show the wrong menu. */
  requiresSafariOnIOS: boolean;
  /** Firefox desktop does not support PWA installability. */
  installUnsupportedDesktop: boolean;
  label: string;
  browserLabel: string;
}

export function getResponsiveViewportWidth(): number {
  if (typeof window === "undefined") return 1024;

  const candidates: number[] = [];
  const push = (value?: number | null) => {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      candidates.push(value);
    }
  };

  push(window.innerWidth);
  push(window.visualViewport?.width);
  push(document.documentElement?.clientWidth);
  push(document.body?.clientWidth);
  push(document.getElementById("root")?.getBoundingClientRect().width);

  try {
    const frame = window.frameElement as HTMLElement | null;
    push(frame?.getBoundingClientRect().width);
  } catch {
    /* cross-origin preview frame */
  }

  return candidates.length ? Math.min(...candidates) : window.innerWidth;
}

export function detectPlatform(): PlatformInfo {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const uaLower = ua.toLowerCase();
  const platform =
    typeof navigator !== "undefined" ? (navigator.platform || "").toLowerCase() : "";
  const maxTouch =
    typeof navigator !== "undefined" ? navigator.maxTouchPoints || 0 : 0;

  // ===== OS =====
  let os: OS = "other";
  if (/iphone|ipod/.test(uaLower)) os = "ios";
  else if (/ipad/.test(uaLower) || (platform === "macintel" && maxTouch > 1)) os = "ipados";
  else if (/android/.test(uaLower)) os = "android";
  else if (/win/.test(platform) || /windows/.test(uaLower)) os = "windows";
  else if (/mac/.test(platform) || /macintosh/.test(uaLower)) os = "macos";
  else if (/linux/.test(platform)) os = "linux";

  // ===== Browser (order matters) =====
  let browser: Browser = "other";
  const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { brave?: unknown }) : null;
  if (nav && typeof nav.brave === "object" && nav.brave !== null) browser = "brave";
  else if (/edg\//i.test(ua)) browser = "edge";
  else if (/samsungbrowser/i.test(ua)) browser = "samsung";
  else if (/opr\/|opera/i.test(ua)) browser = "opera";
  else if (/firefox|fxios/i.test(ua)) browser = "firefox";
  else if (/chrome|crios/i.test(ua)) browser = "chrome";
  else if (/safari/i.test(ua)) browser = "safari";

  const isIOSFamily = os === "ios" || os === "ipados";
  const isMobile = os === "ios" || os === "android";
  const isTablet = os === "ipados" || (os === "android" && !/mobile/i.test(uaLower));
  const isDesktop = os === "windows" || os === "macos" || os === "linux";

  const isStandalone = detectStandalone();

  // iOS: every browser uses WebKit; PWA install (Add to Home Screen) is only
  // exposed in Safari's share sheet. Chrome/Firefox/Edge on iOS cannot install.
  const requiresSafariOnIOS = isIOSFamily && browser !== "safari";

  // beforeinstallprompt is Chromium-only.
  const chromiumFamily: Browser[] = ["chrome", "edge", "brave", "opera", "samsung"];
  const supportsBeforeInstallPrompt =
    !isIOSFamily && chromiumFamily.includes(browser);

  const installUnsupportedDesktop = isDesktop && browser === "firefox";

  return {
    os,
    browser,
    isMobile,
    isTablet,
    isDesktop,
    isStandalone,
    supportsBeforeInstallPrompt,
    requiresSafariOnIOS,
    installUnsupportedDesktop,
    label: labelForOS(os, isTablet),
    browserLabel: labelForBrowser(browser),
  };
}

export function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    if ((window.navigator as Navigator & { standalone?: boolean }).standalone === true) return true;
  } catch {
    /* noop */
  }
  return false;
}

function labelForOS(os: OS, isTablet: boolean): string {
  switch (os) {
    case "ios":
      return "iPhone";
    case "ipados":
      return "iPad";
    case "android":
      return isTablet ? "Tablet Android" : "Android";
    case "windows":
      return "Windows";
    case "macos":
      return "Mac";
    case "linux":
      return "Linux";
    default:
      return "seu dispositivo";
  }
}

function labelForBrowser(b: Browser): string {
  switch (b) {
    case "safari":
      return "Safari";
    case "chrome":
      return "Chrome";
    case "edge":
      return "Edge";
    case "firefox":
      return "Firefox";
    case "samsung":
      return "Samsung Internet";
    case "opera":
      return "Opera";
    case "brave":
      return "Brave";
    default:
      return "navegador";
  }
}
