import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { clientSteps, proSteps, type TutorialStep } from "./tutorial/steps";
import { useViewportHeight } from "@/hooks/useViewportHeight";

const CLIENT_TUTORIAL_KEY = "jalimpo_client_tutorial_completed";
const PRO_TUTORIAL_KEY = "jalimpo_pro_tutorial_completed";

interface AppTutorialProps {
  variant: "client" | "pro";
  onComplete: () => void;
}

// Animation tuning — short, snappy, GPU-friendly transforms only
const SLIDE_TRANSITION = { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const };
const SWIPE_THRESHOLD = 60;

export function AppTutorial({ variant, onComplete }: AppTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isExiting, setIsExiting] = useState(false);

  useViewportHeight();

  const steps = variant === "client" ? clientSteps : proSteps;
  const totalSteps = steps.length;
  const step = steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;
  const storageKey = variant === "client" ? CLIENT_TUTORIAL_KEY : PRO_TUTORIAL_KEY;
  const isPro = variant === "pro";

  // Lock body scroll while open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, []);

  const handleComplete = useCallback(() => {
    setIsExiting(true);
    localStorage.setItem(storageKey, "true");
    setTimeout(() => onComplete(), 280);
  }, [onComplete, storageKey]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentStep((s) => {
      if (s < totalSteps - 1) return s + 1;
      handleComplete();
      return s;
    });
  }, [totalSteps, handleComplete]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentStep((s) => (s > 0 ? s - 1 : s));
  }, []);

  const goTo = useCallback((index: number) => {
    setDirection(index > currentStep ? 1 : -1);
    setCurrentStep(index);
  }, [currentStep]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "Escape") handleComplete();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNext, handlePrev, handleComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-x-0 top-0 z-[9999] bg-background grid overflow-hidden"
          style={{
            height: "var(--app-height, 100dvh)",
            maxHeight: "var(--app-height, 100dvh)",
            gridTemplateRows: "auto auto minmax(0, 1fr) auto",
            paddingTop: "max(env(safe-area-inset-top, 0px), 8px)",
            paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
            willChange: "opacity",
          }}
        >
          {/* Header */}
          <header className="flex-shrink-0 px-4 pt-2 pb-3 flex items-center justify-between">
            <Logo size="sm" iconOnly />
            <button
              onClick={handleComplete}
              className="px-3 py-1.5 rounded-full text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              Pular
            </button>
          </header>

          {/* Progress bar */}
          <ProgressBar
            total={totalSteps}
            current={currentStep}
            isPro={isPro}
            onSelect={goTo}
          />

          {/* Slide area — drag enabled */}
          <main className="flex-1 min-h-0 relative overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <SlideContent
                key={currentStep}
                step={step}
                direction={direction}
                isPro={isPro}
                onSwipeNext={handleNext}
                onSwipePrev={handlePrev}
              />
            </AnimatePresence>
          </main>

          {/* Footer */}
          <footer className="flex-shrink-0 px-5 pt-3 pb-2 border-t border-border/60 bg-background/80 backdrop-blur-sm">
            <div className="max-w-md mx-auto w-full flex items-center gap-3">
              <button
                onClick={handlePrev}
                disabled={isFirstStep}
                className={cn(
                  "h-12 w-12 rounded-2xl border border-border/60 flex items-center justify-center transition-all",
                  isFirstStep
                    ? "opacity-30 pointer-events-none"
                    : "hover:bg-muted active:scale-95",
                )}
                aria-label="Voltar"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>

              <PrimaryButton
                fullWidth
                onClick={handleNext}
                variant={isPro ? "success" : "primary"}
                className="group h-12"
              >
                {isLastStep ? (
                  <span className="flex items-center justify-center gap-2 font-medium tracking-tight">
                    <CheckCircle2 className="w-4 h-4" />
                    Começar a usar
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 font-medium tracking-tight">
                    Próximo
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                )}
              </PrimaryButton>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────── Sub-components ─────────── */

