import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { Loader2 } from "lucide-react";

export default function ClientMatching() {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate matching progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Navigate to offer after "matching"
    const timeout = setTimeout(() => {
      navigate("/client/offer", { state: location.state });
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate, location.state]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center animate-fade-in">
        <Logo size="lg" className="justify-center mb-8" />
        
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center mx-auto">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <div 
            className="absolute inset-0 w-20 h-20 rounded-full border-4 border-primary border-t-transparent mx-auto animate-spin"
            style={{ animationDuration: "1.5s" }}
          />
        </div>

        <h1 className="text-xl font-semibold text-foreground mb-2">
          Procurando uma profissional disponível…
        </h1>
        <p className="text-muted-foreground mb-6">
          Isso leva menos de 30 segundos.
        </p>

        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-secondary rounded-full mx-auto overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
