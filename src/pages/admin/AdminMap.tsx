import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { MapView } from "@/components/ui/MapView";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserCheck, Wifi, WifiOff } from "lucide-react";

const CURITIBA = { lat: -25.4284, lng: -49.2733 };

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Mapa operacional do admin: todas as diaristas (online/offline) e clientes
 * com endereço cadastrado, filtrados pela cidade atendida. Atualiza a cada 15s.
 */
export default function AdminMap() {
  const [cityId, setCityId] = useState<string>("");

  const { data: cities = [] } = useQuery({
    queryKey: ["admin_map_cities"],
    queryFn: async () => {
      const { data } = await supabase.from("cities").select("*").eq("active", true).order("name");
      return data || [];
    },
  });

  const { data: zones = [] } = useQuery({
    queryKey: ["admin_map_zones"],
    queryFn: async () => {
      const { data } = await supabase
        .from("zones")
        .select("id, city_id, name, center_lat, center_lng, radius_km")
        .eq("active", true);
      return data || [];
    },
  });

  const activeCityId = cityId || (cities[0] as any)?.id || "";
  const activeCity = (cities as any[]).find((c) => c.id === activeCityId);
  const cityZones = (zones as any[]).filter((z) => z.city_id === activeCityId && z.center_lat != null);

  // Centro da cidade = média dos centros das zonas ativas
  const cityCenter = useMemo(() => {
    if (cityZones.length === 0) return CURITIBA;
    const lat = cityZones.reduce((s, z) => s + Number(z.center_lat), 0) / cityZones.length;
    const lng = cityZones.reduce((s, z) => s + Number(z.center_lng), 0) / cityZones.length;
    return { lat, lng };
  }, [cityZones]);

  const { data: pros = [] } = useQuery({
    queryKey: ["admin_map_pros"],
    refetchInterval: 15000,
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from("pro_profiles")
        .select("user_id, current_lat, current_lng, available_now, verified, status");
      const ids = (profiles || []).map((p) => p.user_id);
      const { data: names } = ids.length
        ? await supabase.from("profiles").select("user_id, full_name").in("user_id", ids)
        : { data: [] as any[] };
      const nameMap = new Map((names || []).map((n: any) => [n.user_id, n.full_name]));
      return (profiles || []).map((p) => ({ ...p, name: nameMap.get(p.user_id) || "Diarista" }));
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["admin_map_clients"],
    refetchInterval: 30000,
    queryFn: async () => {
      const { data: addrs } = await supabase
        .from("addresses")
        .select("user_id, lat, lng, city, neighborhood");
      const ids = [...new Set((addrs || []).map((a) => a.user_id))];
      const { data: names } = ids.length
        ? await supabase.from("profiles").select("user_id, full_name").in("user_id", ids)
        : { data: [] as any[] };
      const nameMap = new Map((names || []).map((n: any) => [n.user_id, n.full_name]));
      // Um marcador por cliente (endereço mais recente primeiro na lista)
      const seen = new Set<string>();
      return (addrs || [])
        .filter((a) => {
          if (a.lat == null || a.lng == null || seen.has(a.user_id)) return false;
          seen.add(a.user_id);
          return true;
        })
        .map((a) => ({ ...a, name: nameMap.get(a.user_id) || "Cliente" }));
    },
  });

  // Filtro por cidade: clientes pelo campo city do endereço; diaristas por
  // proximidade (até 40 km do centro da cidade — não têm cidade cadastrada)
  const cityName = (activeCity?.name || "").toLowerCase();
  const cityClients = (clients as any[]).filter(
    (c) => !cityName || (c.city || "").toLowerCase().includes(cityName)
  );
  const cityPros = (pros as any[]).filter(
    (p) =>
      p.current_lat != null &&
      haversineKm(Number(p.current_lat), Number(p.current_lng), cityCenter.lat, cityCenter.lng) <= 40
  );
  const onlinePros = cityPros.filter((p) => p.available_now);

  const markers = [
    ...cityPros.map((p) => ({
      lat: Number(p.current_lat),
      lng: Number(p.current_lng),
      color: (p.available_now ? "green" : "orange") as "green" | "orange",
      popup: `<b>${p.name}</b><br/>Diarista ${p.available_now ? "online" : "offline"}${p.verified ? " · verificada" : ""}`,
    })),
    ...cityClients.map((c) => ({
      lat: Number(c.lat),
      lng: Number(c.lng),
      color: "blue" as const,
      popup: `<b>${c.name}</b><br/>Cliente · ${c.neighborhood || c.city || ""}`,
    })),
  ];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mapa da operação</h1>
          <p className="text-muted-foreground">Diaristas e clientes por cidade, em tempo real</p>
        </div>
        <select
          value={activeCityId}
          onChange={(e) => setCityId(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          aria-label="Cidade"
        >
          {(cities as any[]).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.state}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
          <Wifi className="w-5 h-5 text-success shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Diaristas online</p>
            <p className="text-lg font-bold text-foreground">{onlinePros.length}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Diaristas offline</p>
            <p className="text-lg font-bold text-foreground">{cityPros.length - onlinePros.length}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Diaristas na cidade</p>
            <p className="text-lg font-bold text-foreground">{cityPros.length}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
          <Users className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Clientes na cidade</p>
            <p className="text-lg font-bold text-foreground">{cityClients.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border card-shadow overflow-hidden">
        <MapView center={cityCenter} zoom={12} markers={markers} height="520px" />
        <div className="p-3 flex flex-wrap gap-4 text-xs text-muted-foreground border-t border-border">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Diarista online
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> Diarista offline
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Cliente
          </span>
        </div>
      </div>
    </AdminLayout>
  );
}
