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

/**
 * BottomNav usado dentro das páginas — renderiza apenas o spacer
 * para reservar espaço. A barra fixa real é montada uma única vez
 * em App.tsx via <PersistentBottomNav />, mantendo persistência
 * entre navegações (sem "reiniciar" visual a cada troca de aba).
 */
export const BottomNav = forwardRef<HTMLDivElement, BottomNavProps>(
  function BottomNav(_props, _ref) {
    return (
      <div
        className="bottom-nav-spacer shrink-0 w-full"
        style={{ height: "var(--bottom-nav-height, 56px)" }}
        aria-hidden
      />
    );
  }
);

/**
 * Barra inferior persistente. Renderiza uma única vez no shell do app,
 * detecta a rota e mostra a variante correta. Não desmonta entre
 * navegações, dando sensação fluida de aplicativo nativo.
 */
export function PersistentBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  let variant: "client" | "pro" | null = null;
  if (path.startsWith("/client/")) variant = "client";
  else if (path.startsWith("/pro/")) variant = "pro";
  // Admin usa AdminBottomNav próprio via AdminLayout

  if (!variant) return null;

  // Rotas de fluxos onde a barra inferior atrapalha (checkout, matching, etc.)
  const hideOnPrefixes = [
    "/client/checkout",
    "/client/matching",
    "/client/offer",
    "/client/rating",
    "/client/order-tracking",
    "/client/schedule",
    "/client/service",
    "/client/cancel",
    "/chat/order",
    "/pro/order",
    "/pro/withdraw",
    "/pro/verification",
    "/pro/plan",
    "/pro/support",
    "/pro/quality",
    "/pro/availability",
    "/pro/ranking",
  ];
  if (hideOnPrefixes.some((p) => path.startsWith(p))) return null;

  const items =
    variant === "client" ? clientItems : variant === "pro" ? proItems : adminItems;

  return (
    <nav className="app-bottom-nav fixed inset-x-0 bottom-0 z-50 border-t liquid-glass-bar">
      <div className="max-w-lg mx-auto flex" style={{ height: "var(--bottom-nav-height, 56px)" }}>
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
  );
}
