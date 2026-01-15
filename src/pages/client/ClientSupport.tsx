import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { InputField } from "@/components/ui/InputField";
import { TicketCard } from "@/components/ui/TicketCard";
import { ChevronLeft, Plus, X } from "lucide-react";
import { supportTickets } from "@/lib/mockDataV2";
import { toast } from "sonner";

export default function ClientSupport() {
  const navigate = useNavigate();
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock: filter tickets for current client
  const clientTickets = supportTickets.filter(t => t.createdByUserId.startsWith("c"));

  const handleSubmit = async () => {
    if (!subject || !message) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Ticket aberto com sucesso!");
    setShowNewTicket(false);
    setSubject("");
    setMessage("");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Suporte</h1>
          </div>
          <button
            onClick={() => setShowNewTicket(true)}
            className="p-2 rounded-lg bg-primary text-primary-foreground"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-4 animate-fade-in">
        {clientTickets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Você não tem tickets abertos</p>
            <PrimaryButton onClick={() => setShowNewTicket(true)}>
              Abrir novo ticket
            </PrimaryButton>
          </div>
        ) : (
          <div className="space-y-3">
            {clientTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                id={ticket.id}
                subject={ticket.subject}
                createdBy="Você"
                status={ticket.status}
                priority={ticket.priority}
                createdAt={ticket.createdAt}
                lastMessage={ticket.lastMessage}
                orderId={ticket.orderId}
              />
            ))}
          </div>
        )}
      </main>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowNewTicket(false)}
          />
          
          <div className="relative bg-card rounded-t-xl sm:rounded-xl border border-border p-6 w-full max-w-md card-shadow animate-slide-up">
            <button
              onClick={() => setShowNewTicket(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <h2 className="text-xl font-bold text-foreground mb-6">Novo ticket</h2>

            <div className="space-y-4">
              <InputField
                label="Assunto"
                placeholder="Descreva brevemente seu problema"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Mensagem
                </label>
                <textarea
                  placeholder="Explique em detalhes..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background
                    text-foreground placeholder:text-muted-foreground resize-none
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <PrimaryButton fullWidth loading={loading} onClick={handleSubmit}>
                Enviar ticket
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      <BottomNav variant="client" />
    </div>
  );
}
