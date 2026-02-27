import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, ClipboardList, User, Calendar, Wallet, LayoutDashboard, Users, Settings } from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface BottomNavProps {
  variant: "client" | "pro" | "admin";
}

const clientItems: NavItem[] = [
  { icon: <Home className="w-5 h-5" />, label: "Início", path: "/client/home" },
  { icon: <ClipboardList className="w-5 h-5" />, label: "Pedidos", path: "/client/orders" },
  { icon: <User className="w-5 h-5" />, label: "Perfil", path: "/client/profile" },
];

const proItems: NavItem[] = [
  { icon: <Home className="w-5 h-5" />, label: "Início", path: "/pro/home" },
  { icon: <Calendar className="w-5 h-5" />, label: "Agenda", path: "/pro/agenda" },
  { icon: <Wallet className="w-5 h-5" />, label: "Ganhos", path: "/pro/earnings" },
  { icon: <User className="w-5 h-5" />, label: "Perfil", path: "/pro/profile" },
];

const adminItems: NavItem[] = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: "Início", path: "/admin/dashboard" },
  { icon: <Users className="w-5 h-5" />, label: "Clientes", path: "/admin/clients" },
  { icon: <Settings className="w-5 h-5" />, label: "Config", path: "/admin/settings" },
];

export function BottomNav({ variant }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const items =
    variant === "client" ? clientItems : variant === "pro" ? proItems : adminItems;

  const gridCols = items.length === 4 ? "grid-cols-4" : "grid-cols-3";

  return (
    <nav
      className="shrink-0 w-full border-t border-border/30"
      style={{ background: "hsl(var(--card))" }}
    >
      <div
        className="max-w-lg mx-auto px-1"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div
          className={cn("grid", gridCols)}
          style={{ height: "56px" }}
        >
          {items.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-all",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.icon}
                <span className="text-xs font-medium leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
