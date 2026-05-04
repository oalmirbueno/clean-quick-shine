import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ProPageHeader } from "@/components/ui/ProPageHeader";
import { clientSteps, proSteps, type TutorialStep } from "@/components/ui/tutorial/steps";
import { resetTutorialFor } from "@/components/ui/AppTutorial";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

type Tab = "client" | "pro";

export default function HelpDocs() {
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const defaultTab: Tab = roles.includes("pro") ? "pro" : "client";
  const [tab, setTab] = useState<Tab>(defaultTab);

  const steps: TutorialStep[] = tab === "pro" ? proSteps : clientSteps;
  const isPro = tab === "pro";

  const handleReplay = () => {
    if (!roles.includes("client") && !roles.includes("pro")) {
      toast.info("Tutorial guiado disponível apenas para clientes e diaristas.");
      return;
    }
    const target: Tab = roles.includes("pro") ? "pro" : "client";
    resetTutorialFor(target, user?.id);
    toast.success("Tutorial reiniciado.");
    navigate(target === "pro" ? "/pro/home" : "/client/home");
  };

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      <ProPageHeader
        title="Documentação"
        subtitle="Como usar o Já Limpo"
        rightAction={
          <button
            onClick={handleReplay}
            className="h-9 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <PlayCircle className="w-4 h-4" />
            Refazer
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto min-h-0">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="px-5 pb-8 space-y-4 max-w-md mx-auto w-full"
        >
          {/* Tabs */}
          <motion.div variants={item} className="flex gap-2 p-1 bg-muted/40 rounded-2xl">
            {(["client", "pro"] as const).map((t) => {
              const active = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "flex-1 h-9 rounded-xl text-xs font-semibold transition-colors",
                    active
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  {t === "client" ? "Para clientes" : "Para diaristas"}
                </button>
              );
            })}
          </motion.div>

          <motion.p variants={item} className="text-sm text-muted-foreground leading-snug px-1">
            {isPro
              ? "Tudo o que você precisa saber para receber pedidos, cumprir os serviços e sacar seus ganhos."
              : "Tudo o que você precisa para agendar uma limpeza, acompanhar o profissional e avaliar o serviço."}
          </motion.p>

          {/* Steps as documentation */}
          <motion.ol variants={item} className="space-y-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <li
                  key={i}
                  className="bg-card rounded-2xl border border-border/60 shadow-sm p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                        isPro
                          ? "bg-success/10 border-success/15"
                          : "bg-primary/10 border-primary/15"
                      )}
                    >
                      <Icon
                        className={cn("w-5 h-5", isPro ? "text-success" : "text-primary")}
                        strokeWidth={1.75}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                            isPro ? "text-success bg-success/10" : "text-primary bg-primary/10"
                          )}
                        >
                          Passo {i + 1}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {step.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">
                        {step.description}
                      </p>
                      {step.tips && step.tips.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {step.tips.map((tip, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <CheckCircle2
                                className={cn(
                                  "w-3.5 h-3.5 mt-0.5 shrink-0",
                                  isPro ? "text-success" : "text-primary"
                                )}
                              />
                              <span className="text-xs text-foreground/85 leading-snug">
                                {tip}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </motion.ol>

          <motion.div variants={item} className="pt-2 text-center">
            <button
              onClick={handleReplay}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold"
            >
              <PlayCircle className="w-4 h-4" />
              Iniciar tutorial guiado
            </button>
            <p className="text-[11px] text-muted-foreground mt-3">
              Já Limpo · Documentação do aplicativo
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
