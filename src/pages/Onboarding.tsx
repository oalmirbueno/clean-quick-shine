import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Smartphone,
  Download,
  LogIn,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useIsStandalone, useIsMobileDevice } from "@/hooks/useIsStandalone";

type Step = "welcome" | "installed";

/**
 * Welcome/entry screen.
 * - Mobile browser (not installed): shows a tiny wizard —
 *     "Já tem cadastro?" → Sim/Não
 *     If Sim → "Já instalou o app?" → Sim (Entrar) / Não (Instalar)
 *     If Não → vai direto para /install (instala, depois cria conta no app).
 * - Standalone (PWA já instalado) ou desktop: mostra CTAs diretos.
 */
export default function Onboarding() {
  const navigate = useNavigate();
  const isStandalone = useIsStandalone();
  const isMobile = useIsMobileDevice();

  // Se já está no app instalado (PWA) ou desktop, pula o wizard.
  const showWizard = useMemo(() => isMobile && !isStandalone, [isMobile, isStandalone]);

  const [step, setStep] = useState<Step>("welcome");

  if (!showWizard) {
    return (
      <AuthLayout
        eyebrow={
          <>
            <Sparkles className="w-3 h-3" /> Bem-vindo ao Já Limpo
          </>
        }
        title="Limpeza profissional, em poucos toques."
        subtitle="Agende, acompanhe e pague com segurança. Tudo em um só app."
      >
        <div className="space-y-3">
          <PrimaryButton fullWidth size="lg" onClick={() => navigate("/register")} className="group">
            Criar conta grátis
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </PrimaryButton>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/login")}
            className="w-full h-12 rounded-2xl border border-border/60 bg-card text-foreground font-medium hover:bg-muted transition-colors"
          >
            Já tenho conta · Entrar
          </motion.button>
        </div>

        <p className="mt-5 text-[11px] text-center text-muted-foreground leading-relaxed">
          Ao continuar você aceita nossos{" "}
          <a href="/terms" className="text-primary hover:underline">termos</a>{" "}
          e{" "}
          <a href="/privacy" className="text-primary hover:underline">política de privacidade</a>.
        </p>
      </AuthLayout>
    );
  }

  // ===== Wizard mobile-browser =====
  return (
    <AuthLayout
      onBack={step === "welcome" ? undefined : () => setStep("welcome")}
      eyebrow={
        <>
          <Sparkles className="w-3 h-3" /> Bem-vindo ao Já Limpo
        </>
      }
      title={
        step === "welcome"
          ? "Você já tem cadastro?"
          : "Você já instalou o app?"
      }
      subtitle={
        step === "welcome"
          ? "Escolha uma opção para continuar."
          : "Vamos abrir o app do jeito certo."
      }
      showTrust={false}
    >
      <AnimatePresence mode="wait">
        {step === "welcome" ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <ChoiceCard
              icon={LogIn}
              title="Sim, já tenho conta"
              description="Ver como abrir ou instalar o app"
              onClick={() => setStep("installed")}
            />
            <ChoiceCard
              icon={UserPlus}
              title="Não, é minha primeira vez"
              description="Instale o app e crie sua conta"
              onClick={() => navigate("/install")}
              primary
            />
          </motion.div>
        ) : (
          <motion.div
            key="installed"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <ChoiceCard
              icon={CheckCircle2}
              title="Sim, já instalei"
              description="Abrir o app e entrar"
              onClick={() => navigate("/login")}
              primary
            />
            <ChoiceCard
              icon={Download}
              title="Ainda não instalei"
              description="Ver como instalar em segundos"
              onClick={() => navigate("/install")}
            />

            <div className="mt-4 rounded-2xl bg-muted/40 border border-border/60 p-3.5 flex items-start gap-3">
              <Smartphone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Depois de instalar, abra o Já Limpo pelo ícone na tela inicial.
                As atualizações são automáticas ao abrir o app.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-6 text-[11px] text-center text-muted-foreground leading-relaxed">
        Ao continuar você aceita nossos{" "}
        <a href="/terms" className="text-primary hover:underline">termos</a>{" "}
        e{" "}
        <a href="/privacy" className="text-primary hover:underline">política de privacidade</a>.
      </p>
    </AuthLayout>
  );
}

function ChoiceCard({
  icon: Icon,
  title,
  description,
  onClick,
  primary,
}: {
  icon: typeof LogIn;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={
        primary
          ? "w-full flex items-center gap-3 p-4 rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 active:scale-[0.99] transition-transform text-left"
          : "w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/60 hover:bg-muted transition-colors text-left"
      }
    >
      <div
        className={
          primary
            ? "w-10 h-10 rounded-xl bg-primary-foreground/15 flex items-center justify-center shrink-0"
            : "w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"
        }
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className={primary ? "text-sm font-semibold" : "text-sm font-semibold text-foreground"}>
          {title}
        </div>
        <div
          className={
            primary
              ? "text-xs opacity-90 mt-0.5"
              : "text-xs text-muted-foreground mt-0.5"
          }
        >
          {description}
        </div>
      </div>
      <ArrowRight className={primary ? "w-4 h-4 opacity-90" : "w-4 h-4 text-muted-foreground"} />
    </motion.button>
  );
}
