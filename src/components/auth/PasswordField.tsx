import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { InputField } from "@/components/ui/InputField";
import { cn } from "@/lib/utils";

interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

/**
 * Password input with show/hide toggle. Reuses InputField for visual consistency.
 */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label = "Senha", error, className, ...props }, ref) => {
    const [show, setShow] = useState(false);
    return (
      <div className="relative">
        <InputField
          ref={ref}
          label={label}
          type={show ? "text" : "password"}
          error={error}
          className={cn("pr-11", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          className={cn(
            "absolute right-3 text-muted-foreground hover:text-foreground transition-colors",
            label ? "top-[38px]" : "top-1/2 -translate-y-1/2"
          )}
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    );
  }
);

PasswordField.displayName = "PasswordField";
