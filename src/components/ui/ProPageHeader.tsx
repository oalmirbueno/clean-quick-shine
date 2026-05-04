import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProPageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  rightAction?: React.ReactNode;
  className?: string;
}

/**
 * Header padrão das telas do app do Pro/Diarista.
 * Visual consistente com ProHome: sem bg-card pesado, premium e clean.
 */
export function ProPageHeader({
  title,
  subtitle,
  showBack = true,
  backTo,
  rightAction,
  className,
}: ProPageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) navigate(backTo);
    else navigate(-1);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("shrink-0 px-5 pt-3 pb-3 flex items-center gap-3", className)}
    >
      {showBack && (
        <button
          onClick={handleBack}
          aria-label="Voltar"
          className="w-10 h-10 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center shrink-0 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-[17px] font-semibold text-foreground leading-tight tracking-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      {rightAction && <div className="shrink-0 flex items-center gap-1">{rightAction}</div>}
    </motion.header>
  );
}
