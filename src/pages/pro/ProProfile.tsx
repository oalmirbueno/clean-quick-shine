import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { 
  ChevronRight, 
  User, 
  MapPin, 
  Calendar, 
  Settings, 
  LogOut, 
  HelpCircle, 
  CheckCircle2,
  Shield,
  Crown,
  Wallet
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { icon: User, label: "Dados pessoais", path: "#personal" },
  { icon: Shield, label: "Verificação", path: "/pro/verification" },
  { icon: Crown, label: "Plano", path: "/pro/plan" },
  { icon: MapPin, label: "Área de atendimento", path: "#area" },
  { icon: Calendar, label: "Disponibilidade", path: "/pro/availability" },
  { icon: Wallet, label: "Saque", path: "/pro/withdraw" },
  { icon: HelpCircle, label: "Suporte", path: "/pro/support" },
  { icon: Settings, label: "Configurações", path: "#settings" },
];

export default function ProProfile() {
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

  // Fetch pro profile
  const { data: proProfile } = useQuery({
    queryKey: ["pro_profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("pro_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch pro metrics
  const { data: metrics } = useQuery({
    queryKey: ["pro_metrics", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("pro_metrics")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const userName = profile?.full_name || user?.email?.split("@")[0] || "Profissional";
  const isVerified = proProfile?.verified || false;
  const rating = proProfile?.rating || 5.0;
  const jobsDone = proProfile?.jobs_done || 0;
  const acceptanceRate = metrics?.acceptance_rate || 100;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold border-2 border-primary/20">
              {userName.charAt(0).toUpperCase()}
            </div>
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center border-2 border-background">
                <CheckCircle2 className="w-4 h-4 text-success-foreground" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">
                {userName}
              </h1>
            </div>
            <p className="text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={isVerified ? "approved" : "pending"} />
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 animate-fade-in">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-card rounded-xl border border-border p-3 text-center card-shadow">
            <p className="text-xl font-bold text-foreground">⭐ {rating.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Nota</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 text-center card-shadow">
            <p className="text-xl font-bold text-foreground">{jobsDone}</p>
            <p className="text-xs text-muted-foreground">Serviços</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 text-center card-shadow">
            <p className="text-xl font-bold text-foreground">{acceptanceRate}%</p>
            <p className="text-xs text-muted-foreground">Aceitação</p>
          </div>
        </div>

        {/* Balance */}
        <button
          onClick={() => navigate("/pro/withdraw")}
          className="w-full mb-4 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Saldo disponível</span>
          </div>
          <span className="font-bold text-primary">
            R$ 0,00
          </span>
        </button>

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
          JáLimpo v2.0.0
        </p>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
