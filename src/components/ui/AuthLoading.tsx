import { cn } from "@/lib/utils";
import logoIcon from "@/assets/logo-icon.png";

interface AuthLoadingProps {
  message?: string;
  className?: string;
}

export function AuthLoading({ 
  message = "Carregando...", 
  className 
}: AuthLoadingProps) {
  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col items-center justify-center p-6",
      className
    )}>
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* Animated Logo Container */}
        <div className="relative">
          {/* Logo with subtle animation */}
          <div className="relative animate-pulse" style={{ animationDuration: '2s' }}>
            <img 
              src={logoIcon} 
              alt="JáLimpo" 
              className="w-24 h-24"
            />
          </div>
        </div>

        {/* Loading text with fade */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-medium text-foreground">{message}</p>
          
          {/* Animated dots */}
          <div className="flex gap-1.5">
            <span 
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: '0ms', animationDuration: '0.6s' }}
            />
            <span 
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: '150ms', animationDuration: '0.6s' }}
            />
            <span 
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: '300ms', animationDuration: '0.6s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
