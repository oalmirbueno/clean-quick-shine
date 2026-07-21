import { useEffect, useMemo, useState } from "react";
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
  Rocket,
  Zap,
  Wifi,
  BellRing,
} from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useIsStandalone, useIsMobileDevice } from "@/hooks/useIsStandalone";
import { useInstalledPwa } from "@/hooks/useInstalledPwa";
import { toast } from "sonner";

type Step = "welcome" | "hasAccountYes" | "hasAccountNo";

/**
 * Welcome / entry wizard.
 *
 * Prioridade: SEMPRE empurrar o usuário para o app (PWA).
 *  - Desktop/Tablet-browser: mostra QR + link para abrir no celular.
 *  - Mobile-browser (não standalone):
 *      • Se o PWA já está instalado neste device, exibe status "App instalado"
 *        com CTA para abrir pelo ícone.
 *      • Caso contrário, força fluxo de instalação antes de login/cadastro.
 *  - Já dentro do PWA: pula direto para /login.
 */
export default function Onboarding() {
  const navigate = useNavigate();
  const isStandalone = useIsStandalone();
  const isMobile = useIsMobileDevice();
  const pwaInstalled = useInstalledPwa();

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

  // Se o app já está rodando standalone, abre direto o fluxo de login.
  useEffect(() => {
    if (isStandalone) navigate("/login", { replace: true });
  }, [isStandalone, navigate]);

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
            {forceInstall && pwaInstalled && (
              <InstalledStatusCard onOpen={goLogin} />
            )}

            <ChoiceCard
              icon={LogIn}
              title="Sim, já tenho conta"
              description={
                forceInstall
                  ? pwaInstalled
                    ? "Abrir o app instalado"
                    : "Abrir ou instalar o app"
                  : "Entrar agora"
              }
              onClick={() => {
                if (forceInstall && !pwaInstalled) setStep("hasAccountYes");
                else goLogin();
              }}
            />
            <ChoiceCard
              icon={UserPlus}
              title="Não, é minha primeira vez"
              description={
                forceInstall
                  ? pwaInstalled
                    ? "Abrir o app e criar conta"
                    : "Instalar o app e criar conta"
                  : "Criar conta grátis"
              }
              onClick={() => {
                if (forceInstall && !pwaInstalled) setStep("hasAccountNo");
                else goRegister();
              }}
              primary
            />

            {forceInstall && !pwaInstalled && (
              <InfoNote>
                O Já Limpo funciona melhor como aplicativo instalado, mais
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
            Sou diarista, continuar pelo navegador

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

function InstalledStatusCard({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-primary/25 bg-primary/5 p-4 flex items-start gap-3"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-foreground">
            App instalado neste celular
          </div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/15 text-primary">
            Pronto
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          Abra o Já Limpo pelo ícone na sua tela inicial para a melhor
          experiência.
        </p>
        <button
          type="button"
          onClick={onOpen}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Rocket className="w-3.5 h-3.5" /> Continuar mesmo assim
        </button>
      </div>
    </motion.div>
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
  const [os, setOs] = useState<"ios" | "android">("ios");
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

  const steps =
    os === "ios"
      ? [
          { title: "Abra o link no iPhone", body: "Aponte a câmera para o QR ou cole o link no Safari." },
          { title: "Toque em Compartilhar", body: "Ícone de quadrado com seta na barra inferior do Safari." },
          { title: "Adicionar à Tela de Início", body: "Role o menu e confirme em Adicionar no canto superior." },
          { title: "Abra pelo ícone Já Limpo", body: "Faça login ou crie sua conta em segundos." },
        ]
      : [
          { title: "Abra o link no Android", body: "Aponte a câmera para o QR ou cole o link no Chrome." },
          { title: "Toque no menu do Chrome", body: "Três pontinhos no canto superior direito." },
          { title: "Instalar aplicativo", body: "Escolha Instalar app ou Adicionar à tela inicial." },
          { title: "Abra pelo ícone Já Limpo", body: "Faça login ou crie sua conta em segundos." },
        ];

  return (
    <AuthLayout
      eyebrow={
        <>
          <Sparkles className="w-3 h-3" /> Já Limpo é feito para celular
        </>
      }
      title="Abra no seu celular"
      subtitle="Escaneie o QR ou copie o link. Depois siga o passo a passo do seu sistema."
      showTrust
    >
      <div className="space-y-5">
        <div className="rounded-3xl border border-border/60 bg-card p-6 flex flex-col items-center gap-4">
          <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-border/40">
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
            Aponte a câmera do iPhone ou Android
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

        <div className="rounded-2xl bg-muted/40 border border-border/60 p-1 grid grid-cols-2 gap-1">
          <OsTab
            active={os === "ios"}
            onClick={() => setOs("ios")}
            icon={AppleIcon}
            label="iPhone"
          />
          <OsTab
            active={os === "android"}
            onClick={() => setOs("android")}
            icon={AndroidIcon}
            label="Android"
          />
        </div>

        <motion.ol
          key={os}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-2.5"
        >
          {steps.map((s, i) => (
            <StepLine key={i} n={i + 1} title={s.title} body={s.body} />
          ))}
        </motion.ol>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onProWeb}
            className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Sou diarista, continuar pelo navegador
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

function OsTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: (props: { className?: string }) => JSX.Element;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "flex items-center justify-center gap-2 py-2.5 rounded-xl bg-card text-foreground shadow-sm border border-border/60 text-sm font-semibold transition-all"
          : "flex items-center justify-center gap-2 py-2.5 rounded-xl text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
      }
    >
      <Icon className={active ? "w-4 h-4 text-primary" : "w-4 h-4"} />
      {label}
    </button>
  );
}

function StepLine({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 p-3">
      <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
        {n}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground leading-tight">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{body}</div>
      </div>
    </li>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.365 12.86c-.02-2.24 1.83-3.32 1.91-3.37-1.04-1.52-2.66-1.73-3.24-1.76-1.38-.14-2.69.81-3.39.81-.7 0-1.78-.79-2.93-.77-1.51.02-2.9.88-3.68 2.23-1.57 2.72-.4 6.74 1.13 8.95.75 1.08 1.64 2.29 2.79 2.24 1.12-.04 1.55-.72 2.9-.72 1.35 0 1.73.72 2.92.7 1.21-.02 1.97-1.09 2.71-2.18.85-1.25 1.2-2.46 1.22-2.52-.03-.01-2.34-.9-2.34-3.61zm-2.23-6.63c.61-.75 1.03-1.79.91-2.83-.88.04-1.96.59-2.6 1.33-.57.66-1.08 1.72-.94 2.74.99.08 2.01-.5 2.63-1.24z" />
    </svg>
  );
}

function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.6 9.48l1.84-3.18a.4.4 0 10-.69-.4l-1.86 3.23a11.3 11.3 0 00-9.78 0L5.25 5.9a.4.4 0 10-.69.4l1.84 3.18A10.4 10.4 0 001.5 17.5h21a10.4 10.4 0 00-4.9-8.02zM7 15.25a.9.9 0 11.9-.9.9.9 0 01-.9.9zm10 0a.9.9 0 11.9-.9.9.9 0 01-.9.9z" />
    </svg>
  );
}

