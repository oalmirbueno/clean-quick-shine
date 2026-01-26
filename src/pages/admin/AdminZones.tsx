import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ZoneCard } from "@/components/ui/ZoneCard";
import { MapMock } from "@/components/ui/MapMock";
import { Plus, Search, MapPin, Filter } from "lucide-react";
import { zones, cities, zoneRules, pros } from "@/lib/mockDataV3";
import { cn } from "@/lib/utils";

export default function AdminZones() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState("city1");
  const [search, setSearch] = useState("");

  // Filter zones by selected city
  const cityZones = zones.filter(z => z.cityId === selectedCity);
  const filteredZones = cityZones.filter(z => 
    z.name.toLowerCase().includes(search.toLowerCase())
  );

  // Count pros per zone
  const prosPerZone = (zoneId: string) => 
    pros.filter(p => p.zoneIds.includes(zoneId) && p.status === "active").length;

  // Get zone markers for map
  const mapMarkers = filteredZones.map(zone => ({
    id: zone.id,
    lat: zone.centerLat,
    lng: zone.centerLng,
    type: "address" as const,
    label: zone.name
  }));

  const selectedCityData = cities.find(c => c.id === selectedCity);

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Zonas de Atendimento</h1>
            <p className="text-muted-foreground">Gerencie as zonas e regras de cobertura</p>
          </div>

          {/* City Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {cities.map(city => (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city.id)}
                className={cn(
                  "px-4 py-2 rounded-full whitespace-nowrap transition-all",
                  selectedCity === city.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:bg-accent"
                )}
              >
                {city.name} - {city.state}
              </button>
            ))}
          </div>

          {/* Search and Actions */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar zona..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button className="p-2 rounded-lg border border-border bg-card hover:bg-accent">
              <Filter className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90">
              <Plus className="w-5 h-5" />
              Nova zona
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Map */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Mapa - {selectedCityData?.name}
                </h3>
              </div>
              <div className="h-[400px]">
                <MapMock 
                  markers={mapMarkers} 
                  height="100%"
                  centerLat={filteredZones[0]?.centerLat}
                  centerLng={filteredZones[0]?.centerLng}
                />
              </div>
            </div>

            {/* Zones List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  {filteredZones.length} zonas em {selectedCityData?.name}
                </h3>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredZones.map(zone => {
                  const rule = zoneRules.find(r => r.zoneId === zone.id);
                  const prosCount = prosPerZone(zone.id);

                  return (
                    <ZoneCard
                      key={zone.id}
                      zone={zone}
                      prosOnline={prosCount}
                      rule={rule}
                      onClick={() => navigate(`/admin/zones/${zone.id}`)}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Zone Stats Summary */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-card rounded-xl border border-border">
              <p className="text-sm text-muted-foreground">Total de zonas</p>
              <p className="text-2xl font-bold text-foreground">{zones.length}</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border">
              <p className="text-sm text-muted-foreground">Zonas ativas</p>
              <p className="text-2xl font-bold text-success">{zones.filter(z => z.active).length}</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border">
              <p className="text-sm text-muted-foreground">Com taxa extra</p>
              <p className="text-2xl font-bold text-warning">{zones.filter(z => z.feeExtra > 0).length}</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border">
              <p className="text-sm text-muted-foreground">Surge ativo</p>
              <p className="text-2xl font-bold text-primary">{zoneRules.filter(r => r.surgeMultiplier > 1).length}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
