import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Monitor,
  Tablet,
  Download,
  Share,
  Plus,
  MoreVertical,
  Check,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  Copy,
  Menu,
  LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import {
  detectPlatform,
  detectStandalone,
  type Browser,
  type OS,
  type PlatformInfo,
} from "@/lib/platformDetect";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type StepIcon = typeof Share;
interface Step {
  icon: StepIcon;
  text: string;
}

/**
 * PWA install page.
 * Auto-detects OS + browser and shows the correct install path.
 * Users can still switch tabs manually if we misdetected.
 */
export default function Install() {
  const navigate = useNavigate();

  const [platform, setPlatform] = useState<PlatformInfo | null>(null);
  const [os, setOs] = useState<OS>("other");
  const [browser, setBrowser] = useState<Browser>("other");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Initial detect + subscribe to install/uninstall events.
  useEffect(() => {
    const p = detectPlatform();
    setPlatform(p);
    setOs(p.os === "other" ? "windows" : p.os);
    setBrowser(p.browser === "other" ? "chrome" : p.browser);
    setIsInstalled(p.isStandalone);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    const mq = window.matchMedia("(display-mode: standalone)");
    const handleDisplayChange = () => setIsInstalled(detectStandalone());

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    mq.addEventListener?.("change", handleDisplayChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
      mq.removeEventListener?.("change", handleDisplayChange);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      toast.success("Link copiado", { description: window.location.host });
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const guide = useMemo(() => buildGuide(os, browser), [os, browser]);

  // ====== Installed screen ======
  if (isInstalled) {
    return (
      <div className="h-full bg-background flex flex-col items-center justify-center px-6 safe-top safe-bottom">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 16 }}
          className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6"
        >
          <Check className="w-10 h-10 text-primary" strokeWidth={2.2} />
        </motion.div>
        <h1 className="text-2xl font-semibold text-foreground mb-2 text-center tracking-tight">
          Tudo pronto
        </h1>
        <p className="text-muted-foreground text-center mb-8 text-sm max-w-xs leading-relaxed">
          Abra o Já Limpo pelo ícone na sua tela inicial e faça login para começar.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm shadow-primary/20 active:scale-95 transition-transform inline-flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Entrar
        </button>
      </div>
    );
  }

  const osTabs = osTabOptions(platform);

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      {/* Header */}
      <header className="shrink-0 px-5 pt-3 pb-2 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-card border border-border/60 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <Logo size="sm" />
        <div className="w-10 h-10" />
      </header>

      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-md mx-auto px-5 pb-8 space-y-6">
          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-center pt-4 space-y-3"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold tracking-wide uppercase">
              <Sparkles className="w-3 h-3" />
              Instale em segundos
            </div>
            <h1 className="text-[26px] font-semibold text-foreground leading-tight tracking-tight">
              Já Limpo na sua<br />tela inicial
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
              {platform
                ? `Detectamos ${platform.label} · ${platform.browserLabel}. Ajuste se preferir.`
                : "Rápido, direto e sempre à mão. Sem baixar da loja."}
            </p>
          </motion.section>

          {/* Quick install (Chromium: Android & Desktop) */}
          {deferredPrompt && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleInstall}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm
                flex items-center justify-center gap-2 shadow-sm shadow-primary/25 active:scale-[0.98] transition-transform"
            >
              <Download className="w-4 h-4" />
              Instalar agora
            </motion.button>
          )}

          {/* OS tabs */}
          <section>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-muted/40 rounded-2xl">
              {osTabs.map((tab) => {
                const active = os === tab.value;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setOs(tab.value);
                      setBrowser(defaultBrowserFor(tab.value));
                    }}
                    className={`relative flex items-center justify-center gap-1 py-2.5 rounded-xl text-[11px] font-semibold transition-colors ${
                      active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Browser chips */}
          <section>
            <div className="flex flex-wrap gap-2">
              {browserOptionsFor(os).map((b) => {
                const active = browser === b.value;
                return (
                  <button
                    key={b.value}
                    onClick={() => setBrowser(b.value)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors border ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border/60 hover:bg-muted"
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Warning: wrong browser / unsupported */}
          {guide.warning && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-warning/10 border border-warning/30 p-3.5 flex items-start gap-3"
            >
              <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              <div className="flex-1 space-y-2">
                <p className="text-xs text-foreground leading-relaxed">{guide.warning}</p>
                <button
                  onClick={copyUrl}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-border/60 text-[11px] font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  Copiar link do app
                </button>
              </div>
            </motion.div>
          )}

          {/* Steps */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <guide.headerIcon className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">{guide.title}</h2>
            </div>

            <AnimatePresence mode="wait">
              <motion.ol
                key={`${os}-${browser}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                {guide.steps.map((step, i) => {
                  const StepIconEl = step.icon;
                  return (
                    <li
                      key={i}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/60 shadow-sm"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold text-sm">
                        {i + 1}
                      </div>
                      <StepIconEl className="w-4 h-4 text-muted-foreground shrink-0" />
                      <p className="text-sm text-foreground leading-snug flex-1">{step.text}</p>
                    </li>
                  );
                })}
              </motion.ol>
            </AnimatePresence>
          </section>

          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 rounded-2xl bg-card border border-border/60 text-foreground text-sm font-medium hover:bg-muted transition-colors inline-flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Já tenho conta · Entrar
            </button>
            <p className="text-center text-[11px] text-muted-foreground pb-[env(safe-area-inset-bottom,0px)]">
              Atualizações são automáticas ao abrir o app.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================
// Config
// ============================================================

interface Guide {
  title: string;
  headerIcon: typeof Smartphone;
  steps: Step[];
  warning?: string;
}

function osTabOptions(p: PlatformInfo | null) {
  const list: { value: OS; label: string; icon: typeof Smartphone }[] = [
    { value: "ios", label: "iPhone", icon: Smartphone },
    { value: "android", label: "Android", icon: Smartphone },
    { value: "ipados", label: "iPad", icon: Tablet },
    { value: p?.os === "macos" ? "macos" : "windows", label: p?.os === "macos" ? "Mac" : "Desktop", icon: Monitor },
  ];
  return list;
}

function defaultBrowserFor(os: OS): Browser {
  if (os === "ios" || os === "ipados" || os === "macos") return "safari";
  if (os === "android") return "chrome";
  return "chrome";
}

function browserOptionsFor(os: OS): { value: Browser; label: string }[] {
  if (os === "ios" || os === "ipados") {
    return [
      { value: "safari", label: "Safari" },
      { value: "chrome", label: "Chrome" },
      { value: "firefox", label: "Firefox" },
      { value: "edge", label: "Edge" },
    ];
  }
  if (os === "android") {
    return [
      { value: "chrome", label: "Chrome" },
      { value: "samsung", label: "Samsung" },
      { value: "edge", label: "Edge" },
      { value: "firefox", label: "Firefox" },
      { value: "opera", label: "Opera" },
    ];
  }
  // Desktop (windows/macos/linux)
  const list: { value: Browser; label: string }[] = [
    { value: "chrome", label: "Chrome" },
    { value: "edge", label: "Edge" },
    { value: "brave", label: "Brave" },
    { value: "opera", label: "Opera" },
    { value: "firefox", label: "Firefox" },
  ];
  if (os === "macos") list.unshift({ value: "safari", label: "Safari" });
  return list;
}

function buildGuide(os: OS, browser: Browser): Guide {
  const iosFamily = os === "ios" || os === "ipados";
  const deviceName = os === "ipados" ? "iPad" : os === "ios" ? "iPhone" : os === "android" ? "Android" : os === "macos" ? "Mac" : "computador";

  // ===== iOS / iPadOS =====
  if (iosFamily) {
    if (browser !== "safari") {
      return {
        title: `Instalar no ${deviceName}`,
        headerIcon: Smartphone,
        warning:
          "No iOS, a instalação só funciona pelo Safari. Copie o link e cole no Safari para instalar.",
        steps: [
          { icon: Copy, text: "Copie o link do app (botão acima)" },
          { icon: Share, text: "Abra o Safari e cole o link na barra de endereço" },
          { icon: Share, text: "Toque no botão Compartilhar (quadrado com seta)" },
          { icon: Plus, text: 'Escolha "Adicionar à Tela de Início"' },
          { icon: Check, text: 'Confirme em "Adicionar"' },
        ],
      };
    }
    return {
      title: `Instalar no ${deviceName} (Safari)`,
      headerIcon: Smartphone,
      steps: [
        { icon: Share, text: "Toque no botão Compartilhar (quadrado com seta) na barra do Safari" },
        { icon: Plus, text: 'Role e toque em "Adicionar à Tela de Início"' },
        { icon: Check, text: 'Toque em "Adicionar" no canto superior direito' },
        { icon: Smartphone, text: "Abra o Já Limpo pelo ícone na tela inicial" },
      ],
    };
  }

  // ===== Android =====
  if (os === "android") {
    if (browser === "firefox") {
      return {
        title: "Instalar no Android (Firefox)",
        headerIcon: Smartphone,
        steps: [
          { icon: MoreVertical, text: "Toque no menu (⋮) do Firefox" },
          { icon: Plus, text: 'Escolha "Instalar" ou "Adicionar à tela inicial"' },
          { icon: Check, text: "Confirme para adicionar" },
        ],
      };
    }
    if (browser === "samsung") {
      return {
        title: "Instalar no Samsung Internet",
        headerIcon: Smartphone,
        steps: [
          { icon: Menu, text: "Toque no menu (☰) na parte inferior" },
          { icon: Plus, text: 'Escolha "Adicionar página a" → "Tela inicial"' },
          { icon: Check, text: "Confirme para instalar" },
        ],
      };
    }
    // Chrome / Edge / Brave / Opera
    return {
      title: `Instalar no Android (${labelFor(browser)})`,
      headerIcon: Smartphone,
      steps: [
        { icon: Download, text: 'Se aparecer o botão "Instalar agora" acima, toque nele' },
        { icon: MoreVertical, text: "Ou abra o menu (⋮) do navegador" },
        { icon: Plus, text: 'Escolha "Instalar app" ou "Adicionar à tela inicial"' },
        { icon: Check, text: 'Confirme em "Instalar"' },
      ],
    };
  }

  // ===== Desktop =====
  if (browser === "firefox") {
    return {
      title: "Firefox no desktop",
      headerIcon: Monitor,
      warning:
        "O Firefox no desktop ainda não instala aplicativos web. Use Chrome, Edge, Brave ou Opera para instalar o Já Limpo.",
      steps: [
        { icon: Copy, text: "Copie o link do app (botão acima)" },
        { icon: Monitor, text: "Abra o Chrome, Edge, Brave ou Opera" },
        { icon: Download, text: 'Clique no ícone de instalar na barra de endereço' },
        { icon: Check, text: 'Confirme em "Instalar"' },
      ],
    };
  }
  if (os === "macos" && browser === "safari") {
    return {
      title: "Instalar no Mac (Safari 17+)",
      headerIcon: Monitor,
      steps: [
        { icon: Share, text: "Clique no menu Arquivo do Safari" },
        { icon: Plus, text: 'Escolha "Adicionar ao Dock"' },
        { icon: Check, text: 'Confirme em "Adicionar"' },
        { icon: Monitor, text: "Abra o Já Limpo pelo Dock" },
      ],
    };
  }
  // Chrome / Edge / Brave / Opera desktop
  return {
    title: `Instalar no desktop (${labelFor(browser)})`,
    headerIcon: Monitor,
    steps: [
      { icon: Download, text: 'Se aparecer o botão "Instalar agora" acima, clique nele' },
      { icon: Download, text: "Ou clique no ícone de instalar (📥) na barra de endereço, à direita" },
      { icon: Check, text: 'Confirme em "Instalar"' },
      { icon: Monitor, text: "O Já Limpo abre em uma janela dedicada" },
    ],
  };
}

function labelFor(b: Browser): string {
  const map: Record<Browser, string> = {
    safari: "Safari",
    chrome: "Chrome",
    edge: "Edge",
    firefox: "Firefox",
    samsung: "Samsung Internet",
    opera: "Opera",
    brave: "Brave",
    other: "navegador",
  };
  return map[b];
}
