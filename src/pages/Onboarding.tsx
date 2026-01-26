import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { User, Briefcase } from "lucide-react";
import heroCleanerImg from "@/assets/hero-cleaner-bg.png";

export default function Onboarding() {
  const navigate = useNavigate();

  return (
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
              onClick={() => navigate("/onboarding/client")}
              className="w-full p-5 bg-card/90 backdrop-blur-sm rounded-xl border border-border card-shadow
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
              className="w-full p-5 bg-card/90 backdrop-blur-sm rounded-xl border border-border card-shadow
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
    </div>
  );
}
