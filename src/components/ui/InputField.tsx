import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full py-3 rounded-xl border border-border/50 bg-background",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "transition-all duration-200",
              icon ? "pl-10 pr-4" : "px-4",
              error && "border-destructive focus:ring-destructive/20 focus:border-destructive",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";
