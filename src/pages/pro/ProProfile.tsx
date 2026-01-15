import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { ChevronRight, User, MapPin, Calendar, Settings, LogOut, HelpCircle, CheckCircle2 } from "lucide-react";
import { mockPro, mockProProfile } from "@/lib/mockData";

const menuItems = [
  { icon: User, label: "Dados pessoais", path: "#personal" },
  { icon: MapPin, label: "Área de atendimento", path: "#area", value: `${mockProProfile.radiusKm} km` },
  { icon: Calendar, label: "Disponibilidade", path: "#availability" },
  { icon: Settings, label: "Configurações", path: "#settings" },
  { icon: HelpCircle, label: "Ajuda e suporte", path: "#help" },
];

export default function ProProfile() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={mockProProfile.avatar}
              alt={mockProProfile.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
            />
            {mockProProfile.verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center border-2 border-background">
                <CheckCircle2 className="w-4 h-4 text-success-foreground" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {mockProProfile.name}
            </h1>
            <p className="text-muted-foreground">{mockPro.email}</p>
            {mockProProfile.verified && (
              <span className="inline-flex items-center gap-1 text-xs text-success font-medium mt-1">
                <CheckCircle2 className="w-3 h-3" />
                Profissional verificada
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 animate-fade-in">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-card rounded-xl border border-border p-3 text-center card-shadow">
            <p className="text-xl font-bold text-foreground">⭐ {mockProProfile.ratingAvg}</p>
            <p className="text-xs text-muted-foreground">Nota</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 text-center card-shadow">
            <p className="text-xl font-bold text-foreground">{mockProProfile.jobsDone}</p>
            <p className="text-xs text-muted-foreground">Serviços</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 text-center card-shadow">
            <p className="text-xl font-bold text-foreground">{mockProProfile.acceptanceRate}%</p>
            <p className="text-xs text-muted-foreground">Aceitação</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-card rounded-xl border border-border overflow-hidden card-shadow">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              className={`w-full p-4 flex items-center gap-4 hover:bg-secondary transition-colors
                ${index !== menuItems.length - 1 ? "border-b border-border" : ""}`}
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="flex-1 text-left font-medium text-foreground">
                {item.label}
              </span>
              {item.value && (
                <span className="text-sm text-muted-foreground">
                  {item.value}
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
          LimpaJá v1.0.0
        </p>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
