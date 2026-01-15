import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { User, Briefcase } from "lucide-react";

type UserType = "client" | "pro" | null;

export default function Login() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (userType === "client") {
      navigate("/client/home");
    } else {
      navigate("/pro/home");
    }
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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <PrimaryButton variant="outline" fullWidth disabled>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Entrar com Google
        </PrimaryButton>

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
