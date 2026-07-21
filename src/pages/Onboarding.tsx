import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Sparkles,
  ArrowRight,
  Smartphone,
  Download,
  LogIn,
  UserPlus,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
} from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useIsStandalone, useIsMobileDevice } from "@/hooks/useIsStandalone";
import { toast } from "sonner";

type Step = "welcome" | "hasAccountYes" | "hasAccountNo";

/**
 * Welcome / entry wizard.
 *
 * Prioridade: SEMPRE empurrar o usuário para o app (PWA).
 *  - Desktop/Tablet-browser: mostra QR + link para abrir no celular.
 *    Link discreto para diaristas seguirem no navegador (fallback).
 *  - Mobile-browser (não standalone): força fluxo de instalação antes de login/cadastro.
 *  - Já dentro do PWA: vai direto para login/cadastro.
 */
export default function Onboarding() {
  const navigate = useNavigate();
  const isStandalone = useIsStandalone();
  const isMobile = useIsMobileDevice();

  // Em navegador mobile, sempre força passar pelo app.
  const forceInstall = useMemo(
    () => isMobile && !isStandalone,
    [isMobile, isStandalone],
  );

  // Desktop/tablet (não mobile e não standalone): tela dedicada de "abra no celular".
  const showDesktopHandoff = !isMobile && !isStandalone;

  const [step, setStep] = useState<Step>("welcome");

  const goLogin = () => navigate("/login");
  const goRegister = () => navigate("/register");
  const goInstall = () => navigate("/install");

  const backTarget = step === "welcome" ? undefined : () => setStep("welcome");

  if (showDesktopHandoff) {
    return <DesktopHandoff onProWeb={goLogin} />;
  }

  return (
    <AuthLayout
      onBack={backTarget}
      eyebrow={
        <>
          <Sparkles className="w-3 h-3" /> Bem-vindo ao Já Limpo
        </>
      }
      title={
        step === "welcome"
          ? "Você já tem cadastro?"
          : step === "hasAccountYes"
            ? "Já instalou o app?"
            : "Vamos começar do jeito certo"
      }
      subtitle={
        step === "welcome"
          ? "Em poucos toques você agenda sua limpeza."
          : step === "hasAccountYes"
            ? "Assim você abre o Já Limpo sempre que precisar."
            : forceInstall
              ? "Instale o app antes de criar sua conta."
              : "Crie sua conta grátis em segundos."
      }
      showTrust={step === "welcome"}
    >
      <AnimatePresence mode="wait">
        {step === "welcome" && (
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
              description={forceInstall ? "Abrir ou instalar o app" : "Entrar agora"}
              onClick={() => {
                if (forceInstall) setStep("hasAccountYes");
                else goLogin();
              }}
            />
            <ChoiceCard
              icon={UserPlus}
              title="Não, é minha primeira vez"
              description={forceInstall ? "Instalar o app e criar conta" : "Criar conta grátis"}
              onClick={() => {
                if (forceInstall) setStep("hasAccountNo");
                else goRegister();
              }}
              primary
            />

            {forceInstall && (
              <InfoNote>
                O Já Limpo funciona melhor como aplicativo instalado — mais
                rápido, com notificações e sempre atualizado.
              </InfoNote>
            )}
          </motion.div>
        )}

        {step === "hasAccountYes" && (
          <motion.div
            key="hasAccountYes"
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
              onClick={goLogin}
              primary
            />
            <ChoiceCard
              icon={Download}
              title="Ainda não instalei"
              description="Ver como instalar em segundos"
              onClick={goInstall}
            />

            <InfoNote>
              Depois de instalar, abra o Já Limpo pelo ícone na tela inicial.
              As atualizações são automáticas ao reabrir o app.
            </InfoNote>
          </motion.div>
        )}

        {step === "hasAccountNo" && (
          <motion.div
            key="hasAccountNo"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <ChoiceCard
              icon={Download}
              title="Instalar o app agora"
              description="Rápido, sem loja. Depois criamos sua conta."
              onClick={goInstall}
              primary
            />

            <InfoNote>
              Instalar deixa o app na tela inicial, com acesso mais rápido e
              atualizações automáticas.
            </InfoNote>
          </motion.div>
        )}
      </AnimatePresence>

      {forceInstall && step === "welcome" && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={goLogin}
            className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Sou diarista — continuar pelo navegador
          </button>
        </div>
      )}

      <p className="mt-6 text-[11px] text-center text-muted-foreground leading-relaxed">
        Ao continuar você aceita nossos{" "}
        <a href="/terms" className="text-primary hover:underline">termos</a>{" "}
        e{" "}
        <a href="/privacy" className="text-primary hover:underline">política de privacidade</a>.
      </p>
    </AuthLayout>
  );
}

function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-2xl bg-muted/40 border border-border/60 p-3.5 flex items-start gap-3">
      <Smartphone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <p className="text-xs text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}

function ChoiceCard({
  icon: Icon,
  title,
  description,
  onClick,
  primary,
  badge,
}: {
  icon: typeof LogIn;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
  badge?: string;
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
        <div className="flex items-center gap-2">
          <div className={primary ? "text-sm font-semibold" : "text-sm font-semibold text-foreground"}>
            {title}
          </div>
          {badge && (
            <span
              className={
                primary
                  ? "text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary-foreground/20"
                  : "text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary"
              }
            >
              {badge}
            </span>
          )}
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

function DesktopHandoff({ onProWeb }: { onProWeb: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.origin + "/" : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <AuthLayout
      eyebrow={
        <>
          <Sparkles className="w-3 h-3" /> Já Limpo funciona no seu celular
        </>
      }
      title="Abra no seu celular"
      subtitle="O Já Limpo foi feito para iOS e Android. Aponte a câmera do celular para o QR ou copie o link."
      showTrust
    >
      <div className="space-y-5">
        <div className="rounded-3xl border border-border/60 bg-card p-6 flex flex-col items-center gap-4">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <QRCodeSVG
              value={url}
              size={176}
              level="M"
              bgColor="#ffffff"
              fgColor="#0b1c2c"
              includeMargin={false}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <QrCode className="w-3.5 h-3.5 text-primary" />
            Aponte a câmera do iPhone ou Android para o QR
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 flex items-center gap-2">
          <div className="flex-1 min-w-0 text-xs font-mono truncate text-foreground/80">
            {url}
          </div>
          <button
            type="button"
            onClick={copyLink}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copiado
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copiar
              </>
            )}
          </button>
        </div>

        <ol className="space-y-2.5 text-sm text-foreground/90">
          <StepLine n={1} text="Abra o link no celular (QR ou copiar)." />
          <StepLine n={2} text="Toque em Instalar / Adicionar à tela inicial." />
          <StepLine n={3} text="Abra o Já Limpo pelo ícone e faça login." />
        </ol>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onProWeb}
            className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Sou diarista — continuar pelo navegador
          </button>
        </div>
      </div>

      <p className="mt-6 text-[11px] text-center text-muted-foreground leading-relaxed">
        Ao continuar você aceita nossos{" "}
        <a href="/terms" className="text-primary hover:underline">termos</a>{" "}
        e{" "}
        <a href="/privacy" className="text-primary hover:underline">política de privacidade</a>.
      </p>
    </AuthLayout>
  );
}

function StepLine({ n, text }: { n: number; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
        {n}
      </span>
      <span className="leading-relaxed pt-0.5">{text}</span>
    </li>
  );
}
