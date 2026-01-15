import { cn } from "@/lib/utils";

interface BreakdownItem {
  label: string;
  value: number;
  highlight?: boolean;
  negative?: boolean;
}

interface MoneyBreakdownProps {
  items: BreakdownItem[];
  total: number;
  totalLabel?: string;
  className?: string;
}

export function MoneyBreakdown({ items, total, totalLabel = "Total", className }: MoneyBreakdownProps) {
  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, index) => (
        <div 
          key={index}
          className={cn(
            "flex items-center justify-between text-sm",
            item.highlight && "font-medium"
          )}
        >
          <span className="text-muted-foreground">{item.label}</span>
          <span className={cn(
            item.negative ? "text-success" : "text-foreground"
          )}>
            {item.negative ? "-" : ""}{formatCurrency(Math.abs(item.value))}
          </span>
        </div>
      ))}
      <div className="pt-3 mt-3 border-t border-border flex items-center justify-between">
        <span className="font-semibold text-foreground">{totalLabel}</span>
        <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