function ProgressBar({
  total, current, isPro, onSelect,
}: { total: number; current: number; isPro: boolean; onSelect: (i: number) => void }) {
  return (
    <div className="flex-shrink-0 px-5 pb-3">
      <div className="flex gap-1.5" role="tablist">
        {Array.from({ length: total }).map((_, i) => {
          const isActive = i === current;
          const isPast = i < current;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className="flex-1 h-1 rounded-full bg-muted overflow-hidden cursor-pointer"
              aria-label={`Ir para passo ${i + 1}`}
              role="tab"
              aria-selected={isActive}
            >
              <motion.div
                initial={false}
                animate={{ width: isPast || isActive ? "100%" : "0%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  isPro ? "bg-success" : "bg-primary",
                )}
                style={{ willChange: "width" }}
              />
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground mt-2 tracking-tight tabular-nums">
        {current + 1} de {total}
      </p>
    </div>
  );
}

interface SlideContentProps {
  step: TutorialStep;
  direction: number;
  isPro: boolean;
  onSwipeNext: () => void;
  onSwipePrev: () => void;
}

function SlideContent({ step, direction, isPro, onSwipeNext, onSwipePrev }: SlideContentProps) {
  const Icon = step.icon;

  // Memoize variants per direction so framer-motion doesn't re-compute
  const variants = useMemo(() => ({
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  }), []);

  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={SLIDE_TRANSITION}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x < -SWIPE_THRESHOLD) onSwipeNext();
        else if (info.offset.x > SWIPE_THRESHOLD) onSwipePrev();
      }}
      className="absolute inset-0 overflow-y-auto overscroll-contain"
      style={{ willChange: "transform, opacity", WebkitOverflowScrolling: "touch" }}
    >
      <div
        className="min-h-full px-6 pt-2 max-w-md mx-auto w-full flex flex-col justify-center"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
      >
        {/* Icon */}
        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border",
            isPro
              ? "bg-success/10 border-success/15"
              : "bg-primary/10 border-primary/15",
          )}
        >
          <Icon
            className={cn("w-8 h-8", isPro ? "text-success" : "text-primary")}
            strokeWidth={1.75}
          />
        </div>

        {/* Badge */}
        <span
          className={cn(
            "inline-flex items-center self-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-[0.08em] mb-3",
            isPro ? "bg-success/10 text-success" : "bg-primary/10 text-primary",
          )}
        >
          {step.badge}
        </span>

        {/* Title */}
        <h2 className="text-center text-[19px] sm:text-[20px] font-semibold text-foreground leading-[1.25] tracking-[-0.01em] mb-2.5 max-w-[20ch] mx-auto">
          {step.title}
        </h2>

        {/* Description */}
        <p className="text-center text-[14px] text-muted-foreground leading-[1.55] mb-6 max-w-[32ch] mx-auto">
          {step.description}
        </p>

        {/* Tips */}
        {step.tips && step.tips.length > 0 && (
          <ul className="space-y-2.5 text-left bg-muted/30 rounded-xl p-4 border border-border/50">
            {step.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2
                  className={cn(
                    "w-3.5 h-3.5 mt-[3px] flex-shrink-0",
                    isPro ? "text-success" : "text-primary",
                  )}
                  strokeWidth={2.25}
                />
                <span className="text-[13px] text-foreground/85 leading-[1.45]">
                  {tip}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────── Hook ─────────── */

export function useAppTutorial(variant: "client" | "pro") {
  const [showTutorial, setShowTutorial] = useState(false);
  const storageKey = variant === "client" ? CLIENT_TUTORIAL_KEY : PRO_TUTORIAL_KEY;

  useEffect(() => {
    const completed = localStorage.getItem(storageKey) === "true";
    if (!completed) {
      const timer = setTimeout(() => setShowTutorial(true), 400);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const completeTutorial = useCallback(() => {
    localStorage.setItem(storageKey, "true");
    setShowTutorial(false);
  }, [storageKey]);

  const resetTutorial = useCallback(() => {
    localStorage.removeItem(storageKey);
    setShowTutorial(true);
  }, [storageKey]);

  return { showTutorial, completeTutorial, resetTutorial };
}
