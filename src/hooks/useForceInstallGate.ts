import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsStandalone, useIsMobileDevice } from "@/hooks/useIsStandalone";

/**
 * Em navegador mobile/tablet (não standalone), força ir para /install.
 * Acesso web direto em login/cadastro só fica disponível em desktop.
 */
export function useForceInstallGate() {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = useIsStandalone();
  const isMobile = useIsMobileDevice();

  useEffect(() => {
    if (isStandalone || !isMobile) return;
    try {
      localStorage.removeItem("jl_allow_mobile_web");
      sessionStorage.setItem("jl_force_install_from", `${location.pathname}${location.search}`);
    } catch {}
    navigate("/install", { replace: true });
  }, [isStandalone, isMobile, location.pathname, location.search, navigate]);
}
