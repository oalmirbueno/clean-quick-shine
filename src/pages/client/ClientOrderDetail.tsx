import { useNavigate, useParams } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BottomNav } from "@/components/ui/BottomNav";
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
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="size-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-foreground leading-tight">Detalhes do pedido</h1>
            <p className="text-xs text-muted-foreground">#{order.id.slice(0, 8)}</p>
          </div>
          <StatusBadge status={order.status || "scheduled"} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 animate-fade-in">
        <div className="p-4 space-y-3">
          {/* Pro Card */}
          {order.pro_id && (
            <section className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={proAvatar}
                    alt={proName}
                    className="size-14 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  {order.pro_profile?.verified && (
                    <div className="absolute -bottom-1 -right-1 size-5 bg-primary rounded-full flex items-center justify-center ring-2 ring-card">
                      <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{proName}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                    <span>{order.pro_profile?.rating?.toFixed(1) || "5.0"}</span>
                    <span>•</span>
                    <span>{order.pro_profile?.jobs_done || 0} serviços</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/chat/order/${order.id}?as=client`)}
                  className="size-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                  aria-label="Abrir chat"
                >
                  <MessageCircle className="w-5 h-5 text-primary" />
                </button>
              </div>
            </section>
          )}

          {/* Service */}
          <section className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Serviço</p>
            <p className="font-semibold text-foreground text-lg leading-tight">{order.service?.name || "Serviço"}</p>
            {order.service?.description && (
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{order.service.description}</p>
            )}
            <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Duração estimada de <span className="text-foreground font-medium">{order.duration_hours}h</span></span>
            </div>
          </section>

          {/* Date & Address */}
          <section className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Calendar className="w-4.5 h-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Data e horário</p>
                <p className="text-foreground font-medium capitalize">{formatDate(order.scheduled_date)}</p>
                <p className="text-sm text-muted-foreground">às {formatTime(order.scheduled_time)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pt-3 border-t border-border/50">
              <div className="size-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <MapPin className="w-4.5 h-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Endereço</p>
                {order.address?.label && (
                  <p className="text-foreground font-medium">{order.address.label}</p>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">{formatAddress()}</p>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Pagamento</p>
            </div>
            <div className="space-y-2 text-sm">
              {order.base_price && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Valor base</span>
                  <span className="text-foreground">R$ {Number(order.base_price).toFixed(2).replace(".", ",")}</span>
                </div>
              )}
              {order.zone_fee && Number(order.zone_fee) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Taxa da zona</span>
                  <span className="text-foreground">R$ {Number(order.zone_fee).toFixed(2).replace(".", ",")}</span>
                </div>
              )}
              {order.discount && Number(order.discount) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Desconto</span>
                  <span className="text-primary">-R$ {Number(order.discount).toFixed(2).replace(".", ",")}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <span className="text-foreground font-medium">Total</span>
                <span className="text-xl font-bold text-foreground">
                  R$ {Number(order.total_price).toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </section>

          {/* Rating */}
          {order.client_rating && (
            <section className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Sua avaliação</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${star <= order.client_rating! ? "fill-warning text-warning" : "text-border"}`}
                  />
                ))}
              </div>
              {order.client_review && (
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed italic">"{order.client_review}"</p>
              )}
            </section>
          )}

          {/* Refund */}
          {payment?.status === "refunded" && (
            <section className="p-4 rounded-2xl border border-primary/25 bg-primary/5">
              <div className="flex items-start gap-3 mb-3">
                <div className="size-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">Pedido estornado</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Reembolso de R$ {Number(order.total_price).toFixed(2).replace(".", ",")} processado.
                    Retorno em até 7 dias úteis.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownloadReceipt}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Baixar comprovante (PDF)
              </button>
            </section>
          )}

          {/* Support */}
          <button
            onClick={() => navigate("/client/support")}
            className="w-full p-4 rounded-2xl border border-border/60 bg-card flex items-center gap-3 hover:bg-secondary/60 transition-colors active:scale-[0.99]"
          >
            <div className="size-9 rounded-full bg-secondary flex items-center justify-center">
              <HelpCircle className="w-4.5 h-4.5 text-muted-foreground" />
            </div>
            <span className="font-medium text-foreground text-sm flex-1 text-left">Preciso de ajuda</span>
            <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
          </button>
        </div>
      </main>

      {/* Bottom Action */}
      {order.status && ["confirmed", "en_route", "in_progress"].includes(order.status) && (
        <div className="p-4 bg-card/95 backdrop-blur-md border-t border-border/60 safe-bottom">
          <PrimaryButton
            fullWidth
            onClick={() => navigate("/client/order-tracking", { state: { orderId: order.id } })}
          >
            Acompanhar pedido
          </PrimaryButton>
        </div>
      )}

      {order.status === "completed" && !order.client_rating && (
        <div className="p-4 bg-card/95 backdrop-blur-md border-t border-border/60 safe-bottom">
          <PrimaryButton
            fullWidth
            onClick={() => navigate("/client/rating", { state: { orderId: order.id } })}
          >
            Avaliar serviço
          </PrimaryButton>
        </div>
      )}

      <BottomNav variant="client" />
    </div>
  );
}
