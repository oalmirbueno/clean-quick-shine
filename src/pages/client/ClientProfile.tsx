import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import {
  ChevronRight,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  HelpCircle,
  BadgeCheck,
  Bell,
  FileText,
  Shield,
} from "lucide-react";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type MenuItem = {
  icon: typeof MapPin;
  label: string;
  hint?: string;
  path: string;
  badge?: string | number;
};

type Section = {
  title: string;
  items: MenuItem[];
};

export default function ClientProfile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: addresses } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("addresses")
        .select("id")
        .eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: orderStats } = useQuery({
    queryKey: ["profile_order_stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0 };
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("client_id", user.id);
      return { total: count || 0 };
    },
    enabled: !!user?.id,
  });

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const userName = profile?.full_name || user?.email?.split("@")[0] || "Usuário";
  const initial = userName.charAt(0).toUpperCase();

  const sections: Section[] = [
    {
      title: "Conta",
      items: [
        {
          icon: MapPin,
          label: "Endereços salvos",
          hint: addresses && addresses.length > 0 ? `${addresses.length} endereço(s)` : "Adicionar",
          path: "/client/location",
          badge: addresses?.length,
        },
        {
          icon: CreditCard,
          label: "Formas de pagamento",
          hint: "Cartão, PIX",
          path: "#payment",
        },
        {
          icon: Bell,
          label: "Notificações",
          hint: "Preferências",
          path: "/settings",
        },
      ],
    },
    {
      title: "Ajuda e legal",
      items: [
        {
          icon: HelpCircle,
          label: "Ajuda e suporte",
          hint: "Fale com a gente",
          path: "/client/support",
        },
        {
          icon: FileText,
          label: "Termos de uso",
          path: "/terms",
        },
        {
          icon: Shield,
          label: "Política de privacidade",
          path: "/privacy",
        },
        {
          icon: Settings,
          label: "Configurações do app",
          path: "/settings",
        },
      ],
    },
  ];

  return (
    <div className="h-full min-h-0 bg-background flex flex-col relative safe-top">
      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[35%]"
        style={{
          background:
            "radial-gradient(90% 60% at 50% 0%, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.03) 50%, transparent 80%)",
        }}
      />

      {/* Header */}
      <header
        className="relative shrink-0 px-5 pt-3 pb-4 z-10"
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}
      >
        <div className="mx-auto max-w-lg">
          <p className="text-[12px] text-muted-foreground leading-none mb-1.5">
            Sua conta
          </p>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground leading-tight">
            Perfil
          </h1>
        </div>
      </header>

      <main className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pb-24">
        <div className="mx-auto max-w-lg space-y-5">
          {/* Identity card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl font-semibold">
                  {initial}
                </div>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-card">
                  <BadgeCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[17px] font-semibold text-foreground leading-tight truncate">
                  {userName}
                </h2>
                <p className="text-[13px] text-muted-foreground truncate mt-0.5">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Mini-stats */}
            <div className="grid grid-cols-3 gap-2 mt-5">
              <Stat label="Pedidos" value={orderStats?.total ?? 0} />
              <Stat label="Endereços" value={addresses?.length ?? 0} />
              <Stat label="Plano" value="Free" />
            </div>
          </motion.div>

          {/* Menu sections */}
          {sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                {section.title}
              </h3>
              <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
                {section.items.map((item, idx) => (
                  <motion.button
                    key={item.label}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => item.path.startsWith("/") && navigate(item.path)}
                    className={cn(
                      "w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-secondary/50 transition-colors",
                      idx !== section.items.length - 1 && "border-b border-border/60",
                    )}
                  >
                    <div className="w-9 h-9 rounded-xl bg-secondary/70 flex items-center justify-center shrink-0">
                      <item.icon className="w-[17px] h-[17px] text-foreground/70" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-foreground leading-tight">
                        {item.label}
                      </p>
                      {item.hint && (
                        <p className="text-[11.5px] text-muted-foreground leading-tight mt-0.5 truncate">
                          {item.hint}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </motion.button>
                ))}
              </div>
            </section>
          ))}

          {/* Logout */}
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={handleLogout}
            className="w-full px-4 py-3.5 rounded-2xl border border-border/60 bg-card flex items-center gap-3 hover:bg-destructive/5 hover:border-destructive/30 transition-colors shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <LogOut className="w-[17px] h-[17px] text-destructive" strokeWidth={2} />
            </div>
            <span className="text-[14px] font-medium text-destructive">Sair da conta</span>
          </motion.button>

          <DeleteAccountButton />

          <p className="text-center text-[11px] text-muted-foreground pt-2">
            jálimpo · v1.0.0
          </p>
        </div>
      </main>

      <BottomNav variant="client" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-secondary/50 border border-border/60 px-3 py-2.5 text-center">
      <p className="text-[16px] font-semibold text-foreground leading-none tracking-tight">
        {value}
      </p>
      <p className="text-[10.5px] text-muted-foreground mt-1 uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}
