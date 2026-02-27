import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PageTransition } from "@/components/ui/PageTransition";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { BottomNav } from "@/components/ui/BottomNav";
import { useService } from "@/hooks/useServices";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import { ArrowLeft, Star, UserCheck, Clock, Calendar, Loader2 } from "lucide-react";
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
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Dados da oferta não encontrados</p>
            <PrimaryButton onClick={() => navigate("/client/home")}>Voltar ao início</PrimaryButton>
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
      console.error("Erro ao criar pedido:", error);
      toast.error(error?.message || "Erro ao criar pedido");
      setIsCreating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Oferta de serviço</h1>
          </div>
        </header>

        <main className="p-4 space-y-4">
          {/* Card da Profissional */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {state.proName?.charAt(0)?.toUpperCase() || "P"}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-lg">{state.proName}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {state.proRating?.toFixed(1) || "5.0"}
                  </span>
                  {state.proJobsDone !== undefined && (
                    <>
                      <span>•</span>
                      <span>{state.proJobsDone} serviços</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-primary">
              <UserCheck className="w-3.5 h-3.5" />
              Profissional verificada
            </div>
          </div>

          {/* Detalhes do Serviço */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Detalhes do serviço</h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{service?.name || "Serviço"}</p>
                  <p className="text-xs text-muted-foreground">{service?.description || ""}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{formatDate(state.date)}</p>
                  <p className="text-xs text-muted-foreground">às {state.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Duração estimada</p>
                  <p className="text-xs text-muted-foreground">{service?.duration_hours || 0} horas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preço */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Valor total</span>
              <span className="text-2xl font-bold text-foreground">
                R$ {(Number(service?.base_price) || 0).toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>

          {/* Botões */}
          <div className="space-y-3 pt-2">
            <PrimaryButton
              className="w-full"
              onClick={handleAccept}
              disabled={isCreating}
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando pedido...
                </span>
              ) : (
                "Aceitar e pagar"
              )}
            </PrimaryButton>

            <PrimaryButton
              variant="outline"
              className="w-full"
              onClick={() => navigate("/client/home")}
              disabled={isCreating}
            >
              Recusar
            </PrimaryButton>
          </div>
        </main>

        <BottomNav variant="client" />
      </div>
    </PageTransition>
  );
}
