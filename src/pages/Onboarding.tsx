import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { User, Briefcase } from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Logo size="xl" />
          </div>
          <p className="text-muted-foreground text-lg">
            Limpeza de qualidade a um clique
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/onboarding/client")}
            className="w-full p-5 bg-card rounded-xl border border-border card-shadow
              hover:card-shadow-hover hover:border-primary/20 transition-all duration-200
              flex items-center gap-4 active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-foreground">Quero contratar limpeza</h3>
              <p className="text-sm text-muted-foreground">
                Encontre profissionais qualificadas
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate("/onboarding/pro")}
            className="w-full p-5 bg-card rounded-xl border border-border card-shadow
              hover:card-shadow-hover hover:border-primary/20 transition-all duration-200
              flex items-center gap-4 active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-foreground">Quero trabalhar como diarista</h3>
              <p className="text-sm text-muted-foreground">
                Ganhe dinheiro com seus serviços
              </p>
            </div>
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Já tem conta?{" "}
          <button 
            onClick={() => navigate("/login")}
            className="text-primary font-medium hover:underline"
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}
