import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { ChevronRight, MapPin, CreditCard, Settings, LogOut, HelpCircle } from "lucide-react";
import { mockUser, mockAddresses } from "@/lib/mockData";

const menuItems = [
  { icon: MapPin, label: "Endereços salvos", path: "#addresses", count: mockAddresses.length },
  { icon: CreditCard, label: "Formas de pagamento", path: "#payment" },
  { icon: Settings, label: "Preferências", path: "#settings" },
  { icon: HelpCircle, label: "Ajuda e suporte", path: "#help" },
];

export default function ClientProfile() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
            {mockUser.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {mockUser.name}
            </h1>
            <p className="text-muted-foreground">{mockUser.email}</p>
          </div>
        </div>
      </header>

      <main className="p-4 animate-fade-in">
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
              {item.count && (
                <span className="px-2 py-0.5 bg-secondary rounded-full text-xs text-muted-foreground">
                  {item.count}
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

      <BottomNav variant="client" />
    </div>
  );
}
