import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ChevronLeft, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TicketWithProfile {
  id: string;
  subject: string;
  description: string;
  status: string;
  user_id: string;
  order_id: string | null;
  created_at: string;
  profile_name: string;
}

export default function AdminSupportDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");

  const { data: ticket } = useQuery<TicketWithProfile | null>({
    queryKey: ["admin_ticket", id],
    queryFn: async () => {
      const { data } = await supabase.from("support_tickets").select("*").eq("id", id!).single();
      if (data) {
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_id", data.user_id).single();
        return { ...data, profile_name: profile?.full_name || "Usuário" } as TicketWithProfile;
      }
      return null;
    },
    enabled: !!id,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["admin_ticket_messages", id],
    queryFn: async () => {
      const { data } = await supabase.from("support_messages").select("*").eq("ticket_id", id!).order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!id,
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("support_messages").insert({ ticket_id: id!, message: newMessage, is_admin: true });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mensagem enviada!");
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["admin_ticket_messages", id] });
    },
  });

  if (!ticket) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Ticket não encontrado</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">{ticket.subject}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">{ticket.profile_name}</span>
            {ticket.order_id && <><span className="text-muted-foreground">•</span><span className="text-sm text-muted-foreground">Pedido #{ticket.order_id.slice(0, 8)}</span></>}
          </div>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="flex flex-col">
          <div className="flex-1 space-y-4 min-h-[300px]">
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-xl bg-muted rounded-bl-none">
                <p className="text-xs font-medium mb-1 text-muted-foreground">{ticket.profile_name}</p>
                <p className="text-sm text-foreground">{ticket.description}</p>
                <p className="text-xs mt-1 text-muted-foreground">{new Date(ticket.created_at).toLocaleString("pt-BR")}</p>
              </div>
            </div>
            {messages.map((message: any) => (
              <div key={message.id} className={cn("flex", message.is_admin ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] p-3 rounded-xl", message.is_admin ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none")}>
                  <p className="text-xs font-medium mb-1 opacity-70">{message.is_admin ? "Admin" : "Usuário"}</p>
                  <p className="text-sm">{message.message}</p>
                  <p className="text-xs mt-1 opacity-50">{new Date(message.created_at).toLocaleString("pt-BR")}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-border mt-4">
            <div className="flex gap-2">
              <input type="text" placeholder="Digite sua resposta..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && newMessage.trim() && sendMessage.mutate()} className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              <PrimaryButton onClick={() => newMessage.trim() && sendMessage.mutate()} disabled={!newMessage.trim()}><Send className="w-4 h-4" /></PrimaryButton>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 card-shadow h-fit space-y-4">
          <h3 className="font-semibold text-foreground">Ações</h3>
          <PrimaryButton fullWidth variant="outline" onClick={() => { supabase.from("support_tickets").update({ status: "resolved" as any, resolved_at: new Date().toISOString() }).eq("id", id!).then(() => { toast.success("Ticket resolvido"); queryClient.invalidateQueries({ queryKey: ["admin_ticket", id] }); }); }}>
            Marcar como resolvido
          </PrimaryButton>
        </div>
      </div>
    </AdminLayout>
  );
}
