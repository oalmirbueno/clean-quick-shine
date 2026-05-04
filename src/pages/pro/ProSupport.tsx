import { useState } from "react";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { ProPageHeader } from "@/components/ui/ProPageHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { InputField } from "@/components/ui/InputField";
import { TicketCard } from "@/components/ui/TicketCard";
import { Plus, X, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function ProSupport() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const { data: tickets = [] } = useQuery({
    queryKey: ["pro_tickets", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("support_tickets").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const createTicket = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("support_tickets").insert({ user_id: user!.id, subject, description: message });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ticket aberto com sucesso!");
      setShowNewTicket(false);
      setSubject("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["pro_tickets"] });
    },
    onError: () => toast.error("Erro ao abrir ticket"),
  });

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      <ProPageHeader
        title="Suporte"
        subtitle="Tire dúvidas e abra chamados"
        rightAction={
          <button
            onClick={() => setShowNewTicket(true)}
            className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Novo
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 pb-6"
        >
          {tickets.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border/60 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-foreground font-medium mb-1">Nenhum ticket aberto</p>
              <p className="text-xs text-muted-foreground mb-4">Estamos aqui para ajudar quando precisar</p>
              <PrimaryButton onClick={() => setShowNewTicket(true)}>Abrir novo ticket</PrimaryButton>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket: any) => (
                <TicketCard
                  key={ticket.id}
                  id={ticket.id}
                  subject={ticket.subject}
                  createdBy="Você"
                  status={ticket.status}
                  priority={ticket.priority || "medium"}
                  createdAt={new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                  lastMessage={ticket.description}
                  orderId={ticket.order_id}
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {showNewTicket && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowNewTicket(false)} />
          <div className="relative bg-card rounded-t-xl sm:rounded-xl border border-border p-6 w-full max-w-md card-shadow animate-slide-up">
            <button onClick={() => setShowNewTicket(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
            <h2 className="text-xl font-bold text-foreground mb-6">Novo ticket</h2>
            <div className="space-y-4">
              <InputField label="Assunto" placeholder="Descreva brevemente seu problema" value={subject} onChange={(e) => setSubject(e.target.value)} />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Mensagem</label>
                <textarea placeholder="Explique em detalhes..." value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <PrimaryButton fullWidth loading={createTicket.isPending} onClick={() => createTicket.mutate()}>Enviar ticket</PrimaryButton>
            </div>
          </div>
        </div>
      )}

      <BottomNav variant="pro" />
    </div>
  );
}
