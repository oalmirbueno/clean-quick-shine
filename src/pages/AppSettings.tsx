import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight,
  Settings,
  Bell,
  BellOff,
  Moon,
  Sun,
  Trash2,
  Download,
  Smartphone,
  Globe,
  Shield,
  HelpCircle,
  LogOut,
  Database,
  RefreshCw,
  Check,
  Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/Logo";

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

function SettingItem({ icon, label, description, action, onClick, danger }: SettingItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors text-left
        ${onClick ? "hover:bg-muted/50 active:bg-muted" : "cursor-default"}
        ${danger ? "text-destructive" : ""}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        danger ? "bg-destructive/10" : "bg-muted"
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${danger ? "text-destructive" : "text-foreground"}`}>{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        )}
      </div>
      {action || (onClick && <ChevronRight className="w-5 h-5 text-muted-foreground" />)}
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <motion.div
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
      />
    </button>
  );
}

export default function AppSettings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, signOut, roles } = useAuth();
  
  const userRole = roles[0] || "client";
  
  const [notifications, setNotifications] = useState(true);
  const [cacheSize, setCacheSize] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(({ usage }) => {
        if (usage) {
          const mb = (usage / (1024 * 1024)).toFixed(2);
          setCacheSize(`${mb} MB`);
        }
      });
    }
    setIsPWA(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      const authData = localStorage.getItem('sb-mdgiviynypoyixpskmpu-auth-token');
      localStorage.clear();
      if (authData) {
        localStorage.setItem('sb-mdgiviynypoyixpskmpu-auth-token', authData);
      }
      setCleared(true);
      setCacheSize("0 MB");
      setTimeout(() => setCleared(false), 2000);
    } catch (error) {
      console.error("Error clearing cache:", error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 bg-background/95 backdrop-blur-md border-b border-border z-10"
      >
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Configurações</h1>
          </div>
        </div>
      </motion.header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-8 safe-bottom">
        {/* App Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Logo size="sm" iconOnly />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-lg">Já Limpo</h2>
            <p className="text-sm text-muted-foreground">Versão 1.0.0</p>
            {isPWA && (
              <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                <Smartphone className="w-3 h-3" />
                App Instalado
              </span>
            )}
          </div>
        </motion.section>

        {/* Appearance */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">Aparência</h3>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <SettingItem
              icon={theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              label="Tema escuro"
              description={theme === "dark" ? "Ativado" : "Desativado"}
              action={<Toggle checked={theme === "dark"} onChange={(v) => setTheme(v ? "dark" : "light")} />}
            />
          </div>
        </motion.section>

        {/* Notifications */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">Notificações</h3>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <SettingItem
              icon={notifications ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              label="Notificações push"
              description={notifications ? "Receber alertas de pedidos" : "Notificações desativadas"}
              action={<Toggle checked={notifications} onChange={setNotifications} />}
            />
          </div>
        </motion.section>

        {/* App & Data */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">App e Dados</h3>
          <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
            <SettingItem
              icon={<Database className="w-5 h-5" />}
              label="Dados em cache"
              description={cacheSize || "Calculando..."}
              action={
                <div className="flex items-center gap-2">
                  {cleared ? (
                    <Check className="w-5 h-5 text-success" />
                  ) : isClearing ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <button onClick={handleClearCache} className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Trash2 className="w-5 h-5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              }
            />
            <SettingItem
              icon={<RefreshCw className="w-5 h-5" />}
              label="Atualizar app"
              description="Verificar nova versão"
              onClick={() => window.location.reload()}
            />
          </div>
        </motion.section>

        {/* Support */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">Suporte</h3>
          <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
            <SettingItem
              icon={<HelpCircle className="w-5 h-5" />}
              label="Central de ajuda"
              description="Dúvidas frequentes"
              onClick={() => navigate(userRole === "pro" ? "/pro/support" : "/client/support")}
            />
            <SettingItem
              icon={<Shield className="w-5 h-5" />}
              label="Privacidade e termos"
              description="Políticas do app"
              onClick={() => {}}
            />
            <SettingItem
              icon={<Globe className="w-5 h-5" />}
              label="Idioma"
              description="Português (Brasil)"
              action={<span className="text-sm text-muted-foreground">PT-BR</span>}
            />
          </div>
        </motion.section>

        {/* Account */}
        {user && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">Conta</h3>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <SettingItem
                icon={<LogOut className="w-5 h-5" />}
                label="Sair da conta"
                description={user.email}
                onClick={handleLogout}
                danger
              />
            </div>
          </motion.section>
        )}

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-center pt-4">
          <p className="text-xs text-muted-foreground">Já Limpo © 2025. Todos os direitos reservados.</p>
        </motion.div>
      </main>
    </div>
  );
}
