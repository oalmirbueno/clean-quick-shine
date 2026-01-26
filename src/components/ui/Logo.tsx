import { cn } from "@/lib/utils";
import logoIcon from "@/assets/logo-icon.png";
import logoFull from "@/assets/logo-full.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  iconOnly?: boolean;
}

const sizes = {
  sm: { icon: "w-8 h-8", full: "h-8" },
  md: { icon: "w-10 h-10", full: "h-10" },
  lg: { icon: "w-14 h-14", full: "h-14" },
  xl: { icon: "w-24 h-24", full: "h-28" },
  "2xl": { icon: "w-32 h-32", full: "h-36" },
};

export function Logo({ size = "md", className, iconOnly = false }: LogoProps) {
  const { icon, full } = sizes[size];
  
  if (iconOnly) {
    return (
      <img 
        src={logoIcon} 
        alt="JáLimpo" 
        className={cn(icon, className)}
      />
    );
  }
  
  return (
    <img 
      src={logoFull} 
      alt="JáLimpo - Chamou, tá limpo" 
      className={cn(full, "w-auto", className)}
    />
  );
}
