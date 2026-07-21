import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Monitor,
  Download,
  Share,
  Plus,
  MoreVertical,
  Check,
  ChevronLeft,
  AlertCircle,
  Copy,
  Menu,
  LogIn,
  ChevronRight,
  RotateCcw,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Logo } from "@/components/ui/Logo";
import appPreview from "@/assets/screenshots/app-preview.png";

import { useInstalledPwa } from "@/hooks/useInstalledPwa";
import { useIsMobileDevice, useIsStandalone } from "@/hooks/useIsStandalone";
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
 * PWA install page — Midnight Premium.
 * Always renders in dark theme regardless of system/app theme.
 * Users choose the app theme after install.
 */
export default function Install() {
  const navigate = useNavigate();
  const isMobileViewport = useIsMobileDevice();
  const isStandaloneMode = useIsStandalone();
  const installedPwa = useInstalledPwa();

  const [platform, setPlatform] = useState<PlatformInfo | null>(null);
  const [os, setOs] = useState<OS>("other");
  const [browser, setBrowser] = useState<Browser>("other");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

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
    const handleVisibility = () => {
      if (document.visibilityState === "visible") handleDisplayChange();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    mq.addEventListener?.("change", handleDisplayChange);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleDisplayChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
      mq.removeEventListener?.("change", handleDisplayChange);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleDisplayChange);
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
    const shareText = "Conhece alguém que precisa de praticidade na limpeza? Compartilhe o Já Limpo.";
    if (nav.share) {
      try {
        await nav.share({
          title: "Já Limpo",
          text: shareText,
          url: window.location.origin,
        });
        return;
      } catch {
        /* user cancelled */
      }
    }
    copyUrl();
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Conhece alguém que pode aproveitar o Já Limpo? Acesse e instale o app: ${window.location.origin}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const guide = useMemo(() => buildGuide(os, browser), [os, browser]);
  const tutorialSteps = useMemo(() => guide.steps.slice(0, 3), [guide]);

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

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ completed, activeStep }));
    } catch {
      /* ignore */
    }
  }, [storageKey, completed, activeStep]);

  const isDesktopOs = os === "windows" || os === "macos" || os === "linux";
  const showQr = isDesktopOs && viewportIsWide;
  const installedReady = isStandaloneMode || isInstalled || installedPwa;
  const canOpenAuthHere = isStandaloneMode || !isMobileViewport;

  useEffect(() => {
    if (!installedReady) return;
    if (tutorialSteps.length === 0) return;
    const allDone = tutorialSteps.map(() => true);
    setCompleted(allDone);
    setActiveStep(tutorialSteps.length - 1);
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ completed: allDone, activeStep: tutorialSteps.length - 1 }),
      );
    } catch {
      /* ignore */
    }
  }, [installedReady, storageKey, tutorialSteps.length]);

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

  // Shared dark shell — this page is always dark regardless of user theme.
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="dark h-full bg-[#0B1E30] text-white flex flex-col safe-top overflow-hidden">
      {children}
    </div>
  );

  // ====== Installed screen ======
  if (installedReady) {
    return (
      <Shell>
        <div className="flex-1 overflow-y-auto">
          <div className="w-full max-w-md mx-auto px-6 py-10 flex flex-col items-center justify-center min-h-full">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 16 }}
              className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/25 flex items-center justify-center mb-6"
            >
              <Check className="w-10 h-10 text-primary" strokeWidth={2.2} />
            </motion.div>
            <h1 className="text-[26px] font-semibold mb-2 text-center tracking-tight">
              App instalado
            </h1>
            <p className="text-neutral-400 text-center mb-8 text-sm max-w-xs leading-relaxed">
              Abra o Já Limpo pelo ícone na tela inicial. Se quiser, convide alguém.
            </p>

            {canOpenAuthHere ? (
              <div className="w-full max-w-xs space-y-2 mb-6">
                <button
                  onClick={() => navigate("/register")}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform inline-flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Criar conta grátis
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-white font-medium text-sm hover:bg-neutral-800/60 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Já tenho conta
                </button>
              </div>
            ) : (
              <div className="w-full max-w-xs mb-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 p-4 text-center">
                <Smartphone className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold">Abra pelo ícone do app</p>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  No navegador o acesso fica protegido. Use o ícone do Já Limpo na tela inicial.
                </p>
              </div>
            )}

            <section className="w-full rounded-3xl bg-neutral-900/50 border border-neutral-800 p-5 space-y-3">
              <div className="text-center">
                <h2 className="text-base font-semibold">Compartilhe com quem precisa</h2>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Envie o Já Limpo para amigos, familiares ou colegas.
                </p>
              </div>

              {showQr && (
                <div className="flex items-center justify-center py-2">
                  <div className="p-3 rounded-2xl bg-white">
                    <QRCodeSVG value={window.location.origin} size={112} level="M" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={shareWhatsApp}
                  className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Compartilhar no WhatsApp
                </button>
                <button
                  onClick={shareUrl}
                  className="w-full py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-white font-medium text-sm hover:bg-neutral-900 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Share className="w-4 h-4" />
                  Compartilhar link
                </button>
              </div>
            </section>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Header */}
      <header className="shrink-0 px-5 pt-3 pb-2 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-primary/12 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/20 active:scale-95 transition"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[15px] font-semibold tracking-tight">Instalar o app</h1>
        <div className="w-10 h-10" />
      </header>

      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-md mx-auto px-5 pb-10 space-y-8">
          {/* Brand + subtitle */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="pt-3 text-center space-y-4"
          >
            <div className="flex justify-center">
              <Logo size="md" />
            </div>
            <h2 className="text-[24px] font-semibold leading-tight tracking-tight">
              Deixe o Já Limpo<br />na sua tela inicial
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-[300px] mx-auto">
              Acesso rápido, notificações e experiência dedicada. Instale como um app.
            </p>
          </motion.section>

          {/* Platform meta — two clean pills */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center justify-center gap-2"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/70 border border-neutral-800 text-[11px] font-medium text-neutral-300">
              <Smartphone className="w-3 h-3 text-neutral-500" />
              {platform?.label ?? osShortLabel(os)}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/70 border border-neutral-800 text-[11px] font-medium text-neutral-300">
              <BrowserGlyph browser={browser} />
              {labelFor(browser)}
            </span>
          </motion.div>

          {/* Simplified mockup */}
          <InstallMockup os={os} browser={browser} />

          {/* Native install button */}
          {deferredPrompt && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleInstall}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm
                flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
            >
              <Download className="w-4 h-4" />
              Instalar agora
            </motion.button>
          )}

          {/* Warning */}
          {guide.warning && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5 flex items-start gap-3"
            >
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-neutral-200 leading-relaxed">{guide.warning}</p>
            </motion.div>
          )}

          {/* Tutorial — timeline stepper */}
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                  Passo a passo
                </p>
                <h3 className="text-[15px] font-semibold mt-0.5">{guide.title}</h3>
              </div>
              <span className="text-[11px] font-semibold text-neutral-400 tabular-nums shrink-0">
                {completed.filter(Boolean).length}/{tutorialSteps.length}
              </span>
            </div>

            {/* Progress */}
            <div className="h-1 rounded-full bg-neutral-900 overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", damping: 20 }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.ol
                key={`${os}-${browser}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-0"
              >
                {tutorialSteps.map((step, i) => {
                  const isDone = completed[i];
                  const isActive = i === activeStep && !isDone;
                  const isLast = i === tutorialSteps.length - 1;
                  const num = String(i + 1).padStart(2, "0");
                  return (
                    <li key={i} className="flex gap-5">
                      {/* Rail */}
                      <div className="flex flex-col items-center">
                        <motion.div
                          animate={
                            isActive
                              ? { boxShadow: ["0 0 0 0 rgba(25,204,151,0.35)", "0 0 0 8px rgba(25,204,151,0)"] }
                              : {}
                          }
                          transition={{ duration: 1.6, repeat: Infinity }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 border transition-colors ${
                            isDone
                              ? "bg-primary text-primary-foreground border-primary"
                              : isActive
                                ? "bg-primary/15 text-primary border-primary/60"
                                : "bg-primary/8 text-primary/80 border-primary/25"
                          }`}
                        >
                          {isDone ? <Check className="w-4 h-4" strokeWidth={2.6} /> : num}
                        </motion.div>
                        {!isLast && <div className="w-px flex-1 bg-primary/25 my-1 min-h-6" />}
                      </div>

                      {/* Body */}
                      <div className={`pt-1 pb-6 flex-1 ${isDone ? "opacity-60" : ""}`}>
                        <p
                          className={`text-[14px] leading-relaxed ${
                            isDone ? "text-neutral-500 line-through" : isActive ? "text-white font-medium" : "text-neutral-300"
                          }`}
                        >
                          {step.text}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </motion.ol>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center gap-2 pt-1">
              {completed.every(Boolean) ? (
                <>
                  <div className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary/10 text-primary text-sm font-semibold border border-primary/25">
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                    Tutorial concluído
                  </div>
                  <button
                    onClick={resetTutorial}
                    className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
                    aria-label="Recomeçar tutorial"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={markStepDone}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
                  >
                    {activeStep === tutorialSteps.length - 1 ? "Concluir" : "Fiz esse passo"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {completed.some(Boolean) && (
                    <button
                      onClick={resetTutorial}
                      className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
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

          {/* QR — desktop only */}
          {showQr && (
            <section className="rounded-2xl bg-neutral-900/50 border border-neutral-800 p-4 flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white">
                <QRCodeSVG value={window.location.origin} size={88} level="M" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug">Aponte a câmera do celular</p>
                <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5">
                  Continue a instalação no seu iPhone ou Android.
                </p>
              </div>
            </section>
          )}

          {/* Share footer */}
          <button
            onClick={shareUrl}
            className="w-full py-3 rounded-2xl bg-primary/12 border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors inline-flex items-center justify-center gap-2"
          >
            <Share className="w-4 h-4" />
            Compartilhar com um amigo
          </button>

          <div className="flex flex-col gap-2">
            {!isMobileViewport && (
              <button
                onClick={() => navigate("/login?web=1")}
                className="w-full py-2 text-[12px] text-neutral-500 hover:text-neutral-300 underline underline-offset-2 transition-colors"
              >
                Sou diarista, continuar pelo navegador
              </button>
            )}
            <p className="text-center text-[11px] text-neutral-600 pb-[env(safe-area-inset-bottom,0px)]">
              Atualizações automáticas ao abrir o app.
            </p>
          </div>
        </div>
      </main>
    </Shell>
  );
}

// ============================================================
// Simplified install mockup — a single phone, subtle pointer
// ============================================================
function InstallMockup({ os, browser }: { os: OS; browser: Browser }) {
  const iosFamily = os === "ios" || os === "ipados";
  const isSafariIOS = iosFamily && browser === "safari";
  const chromeIOS = iosFamily && (browser === "chrome" || browser === "edge" || browser === "firefox");
  const pointerBottom = isSafariIOS || chromeIOS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="relative w-full aspect-[16/11] rounded-3xl overflow-hidden flex items-center justify-center border border-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
      style={{
        background:
          "linear-gradient(135deg, rgba(16,42,67,0.95) 0%, rgba(11,30,48,0.95) 100%)",
        backdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      {/* Mint glow */}
      <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_50%_115%,rgba(25,204,151,0.45),transparent_60%)]" />
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_-10%,rgba(255,255,255,0.08),transparent_55%)]" />
      {/* Highlight edge */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl [background:linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0)_45%)]" />

      {/* Phone frame */}
      <div
        className="relative w-[152px] h-[224px] rounded-[30px] overflow-hidden shadow-2xl"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 100%)",
          border: "1px solid rgba(255,255,255,0.22)",
          boxShadow:
            "0 10px 40px -8px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        {/* Notch */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-2.5 rounded-full bg-white/15 border border-white/10 z-20" />

        {/* Top browser bar (glass) */}
        <div className="absolute inset-x-0 top-0 h-8 z-10 flex items-center gap-1 px-2 pt-3.5 border-b border-white/10 backdrop-blur-md bg-white/5">
          <div className="flex-1 h-2 rounded-sm bg-white/15" />
          {!pointerBottom && (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="w-3.5 h-3.5 rounded bg-primary/30 border border-primary/70 flex items-center justify-center"
            >
              {os === "android" ? (
                <MoreVertical className="w-2 h-2 text-primary" />
              ) : (
                <Download className="w-2 h-2 text-primary" />
              )}
            </motion.div>
          )}
        </div>

        {/* Real app screenshot */}
        <img
          src={appPreview}
          alt="Prévia real do app Já Limpo"
          className="absolute inset-x-0 top-8 bottom-8 w-full h-[calc(100%-4rem)] object-cover object-top"
          loading="lazy"
        />

        {/* iOS bottom bar with pointer */}
        {pointerBottom && (
          <div className="absolute inset-x-0 bottom-0 h-8 z-10 flex items-center justify-around px-2 border-t border-white/10 backdrop-blur-md bg-white/5">
            <div className="w-2.5 h-2.5 rounded bg-white/15" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="w-4 h-4 rounded bg-primary/30 border border-primary/70 flex items-center justify-center"
            >
              <Share className="w-2.5 h-2.5 text-primary" />
            </motion.div>
            <div className="w-2.5 h-2.5 rounded bg-white/15" />
            <div className="w-2.5 h-2.5 rounded bg-white/15" />
          </div>
        )}
      </div>
    </motion.div>
  );
}



