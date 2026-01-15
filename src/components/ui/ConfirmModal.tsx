import { cn } from "@/lib/utils";
import { AlertTriangle, X } from "lucide-react";
import { PrimaryButton } from "./PrimaryButton";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    warning: "bg-warning text-warning-foreground hover:bg-warning/90",
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-xl border border-border p-6 w-full max-w-md card-shadow animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-4">
          {variant !== "default" && (
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
              variant === "danger" ? "bg-destructive/10" : "bg-warning/10"
            )}>
              <AlertTriangle className={cn(
                "w-5 h-5",
                variant === "danger" ? "text-destructive" : "text-warning"
              )} />
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <PrimaryButton
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </PrimaryButton>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg font-medium transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              variantStyles[variant]
            )}
          >
            {loading ? "Aguarde..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
