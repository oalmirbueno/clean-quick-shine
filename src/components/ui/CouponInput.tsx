import { useState } from "react";
import { cn } from "@/lib/utils";
import { Tag, Check, X, Loader2 } from "lucide-react";

interface CouponInputProps {
  onApply: (code: string) => Promise<{ success: boolean; message: string }>;
  appliedCoupon?: { code: string; discount: number };
  onRemove?: () => void;
  className?: string;
}

export function CouponInput({ onApply, appliedCoupon, onRemove, className }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setError("");
    
    const result = await onApply(code.toUpperCase());
    
    setLoading(false);
    
    if (result.success) {
      setCode("");
    } else {
      setError(result.message);
    }
  };

  if (appliedCoupon) {
    return (
      <div className={cn(
        "flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20",
        className
      )}>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-success" />
          <span className="font-medium text-success">{appliedCoupon.code}</span>
          <span className="text-sm text-success">
            -R$ {appliedCoupon.discount.toFixed(2).replace(".", ",")}
          </span>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-1 hover:bg-success/20 rounded transition-colors"
          >
            <X className="w-4 h-4 text-success" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Código do cupom"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background",
              "text-foreground placeholder:text-muted-foreground uppercase",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "transition-all duration-200",
              error ? "border-destructive" : "border-input"
            )}
          />
        </div>
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className={cn(
            "px-4 py-2.5 rounded-lg font-medium transition-all",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
        </button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
