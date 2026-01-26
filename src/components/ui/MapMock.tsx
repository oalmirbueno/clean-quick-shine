import { cn } from "@/lib/utils";
import { MapPin, Navigation, User } from "lucide-react";

interface MapMockProps {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  height?: string;
  radiusKm?: number;
  markers?: Array<{
    id?: string;
    lat: number;
    lng: number;
    type?: "user" | "pro" | "address";
    label?: string;
  }>;
  radius?: number;
  showRadius?: boolean;
  className?: string;
  onClick?: () => void;
}

export function MapMock({
  centerLat = -23.5634,
  centerLng = -46.6542,
  markers = [],
  radius = 5,
  radiusKm,
  showRadius = false,
  height,
  className,
  onClick,
}: MapMockProps) {
  const effectiveRadius = radiusKm || radius;
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative w-full bg-secondary/30 rounded-xl overflow-hidden border border-border",
        "cursor-pointer hover:border-primary/30 transition-colors",
        !height && "aspect-[16/10]",
        className
      )}
      style={height ? { height } : undefined}
    >
      {/* Grid pattern to simulate map */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Mock streets */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-muted-foreground/20" />
        <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-muted-foreground/20" />
        <div className="absolute left-1/4 top-0 bottom-0 w-0.5 bg-muted-foreground/20" />
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-muted-foreground/20" />
        <div className="absolute left-3/4 top-0 bottom-0 w-0.5 bg-muted-foreground/20" />
      </div>

      {/* Radius circle */}
      {(showRadius || radiusKm) && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div 
            className="rounded-full border-2 border-primary/30 bg-primary/5"
            style={{ width: `${effectiveRadius * 30}px`, height: `${effectiveRadius * 30}px` }}
          />
        </div>
      )}

      {/* Center marker (current location) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="relative">
          <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
          <div className="absolute inset-0 w-4 h-4 bg-primary/30 rounded-full animate-ping" />
        </div>
      </div>

      {/* Markers */}
      {markers.map((marker, index) => {
        // Simple positioning based on relative lat/lng difference
        const offsetX = (marker.lng - centerLng) * 500;
        const offsetY = (centerLat - marker.lat) * 500;
        const markerType = marker.type || "user";
        
        return (
          <div
            key={marker.id || `marker-${index}`}
            className="absolute z-20"
            style={{
              left: `calc(50% + ${offsetX}px)`,
              top: `calc(50% + ${offsetY}px)`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {markerType === "pro" ? (
              <div className="relative group">
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <User className="w-4 h-4 text-white" />
                </div>
                {marker.label && (
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium bg-card px-2 py-0.5 rounded shadow whitespace-nowrap">
                    {marker.label}
                  </span>
                )}
              </div>
            ) : markerType === "address" ? (
              <div className="relative">
                <MapPin className="w-8 h-8 text-destructive drop-shadow-lg" />
              </div>
            ) : (
              <div className="w-3 h-3 bg-primary rounded-full" />
            )}
          </div>
        );
      })}

      {/* Map controls mock */}
      <div className="absolute top-3 right-3 flex flex-col gap-2">
        <button className="w-8 h-8 bg-card rounded-lg shadow-md flex items-center justify-center hover:bg-secondary transition-colors">
          <span className="text-lg font-medium">+</span>
        </button>
        <button className="w-8 h-8 bg-card rounded-lg shadow-md flex items-center justify-center hover:bg-secondary transition-colors">
          <span className="text-lg font-medium">−</span>
        </button>
      </div>

      {/* Current location button */}
      <button className="absolute bottom-3 right-3 w-10 h-10 bg-card rounded-lg shadow-md flex items-center justify-center hover:bg-secondary transition-colors">
        <Navigation className="w-5 h-5 text-primary" />
      </button>

      {/* Coordinates display */}
      <div className="absolute bottom-3 left-3 px-2 py-1 bg-card/80 rounded text-xs text-muted-foreground">
        {centerLat.toFixed(4)}, {centerLng.toFixed(4)}
      </div>
    </div>
  );
}
