import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { User, Briefcase } from "lucide-react";
import heroCleanerImg from "@/assets/hero-cleaner-bg.png";

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden fixed inset-0">
      {/* Hero Section with Image */}
      <div className="relative flex-shrink-0 bg-gradient-to-b from-primary/10 to-background pt-8 pb-2">
        <div className="flex flex-col items-center">
          <Logo size="xl" className="mb-2" />
          <p className="text-muted-foreground text-sm">
            Limpeza de qualidade a um clique
          </p>
        </div>
        
        {/* Hero Image */}
        <div className="flex justify-center mt-2">
          <img 
            src={heroCleanerImg} 
            alt="Profissional de limpeza" 
            className="h-40 w-auto object-contain drop-shadow-lg"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-6">
        <div className="w-full max-w-sm mx-auto animate-fade-in space-y-3">
          <button
            onClick={() => navigate("/onboarding/client")}
            className="w-full p-4 bg-card rounded-xl border border-border card-shadow
              hover:card-shadow-hover hover:border-primary/20 transition-all duration-200
              flex items-center gap-4 active:scale-[0.98]"
          >
            <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
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
            className="w-full p-4 bg-card rounded-xl border border-border card-shadow
              hover:card-shadow-hover hover:border-primary/20 transition-all duration-200
              flex items-center gap-4 active:scale-[0.98]"
          >
            <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-foreground">Quero trabalhar como diarista</h3>
              <p className="text-sm text-muted-foreground">
                Ganhe dinheiro com seus serviços
              </p>
            </div>
          </button>

          <p className="text-center text-sm text-muted-foreground pt-4">
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
    </div>
  );
}
