import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
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

  const nav = (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/30"
      style={{ background: "hsl(var(--card))" }}
    >
      <div
        className="max-w-lg mx-auto px-1 pt-1"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 4px)" }}
      >
        <div className="grid grid-cols-3 items-end min-h-14">
          {items.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "mx-auto flex flex-col items-center justify-end gap-1 px-4 py-1.5 rounded-xl transition-all",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
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

  return typeof document !== "undefined" ? createPortal(nav, document.body) : null;
}

