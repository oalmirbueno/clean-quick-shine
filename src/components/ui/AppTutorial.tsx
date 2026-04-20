import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  Calendar, Star, MapPin, Search, Wallet, Trophy, Clock,
  CheckCircle2, ChevronRight, ChevronLeft, X, Sparkles,
  Shield, Bell, CreditCard, MessageCircle, ThumbsUp, Power,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CLIENT_TUTORIAL_KEY = "jalimpo_client_tutorial_completed";
const PRO_TUTORIAL_KEY = "jalimpo_pro_tutorial_completed";

interface TutorialStep {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge: string;
  title: string;
  description: string;
  /** Bullets práticos, escaneáveis. Máximo 3. */
  tips?: string[];
}

const clientSteps: TutorialStep[] = [
  {
    icon: Sparkles,
    badge: "Bem-vindo",
    title: "Limpeza profissional, sem complicação",
    description:
      "Em poucos toques você agenda uma profissional verificada e acompanha tudo em tempo real.",
    tips: [
      "Profissionais verificadas com documento",
      "Pagamento protegido pelo app",
      "Suporte humano sempre que precisar",
    ],
  },
  {
    icon: Search,
    badge: "Passo 1",
    title: "Escolha o serviço",
    description:
      "Na tela inicial, toque no tipo de limpeza que você precisa: residencial, comercial, pós-obra ou emergência.",
    tips: [
      "Veja preço e duração antes de seguir",
      "Cada serviço tem profissionais especializadas",
    ],
  },
  {
    icon: MapPin,
    badge: "Passo 2",
    title: "Informe o endereço",
    description:
      "Adicione onde quer o serviço. Salve seus endereços favoritos para agendar mais rápido nas próximas vezes.",
    tips: [
      "Endereço exato evita atrasos",
      "Você pode salvar casa, trabalho e outros",
    ],
  },
  {
    icon: Calendar,
    badge: "Passo 3",
    title: "Escolha data e horário",
    description:
      "Selecione o melhor dia e horário. Você pode agendar para hoje mesmo ou planejar para dias na frente.",
    tips: ["Horários disponíveis em verde", "Confirmação imediata"],
  },
  {
    icon: CreditCard,
    badge: "Passo 4",
    title: "Pague com segurança",
    description:
      "Pague via PIX direto no app. O valor só é liberado para a profissional após o serviço concluído.",
    tips: ["PIX confirmado em segundos", "Cupom de desconto no checkout"],
  },
  {
    icon: Bell,
    badge: "Acompanhe",
    title: "Tudo em tempo real",
    description:
      "Receba notificações quando a profissional confirmar, sair de casa, chegar e iniciar o serviço.",
    tips: ["Atualizações automáticas", "Chat direto se precisar falar"],
  },
  {
    icon: Star,
    badge: "Finalize",
    title: "Avalie e ajude a comunidade",
    description:
      "Ao final, dê uma nota e comentário. Sua avaliação mantém o padrão de qualidade do Já Limpo.",
    tips: ["Avaliações ajudam outras pessoas", "Você pode favoritar profissionais"],
  },
];

const proSteps: TutorialStep[] = [
  {
    icon: Sparkles,
    badge: "Bem-vinda",
    title: "Trabalhe com liberdade no Já Limpo",
    description:
      "Você define quando trabalhar, em quais zonas e recebe direto no PIX. Sem mensalidade obrigatória.",
    tips: [
      "Você fica com 80% de cada serviço",
      "Saque a partir de R$ 10,00",
      "Suporte dedicado para diaristas",
    ],
  },
  {
    icon: Shield,
    badge: "Passo 1",
    title: "Envie seus documentos",
    description:
      "Para começar a receber pedidos, envie RG/CNH (frente e verso) e uma selfie. A análise leva poucas horas.",
    tips: ["Foto nítida e sem reflexo", "Documento dentro da validade"],
  },
  {
    icon: MapPin,
    badge: "Passo 2",
    title: "Defina suas zonas",
    description:
      "Escolha em quais bairros e cidades você quer atender. Você só recebe pedidos dessas regiões.",
    tips: ["Quanto mais zonas, mais pedidos", "Pode editar quando quiser"],
  },
  {
    icon: Power,
    badge: "Passo 3",
    title: "Ative quando estiver disponível",
    description:
      "Toque em 'Disponível' na tela inicial. Os pedidos aparecem automaticamente para você aceitar ou recusar.",
    tips: ["Aceite rápido = mais pedidos", "Desative quando não puder atender"],
  },
  {
    icon: ThumbsUp,
    badge: "Passo 4",
    title: "Capriche no atendimento",
    description:
      "Chegue no horário, capriche na limpeza e seja gentil. Boas avaliações sobem você no ranking.",
    tips: ["Pontualidade conta muito", "Comunicação clara evita problemas"],
  },
  {
    icon: Wallet,
    badge: "Receba",
    title: "Saque seu dinheiro pelo PIX",
    description:
      "Após cada serviço avaliado, 80% vai para seu saldo. Saque na hora pelo PIX, sem taxa.",
    tips: ["Disponível assim que o cliente avalia", "Cadastre seu PIX no perfil"],
  },
  {
    icon: Trophy,
    badge: "Cresça",
    title: "Suba no ranking e ganhe mais",
    description:
      "Mantenha boas notas, baixo cancelamento e pontualidade. Quanto melhor seu nível, mais pedidos premium você recebe.",
    tips: ["Níveis A, B, C e D", "Plano ELITE prioriza pedidos"],
  },
];

