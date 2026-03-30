import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ChevronLeft, Check, Clock, Loader2, Crown, Zap, Home, Sparkles, HardHat } from "lucide-react";
import { cn } from "@/lib/utils";
import { useServices } from "@/hooks/useServices";

const iconMap: Record<string, React.ComponentType<any>> = {
  Zap,
  Home,
  Sparkles,
  HardHat,
};

const tagMap: Record<string, { label: string; color: string } | null> = {
  "Limpeza de Emergência": { label: "URGENTE", color: "bg-orange-500/15 text-orange-600" },
  "Meio Período": { label: "POPULAR", color: "bg-primary/10 text-primary" },
  "Dia Todo": { label: "COMPLETO", color: "bg-emerald-500/15 text-emerald-600" },
  "Pós-Obra": null, // uses PRO badge instead
};

export default function ClientService() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const { data: services, isLoading } = useServices();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      <header className="flex-shrink-0 bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Escolha o serviço</h1>
            <p className="text-xs text-muted-foreground">Selecione o tipo de limpeza ideal para você</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 animate-fade-in">
        {!services || services.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum serviço disponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => {
              const IconComp = iconMap[(service as any).icon] || Sparkles;
              const tag = tagMap[service.name];
              const isSelected = selectedService === service.id;
              const isProOnly = (service as any).requires_pro_plan;

              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={cn(
                    "w-full p-4 rounded-2xl border text-left transition-all duration-200",
                    "hover:shadow-md active:scale-[0.99]",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                      : "border-border bg-card shadow-sm hover:border-primary/30"
                  )}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                      isSelected ? "bg-primary/15" : "bg-muted/60"
                    )}>
                      <IconComp className={cn("w-5 h-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-foreground text-[15px]">{service.name}</h3>

                        {isProOnly && (
                          <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-600 rounded text-[10px] font-bold flex items-center gap-0.5 uppercase tracking-wide">
                            <Crown className="w-3 h-3" /> PRO
                          </span>
                        )}

                        {tag && !isProOnly && (
                          <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide", tag.color)}>
                            {tag.label}
                          </span>
                        )}

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center ml-auto shrink-0">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground leading-snug mb-2 line-clamp-2">
                        {service.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{service.duration_hours}h estimadas</span>
                        </div>
                        <p className="text-lg font-bold text-primary">
                          R$ {Number(service.base_price).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <div className="flex-shrink-0 p-4 bg-card border-t border-border safe-bottom">
        <PrimaryButton
          fullWidth
          disabled={!selectedService}
          onClick={() => navigate("/client/schedule", { state: { serviceId: selectedService } })}
        >
          Continuar
        </PrimaryButton>
      </div>
    </div>
  );
}
