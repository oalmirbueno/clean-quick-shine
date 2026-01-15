import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { Calendar, MapPin, Clock } from "lucide-react";

type OrderStatus = 
  | "draft" 
  | "scheduled" 
  | "matching" 
  | "confirmed" 
  | "in_progress" 
  | "completed" 
  | "rated";

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
        "w-full text-left p-4 bg-card rounded-xl border border-border",
        "card-shadow hover:card-shadow-hover transition-all duration-200",
        "hover:border-primary/20 active:scale-[0.99]",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-foreground">{service}</h3>
        <StatusBadge status={status} />
      </div>
      
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{date}</span>
          <Clock className="w-4 h-4 ml-2" />
          <span>{time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{address}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-border">
        <span className="text-lg font-semibold text-foreground">
          R$ {price.toFixed(2).replace(".", ",")}
        </span>
      </div>
    </button>
  );
}
