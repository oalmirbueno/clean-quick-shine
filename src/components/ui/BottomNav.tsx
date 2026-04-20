import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, ClipboardList, User, Calendar, Wallet, LayoutDashboard, Users, Settings } from "lucide-react";
import { forwardRef } from "react";

interface NavItem {
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
  path: string;
}

interface BottomNavProps {
  variant: "client" | "pro" | "admin";
}

const clientItems: NavItem[] = [
  { icon: <Home className="w-5 h-5" strokeWidth={1.6} />, activeIcon: <Home className="w-5 h-5" strokeWidth={2.2} />, label: "Início", path: "/client/home" },
  { icon: <ClipboardList className="w-5 h-5" strokeWidth={1.6} />, activeIcon: <ClipboardList className="w-5 h-5" strokeWidth={2.2} />, label: "Pedidos", path: "/client/orders" },
  { icon: <User className="w-5 h-5" strokeWidth={1.6} />, activeIcon: <User className="w-5 h-5" strokeWidth={2.2} />, label: "Perfil", path: "/client/profile" },
];

const proItems: NavItem[] = [
  { icon: <Home className="w-5 h-5" strokeWidth={1.6} />, activeIcon: <Home className="w-5 h-5" strokeWidth={2.2} />, label: "Início", path: "/pro/home" },
  { icon: <Calendar className="w-5 h-5" strokeWidth={1.6} />, activeIcon: <Calendar className="w-5 h-5" strokeWidth={2.2} />, label: "Agenda", path: "/pro/agenda" },
  { icon: <Wallet className="w-5 h-5" strokeWidth={1.6} />, activeIcon: <Wallet className="w-5 h-5" strokeWidth={2.2} />, label: "Ganhos", path: "/pro/earnings" },
  { icon: <User className="w-5 h-5" strokeWidth={1.6} />, activeIcon: <User className="w-5 h-5" strokeWidth={2.2} />, label: "Perfil", path: "/pro/profile" },
];

const adminItems: NavItem[] = [
  { icon: <LayoutDashboard className="w-5 h-5" strokeWidth={1.6} />, activeIcon: <LayoutDashboard className="w-5 h-5" strokeWidth={2.2} />, label: "Início", path: "/admin/dashboard" },
  { icon: <Users className="w-5 h-5" strokeWidth={1.6} />, activeIcon: <Users className="w-5 h-5" strokeWidth={2.2} />, label: "Clientes", path: "/admin/clients" },
  { icon: <Settings className="w-5 h-5" strokeWidth={1.6} />, activeIcon: <Settings className="w-5 h-5" strokeWidth={2.2} />, label: "Config", path: "/admin/settings" },
];

export const BottomNav = forwardRef<HTMLDivElement, BottomNavProps>(
  function BottomNav({ variant }, ref) {
    const navigate = useNavigate();
    const location = useLocation();

    const items =
      variant === "client" ? clientItems : variant === "pro" ? proItems : adminItems;

    return (
      <>
        {/* Spacer */}
        <div
          className="shrink-0 w-full"
          style={{ height: "calc(56px + env(safe-area-inset-bottom, 0px))" }}
        />

        <nav
          ref={ref}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border/30 bg-card/95 backdrop-blur-lg"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="max-w-lg mx-auto flex" style={{ height: "56px" }}>
            {items.map((navItem) => {
              const isActive =
                location.pathname === navItem.path ||
                location.pathname.startsWith(`${navItem.path}/`);

              return (
                <button
                  key={navItem.path}
                  onClick={() => navigate(navItem.path)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground active:text-foreground"
                  )}
                >
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[2.5px] rounded-full bg-primary" />
                  )}
                  {isActive ? navItem.activeIcon : navItem.icon}
                  <span className="text-[10px] font-medium leading-none mt-0.5">{navItem.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </>
    );
  }
);
