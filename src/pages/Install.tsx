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
  ChevronRight,
  RotateCcw,
  QrCode,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Logo } from "@/components/ui/Logo";
import {
  detectPlatform,
  detectStandalone,
  getResponsiveViewportWidth,
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

  const shareUrl = async () => {
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({
          title: "Já Limpo",
          text: "Instale o app Já Limpo",
          url: window.location.origin,
        });
        return;
      } catch {
        /* user cancelled */
      }
    }
    copyUrl();
  };


  const guide = useMemo(() => buildGuide(os, browser), [os, browser]);
  const tutorialSteps = useMemo(() => guide.steps.slice(0, 3), [guide]);
  // Track viewport mode so tutorial progress is stored separately for desktop vs mobile/tablet.
  const [viewportIsWide, setViewportIsWide] = useState<boolean>(() =>
    typeof window !== "undefined" ? getResponsiveViewportWidth() >= 1024 : true,
  );
  useEffect(() => {
    const onResize = () => setViewportIsWide(getResponsiveViewportWidth() >= 1024);
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    const mql = window.matchMedia("(min-width: 1024px)");
    const onMql = () => onResize();
    mql.addEventListener?.("change", onMql);
    const root = document.getElementById("root");
    const observer = root && "ResizeObserver" in window ? new ResizeObserver(onResize) : null;
    if (root && observer) observer.observe(root);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      mql.removeEventListener?.("change", onMql);
      observer?.disconnect();
    };
  }, []);
  const viewportMode = viewportIsWide ? "desktop" : "mobile";
  const storageKey = `jl_install_tutorial:${viewportMode}:${os}:${browser}:${tutorialSteps.length}`;

  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>(() => tutorialSteps.map(() => false));

  // Hydrate from localStorage when os/browser (and thus storageKey) change.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { completed?: boolean[]; activeStep?: number };
        if (Array.isArray(parsed.completed) && parsed.completed.length === tutorialSteps.length) {
          setCompleted(parsed.completed);
          const firstOpen = parsed.completed.findIndex((v) => !v);
          setActiveStep(
            typeof parsed.activeStep === "number"
              ? Math.min(Math.max(parsed.activeStep, 0), tutorialSteps.length - 1)
              : firstOpen === -1
                ? tutorialSteps.length - 1
                : firstOpen,
          );
          return;
        }
      }
    } catch {
      /* ignore */
    }
    setActiveStep(0);
    setCompleted(tutorialSteps.map(() => false));
  }, [storageKey, tutorialSteps.length]);

  // Persist on change.
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ completed, activeStep }));
    } catch {
      /* ignore */
    }
  }, [storageKey, completed, activeStep]);

  const isDesktopOs = os === "windows" || os === "macos" || os === "linux";
  const showQr = isDesktopOs && viewportIsWide;

  const markStepDone = () => {
    setCompleted((prev) => {
      const next = [...prev];
      next[activeStep] = true;
      return next;
    });
    if (activeStep < tutorialSteps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const resetTutorial = () => {
    setActiveStep(0);
    setCompleted(tutorialSteps.map(() => false));
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  };

  const progress = Math.round(
    (completed.filter(Boolean).length / Math.max(tutorialSteps.length, 1)) * 100,
  );

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
          Abra o Já Limpo pelo ícone na tela inicial. Se é seu primeiro acesso,
          crie sua conta em segundos.
        </p>
        <div className="w-full max-w-xs space-y-2">
          <button
            onClick={() => navigate("/register")}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm shadow-primary/20 active:scale-95 transition-transform inline-flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Criar conta grátis
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-2xl bg-card border border-border/60 text-foreground font-medium text-sm hover:bg-muted transition-colors inline-flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Já tenho conta · Entrar
          </button>
        </div>
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
        <div className="max-w-md mx-auto px-5 pb-8 space-y-5">
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
              Deixe o Já Limpo<br />na sua tela inicial
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
              {platform
                ? `Detectamos ${platform.label} · ${platform.browserLabel}.`
                : "Rápido, direto e sempre à mão."}
            </p>
          </motion.section>

          {/* Animated pointing hint */}
          <AnimatedInstallHint os={os} browser={browser} />

          {/* Primary actions: native install if available, else share link */}
          {deferredPrompt ? (
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
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={shareUrl}
                className="py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm shadow-primary/20 active:scale-[0.98] transition-transform inline-flex items-center justify-center gap-2"
              >
                <Share className="w-4 h-4" />
                Compartilhar
              </button>
              <button
                onClick={copyUrl}
                className="py-3 rounded-2xl bg-card border border-border/60 text-foreground font-semibold text-sm hover:bg-muted transition-colors inline-flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar link
              </button>
            </div>
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

          {/* Interactive tutorial */}
          <section className="space-y-3">
            {/* Header with browser/OS badge */}
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2 min-w-0">
                <guide.headerIcon className="w-4 h-4 text-primary shrink-0" />
                <h2 className="text-sm font-semibold text-foreground truncate">
                  {guide.title}
                </h2>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wide">
                <BrowserGlyph browser={browser} />
                {labelFor(browser)} · {osShortLabel(os)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2 px-1">
              <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", damping: 20 }}
                />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground tabular-nums">
                {completed.filter(Boolean).length}/{tutorialSteps.length}
              </span>
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
                {tutorialSteps.map((step, i) => {
                  const StepIconEl = step.icon;
                  const isDone = completed[i];
                  const isActive = i === activeStep && !isDone;
                  return (
                    <motion.li
                      key={i}
                      layout
                      animate={{
                        scale: isActive ? 1 : 0.99,
                        opacity: isDone ? 0.7 : 1,
                      }}
                      className={`relative flex items-center gap-3 p-3.5 rounded-2xl border shadow-sm transition-colors ${
                        isActive
                          ? "bg-primary/5 border-primary/40"
                          : isDone
                            ? "bg-card border-border/60"
                            : "bg-card border-border/60"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          className="absolute inset-0 rounded-2xl ring-2 ring-primary/40 pointer-events-none"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.6, repeat: Infinity }}
                        />
                      )}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-semibold text-sm ${
                          isDone
                            ? "bg-primary text-primary-foreground"
                            : isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary/10 text-primary"
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4" strokeWidth={2.5} /> : i + 1}
                      </div>
                      <StepIconEl
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <p
                        className={`text-sm leading-snug flex-1 ${
                          isDone ? "text-muted-foreground line-through" : "text-foreground"
                        }`}
                      >
                        {step.text}
                      </p>
                    </motion.li>
                  );
                })}
              </motion.ol>
            </AnimatePresence>

            {/* Tutorial controls */}
            <div className="flex items-center gap-2">
              {completed.every(Boolean) ? (
                <>
                  <div className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary/10 text-primary text-sm font-semibold">
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                    Tutorial concluído
                  </div>
                  <button
                    onClick={resetTutorial}
                    className="p-3 rounded-2xl bg-card border border-border/60 text-foreground hover:bg-muted transition-colors"
                    aria-label="Recomeçar tutorial"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={markStepDone}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm shadow-primary/20 active:scale-[0.98] transition-transform"
                  >
                    {activeStep === tutorialSteps.length - 1 ? "Concluir" : "Fiz esse passo"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {completed.some(Boolean) && (
                    <button
                      onClick={resetTutorial}
                      className="p-3 rounded-2xl bg-card border border-border/60 text-foreground hover:bg-muted transition-colors"
                      aria-label="Recomeçar tutorial"
                      title="Recomeçar tutorial"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </section>

          {/* QR code: desktop only */}
          {showQr && (
            <section className="rounded-2xl bg-card border border-border/60 p-4 flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white">
                <QRCodeSVG value={window.location.origin} size={88} level="M" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wide mb-1.5">
                  <QrCode className="w-3 h-3" />
                  Para celular
                </div>
                <p className="text-sm font-semibold text-foreground leading-snug">
                  Aponte a câmera do celular
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                  Abra o Já Limpo no seu iPhone ou Android para instalar em segundos.
                </p>
              </div>
            </section>
          )}




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
    if (browser === "chrome") {
      return {
        title: `Instalar no ${deviceName} (Chrome)`,
        headerIcon: Smartphone,
        steps: [
          { icon: Share, text: "Toque no botão Compartilhar (quadrado com seta) na barra do Chrome" },
          { icon: Plus, text: 'Escolha "Adicionar à Tela de Início"' },
          { icon: Check, text: 'Toque em "Adicionar" no canto superior direito' },
          { icon: Smartphone, text: "Abra o Já Limpo pelo ícone na tela inicial" },
        ],
      };
    }
    if (browser === "edge") {
      return {
        title: `Instalar no ${deviceName} (Edge)`,
        headerIcon: Smartphone,
        steps: [
          { icon: MoreVertical, text: "Toque no menu (…) na parte inferior do Edge" },
          { icon: Plus, text: 'Escolha "Adicionar ao telefone" ou "Adicionar à Tela de Início"' },
          { icon: Check, text: "Confirme para adicionar" },
          { icon: Smartphone, text: "Abra o Já Limpo pelo ícone na tela inicial" },
        ],
      };
    }
    if (browser === "firefox") {
      return {
        title: `Instalar no ${deviceName} (Firefox)`,
        headerIcon: Smartphone,
        steps: [
          { icon: MoreVertical, text: "Toque no menu do Firefox" },
          { icon: Share, text: 'Escolha "Compartilhar"' },
          { icon: Plus, text: '"Adicionar à Tela de Início"' },
          { icon: Check, text: "Confirme para adicionar" },
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

function osShortLabel(os: OS): string {
  const map: Record<OS, string> = {
    ios: "iOS",
    ipados: "iPadOS",
    android: "Android",
    windows: "Windows",
    macos: "macOS",
    linux: "Linux",
    other: "Web",
  };
  return map[os];
}

function BrowserGlyph({ browser }: { browser: Browser }) {
  // Small colored dot per browser for the badge; keeps bundle light without extra SVGs.
  const color: Record<Browser, string> = {
    safari: "#0FB5EE",
    chrome: "#F4B400",
    edge: "#0078D4",
    firefox: "#FF7139",
    samsung: "#1428A0",
    opera: "#FF1B2D",
    brave: "#FB542B",
    other: "hsl(var(--muted-foreground))",
  };
  return (
    <span
      aria-hidden
      className="inline-block w-1.5 h-1.5 rounded-full"
      style={{ background: color[browser] }}
    />
  );
}

// ============================================================
// Animated pointing hint
// ============================================================
function AnimatedInstallHint({ os, browser }: { os: OS; browser: Browser }) {
  const iosFamily = os === "ios" || os === "ipados";
  const isSafariIOS = iosFamily && browser === "safari";
  const isBottomBar = isSafariIOS; // Safari iOS: share is bottom
  // Chrome iOS: share is bottom-right too. Android: menu top-right. Desktop: install icon top-right (address bar).
  const chromeIOS = iosFamily && (browser === "chrome" || browser === "edge" || browser === "firefox");
  const bottom = isSafariIOS || chromeIOS;

  const label = isSafariIOS
    ? "Toque em Compartilhar"
    : chromeIOS
      ? "Toque em Compartilhar"
      : os === "android"
        ? "Abra o menu do navegador"
        : "Clique em Instalar na barra de endereço";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl bg-gradient-to-b from-primary/5 to-transparent border border-border/60 p-4"
    >
      <div className="relative mx-auto w-[220px] h-[300px] rounded-[32px] bg-card border border-border shadow-sm overflow-hidden">
        {/* Phone notch */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-foreground/80 rounded-b-2xl z-10" />
        {/* Browser chrome */}
        <div className="absolute inset-x-0 top-0 h-9 bg-muted/60 border-b border-border/40 flex items-center gap-1.5 px-3 pt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
          <div className="flex-1 h-3.5 rounded-md bg-background/70 mx-1" />
          {!bottom && (
            <div className="relative">
              <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center">
                {os === "android" ? (
                  <MoreVertical className="w-3 h-3 text-primary" />
                ) : (
                  <Download className="w-3 h-3 text-primary" />
                )}
              </div>
              <PingArrow direction="up" />
            </div>
          )}
        </div>
        {/* Page content stub */}
        <div className="absolute inset-x-3 top-12 space-y-1.5">
          <div className="h-2 rounded bg-muted/70 w-3/4" />
          <div className="h-2 rounded bg-muted/50 w-1/2" />
          <div className="mt-3 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Logo size="sm" />
          </div>
          <div className="h-2 rounded bg-muted/50 w-2/3" />
          <div className="h-2 rounded bg-muted/40 w-1/2" />
        </div>
        {/* Bottom bar (iOS) */}
        {bottom && (
          <div className="absolute inset-x-0 bottom-0 h-10 bg-muted/60 border-t border-border/40 flex items-center justify-around px-4">
            <div className="w-4 h-4 rounded bg-foreground/20" />
            <div className="relative">
              <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center">
                <Share className="w-3 h-3 text-primary" />
              </div>
              <PingArrow direction="down" />
            </div>
            <div className="w-4 h-4 rounded bg-foreground/20" />
            <div className="w-4 h-4 rounded bg-foreground/20" />
          </div>
        )}
      </div>
      <p className="text-center text-xs font-semibold text-foreground mt-3">
        {label}
      </p>
      <p className="text-center text-[11px] text-muted-foreground mt-0.5">
        Siga os passos abaixo para adicionar à tela inicial.
      </p>
    </motion.div>
  );
}

function PingArrow({ direction }: { direction: "up" | "down" }) {
  const isUp = direction === "up";
  return (
    <motion.div
      initial={{ y: 0, opacity: 0.4 }}
      animate={{ y: isUp ? [-2, -8, -2] : [2, 8, 2], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      className={
        isUp
          ? "absolute -top-4 left-1/2 -translate-x-1/2 text-primary"
          : "absolute -bottom-5 left-1/2 -translate-x-1/2 text-primary"
      }
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
        {isUp ? (
          <path d="M6 1l5 6H7v4H5V7H1z" />
        ) : (
          <path d="M6 11l5-6H7V1H5v4H1z" />
        )}
      </svg>
    </motion.div>
  );
}

