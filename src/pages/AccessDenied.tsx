import { useLocation, useNavigate } from "react-router-dom";
import { ShieldX, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

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
      <div className="text-center p-6 max-w-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <ShieldX className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Acesso Negado</h1>
        <p className="mb-8 text-muted-foreground">
          Você não tem permissão para acessar esta área.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate(getHomeRoute(), { replace: true })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ir para minha área
          </Button>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
