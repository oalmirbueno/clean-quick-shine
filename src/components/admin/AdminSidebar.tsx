import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
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
  X
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: ClipboardList, label: "Pedidos", path: "/admin/orders" },
  { icon: UserCheck, label: "Diaristas", path: "/admin/pros" },
  { icon: FileCheck, label: "Documentos", path: "/admin/documents" },
  { icon: Users, label: "Clientes", path: "/admin/clients" },
  { icon: Tag, label: "Cupons", path: "/admin/coupons" },
  { icon: HeadphonesIcon, label: "Suporte", path: "/admin/support" },
  { icon: Settings, label: "Configurações", path: "/admin/settings" },
];

export function AdminSidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const NavContent = () => (
    <>
      <div className="p-4 border-b border-border">
        <Logo size="sm" />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link
          to="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-40 flex items-center px-4 safe-top">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Logo size="sm" className="ml-3" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-card border-r border-border z-50",
        "flex flex-col transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <NavContent />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r border-border">
        <NavContent />
      </div>
    </>
  );
}
