import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useIsStandalone, useIsMobileDevice } from "@/hooks/useIsStandalone";

/**
 * Bloqueia o acesso via navegador mobile a telas de auth/onboarding.
 * Em mobile sem PWA instalado o usuário é direcionado para `/install` para
 * primeiro instalar o app. Desktop e preview Lovable continuam livres.
 */
export function MobilePwaGate({ children }: { children: ReactNode }) {
  const isStandalone = useIsStandalone();
  const isMobile = useIsMobileDevice();
  const location = useLocation();

  // Já está no /install — nunca redireciona
  if (location.pathname.startsWith("/install")) return <>{children}</>;

  // Mobile + navegador (não instalado) → manda para /install
  if (isMobile && !isStandalone) {
    return <Navigate to="/install" replace />;
  }

  return <>{children}</>;
}
