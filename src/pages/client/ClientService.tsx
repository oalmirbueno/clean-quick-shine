import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ChevronLeft, Check, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useServices } from "@/hooks/useServices";

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
    <div className="min-h-screen bg-background flex flex-col safe-top">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            Escolha o tipo de limpeza
          </h1>
        </div>
      </header>

      <main className="flex-1 p-4 animate-fade-in">
        {!services || services.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum serviço disponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={cn(
                  "w-full p-4 rounded-xl border text-left transition-all duration-200",
                  "hover:card-shadow-hover active:scale-[0.99]",
                  selectedService === service.id
                    ? "border-primary bg-accent card-shadow-hover"
                    : "border-border bg-card card-shadow hover:border-primary/20"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">
                        {service.name}
                      </h3>
                      {selectedService === service.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration_hours}h estimado</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">A partir de</p>
                    <p className="text-lg font-semibold text-primary">
                      R$ {Number(service.base_price).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Action */}
      <div className="p-4 bg-card border-t border-border">
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
