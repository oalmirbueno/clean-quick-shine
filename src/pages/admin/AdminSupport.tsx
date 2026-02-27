import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { TicketCard } from "@/components/ui/TicketCard";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Tab = "all" | "open" | "in_progress" | "resolved";

export default function AdminSupport() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const { data: tickets = [] } = useQuery({
    queryKey: ["admin_support_tickets"],
    queryFn: async () => {
      const { data } = await supabase
        .from("support_tickets")
        .select("*, profiles!support_tickets_user_id_fkey(full_name)")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const filteredTickets = tickets.filter((ticket: any) => {
    if (activeTab === "all") return true;
    return ticket.status === activeTab;
  });

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "Todos", count: tickets.length },
    { id: "open", label: "Abertos", count: tickets.filter((t: any) => t.status === "open").length },
    { id: "in_progress", label: "Em andamento", count: tickets.filter((t: any) => t.status === "in_progress").length },
    { id: "resolved", label: "Resolvidos", count: tickets.filter((t: any) => t.status === "resolved").length },
  ];

  return (
    <div className="min-h-screen bg-background safe-top">
      <AdminSidebar />
      <main className="lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Suporte</h1>
            <p className="text-muted-foreground">Central de tickets e mediação</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}>
                {tab.label}
                <span className="ml-2 px-1.5 py-0.5 bg-background/20 rounded text-xs">{tab.count}</span>
              </button>
            ))}
          </div>

          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhum ticket encontrado</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTickets.map((ticket: any) => (
                <TicketCard
                  key={ticket.id}
                  id={ticket.id}
                  subject={ticket.subject}
                  createdBy={ticket.profiles?.full_name || "Usuário"}
                  status={ticket.status}
                  priority={ticket.priority || "low"}
                  createdAt={ticket.created_at}
                  lastMessage={ticket.description}
                  orderId={ticket.order_id?.slice(0, 8)}
                  onClick={() => navigate(`/admin/support/${ticket.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
