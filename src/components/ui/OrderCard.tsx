import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { Calendar, MapPin, Clock } from "lucide-react";

type OrderStatus = 
  | "draft" 
  | "scheduled" 
  | "matching" 
  | "confirmed" 
  | "en_route"
  | "in_progress" 
  | "completed" 
  | "rated"
  | "paid_out"
  | "cancelled"
  | "in_review";

interface OrderCardProps {
  id: string;
  service: string;
  date: string;
  time: string;
  address: string;
  status: OrderStatus;
  price: number;
  onClick?: () => void;
  className?: string;
}

export function OrderCard({
  service,
  date,
  time,
  address,
  status,
  price,
  onClick,
  className,
}: OrderCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 bg-card rounded-2xl border border-border",
        "shadow-sm hover:shadow-md transition-all duration-200",
        "hover:border-primary/30 active:scale-[0.99]",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-foreground">{service}</h3>
        <StatusBadge status={status} />
      </div>
      
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{time}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">{address}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-lg font-bold text-foreground">
          R$ {price.toFixed(2).replace(".", ",")}
        </span>
        <span className="text-xs text-primary font-medium">Ver detalhes →</span>
      </div>
    </button>
  );
}
