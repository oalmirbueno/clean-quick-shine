import { ReactNode } from "react";

/**
 * Antes mandava todo celular fora do PWA para `/install`, e isso deixava de
 * fora quem abre pelo navegador do Instagram, WhatsApp ou Facebook (lá não dá
 * para instalar): a pessoa nunca chegava ao login. Agora login e cadastro
 * funcionam em qualquer navegador; a instalação virou convite (InstallBanner).
 */
export function MobilePwaGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
