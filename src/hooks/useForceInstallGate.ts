import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsStandalone, useIsMobileDevice } from "@/hooks/useIsStandalone";

/**
 * Em navegador mobile (não standalone), força ir para /install.
 * Permite bypass com `?web=1` na URL (para diaristas que optam por navegador)
 * ou se a chave `jl_allow_mobile_web` estiver salva em localStorage.
 */
export function useForceInstallGate() {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = useIsStandalone();
  const isMobile = useIsMobileDevice();

  useEffect(() => {
    if (isStandalone || !isMobile) return;
    const params = new URLSearchParams(location.search);
    if (params.get("web") === "1") {
      try { localStorage.setItem("jl_allow_mobile_web", "1"); } catch {}
      return;
    }
    try {
      if (localStorage.getItem("jl_allow_mobile_web") === "1") return;
    } catch {}
    navigate("/install", { replace: true });
  }, [isStandalone, isMobile, location.search, navigate]);
}
