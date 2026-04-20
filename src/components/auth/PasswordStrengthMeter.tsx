import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPasswordStrength } from "@/lib/passwordValidation";

interface PasswordStrengthMeterProps {
  password: string;
  /** Show the per-rule checklist below the bar. */
  showChecklist?: boolean;
}

export function PasswordStrengthMeter({
  password,
  showChecklist = true,
}: PasswordStrengthMeterProps) {
  const { score, label, color, checks } = getPasswordStrength(password);
  const colorMap: Record<typeof color, string> = {
    destructive: "bg-destructive",
    warning: "bg-warning",
    primary: "bg-primary",
    success: "bg-success",
  };
  const textColorMap: Record<typeof color, string> = {
    destructive: "text-destructive",
    warning: "text-warning",
    primary: "text-primary",
    success: "text-success",
  };

  if (!password) return null;

  const items: Array<[keyof typeof checks, string]> = [
    ["length", "8+ caracteres"],
    ["upper", "Maiúscula"],
    ["lower", "Minúscula"],
    ["number", "Número"],
    ["special", "Especial"],
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ opacity: i <= score ? 1 : 0.2 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "h-1.5 rounded-full transition-colors",
                i <= score ? colorMap[color] : "bg-muted"
              )}
            />
          ))}
        </div>
        <span className={cn("text-xs font-semibold", textColorMap[color])}>
          {label}
        </span>
      </div>

      {showChecklist && (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
          {items.map(([key, text]) => {
            const ok = checks[key];
            return (
              <li
                key={key}
                className={cn(
                  "flex items-center gap-1.5 text-[11px]",
                  ok ? "text-success" : "text-muted-foreground"
                )}
              >
                {ok ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <X className="w-3 h-3 opacity-50" />
                )}
                <span>{text}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
