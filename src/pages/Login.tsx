import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { User, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type UserType = "client" | "pro" | null;

export default function Login() {
  const navigate = useNavigate();
  const { signIn, refreshRoles } = useAuth();
  const [userType, setUserType] = useState<UserType>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error, roles } = await signIn(email, password);
    
    if (error) {
      toast.error(error.message === "Invalid login credentials" 
        ? "Email ou senha incorretos" 
        : error.message);
      setLoading(false);
      return;
    }

    toast.success("Login realizado com sucesso!");
    
    // Se não tem role, adicionar baseado na seleção do usuário
    let finalRoles = roles || [];
    if (finalRoles.length === 0 && userType) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const selectedRole = userType as "client" | "pro";
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: userData.user.id, role: selectedRole });
        
        if (!roleError) {
          finalRoles = [selectedRole];
          await refreshRoles();
        }
      }
    }
    
    // Navegar baseado na role real ou seleção
    if (finalRoles.includes("admin")) {
      navigate("/admin/dashboard");
    } else if (finalRoles.includes("client")) {
      navigate("/client/home");
    } else if (finalRoles.includes("pro")) {
      navigate("/pro/home");
    } else if (userType) {
      // Fallback para seleção do usuário
      navigate(userType === "client" ? "/client/home" : "/pro/home");
    } else {
      toast.error("Erro ao determinar tipo de conta");
    }
    setLoading(false);
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-12">
            <Logo size="lg" className="justify-center mb-4" />
            <p className="text-muted-foreground">
              Limpeza de qualidade a um clique
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setUserType("client")}
              className="w-full p-5 bg-card rounded-xl border border-border card-shadow
                hover:card-shadow-hover hover:border-primary/20 transition-all duration-200
                flex items-center gap-4 active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Sou Cliente</h3>
                <p className="text-sm text-muted-foreground">
                  Quero contratar limpeza
                </p>
              </div>
            </button>

            <button
              onClick={() => setUserType("pro")}
              className="w-full p-5 bg-card rounded-xl border border-border card-shadow
                hover:card-shadow-hover hover:border-primary/20 transition-all duration-200
                flex items-center gap-4 active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Sou Diarista</h3>
                <p className="text-sm text-muted-foreground">
                  Quero oferecer meus serviços
                </p>
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Não tem conta?{" "}
            <button 
              onClick={() => navigate("/register")}
              className="text-primary font-medium hover:underline"
            >
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in">
        <button
          onClick={() => setUserType(null)}
          className="text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          ← Voltar
        </button>

        <div className="text-center mb-8">
          <Logo size="md" className="justify-center mb-4" />
          <h1 className="text-xl font-semibold text-foreground">
            {userType === "client" ? "Entrar como Cliente" : "Entrar como Diarista"}
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <InputField
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <InputField
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <PrimaryButton type="submit" fullWidth loading={loading}>
            Entrar
          </PrimaryButton>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Não tem conta?{" "}
          <button 
            onClick={() => navigate("/register")}
            className="text-primary font-medium hover:underline"
          >
            Cadastre-se
          </button>
        </p>
      </div>
    </div>
  );
}
