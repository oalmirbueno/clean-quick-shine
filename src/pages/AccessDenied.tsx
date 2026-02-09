import { useLocation, useNavigate } from "react-router-dom";
import { ShieldX, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const AccessDenied = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const userRoles: string[] = location.state?.roles || [];

  const getHomeRoute = () => {
    if (userRoles.includes("admin")) return "/admin/dashboard";
    if (userRoles.includes("client")) return "/client/home";
    if (userRoles.includes("pro")) return "/pro/home";
    return "/login";
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-muted overflow-hidden safe-top safe-bottom">
      <motion.div
        className="text-center p-6 max-w-sm"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
        >
          <ShieldX className="h-8 w-8 text-destructive" />
        </motion.div>
        <motion.h1
          className="mb-2 text-2xl font-bold text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Acesso Negado
        </motion.h1>
        <motion.p
          className="mb-8 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          Você não tem permissão para acessar esta área.
        </motion.p>
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Button onClick={() => navigate(getHomeRoute(), { replace: true })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ir para minha área
          </Button>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair da conta
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AccessDenied;
