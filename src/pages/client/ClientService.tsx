import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ChevronLeft, Check, Clock, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useServices } from "@/hooks/useServices";
import * as LucideIcons from "lucide-react";

const getIcon = (name: string | null): React.ComponentType<any> => {
  if (!name) return Sparkles;
  return (LucideIcons as any)[name] || Sparkles;
};

export default function ClientService() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const { data: services, isLoading } = useServices();

  const selected = services?.find((s) => s.id === selectedService);

  return (
    <div className="h-full bg-background flex flex-col relative safe-top">
      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[30%]"
        style={{
          background:
            "radial-gradient(90% 60% at 50% 0%, hsl(var(--primary) / 0.10) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <header
        className="relative shrink-0 px-5 pt-3 pb-4 z-10"
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}
      >
        <div className="mx-auto max-w-lg flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card border border-border/60 flex items-center justify-center text-foreground hover:bg-secondary transition-colors shadow-sm"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <p className="text-[12px] text-muted-foreground leading-none mb-1">
              Passo 1 de 3
            </p>
            <h1 className="text-[20px] font-semibold text-foreground leading-tight tracking-tight">
              Qual serviço você precisa?
            </h1>
          </div>
        </div>
      </header>

      <main className="relative flex-1 overflow-y-auto z-10 px-5 pb-28">
        <div className="mx-auto max-w-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !services || services.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-sm">
                Nenhum serviço disponível no momento.
              </p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.04 } },
              }}
              className="space-y-3"
            >
              {services.map((service) => {
                const IconComp = getIcon((service as any).icon);
                const isSelected = selectedService === service.id;
                const isProOnly = (service as any).requires_pro_plan;

                return (
                  <motion.button
                    key={service.id}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      show: { opacity: 1, y: 0 },
                    }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedService(service.id)}
                    className={cn(
                      "relative w-full p-4 rounded-2xl border text-left transition-all overflow-hidden",
                      isSelected
                        ? "border-primary/50 bg-primary/5 shadow-sm ring-2 ring-primary/15"
                        : "border-border/60 bg-card shadow-sm hover:border-primary/30",
                    )}
                  >
                    {isSelected && (
                      <div
                        aria-hidden
                        className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full"
                        style={{
                          background:
                            "radial-gradient(circle, hsl(var(--primary) / 0.12), transparent 70%)",
                        }}
                      />
                    )}
                    <div className="relative flex gap-3">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                          isSelected ? "bg-primary/15" : "bg-secondary/70",
                        )}
                      >
                        <IconComp
                          className={cn(
                            "w-5 h-5",
                            isSelected ? "text-primary" : "text-foreground/70",
                          )}
                          strokeWidth={2}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <h3 className="font-semibold text-foreground text-[15px] leading-tight flex-1 min-w-0">
                            {service.name}
                          </h3>
                          {isProOnly && (
                            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-md text-[10px] font-bold uppercase tracking-wide shrink-0">
                              PRO
                            </span>
                          )}
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                            </div>
                          )}
                        </div>

                        {(service as any).description && (
                          <p className="text-[12.5px] text-muted-foreground mt-1 line-clamp-2 leading-snug">
                            {(service as any).description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/60 text-[11px] text-muted-foreground font-medium">
                            <Clock className="w-3 h-3" />
                            {service.duration_hours}h
                          </div>
                          <p className="text-[16px] font-bold text-foreground tracking-tight">
                            R$ {Number(service.base_price).toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </div>
      </main>

      {/* Sticky bottom CTA with selected summary */}
      <div
        className="shrink-0 px-5 pt-3 pb-5 bg-card/95 backdrop-blur border-t border-border/60"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 20px)" }}
      >
        <div className="mx-auto max-w-lg">
          {selected && (
            <div className="mb-3 flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">
                {selected.name} · {selected.duration_hours}h
              </span>
              <span className="font-semibold text-foreground">
                R$ {Number(selected.base_price).toFixed(2).replace(".", ",")}
              </span>
            </div>
          )}
          <PrimaryButton
            fullWidth
            disabled={!selectedService}
            onClick={() =>
              navigate("/client/schedule", { state: { serviceId: selectedService } })
            }
          >
            Continuar
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
