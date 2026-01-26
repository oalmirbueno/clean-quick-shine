import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ChevronLeft, Send, DollarSign, AlertTriangle } from "lucide-react";
import { supportTickets, supportMessages } from "@/lib/mockDataV2";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminSupportDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const ticket = supportTickets.find(t => t.id === id);
  const messages = supportMessages.filter(m => m.ticketId === id);
  const [newMessage, setNewMessage] = useState("");

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Ticket não encontrado</p>
      </div>
    );
  }

  const handleSend = () => {
    if (!newMessage.trim()) return;
    toast.success("Mensagem enviada!");
    setNewMessage("");
  };

  const handleRefund = () => {
    toast.success("Reembolso aprovado!");
  };

  const handlePenalize = () => {
    toast.warning("Penalidade registrada para a diarista");
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="lg:ml-64 pt-14 lg:pt-0 flex flex-col h-screen lg:h-auto">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">{ticket.subject}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">{ticket.createdByName}</span>
                {ticket.orderId && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">Pedido #{ticket.orderId}</span>
                  </>
                )}
              </div>
            </div>
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4 lg:p-6 space-y-4 overflow-y-auto">
              {messages.map((message) => {
                const isAdmin = message.senderUserId.startsWith("admin");
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      isAdmin ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[80%] p-3 rounded-xl",
                      isAdmin 
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-secondary text-secondary-foreground rounded-bl-none"
                    )}>
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {message.senderName}
                      </p>
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs mt-1 opacity-50">
                        {new Date(message.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite sua resposta..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background
                    text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <PrimaryButton onClick={handleSend}>
                  <Send className="w-4 h-4" />
                </PrimaryButton>
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="w-full lg:w-72 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-border bg-card space-y-4">
            <h3 className="font-semibold text-foreground">Ações</h3>
            
            <PrimaryButton fullWidth variant="outline" onClick={() => toast.success("Ticket marcado como resolvido")}>
              Marcar como resolvido
            </PrimaryButton>

            {ticket.orderId && (
              <>
                <PrimaryButton fullWidth variant="outline" onClick={handleRefund}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Aprovar reembolso
                </PrimaryButton>

                <PrimaryButton 
                  fullWidth 
                  variant="outline"
                  onClick={handlePenalize}
                  className="text-warning border-warning/20 hover:bg-warning/10"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Penalizar diarista
                </PrimaryButton>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
