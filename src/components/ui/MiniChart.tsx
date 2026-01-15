import { cn } from "@/lib/utils";

interface MiniChartProps {
  data: number[];
  height?: number;
  color?: string;
  className?: string;
}

export function MiniChart({ data, height = 60, color = "bg-primary", className }: MiniChartProps) {
  const max = Math.max(...data);
  
  return (
    <div className={cn("flex items-end gap-1", className)} style={{ height }}>
      {data.map((value, index) => (
        <div
          key={index}
          className={cn("flex-1 rounded-t transition-all", color)}
          style={{ 
            height: value > 0 ? `${(value / max) * 100}%` : "4px",
            minHeight: "4px",
            opacity: 0.3 + (index / data.length) * 0.7
          }}
        />
      ))}
    </div>
  );
}
