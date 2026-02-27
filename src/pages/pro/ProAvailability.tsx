import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { MapMock } from "@/components/ui/MapMock";
import { ChevronRight, Radio, MapPin, Clock, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function ProAvailability() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: proProfile } = useQuery({
    queryKey: ["pro_profile_avail", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("pro_profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: proZones = [] } = useQuery({
    queryKey: ["pro_zones_avail", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("pro_zones").select("*, zones(*)").eq("user_id", user!.id);
      return data?.map((pz: any) => pz.zones).filter(Boolean) || [];
    },
    enabled: !!user,
  });

  const [isAvailable, setIsAvailable] = useState(proProfile?.available_now || false);

  const toggleAvailability = useMutation({
    mutationFn: async () => {
      const newValue = !isAvailable;
      await supabase.from("pro_profiles").update({ available_now: newValue }).eq("user_id", user!.id);
      return newValue;
    },
    onSuccess: (newValue) => {
      setIsAvailable(newValue);
      toast.success(newValue ? "Você está disponível para pedidos!" : "Você está offline");
      queryClient.invalidateQueries({ queryKey: ["pro_profile_avail"] });
    },
  });

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-lg"><ChevronRight className="w-5 h-5 rotate-180" /></button>
          <h1 className="text-lg font-semibold">Disponibilidade</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 animate-fade-in">
        <button onClick={() => toggleAvailability.mutate()} className={`w-full p-5 rounded-xl border-2 transition-all ${isAvailable ? "bg-success/10 border-success" : "bg-card border-border"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isAvailable ? "bg-success" : "bg-muted"}`}>
                <Radio className={`w-7 h-7 ${isAvailable ? "text-white animate-pulse" : "text-muted-foreground"}`} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-lg text-foreground">{isAvailable ? "Você está online" : "Você está offline"}</p>
                <p className="text-sm text-muted-foreground">{isAvailable ? "Recebendo pedidos na sua área" : "Toque para ficar disponível"}</p>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full p-1 transition-colors ${isAvailable ? "bg-success" : "bg-muted"}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${isAvailable ? "translate-x-5" : "translate-x-0"}`} />
            </div>
          </div>
        </button>

        <MapMock
          centerLat={proProfile?.current_lat ? Number(proProfile.current_lat) : -23.5634}
          centerLng={proProfile?.current_lng ? Number(proProfile.current_lng) : -46.6542}
          showRadius
          radius={(proProfile?.radius_km ? Number(proProfile.radius_km) : 10) / 3}
          markers={isAvailable ? [{ id: "1", lat: -23.5680, lng: -46.6600, type: "pro", label: "Você" }] : []}
        />

        <section>
          <h3 className="font-semibold text-foreground mb-3">Suas zonas de atendimento</h3>
          <div className="space-y-2">
            {proZones.map((zone: any) => (
              <div key={zone.id} className="p-3 bg-card rounded-lg border border-border flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{zone.name}</p>
                  <p className="text-xs text-muted-foreground">Raio: {zone.radius_km || 5}km</p>
                </div>
                {(zone.fee_extra || 0) > 0 && <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">+R$ {zone.fee_extra}</span>}
              </div>
            ))}
            {proZones.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma zona cadastrada</p>}
          </div>
        </section>

        {isAvailable && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 text-center">
              <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">-</p>
              <p className="text-xs text-muted-foreground">Pedidos disponíveis</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border text-center">
              <Clock className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">-</p>
              <p className="text-xs text-muted-foreground">Tempo médio espera</p>
            </div>
          </div>
        )}
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
