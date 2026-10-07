import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SystemBars, SystemBarsStyle } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { SplashScreen } from "@capacitor/splash-screen";
import { useAuth } from "@/contexts/AuthContext";
import { getPublicOrigin, isNativeApp } from "@/lib/platform";
import { registerNativePush } from "@/lib/pushNative";

/** Telas em que o "voltar" do Android minimiza o app em vez de navegar. */
const RAIZES = new Set(["/", "/login", "/install", "/client/home", "/pro/home", "/admin/dashboard"]);

const ehDoSite = (host: string) => host === "jalimpo.com" || host.endsWith(".jalimpo.com");

/**
 * Integração com a casca nativa (Capacitor). Não renderiza nada e não faz
 * nada na web: botão voltar do Android, links universais, cor das barras do
 * sistema, links externos no navegador interno e registro do push.
 */
export function NativeBridge() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // splash some quando o React já pintou a primeira tela
  useEffect(() => {
    if (!isNativeApp()) return;
    const t = setTimeout(() => SplashScreen.hide({ fadeOutDuration: 250 }).catch(() => {}), 120);
    return () => clearTimeout(t);
  }, []);

  // voltar do Android + links universais (https://jalimpo.com/...)
  useEffect(() => {
    if (!isNativeApp()) return;
    const subs = [
      App.addListener("backButton", ({ canGoBack }) => {
        if (RAIZES.has(window.location.pathname) || !canGoBack) {
          App.minimizeApp();
        } else {
          window.history.back();
        }
      }),
      App.addListener("appUrlOpen", ({ url }) => {
        try {
          const u = new URL(url);
          if (ehDoSite(u.hostname)) navigate(`${u.pathname}${u.search}${u.hash}` || "/");
        } catch {
          /* noop */
        }
      }),
    ];
    return () => {
      subs.forEach((p) => p.then((h) => h.remove()));
    };
  }, [navigate]);

  // links externos e páginas do site abertos no navegador interno
  useEffect(() => {
    if (!isNativeApp()) return;
    const original = window.open.bind(window);
    window.open = ((url?: string | URL, target?: string, features?: string) => {
      const href = String(url ?? "");
      if (/^https?:\/\//i.test(href)) {
        Browser.open({ url: href, presentationStyle: "popover" });
        return null;
      }
      if (href.startsWith("/")) {
        Browser.open({ url: `${getPublicOrigin()}${href}`, presentationStyle: "popover" });
        return null;
      }
      return original(url, target, features);
    }) as typeof window.open;

    const onClick = (ev: MouseEvent) => {
      const a = (ev.target as HTMLElement | null)?.closest?.("a") as HTMLAnchorElement | null;
      if (!a) return;
      const raw = a.getAttribute("href") || "";
      if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return;
      const externo = /^https?:\/\//i.test(raw) && !raw.startsWith(window.location.origin);
      if (externo || a.target === "_blank") {
        ev.preventDefault();
        window.open(raw, "_blank");
      }
    };
    document.addEventListener("click", onClick, true);
    return () => {
      window.open = original;
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  // barras do sistema acompanham o tema claro/escuro do app
  useEffect(() => {
    if (!isNativeApp()) return;
    const aplicar = () => {
      const escuro = document.documentElement.classList.contains("dark");
      SystemBars.setStyle({ style: escuro ? SystemBarsStyle.Dark : SystemBarsStyle.Light }).catch(() => {});
    };
    aplicar();
    const obs = new MutationObserver(aplicar);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // push nativo para quem está logado
  useEffect(() => {
    if (!isNativeApp() || !user?.id) return;
    registerNativePush(user.id, (path) => navigate(path));
  }, [user?.id, navigate]);

  return null;
}
