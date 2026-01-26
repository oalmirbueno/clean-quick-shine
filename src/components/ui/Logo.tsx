import { cn } from "@/lib/utils";
import logoIcon from "@/assets/logo-icon.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  iconOnly?: boolean;
}

const sizes = {
  sm: { icon: "w-8 h-8", text: "text-lg" },
  md: { icon: "w-10 h-10", text: "text-2xl" },
  lg: { icon: "w-14 h-14", text: "text-4xl" },
};

export function Logo({ size = "md", className, iconOnly = false }: LogoProps) {
  const { icon, text } = sizes[size];
  
  if (iconOnly) {
    return (
      <img 
        src={logoIcon} 
        alt="LimpaJá" 
        className={cn(icon, className)}
      />
    );
  }
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src={logoIcon} 
        alt="LimpaJá" 
        className={icon}
      />
      <span className={cn(text, "font-bold text-foreground tracking-tight")}>
        Limpa<span className="text-primary">Já</span>
      </span>
    </div>
  );
}
