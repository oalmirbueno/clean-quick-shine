import { cn } from "@/lib/utils";
import { Star, MapPin, CheckCircle2 } from "lucide-react";

interface ProCardProps {
  name: string;
  avatar: string;
  rating: number;
  reviews: number;
  distance: string;
  arrivalTime: string;
  verified?: boolean;
  onConfirm?: () => void;
  onDetails?: () => void;
  className?: string;
}

export function ProCard({
  name,
  avatar,
  rating,
  reviews,
  distance,
  arrivalTime,
  verified = true,
  onConfirm,
  onDetails,
  className,
}: ProCardProps) {
  return (
    <div
      className={cn(
        "p-5 bg-card rounded-xl border border-border card-shadow",
        "animate-scale-in",
        className
      )}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <img
            src={avatar}
            alt={name}
            className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
          />
          {verified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-success-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg">{name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({reviews} avaliações)
            </span>
          </div>
          {verified && (
            <span className="inline-flex items-center gap-1 text-xs text-success font-medium mt-1">
              <CheckCircle2 className="w-3 h-3" />
              Verificada
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{distance}</span>
        </div>
        <span>•</span>
        <span>Chega em {arrivalTime}</span>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={onDetails}
          className="flex-1 py-3 px-4 rounded-lg border border-border text-foreground font-medium
            hover:bg-secondary transition-colors"
        >
          Ver detalhes
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium
            button-shadow hover:opacity-90 transition-opacity"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}
