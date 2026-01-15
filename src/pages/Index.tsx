import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Splash screen - redirect after animation
    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="animate-scale-in">
        <Logo size="lg" className="justify-center mb-6" />
        <p className="text-center text-muted-foreground animate-fade-in">
          Limpeza de qualidade a um clique
        </p>
      </div>
      
      {/* Loading indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