// ============================================================
// Guide config
// ============================================================
interface Guide {
  title: string;
  steps: Step[];
  warning?: string;
}

function buildGuide(os: OS, browser: Browser): Guide {
  const iosFamily = os === "ios" || os === "ipados";
  const deviceName =
    os === "ipados" ? "iPad" :
    os === "ios" ? "iPhone" :
    os === "android" ? "Android" :
    os === "macos" ? "Mac" : "computador";

  if (iosFamily) {
    if (browser === "chrome") {
      return {
        title: `${deviceName} · Chrome`,
        steps: [
          { icon: Share, text: "Toque no botão Compartilhar (quadrado com seta) na barra do Chrome." },
          { icon: Plus, text: 'Escolha "Adicionar à Tela de Início".' },
          { icon: Check, text: 'Toque em "Adicionar" no canto superior direito.' },
        ],
      };
    }
    if (browser === "edge") {
      return {
        title: `${deviceName} · Edge`,
        steps: [
          { icon: MoreVertical, text: "Toque no menu (…) na parte inferior do Edge." },
          { icon: Plus, text: 'Escolha "Adicionar ao telefone" ou "Adicionar à Tela de Início".' },
          { icon: Check, text: "Confirme para adicionar." },
        ],
      };
    }
    if (browser === "firefox") {
      return {
        title: `${deviceName} · Firefox`,
        steps: [
          { icon: MoreVertical, text: "Toque no menu do Firefox." },
          { icon: Share, text: 'Escolha "Compartilhar" e depois "Adicionar à Tela de Início".' },
          { icon: Check, text: "Confirme para adicionar." },
        ],
      };
    }
    return {
      title: `${deviceName} · Safari`,
      steps: [
        { icon: Share, text: "Toque no botão Compartilhar (quadrado com seta) na barra do Safari." },
        { icon: Plus, text: 'Role e toque em "Adicionar à Tela de Início".' },
        { icon: Check, text: 'Toque em "Adicionar" no canto superior direito.' },
      ],
    };
  }

  if (os === "android") {
    if (browser === "firefox") {
      return {
        title: "Android · Firefox",
        steps: [
          { icon: MoreVertical, text: "Toque no menu (⋮) do Firefox." },
          { icon: Plus, text: 'Escolha "Instalar" ou "Adicionar à tela inicial".' },
          { icon: Check, text: "Confirme para adicionar." },
        ],
      };
    }
    if (browser === "samsung") {
      return {
        title: "Samsung Internet",
        steps: [
          { icon: Menu, text: "Toque no menu (☰) na parte inferior." },
          { icon: Plus, text: 'Escolha "Adicionar página a" e depois "Tela inicial".' },
          { icon: Check, text: "Confirme para instalar." },
        ],
      };
    }
    return {
      title: `Android · ${labelFor(browser)}`,
      steps: [
        { icon: Download, text: 'Se aparecer o botão "Instalar agora" acima, toque nele.' },
        { icon: MoreVertical, text: 'Ou abra o menu (⋮) e escolha "Instalar app".' },
        { icon: Check, text: 'Confirme em "Instalar".' },
      ],
    };
  }

  if (browser === "firefox") {
    return {
      title: "Desktop · Firefox",
      warning:
        "O Firefox no desktop ainda não instala aplicativos web. Use Chrome, Edge, Brave ou Opera.",
      steps: [
        { icon: Copy, text: "Copie o link do app." },
        { icon: Monitor, text: "Abra o Chrome, Edge, Brave ou Opera." },
        { icon: Download, text: 'Clique no ícone de instalar e confirme em "Instalar".' },
      ],
    };
  }
  if (os === "macos" && browser === "safari") {
    return {
      title: "Mac · Safari 17+",
      steps: [
        { icon: Share, text: "Clique no menu Arquivo do Safari." },
        { icon: Plus, text: 'Escolha "Adicionar ao Dock".' },
        { icon: Check, text: 'Confirme em "Adicionar" e abra pelo Dock.' },
      ],
    };
  }
  return {
    title: `Desktop · ${labelFor(browser)}`,
    steps: [
      { icon: Download, text: 'Se aparecer o botão "Instalar agora" acima, clique nele.' },
      { icon: Download, text: "Ou clique no ícone de instalar na barra de endereço, à direita." },
      { icon: Check, text: 'Confirme em "Instalar".' },
    ],
  };
}

function labelFor(b: Browser): string {
  const map: Record<Browser, string> = {
    safari: "Safari",
    chrome: "Chrome",
    edge: "Edge",
    firefox: "Firefox",
    samsung: "Samsung",
    opera: "Opera",
    brave: "Brave",
    other: "Navegador",
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
  const color: Record<Browser, string> = {
    safari: "#0FB5EE",
    chrome: "#F4B400",
    edge: "#0078D4",
    firefox: "#FF7139",
    samsung: "#1428A0",
    opera: "#FF1B2D",
    brave: "#FB542B",
    other: "#71717A",
  };
  return (
    <span
      aria-hidden
      className="inline-block w-2 h-2 rounded-full"
      style={{ background: color[browser] }}
    />
  );
}
