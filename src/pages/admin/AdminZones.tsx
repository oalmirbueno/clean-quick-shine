import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ZoneCard } from "@/components/ui/ZoneCard";
import { MapMock } from "@/components/ui/MapMock";
import { Plus, Search, MapPin, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminZones() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: cities = [] } = useQuery({
    queryKey: ["admin_cities"],
    queryFn: async () => {
      const { data } = await supabase.from("cities").select("*").eq("active", true).order("name");
      return data || [];
    },
  });

  const { data: zones = [] } = useQuery({
    queryKey: ["admin_zones"],
    queryFn: async () => {
      const { data } = await supabase.from("zones").select("*").order("name");
      return data || [];
    },
  });

  const { data: zoneRules = [] } = useQuery({
    queryKey: ["admin_zone_rules"],
    queryFn: async () => {
      const { data } = await supabase.from("zone_rules").select("*");
      return data || [];
    },
  });

  // Auto-select first city
  const activeCityId = selectedCity || cities[0]?.id || "";
  const cityZones = zones.filter((z: any) => z.city_id === activeCityId);
  const filteredZones = cityZones.filter((z: any) => z.name.toLowerCase().includes(search.toLowerCase()));
  const selectedCityData = cities.find((c: any) => c.id === activeCityId);

  const mapMarkers = filteredZones.map((zone: any) => ({
    id: zone.id,
    lat: zone.center_lat || 0,
    lng: zone.center_lng || 0,
    type: "address" as const,
    label: zone.name,
  }));

  return (
    <div className="min-h-screen bg-background flex safe-top">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Zonas de Atendimento</h1>
            <p className="text-muted-foreground">Gerencie as zonas e regras de cobertura</p>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {cities.map((city: any) => (
              <button key={city.id} onClick={() => setSelectedCity(city.id)} className={cn("px-4 py-2 rounded-full whitespace-nowrap transition-all", activeCityId === city.id ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-accent")}>
                {city.name} - {city.state}
              </button>
            ))}
          </div>

          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" placeholder="Buscar zona..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" />Mapa - {selectedCityData?.name || "Cidade"}</h3>
              </div>
              <div className="h-[400px]">
                <MapMock markers={mapMarkers} height="100%" centerLat={filteredZones[0]?.center_lat} centerLng={filteredZones[0]?.center_lng} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">{filteredZones.length} zonas em {selectedCityData?.name || "..."}</h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredZones.map((zone: any) => {
                  const rule = zoneRules.find((r: any) => r.zone_id === zone.id);
                  return (
                    <ZoneCard
                      key={zone.id}
                      zone={{ id: zone.id, name: zone.name, centerLat: zone.center_lat || 0, centerLng: zone.center_lng || 0, radiusKm: zone.radius_km || 5, feeExtra: zone.fee_extra || 0, active: zone.active ?? true, cityId: zone.city_id }}
                      prosOnline={0}
                      rule={rule ? { id: rule.id, zoneId: rule.zone_id, minProsOnline: rule.min_pros_online || 3, surgeMultiplier: rule.surge_multiplier || 1, active: rule.active ?? true } : undefined}
                      onClick={() => navigate(`/admin/zones/${zone.id}`)}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-card rounded-xl border border-border"><p className="text-sm text-muted-foreground">Total de zonas</p><p className="text-2xl font-bold text-foreground">{zones.length}</p></div>
            <div className="p-4 bg-card rounded-xl border border-border"><p className="text-sm text-muted-foreground">Zonas ativas</p><p className="text-2xl font-bold text-success">{zones.filter((z: any) => z.active).length}</p></div>
            <div className="p-4 bg-card rounded-xl border border-border"><p className="text-sm text-muted-foreground">Com taxa extra</p><p className="text-2xl font-bold text-warning">{zones.filter((z: any) => (z.fee_extra || 0) > 0).length}</p></div>
            <div className="p-4 bg-card rounded-xl border border-border"><p className="text-sm text-muted-foreground">Surge ativo</p><p className="text-2xl font-bold text-primary">{zoneRules.filter((r: any) => (r.surge_multiplier || 1) > 1).length}</p></div>
          </div>
        </div>
      </main>
    </div>
  );
}
