import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { MapMock } from "@/components/ui/MapMock";
import { ChevronRight, Radio, MapPin, Clock, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { mockPro, zones } from "@/lib/mockDataV3";

export default function ProAvailability() {
  const navigate = useNavigate();
  const pro = mockPro;
  const [isAvailable, setIsAvailable] = useState(pro.isAvailableNow || false);

  const proZones = zones.filter(z => pro.zoneIds.includes(z.id));

  const handleToggle = () => {
    setIsAvailable(!isAvailable);
    toast.success(isAvailable ? "Você está offline" : "Você está disponível para pedidos!");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-lg">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-lg font-semibold">Disponibilidade</h1>
        </div>
      </header>

      <main className="p-4 space-y-6 animate-fade-in">
        {/* Toggle Card */}
        <button
          onClick={handleToggle}
          className={`w-full p-5 rounded-xl border-2 transition-all ${
            isAvailable 
              ? "bg-success/10 border-success" 
              : "bg-card border-border"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                isAvailable ? "bg-success" : "bg-muted"
              }`}>
                <Radio className={`w-7 h-7 ${isAvailable ? "text-white animate-pulse" : "text-muted-foreground"}`} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-lg text-foreground">
                  {isAvailable ? "Você está online" : "Você está offline"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isAvailable ? "Recebendo pedidos na sua área" : "Toque para ficar disponível"}
                </p>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full p-1 transition-colors ${
              isAvailable ? "bg-success" : "bg-muted"
            }`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                isAvailable ? "translate-x-5" : "translate-x-0"
              }`} />
            </div>
          </div>
        </button>

        {/* Map */}
        <MapMock
          centerLat={pro.currentLat || -23.5634}
          centerLng={pro.currentLng || -46.6542}
          showRadius
          radius={pro.radiusKm / 3}
          markers={isAvailable ? [
            { id: "1", lat: -23.5680, lng: -46.6600, type: "pro", label: "Você" }
          ] : []}
        />

        {/* Zones */}
        <section>
          <h3 className="font-semibold text-foreground mb-3">Suas zonas de atendimento</h3>
          <div className="space-y-2">
            {proZones.map((zone) => (
              <div key={zone.id} className="p-3 bg-card rounded-lg border border-border flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{zone.name}</p>
                  <p className="text-xs text-muted-foreground">Raio: {zone.radiusKm}km</p>
                </div>
                {zone.feeExtra > 0 && (
                  <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                    +R$ {zone.feeExtra}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        {isAvailable && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 text-center">
              <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-xs text-muted-foreground">Pedidos disponíveis</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border text-center">
              <Clock className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">~8min</p>
              <p className="text-xs text-muted-foreground">Tempo médio espera</p>
            </div>
          </div>
        )}
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
