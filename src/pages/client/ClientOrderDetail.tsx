import { useNavigate, useParams } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ChevronLeft, Calendar, Clock, MapPin, CreditCard, MessageCircle, HelpCircle, Loader2, Star, CheckCircle2, Download, RefreshCw } from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { downloadRefundReceipt, buildProtocol } from "@/lib/refundReceipt";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

function extractRefundReason(notes: string | null | undefined): string | undefined {
  if (!notes) return undefined;
  const m = notes.match(/\[ESTORNO (?:ADMIN|MANUAL)\]\s*(.+)$/s);
  return m ? m[1].trim() : undefined;
}

function formatMethod(method: string | null | undefined): string | null {
  if (!method) return null;
  const map: Record<string, string> = { PIX: "PIX", CREDIT_CARD: "Cartão de crédito", BOLETO: "Boleto" };
  return map[method.toUpperCase()] || method;
}

export default function ClientOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { data: order, isLoading } = useOrder(id || null);

  const { data: payment } = useQuery({
    queryKey: ["client_order_payment", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("order_id", id!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!id,
  });

  const { data: profile } = useQuery({
    queryKey: ["client_profile_for_receipt", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, cpf")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const handleDownloadReceipt = async () => {
    if (!order || !payment) return;
    try {
      const refundDate = payment.updated_at ? new Date(payment.updated_at) : new Date();
      await downloadRefundReceipt({
        orderId: order.id,
        protocol: buildProtocol(order.id, refundDate),
        refundDate,
        clientName: profile?.full_name || "Cliente",
        clientCpf: profile?.cpf || null,
        serviceName: order.service?.name || "Serviço",
        scheduledDate: `${order.scheduled_date} às ${order.scheduled_time}`,
        amount: Number(order.total_price),
        reason: extractRefundReason(order.notes as any),
        asaasTransactionId: payment.asaas_payment_id,
        paymentMethod: formatMethod(payment.method),
      });
      toast.success("Comprovante baixado");
    } catch {
      toast.error("Erro ao gerar comprovante");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  const formatAddress = () => {
    if (!order?.address) return "Endereço não informado";
    const addr = order.address;
    return `${addr.street}, ${addr.number}${addr.complement ? ` - ${addr.complement}` : ""}, ${addr.neighborhood}, ${addr.city} - ${addr.state}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Pedido não encontrado</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground">Este pedido não existe ou você não tem permissão para visualizá-lo.</p>
        </main>
      </div>
    );
  }

  const proAvatar = order.pro_profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.pro_id}`;
  const proName = order.pro_profile?.full_name || "Profissional";

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">
              Detalhes do pedido
            </h1>
            <p className="text-sm text-muted-foreground">#{order.id.slice(0, 8)}</p>
          </div>
          <StatusBadge status={order.status || "scheduled"} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-4 animate-fade-in">
        {/* Pro Info */}
        {order.pro_id && (
          <section className="p-4 border-b border-border">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Profissional</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={proAvatar}
                  alt={proName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
                {order.pro_profile?.verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-success-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{proName}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-warning text-warning" />
                  <span>{order.pro_profile?.rating?.toFixed(1) || "5.0"}</span>
                  <span>•</span>
                  <span>{order.pro_profile?.jobs_done || 0} serviços</span>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </section>
        )}

        {/* Service Details */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Serviço</h2>
          <p className="font-semibold text-foreground text-lg">{order.service?.name || "Serviço"}</p>
          {order.service?.description && (
            <p className="text-sm text-muted-foreground mt-1">{order.service.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Duração estimada: {order.duration_hours}h
          </p>
        </section>

        {/* Date & Time */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Data e horário</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground capitalize">{formatDate(order.scheduled_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{formatTime(order.scheduled_time)}</span>
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Endereço</h2>
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              {order.address?.label && (
                <p className="font-medium text-foreground mb-1">{order.address.label}</p>
              )}
              <p className="text-foreground">{formatAddress()}</p>
            </div>
          </div>
        </section>

        {/* Payment */}
        <section className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Pagamento</h2>
          <div className="space-y-2">
            {order.base_price && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Valor base</span>
                <span className="text-foreground">R$ {Number(order.base_price).toFixed(2).replace(".", ",")}</span>
              </div>
            )}
            {order.zone_fee && Number(order.zone_fee) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Taxa da zona</span>
                <span className="text-foreground">R$ {Number(order.zone_fee).toFixed(2).replace(".", ",")}</span>
              </div>
            )}
            {order.discount && Number(order.discount) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Desconto</span>
                <span className="text-success">-R$ {Number(order.discount).toFixed(2).replace(".", ",")}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">Total</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                R$ {Number(order.total_price).toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>
        </section>

        {/* Rating (if completed) */}
        {order.client_rating && (
          <section className="p-4 border-b border-border">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Sua avaliação</h2>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${star <= order.client_rating! ? "fill-warning text-warning" : "text-muted"}`}
                />
              ))}
            </div>
            {order.client_review && (
              <p className="text-sm text-muted-foreground mt-2">"{order.client_review}"</p>
            )}
          </section>
        )}

        {/* Refund receipt */}
        {payment?.status === "refunded" && (
          <section className="p-4 border-t border-border">
            <div className="rounded-2xl border border-success/30 bg-success/5 p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">Pedido estornado</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Reembolso de R$ {Number(order.total_price).toFixed(2).replace(".", ",")} processado.
                    Retorno em até 7 dias úteis.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownloadReceipt}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-success text-success-foreground hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar comprovante (PDF)
              </button>
            </div>
          </section>
        )}

        {/* Support */}
        <section className="p-4">
          <button
            onClick={() => navigate("/client/support")}
            className="w-full p-4 rounded-xl border border-border bg-card flex items-center gap-3 hover:bg-secondary transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Suporte</span>
          </button>
        </section>
      </main>

      {/* Bottom Action - Show for confirmed/en_route/in_progress */}
      {order.status && ["confirmed", "en_route", "in_progress"].includes(order.status) && (
        <div className="p-4 bg-card border-t border-border">
          <PrimaryButton
            fullWidth
            onClick={() => navigate("/client/order-tracking", { state: { orderId: order.id } })}
          >
            Acompanhar pedido
          </PrimaryButton>
        </div>
      )}

      {/* Rate button for completed orders without rating */}
      {order.status === "completed" && !order.client_rating && (
        <div className="p-4 bg-card border-t border-border">
          <PrimaryButton
            fullWidth
            onClick={() => navigate("/client/rating", { state: { orderId: order.id } })}
          >
            Avaliar serviço
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
