import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageTransition } from "@/components/ui/PageTransition";
import { User, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import heroCleanerImg from "@/assets/hero-cleaner-bg.png";

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
    
    try {
      const { error, roles } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message === "Invalid login credentials" 
          ? "Email ou senha incorretos" 
          : error.message);
        return;
      }

      toast.success("Login realizado com sucesso!");
      
      const userRoles = roles || [];
      
      if (userRoles.includes("admin")) {
        navigate("/admin/dashboard");
      } else if (userRoles.includes("client")) {
        navigate("/client/home");
      } else if (userRoles.includes("pro")) {
        navigate("/pro/home");
      } else if (userType) {
        navigate(userType === "client" ? "/client/home" : "/pro/home");
      } else {
        toast.error("Erro ao determinar tipo de conta");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!userType) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col overflow-hidden fixed inset-0">
          {/* Background Image - Right Side */}
          <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
            <img 
              src={heroCleanerImg} 
              alt="" 
              className="h-[70vh] w-auto object-contain"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col justify-center p-6">
            <div className="w-full max-w-sm mx-auto animate-fade-in">
              {/* Logo and Title */}
              <div className="text-center mb-10">
                <div className="flex justify-center mb-4">
                  <Logo size="2xl" />
                </div>
                <p className="text-muted-foreground">
                  Limpeza de qualidade a um clique
                </p>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <button
                  onClick={() => setUserType("client")}
                  className="w-full p-5 bg-card/90 backdrop-blur-sm rounded-xl border border-border card-shadow
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
                  className="w-full p-5 bg-card/90 backdrop-blur-sm rounded-xl border border-border card-shadow
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
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col overflow-hidden fixed inset-0">
        {/* Background Image - Right Side */}
        <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none">
          <img 
            src={heroCleanerImg} 
            alt="" 
            className="h-[60vh] w-auto object-contain"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center p-6">
          <div className="w-full max-w-sm mx-auto animate-fade-in">
            <button
              onClick={() => setUserType(null)}
              className="text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              ← Voltar
            </button>

            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo size="xl" />
              </div>
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

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-primary hover:underline"
              >
                Esqueceu a senha?
              </button>

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
      </div>
    </PageTransition>
  );
}
