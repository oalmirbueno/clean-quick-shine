import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, User, Calendar, Wallet } from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface BottomNavProps {
  variant: "client" | "pro";
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

export function BottomNav({ variant }: BottomNavProps) {
  const location = useLocation();
  const items = variant === "client" ? clientItems : proItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/30 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
