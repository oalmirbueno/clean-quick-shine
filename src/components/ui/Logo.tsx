import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { icon: "w-5 h-5", text: "text-lg" },
  md: { icon: "w-7 h-7", text: "text-2xl" },
  lg: { icon: "w-10 h-10", text: "text-4xl" },
};

export function Logo({ size = "md", className }: LogoProps) {
  const { icon, text } = sizes[size];
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className={cn(
          "rounded-xl bg-primary flex items-center justify-center p-1.5",
          size === "sm" && "rounded-lg p-1",
          size === "lg" && "rounded-2xl p-2"
        )}>
          <CheckCircle2 className={cn(icon, "text-primary-foreground")} />
        </div>
      </div>
      <span className={cn(text, "font-bold text-foreground tracking-tight")}>
        Limpa<span className="text-primary">Já</span>
      </span>
    </div>
  );
}
