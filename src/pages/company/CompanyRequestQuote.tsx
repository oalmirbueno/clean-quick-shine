import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ChevronLeft, Building2, MapPin, Calendar, Clock, FileText, CheckCircle, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CompanyRequestQuote() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: "",
    frequency: "",
    addresses: 1,
    estimatedHours: 4,
    notes: "",
  });

  const serviceTypes = [
    { id: "office", label: "Escritório", icon: Building2 },
    { id: "retail", label: "Loja", icon: Building2 },
    { id: "warehouse", label: "Galpão", icon: Building2 },
    { id: "clinic", label: "Clínica", icon: Building2 },
  ];

  const frequencies = [
    { id: "daily", label: "Diário" },
    { id: "weekly", label: "Semanal" },
    { id: "biweekly", label: "Quinzenal" },
    { id: "monthly", label: "Mensal" },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitted(true);
    setLoading(false);
    toast.success("Solicitação enviada com sucesso!");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center safe-top">
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-6 animate-fade-in">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Orçamento solicitado!</h1>
        <p className="text-muted-foreground mb-4">
          Nossa equipe comercial entrará em contato em até 24 horas úteis.
        </p>
        <div className="p-4 bg-accent rounded-xl text-sm text-left w-full max-w-sm mb-8">
          <p className="font-medium text-foreground mb-2">Próximos passos:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>1. Análise da sua necessidade</li>
            <li>2. Proposta personalizada</li>
            <li>3. Alocação de profissionais</li>
            <li>4. Início do serviço</li>
          </ul>
        </div>
        <PrimaryButton onClick={() => navigate("/client/home")} fullWidth>
          Voltar ao início
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 safe-top">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <Logo size="sm" iconOnly />
        </div>
      </header>

      <main className="p-4 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Solicitar orçamento
          </h1>
          <p className="text-muted-foreground">
            Conte-nos sobre sua necessidade de limpeza comercial.
          </p>
        </div>

        {/* Service Type */}
        <section>
          <h3 className="font-medium text-foreground mb-3">Tipo de estabelecimento</h3>
          <div className="grid grid-cols-2 gap-3">
            {serviceTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setFormData({...formData, serviceType: type.id})}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    formData.serviceType === type.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-accent"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 mb-2",
                    formData.serviceType === type.id ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="font-medium text-foreground">{type.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Frequency */}
        <section>
          <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Repeat className="w-4 h-4" /> Frequência
          </h3>
          <div className="flex flex-wrap gap-2">
            {frequencies.map((freq) => (
              <button
                key={freq.id}
                onClick={() => setFormData({...formData, frequency: freq.id})}
                className={cn(
                  "px-4 py-2 rounded-full border transition-all",
                  formData.frequency === freq.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-accent"
                )}
              >
                {freq.label}
              </button>
            ))}
          </div>
        </section>

        {/* Addresses */}
        <section>
          <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Quantos endereços?
          </h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFormData({...formData, addresses: Math.max(1, formData.addresses - 1)})}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-accent"
            >
              -
            </button>
            <span className="text-2xl font-bold text-foreground w-12 text-center">
              {formData.addresses}
            </span>
            <button
              onClick={() => setFormData({...formData, addresses: formData.addresses + 1})}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-accent"
            >
              +
            </button>
          </div>
        </section>

        {/* Estimated Hours */}
        <section>
          <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Horas estimadas por visita
          </h3>
          <div className="flex flex-wrap gap-2">
            {[2, 4, 6, 8, 12].map((hours) => (
              <button
                key={hours}
                onClick={() => setFormData({...formData, estimatedHours: hours})}
                className={cn(
                  "px-4 py-2 rounded-full border transition-all",
                  formData.estimatedHours === hours
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-accent"
                )}
              >
                {hours}h
              </button>
            ))}
          </div>
        </section>

        {/* Notes */}
        <section>
          <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Observações (opcional)
          </h3>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Descreva necessidades específicas, materiais especiais, etc."
            className="w-full p-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </section>

        {/* Estimate */}
        {formData.serviceType && formData.frequency && (
          <div className="p-4 bg-accent rounded-xl">
            <p className="text-sm text-muted-foreground mb-1">Estimativa</p>
            <p className="text-2xl font-bold text-foreground">
              A partir de R$ {(formData.estimatedHours * 50 * formData.addresses).toFixed(2).replace(".", ",")}
              <span className="text-sm font-normal text-muted-foreground">/visita</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              * Valor final após análise comercial
            </p>
          </div>
        )}

        <PrimaryButton
          fullWidth
          loading={loading}
          onClick={handleSubmit}
          disabled={!formData.serviceType || !formData.frequency}
        >
          Enviar solicitação
        </PrimaryButton>
      </main>
    </div>
  );
}
