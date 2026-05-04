import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  UserCheck, 
  Tag, 
  HeadphonesIcon,
  FileCheck,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Shield,
  Building2,
  Eye,
  ArrowDownToLine,
  Wrench,
  Bell,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: ClipboardList, label: "Pedidos", path: "/admin/orders" },
  { icon: UserCheck, label: "Diaristas", path: "/admin/pros" },
  { icon: FileCheck, label: "Documentos", path: "/admin/documents" },
  { icon: Users, label: "Clientes", path: "/admin/clients" },
  { icon: Tag, label: "Cupons", path: "/admin/coupons" },
  { icon: ArrowDownToLine, label: "Saques", path: "/admin/withdrawals" },
  { icon: Wrench, label: "Serviços", path: "/admin/services" },
  { icon: Building2, label: "Orçamentos", path: "/admin/quotes" },
  { icon: HeadphonesIcon, label: "Suporte", path: "/admin/support" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  { icon: Shield, label: "Risco", path: "/admin/risk" },
  { icon: Settings, label: "Configurações", path: "/admin/settings" },
];

export function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const NavContent = () => (
    <>
      <div className="p-4 border-b border-border">
        <Logo size="sm" />
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm",
                isActive 
                  ? "bg-primary text-primary-foreground font-semibold" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Acessar como</p>
        <Link
          to="/client/home"
          onClick={() => setIsOpen(false)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Eye className="w-4 h-4 shrink-0" />
          <span>Ver como Cliente</span>
        </Link>
        <Link
          to="/pro/home"
          onClick={() => setIsOpen(false)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Eye className="w-4 h-4 shrink-0" />
          <span>Ver como Diarista</span>
        </Link>
      </div>

      <div className="p-3 border-t border-border">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Sair</span>
        </button>
      </div>
    </>
  );

  // Hide on mobile (mobile uses AdminBottomNav). Sidebar is desktop-only now.
  void isOpen; void setIsOpen;
  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-background border-r border-border">
      <NavContent />
    </div>
  );
}
