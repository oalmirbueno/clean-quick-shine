import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/ui/PageTransition";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useService } from "@/hooks/useServices";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Clock,
  Calendar,
  Loader2,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

interface OfferState {
  serviceId: string;
  date: string;
  time: string;
  addressId: string;
  proId: string;
  proName: string;
  proRating: number;
  proJobsDone?: number;
  distanceKm?: number;
}

export default function ClientOffer() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as OfferState | null;
  const [isCreating, setIsCreating] = useState(false);

  const { data: service } = useService(state?.serviceId || null);
  const createOrder = useCreateOrder();

  if (!state?.serviceId || !state?.proId) {
    return (
      <PageTransition>
        <div className="h-full bg-background flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Dados da oferta não encontrados
            </p>
            <PrimaryButton onClick={() => navigate("/client/home")}>
              Voltar ao início
            </PrimaryButton>
          </div>
        </div>
      </PageTransition>
    );
  }

  const handleAccept = async () => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      const result = await createOrder.mutateAsync({
        serviceId: state.serviceId,
        addressId: state.addressId,
        scheduledDate: state.date,
        scheduledTime: state.time,
        proId: state.proId,
      });

      if (result?.orderId) {
        navigate(`/client/checkout?orderId=${result.orderId}`);
      } else {
        toast.error("Erro ao criar pedido. Tente novamente.");
        setIsCreating(false);
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao criar pedido");
      setIsCreating(false);
    }
  };

  const formatDate = (dateInput: string | Date) => {
    try {
      const dateStr =
        dateInput instanceof Date
          ? dateInput.toISOString().split("T")[0]
          : String(dateInput);
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    } catch {
      return String(dateInput);
    }
  };

  const totalPrice = Number(service?.base_price) || 0;

  return (
    <PageTransition>
      <div className="h-full bg-background flex flex-col relative safe-top">
        {/* Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[40%]"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 0%, hsl(var(--primary) / 0.14) 0%, transparent 70%)",
          }}
        />

        {/* Header */}
        <header
          className="relative shrink-0 px-5 pt-3 pb-2 z-10"
          style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}
        >
          <div className="mx-auto max-w-lg flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-card border border-border/60 flex items-center justify-center text-foreground hover:bg-secondary transition-colors shadow-sm"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-[15px] font-semibold text-foreground">
              Sua oferta
            </h1>
          </div>
        </header>

        <main className="relative z-10 flex-1 overflow-y-auto px-5 pb-32">
          <div className="mx-auto max-w-lg space-y-4">
            {/* Hero Pro card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm text-center"
            >
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/25 flex items-center justify-center text-primary font-bold text-4xl">
                  {state.proName?.charAt(0)?.toUpperCase() || "P"}
                </div>
                <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-4 border-card">
                  <ShieldCheck className="w-4 h-4" strokeWidth={2.5} />
                </span>
              </div>

              <h2 className="text-[20px] font-semibold text-foreground leading-tight tracking-tight">
                {state.proName}
              </h2>

              <div className="flex items-center justify-center gap-2 mt-2 text-[13px] text-muted-foreground">
                <span className="inline-flex items-center gap-0.5 text-amber-500 font-semibold">
                  <Star className="w-4 h-4 fill-amber-500" />
                  {state.proRating?.toFixed(1) || "5.0"}
                </span>
                {state.proJobsDone !== undefined && (
                  <>
                    <span>·</span>
                    <span>{state.proJobsDone} serviços</span>
                  </>
                )}
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11.5px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                Profissional verificada
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4"
            >
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Detalhes do serviço
              </p>

              <DetailRow
                icon={Calendar}
                label="Data e hora"
                value={`${formatDate(state.date)} às ${state.time}`}
              />
              <DetailRow
                icon={Clock}
                label="Duração estimada"
                value={`${service?.duration_hours || 0} horas`}
              />
              {state.distanceKm !== undefined && state.distanceKm !== null && (
                <DetailRow
                  icon={MapPin}
                  label="Distância"
                  value={`${state.distanceKm.toFixed(1)} km`}
                />
              )}
            </motion.div>

            {/* Price */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="rounded-2xl border border-primary/25 bg-primary/5 p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                  Valor total
                </p>
                <p className="text-[13px] text-muted-foreground">
                  {service?.name || "Serviço"}
                </p>
              </div>
              <p className="text-[26px] font-bold text-foreground tracking-tight">
                R$ {totalPrice.toFixed(2).replace(".", ",")}
              </p>
            </motion.div>
          </div>
        </main>

        {/* Sticky bottom CTA */}
        <div
          className="shrink-0 px-5 pt-3 pb-5 bg-card/95 backdrop-blur border-t border-border/60"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 20px)" }}
        >
          <div className="mx-auto max-w-lg space-y-2.5">
            <PrimaryButton fullWidth onClick={handleAccept} disabled={isCreating}>
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando pedido...
                </span>
              ) : (
                <>Aceitar e pagar · R$ {totalPrice.toFixed(2).replace(".", ",")}</>
              )}
            </PrimaryButton>
            <button
              onClick={() => navigate("/client/home")}
              disabled={isCreating}
              className="w-full h-11 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              Recusar oferta
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-secondary/70 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-foreground/70" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[11.5px] text-muted-foreground leading-none mb-1">
          {label}
        </p>
        <p className="text-[14px] font-medium text-foreground leading-tight truncate">
          {value}
        </p>
      </div>
    </div>
  );
}
