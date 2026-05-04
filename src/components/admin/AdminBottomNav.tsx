import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, UserCheck, Users, ArrowDownToLine, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, FileCheck, Tag, Wrench, Building2, HeadphonesIcon, BarChart3, Shield, Settings, LogOut, X, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const primary = [
  { icon: LayoutDashboard, label: "Início", path: "/admin/dashboard" },
  { icon: ClipboardList, label: "Pedidos", path: "/admin/orders" },
  { icon: UserCheck, label: "Diaristas", path: "/admin/pros" },
  { icon: Users, label: "Clientes", path: "/admin/clients" },
  { icon: ArrowDownToLine, label: "Saques", path: "/admin/withdrawals" },
];

const moreItems = [
  { icon: FileCheck, label: "Documentos", path: "/admin/documents" },
  { icon: Tag, label: "Cupons", path: "/admin/coupons" },
  { icon: Wrench, label: "Serviços", path: "/admin/services" },
  { icon: Building2, label: "Orçamentos", path: "/admin/quotes" },
  { icon: HeadphonesIcon, label: "Suporte", path: "/admin/support" },
  { icon: Bell, label: "Notificações", path: "/admin/notifications" },
  { icon: Shield, label: "Auditoria", path: "/admin/audit" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  { icon: Shield, label: "Risco", path: "/admin/risk" },
  { icon: Settings, label: "Configurações", path: "/admin/settings" },
];

export function AdminBottomNav() {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Bottom Nav (mobile only) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t liquid-glass-bar"
        style={{ paddingBottom: "var(--bottom-nav-safe-area, 0px)" }}
      >
        <div className="grid grid-cols-6 h-16">
          {primary.map((item) => {
            const active = pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <button
            onClick={() => setOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
              moreItems.some((i) => pathname.startsWith(i.path)) ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span>Mais</span>
          </button>
        </div>
      </nav>

      {/* "More" sheet */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div
            className="absolute bottom-0 left-0 right-0 liquid-glass liquid-glass-sheet p-5 animate-slide-in-from-bottom"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <Logo size="sm" />
              <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              {moreItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-xs font-medium border border-border/60 transition-colors",
                    pathname.startsWith(item.path) ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/40 text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-center leading-tight">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="border-t border-border/60 pt-3 space-y-1.5">
              <p className="px-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Acessar como</p>
              <Link
                to="/client/home"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Eye className="w-4 h-4" /> Ver como Cliente
              </Link>
              <Link
                to="/pro/home"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Eye className="w-4 h-4" /> Ver como Diarista
              </Link>
              <button
                onClick={async () => { setOpen(false); await signOut(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
