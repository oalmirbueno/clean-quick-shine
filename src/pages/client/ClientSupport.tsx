import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { InputField } from "@/components/ui/InputField";
import { TicketCard } from "@/components/ui/TicketCard";
import { ChevronLeft, Plus, X, LifeBuoy, MessageCircle, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientSupport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const { data: tickets = [] } = useQuery({
    queryKey: ["client_tickets", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const createTicket = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user!.id,
        subject,
        description: message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ticket aberto com sucesso!");
      setShowNewTicket(false);
      setSubject("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["client_tickets"] });
    },
    onError: () => toast.error("Erro ao abrir ticket"),
  });

  const openCount = tickets.filter((t: any) => t.status !== "closed" && t.status !== "resolved").length;

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
          <div className="flex-1">
            <h1 className="text-base font-semibold text-foreground leading-tight">Suporte</h1>
            <p className="text-xs text-muted-foreground">
              {openCount > 0 ? `${openCount} ticket${openCount > 1 ? "s" : ""} em aberto` : "Estamos aqui para ajudar"}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 animate-fade-in">
        <div className="p-4 space-y-4">
          {/* Quick actions */}
          <section className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowNewTicket(true)}
              className="p-4 rounded-2xl bg-primary text-primary-foreground shadow-sm active:scale-[0.98] transition-all text-left"
            >
              <div className="size-10 rounded-full bg-primary-foreground/15 flex items-center justify-center mb-3">
                <Plus className="w-5 h-5" />
              </div>
              <p className="font-semibold text-sm">Novo ticket</p>
              <p className="text-xs opacity-80 mt-0.5">Fale com o time</p>
            </button>
            <a
              href="https://wa.me/5541999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm active:scale-[0.98] transition-all"
            >
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-sm text-foreground">WhatsApp</p>
              <p className="text-xs text-muted-foreground mt-0.5">Resposta rápida</p>
            </a>
          </section>

          {/* Tickets */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-semibold text-foreground">Meus tickets</h2>
              {tickets.length > 0 && (
                <span className="text-xs text-muted-foreground">{tickets.length} total</span>
              )}
            </div>

            {tickets.length === 0 ? (
              <div className="p-8 bg-card rounded-2xl border border-border/60 flex flex-col items-center text-center">
                <div className="size-14 rounded-full bg-secondary flex items-center justify-center mb-3">
                  <LifeBuoy className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">Nenhum ticket ainda</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-xs">
                  Se tiver qualquer dúvida ou problema, abra um ticket que respondemos rápido.
                </p>
                <PrimaryButton onClick={() => setShowNewTicket(true)}>
                  Abrir primeiro ticket
                </PrimaryButton>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tickets.map((ticket: any, i: number) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <TicketCard
                      id={ticket.id}
                      subject={ticket.subject}
                      createdBy="Você"
                      status={ticket.status}
                      priority={ticket.priority || "medium"}
                      createdAt={new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                      lastMessage={ticket.description}
                      orderId={ticket.order_id}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* FAQ hint */}
          <button
            onClick={() => navigate("/client/help")}
            className="w-full p-4 rounded-2xl border border-border/60 bg-card flex items-center gap-3 hover:bg-secondary/60 transition-colors active:scale-[0.99]"
          >
            <div className="size-9 rounded-full bg-secondary flex items-center justify-center">
              <HelpCircle className="w-4.5 h-4.5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground text-sm">Central de ajuda</p>
              <p className="text-xs text-muted-foreground">Perguntas frequentes</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
          </button>
        </div>
      </main>

      {/* New Ticket Sheet */}
      {showNewTicket && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setShowNewTicket(false)}
          />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative bg-card rounded-t-3xl sm:rounded-3xl border border-border/60 p-6 w-full sm:max-w-md shadow-xl safe-bottom"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-foreground">Novo ticket</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Respondemos em até 24h</p>
              </div>
              <button
                onClick={() => setShowNewTicket(false)}
                className="size-9 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <InputField
                label="Assunto"
                placeholder="Descreva brevemente"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Mensagem</label>
                <textarea
                  placeholder="Explique em detalhes o que está acontecendo..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 rounded-2xl border border-border/60 bg-background text-foreground placeholder:text-muted-foreground resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <PrimaryButton
                fullWidth
                loading={createTicket.isPending}
                disabled={!subject.trim() || !message.trim()}
                onClick={() => createTicket.mutate()}
              >
                Enviar ticket
              </PrimaryButton>
            </div>
          </motion.div>
        </div>
      )}

      <BottomNav variant="client" />
    </div>
  );
}

