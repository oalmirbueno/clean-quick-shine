import { cn } from "@/lib/utils";
import logoIcon from "@/assets/logo-icon.png";
import logoFull from "@/assets/logo-full.png";
import logoFullDark from "@/assets/logo-full-dark.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  iconOnly?: boolean;
  /**
   * Variante de contraste. "auto" (default) alterna via classe `dark` do html.
   * "light" força a wordmark colorida (para fundos claros).
   * "dark" força a wordmark negativa (para fundos escuros).
   */
  variant?: "auto" | "light" | "dark";
}

const sizes = {
  sm: { icon: "h-12", full: "h-12" },
  md: { icon: "h-16", full: "h-16" },
  lg: { icon: "h-20", full: "h-20" },
  xl: { icon: "h-32", full: "h-36" },
  "2xl": { icon: "h-44", full: "h-48" },
};

const ALT = "jálimpo";

export function Logo({ size = "md", className, iconOnly = false, variant = "auto" }: LogoProps) {
  const { icon, full } = sizes[size];

  if (iconOnly) {
    return (
      <img
        src={logoIcon}
        alt={ALT}
        className={cn(icon, "w-auto object-contain", className)}
      />
    );
  }

  const base = cn(full, "w-auto object-contain", className);

  if (variant === "dark") {
    return <img src={logoFullDark} alt={ALT} className={base} />;
  }
  if (variant === "light") {
    return <img src={logoFull} alt={ALT} className={base} />;
  }

  // auto — swap via dark mode class
  return (
    <>
      <img src={logoFull} alt={ALT} className={cn(base, "block dark:hidden")} />
      <img src={logoFullDark} alt={ALT} className={cn(base, "hidden dark:block")} />
    </>
  );
}
