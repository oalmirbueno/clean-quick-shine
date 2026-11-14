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
  Activity,
  UserCog,
  ShieldCheck,
  Map,
  CreditCard,
  MessageCircle,
  Target,
  Calculator,
} from "lucide-react";
import { useState } from "react";

const menuGroups = [
  {
    title: "Operação",
    items: [
      { icon: LayoutDashboard, label: "Início", path: "/admin/dashboard" },
      { icon: ClipboardList, label: "Pedidos", path: "/admin/orders" },
      { icon: Map, label: "Mapa", path: "/admin/map" },
      { icon: HeadphonesIcon, label: "Suporte", path: "/admin/support" },
    ],
  },
  {
    title: "Pessoas",
    items: [
      { icon: UserCheck, label: "Diaristas", path: "/admin/pros" },
      { icon: Users, label: "Clientes", path: "/admin/clients" },
      { icon: ShieldCheck, label: "Verificações", path: "/admin/verifications" },
      { icon: FileCheck, label: "Documentos", path: "/admin/documents" },
      { icon: UserCog, label: "Usuários", path: "/admin/users" },
    ],
  },
  {
    title: "Dinheiro",
    items: [
      { icon: ArrowDownToLine, label: "Saques", path: "/admin/withdrawals" },
      { icon: Target, label: "Metas", path: "/admin/goals" },
      { icon: CreditCard, label: "Planos", path: "/admin/plans" },
      { icon: Calculator, label: "Calculadora de planos", path: "/admin/calculator" },
      { icon: Tag, label: "Cupons", path: "/admin/coupons" },
      { icon: Wrench, label: "Serviços e preços", path: "/admin/services" },
      { icon: Building2, label: "Orçamentos", path: "/admin/quotes" },
    ],
  },
  {
    title: "Comunicação",
    items: [
      { icon: MessageCircle, label: "Grupos WhatsApp", path: "/admin/groups" },
      { icon: Bell, label: "Notificações", path: "/admin/notifications" },
      { icon: Activity, label: "Logs de envio", path: "/admin/notification-logs" },
    ],
  },
  {
    title: "Controle",
    items: [
      { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
      { icon: Shield, label: "Risco", path: "/admin/risk" },
      { icon: Eye, label: "Auditoria", path: "/admin/audit" },
      { icon: Settings, label: "Configurações", path: "/admin/settings" },
    ],
  },
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

      <nav className="flex-1 min-h-0 p-3 space-y-4 overflow-y-auto overscroll-contain">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-0.5">
            <p className="px-3 pb-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{group.title}</p>
            {group.items.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-sm",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-[18px] h-[18px] shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
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
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 liquid-glass-bar border-r">
      <NavContent />
    </div>
  );
}
