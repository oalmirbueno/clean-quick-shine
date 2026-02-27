import { useState, useEffect } from "react";
import logoFullText from "@/assets/logo-full-text.png";
import { Download, Smartphone, Share, MoreVertical, Plus } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallScreen() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));
    setIsAndroid(/android/.test(ua));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-8">
        {/* Logo */}
        <img src={logoFullText} alt="Já Limpo" className="h-32 w-auto" />

        {/* Icon */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Instale o Já Limpo</h1>
          <p className="text-muted-foreground leading-relaxed">
            Para usar o app, instale-o no seu dispositivo. É rápido e não ocupa quase nada de espaço.
          </p>
        </div>

        {/* Native install button (Android/Chrome) */}
        {deferredPrompt && (
          <button
            onClick={handleInstall}
            className="w-full py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-semibold
              shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
          >
            <Download className="w-5 h-5" />
            Instalar Já Limpo
          </button>
        )}

        {/* iOS instructions */}
        {isIOS && !deferredPrompt && (
          <div className="w-full space-y-4">
            <h2 className="font-semibold text-foreground">Como instalar no iPhone</h2>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-4 p-3 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Share className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-foreground pt-2">
                  Toque no botão <strong>Compartilhar</strong> (ícone ↑) na barra do Safari
                </p>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-foreground pt-2">
                  Selecione <strong>"Adicionar à Tela de Início"</strong>
                </p>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-foreground pt-2">
                  Abra o app pelo ícone na sua tela inicial
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Android instructions (no native prompt) */}
        {isAndroid && !deferredPrompt && (
          <div className="w-full space-y-4">
            <h2 className="font-semibold text-foreground">Como instalar no Android</h2>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-4 p-3 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MoreVertical className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-foreground pt-2">
                  Toque no menu <strong>⋮ (3 pontos)</strong> do Chrome
                </p>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-foreground pt-2">
                  Selecione <strong>"Instalar aplicativo"</strong>
                </p>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-foreground pt-2">
                  Abra o app pelo ícone na sua tela inicial
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Desktop */}
        {!isIOS && !isAndroid && !deferredPrompt && (
          <div className="w-full space-y-3">
            <h2 className="font-semibold text-foreground">Acesse pelo celular</h2>
            <p className="text-sm text-muted-foreground">
              Para a melhor experiência, abra este link no navegador do seu celular e instale o app.
            </p>
          </div>
        )}

        {/* Security badge */}
        <p className="text-xs text-muted-foreground pt-4">
          🔒 App seguro • Não ocupa espaço • Atualiza automaticamente
        </p>
      </div>
    </div>
  );
}
