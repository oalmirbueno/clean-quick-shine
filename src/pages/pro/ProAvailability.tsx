import { motion } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { ProPageHeader } from "@/components/ui/ProPageHeader";
import { MapMock } from "@/components/ui/MapMock";
import { Radio, MapPin, Clock, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function ProAvailability() {
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
      <ProPageHeader title="Disponibilidade" subtitle="Controle quando receber pedidos" />

      <main className="flex-1 overflow-y-auto min-h-0">
        <motion.div variants={container} initial="hidden" animate="show" className="px-5 pb-6 space-y-4">
          <motion.button
            variants={item}
            onClick={() => toggleAvailability.mutate()}
            className={cn(
              "w-full p-5 rounded-2xl border transition-all shadow-sm text-left",
              isAvailable ? "bg-success/10 border-success/40" : "bg-card border-border/60"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  isAvailable ? "bg-success" : "bg-muted"
                )}>
                  <Radio className={cn("w-5 h-5", isAvailable ? "text-white animate-pulse" : "text-muted-foreground")} />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-foreground">
                    {isAvailable ? "Você está online" : "Você está offline"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isAvailable ? "Recebendo pedidos na sua área" : "Toque para ficar disponível"}
                  </p>
                </div>
              </div>
              <div className={cn("w-11 h-6 rounded-full p-0.5 transition-colors shrink-0", isAvailable ? "bg-success" : "bg-muted")}>
                <div className={cn("w-5 h-5 rounded-full bg-white shadow transition-transform", isAvailable ? "translate-x-5" : "translate-x-0")} />
              </div>
            </div>
          </motion.button>

          <motion.div variants={item} className="rounded-2xl overflow-hidden border border-border/60 shadow-sm">
            <MapMock
              centerLat={proProfile?.current_lat ? Number(proProfile.current_lat) : -23.5634}
              centerLng={proProfile?.current_lng ? Number(proProfile.current_lng) : -46.6542}
              showRadius
              radius={(proProfile?.radius_km ? Number(proProfile.radius_km) : 10) / 3}
              markers={isAvailable ? [{ id: "1", lat: -23.5680, lng: -46.6600, type: "pro", label: "Você" }] : []}
            />
          </motion.div>

          <motion.section variants={item}>
            <h3 className="text-sm font-bold text-foreground mb-2.5">Suas zonas de atendimento</h3>
            <div className="space-y-2">
              {proZones.map((zone: any) => (
                <div key={zone.id} className="p-3.5 bg-card rounded-2xl border border-border/60 shadow-sm flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{zone.name}</p>
                    <p className="text-xs text-muted-foreground">Raio: {zone.radius_km || 5}km</p>
                  </div>
                  {(zone.fee_extra || 0) > 0 && (
                    <span className="px-2 py-0.5 bg-success/10 text-success text-[10px] font-semibold rounded-full">
                      +R$ {zone.fee_extra}
                    </span>
                  )}
                </div>
              ))}
              {proZones.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6 bg-card rounded-2xl border border-border/60">
                  Nenhuma zona cadastrada
                </p>
              )}
            </div>
          </motion.section>

          {isAvailable && (
            <motion.div variants={item} className="grid grid-cols-2 gap-2.5">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 text-center">
                <Zap className="w-5 h-5 text-primary mx-auto mb-1.5" />
                <p className="text-lg font-bold text-foreground leading-none">-</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mt-1.5">Pedidos</p>
              </div>
              <div className="p-4 bg-card rounded-2xl border border-border/60 text-center shadow-sm">
                <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-1.5" />
                <p className="text-lg font-bold text-foreground leading-none">-</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mt-1.5">Espera</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
