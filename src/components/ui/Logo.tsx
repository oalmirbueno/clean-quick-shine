import { cn } from "@/lib/utils";
import logoIcon from "@/assets/logo-icon.png";
import logoFull from "@/assets/logo-full.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  iconOnly?: boolean;
}

const sizes = {
  sm: { icon: "h-12", full: "h-12" },
  md: { icon: "h-16", full: "h-16" },
  lg: { icon: "h-20", full: "h-20" },
  xl: { icon: "h-32", full: "h-36" },
  "2xl": { icon: "h-44", full: "h-48" },
};

export function Logo({ size = "md", className, iconOnly = false }: LogoProps) {
  const { icon, full } = sizes[size];
  
  if (iconOnly) {
    return (
      <img 
        src={logoIcon} 
        alt="JáLimpo" 
        className={cn(icon, "w-auto object-contain", className)}
      />
    );
  }
  
  return (
    <img 
      src={logoFull} 
      alt="JáLimpo - Chamou, tá limpo" 
      className={cn(full, "w-auto object-contain", className)}
    />
  );
}
