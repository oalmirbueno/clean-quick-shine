import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { ChevronRight, MapPin, CreditCard, Settings, LogOut, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { icon: MapPin, label: "Endereços salvos", path: "/client/location" },
  { icon: CreditCard, label: "Formas de pagamento", path: "#payment" },
  { icon: Settings, label: "Configurações", path: "/settings" },
  { icon: HelpCircle, label: "Ajuda e suporte", path: "/client/support" },
];

export default function ClientProfile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Fetch user profile
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

  // Fetch addresses count
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

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const userName = profile?.full_name || user?.email?.split("@")[0] || "Usuário";

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      {/* Header */}
      <header className="flex-shrink-0 bg-card border-b border-border p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {userName}
            </h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-contain p-4 animate-fade-in" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Menu Items */}
        <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => item.path.startsWith("/") && navigate(item.path)}
              className={`w-full p-4 flex items-center gap-4 hover:bg-secondary transition-colors
                ${index !== menuItems.length - 1 ? "border-b border-border" : ""}`}
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="flex-1 text-left font-medium text-foreground">
                {item.label}
              </span>
              {item.path === "/client/location" && addresses && addresses.length > 0 && (
                <span className="px-2 py-0.5 bg-secondary rounded-full text-xs text-muted-foreground">
                  {addresses.length}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full mt-4 p-4 bg-card rounded-xl border border-border flex items-center gap-4 
            hover:bg-destructive/5 hover:border-destructive/20 transition-colors card-shadow"
        >
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-destructive" />
          </div>
          <span className="font-medium text-destructive">Sair da conta</span>
        </button>

        {/* App Version */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Já Limpo v1.0.0
        </p>
      </main>

      <BottomNav variant="client" />
    </div>
  );
}
