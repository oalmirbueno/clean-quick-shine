import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { BottomNav } from "@/components/ui/BottomNav";
import { MapMock } from "@/components/ui/MapMock";
import { MapPin, Navigation, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ClientLocation() {
  const navigate = useNavigate();
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [address, setAddress] = useState("");

  const handleUseCurrentLocation = () => {
    setUseCurrentLocation(true);
    toast.success("Localização detectada: Jardins, São Paulo");
    setAddress("Rua Oscar Freire, 300 - Jardins");
  };

  const handleConfirm = () => {
    if (address) {
      navigate("/client/schedule");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-lg">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-lg font-semibold">Seu endereço</h1>
        </div>
      </header>

      <main className="p-4 space-y-4 animate-fade-in">
        <MapMock
          centerLat={-23.5634}
          centerLng={-46.6542}
          showRadius
          radius={3}
          markers={useCurrentLocation ? [
            { id: "1", lat: -23.5634, lng: -46.6542, type: "address" }
          ] : []}
        />

        <button
          onClick={handleUseCurrentLocation}
          className="w-full p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3 hover:bg-primary/10 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Navigation className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground">Usar localização atual</p>
            <p className="text-sm text-muted-foreground">Detectar automaticamente</p>
          </div>
        </button>

        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Digite o endereço"
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {address && (
          <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
            <p className="text-sm text-muted-foreground mb-1">Zona detectada</p>
            <p className="font-medium text-foreground">Jardins - São Paulo/SP</p>
            <p className="text-sm text-success mt-2">✓ 5 profissionais disponíveis próximas</p>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!address}
          className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          Confirmar endereço
        </button>
      </main>

      <BottomNav variant="client" />
    </div>
  );
}