interface AppTutorialProps {
  variant: "client" | "pro";
  onComplete: () => void;
}

export function AppTutorial({ variant, onComplete }: AppTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const steps = variant === "client" ? clientSteps : proSteps;
  const totalSteps = steps.length;
  const step = steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;
  const storageKey = variant === "client" ? CLIENT_TUTORIAL_KEY : PRO_TUTORIAL_KEY;
  const accent = variant === "client" ? "primary" : "success";

  // Lock body scroll while open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) setCurrentStep((s) => s + 1);
    else handleComplete();
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleSkip = () => handleComplete();

  const handleComplete = () => {
    setIsExiting(true);
    localStorage.setItem(storageKey, "true");
    setTimeout(() => onComplete(), 350);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col overflow-hidden"
          style={{
            paddingTop: "max(env(safe-area-inset-top, 0px), 8px)",
            paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
          }}
        >
          {/* ─── Header ─── */}
          <header className="flex-shrink-0 px-4 pt-2 pb-3 flex items-center justify-between">
            <Logo size="sm" iconOnly />
            <button
              onClick={handleSkip}
              className="px-3 py-1.5 rounded-full text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Pular tutorial"
            >
              Pular
            </button>
          </header>

          {/* ─── Progress ─── */}
          <div className="flex-shrink-0 px-5 pb-4">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-1 rounded-full bg-muted overflow-hidden"
                >
                  <motion.div
                    initial={false}
                    animate={{
                      width: i < currentStep ? "100%" : i === currentStep ? "100%" : "0%",
                    }}
                    transition={{ duration: i === currentStep ? 0.4 : 0.2, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      accent === "primary" ? "bg-primary" : "bg-success",
                    )}
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 tracking-tight">
              {currentStep + 1} de {totalSteps}
            </p>
          </div>

          {/* ─── Scrollable content ─── */}
          <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div className="px-6 py-4 max-w-md mx-auto w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="text-center"
                >
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.05, type: "spring", stiffness: 220, damping: 18 }}
                    className={cn(
                      "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm border",
                      accent === "primary"
                        ? "bg-gradient-to-br from-primary/15 to-primary/5 border-primary/20"
                        : "bg-gradient-to-br from-success/15 to-success/5 border-success/20",
                    )}
                  >
                    <step.icon
                      className={cn(
                        "w-10 h-10",
                        accent === "primary" ? "text-primary" : "text-success",
                      )}
                      strokeWidth={1.8}
                    />
                  </motion.div>

                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium mb-3 tracking-tight",
                      accent === "primary"
                        ? "bg-primary/10 text-primary"
                        : "bg-success/10 text-success",
                    )}
                  >
                    {step.badge}
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-[22px] sm:text-2xl font-semibold text-foreground leading-tight tracking-tight mb-3"
                  >
                    {step.title}
                  </motion.h2>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-[14px] text-muted-foreground leading-relaxed mb-5"
                  >
                    {step.description}
                  </motion.p>

                  {/* Tips */}
                  {step.tips && step.tips.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="space-y-2 text-left bg-muted/40 rounded-2xl p-4 border border-border/60"
                    >
                      {step.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2
                            className={cn(
                              "w-4 h-4 mt-0.5 flex-shrink-0",
                              accent === "primary" ? "text-primary" : "text-success",
                            )}
                            strokeWidth={2}
                          />
                          <span className="text-[13px] text-foreground leading-snug tracking-tight">
                            {tip}
                          </span>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* ─── Footer ─── */}
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
                variant={variant === "pro" ? "success" : "primary"}
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

export function useAppTutorial(variant: "client" | "pro") {
  const [showTutorial, setShowTutorial] = useState(false);
  const storageKey = variant === "client" ? CLIENT_TUTORIAL_KEY : PRO_TUTORIAL_KEY;

  useEffect(() => {
    const completed = localStorage.getItem(storageKey) === "true";
    if (!completed) {
      const timer = setTimeout(() => setShowTutorial(true), 500);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const completeTutorial = () => {
    localStorage.setItem(storageKey, "true");
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    localStorage.removeItem(storageKey);
    setShowTutorial(true);
  };

  return { showTutorial, completeTutorial, resetTutorial };
}
