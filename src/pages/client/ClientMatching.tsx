import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PageTransition } from "@/components/ui/PageTransition";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Search, UserCheck, AlertCircle, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MatchingState {
  serviceId: string;
  date: string;
  time: string;
  addressId: string;
}

interface FoundPro {
  user_id: string;
  rating: number | null;
  jobs_done: number | null;
  verified: boolean | null;
  available_now: boolean | null;
  full_name: string;
  avatar_url: string | null;
  distance_km: number | null;
  same_zone: boolean;
}

export default function ClientMatching() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as MatchingState | null;

  const [status, setStatus] = useState<"searching" | "found" | "not_found">(
    "searching"
  );
  const [foundPro, setFoundPro] = useState<FoundPro | null>(null);
  const [progress, setProgress] = useState(0);
  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    if (!state?.serviceId || !state?.addressId) {
      navigate("/client/home");
      return;
    }
    searchPro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "searching") return;
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 90));
    }, 100);
    return () => clearInterval(interval);
  }, [status]);

  const searchPro = async () => {
    try {
      // 1) Pega o endereço selecionado para descobrir lat/lng/zone
      const { data: address, error: addrErr } = await supabase
        .from("addresses")
        .select("id, lat, lng, zone_id, city, state")
        .eq("id", state!.addressId)
        .maybeSingle();

      if (addrErr || !address) {
        console.error("[matching] endereço não encontrado", addrErr);
        setReason("Endereço inválido.");
        setProgress(100);
        setTimeout(() => setStatus("not_found"), 400);
        return;
      }

      if (address.lat == null || address.lng == null) {
        setReason(
          "Seu endereço não tem coordenadas. Edite-o e selecione no mapa."
        );
        setProgress(100);
        setTimeout(() => setStatus("not_found"), 400);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      // 2) Chama RPC híbrida: mesma zona OU dist < 15km
      const { data: pros, error: rpcErr } = await supabase.rpc(
        "find_matching_pros",
        {
          p_lat: Number(address.lat),
          p_lng: Number(address.lng),
          p_zone_id: address.zone_id,
          p_max_km: 15,
          p_limit: 10,
          p_exclude_client: user?.id ?? null,
        }
      );

      if (rpcErr) {
        console.error("[matching] RPC erro", rpcErr);
        setReason("Falha ao buscar profissionais.");
        setProgress(100);
        setTimeout(() => setStatus("not_found"), 400);
        return;
      }

      const candidates = (pros as any[]) || [];
      console.log(
        `[matching] candidatos: ${candidates.length} | cidade=${address.city}/${address.state} | zone=${address.zone_id}`
      );

      if (candidates.length === 0) {
        setReason(
          `Nenhuma profissional disponível em ${address.city}/${address.state} no momento.`
        );
        setProgress(100);
        setTimeout(() => setStatus("not_found"), 400);
        return;
      }

      const best = candidates[0];

      // 3) Busca perfil do escolhido
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .eq("user_id", best.user_id)
        .maybeSingle();

      // 4) Auditoria do matching
      try {
        await supabase.from("matching_logs").insert({
          order_id: state!.addressId, // placeholder até existir order; pode ser substituído depois
          chosen_pro_id: best.user_id,
          candidates: candidates.map((c: any) => ({
            user_id: c.user_id,
            rating: c.rating,
            distance_km: c.distance_km,
            same_zone: c.same_zone,
          })),
          reason: best.same_zone
            ? "same_zone"
            : `radius_${Math.round(best.distance_km ?? 0)}km`,
        });
      } catch (e) {
        // Auditoria não pode quebrar o fluxo — só loga
        console.warn("[matching] log skip:", e);
      }

      setProgress(100);
      setFoundPro({
        ...best,
        full_name: profile?.full_name || "Profissional",
        avatar_url: profile?.avatar_url || null,
      });
      setTimeout(() => setStatus("found"), 400);
    } catch (error) {
      console.error("[matching] erro", error);
      setReason("Erro inesperado. Tente novamente.");
      setProgress(100);
      setTimeout(() => setStatus("not_found"), 400);
    }
  };

  return (
    <PageTransition>
      <div className="h-full bg-background flex flex-col items-center justify-center p-6 safe-top safe-bottom">
        {status === "searching" && (
          <div className="text-center animate-fade-in">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Search className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <div
                className="absolute inset-0 w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary mx-auto animate-spin"
                style={{ animationDuration: "1.5s" }}
              />
            </div>

            <div className="mb-8">
              <h1 className="text-xl font-semibold text-foreground mb-2">
                Buscando na sua região
              </h1>
              <p className="text-muted-foreground text-sm">
                Profissionais verificadas próximas a você
              </p>
            </div>

            <div className="w-56 mx-auto">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {status === "found" && foundPro && (
          <div className="text-center animate-fade-in w-full max-w-sm">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-primary" />
            </div>

            <div className="mb-6">
              <h1 className="text-xl font-semibold text-foreground mb-1">
                Profissional encontrada
              </h1>
              <p className="text-sm text-muted-foreground">
                Perto de você
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border/60 p-5 mb-6 text-left shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                  {foundPro.full_name?.charAt(0)?.toUpperCase() || "P"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {foundPro.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ⭐ {foundPro.rating?.toFixed(1) || "5.0"}
                    <span className="mx-1">•</span>
                    {foundPro.jobs_done || 0} serviços
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-primary">
                <MapPin className="w-3.5 h-3.5" />
                {foundPro.same_zone
                  ? "Mesma região"
                  : `A ${(foundPro.distance_km ?? 0).toFixed(1)} km de você`}
              </div>
            </div>

            <PrimaryButton
              className="w-full"
              onClick={() => {
                navigate("/client/offer", {
                  state: {
                    ...state,
                    proId: foundPro.user_id,
                    proName: foundPro.full_name,
                    proRating: foundPro.rating,
                    proJobsDone: foundPro.jobs_done,
                    distanceKm: foundPro.distance_km,
                  },
                });
              }}
            >
              Ver oferta
            </PrimaryButton>
          </div>
        )}

        {status === "not_found" && (
          <div className="text-center animate-fade-in w-full max-w-sm">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>

            <div className="mb-6">
              <h1 className="text-xl font-semibold text-foreground mb-2">
                Nenhuma profissional disponível
              </h1>
              <p className="text-sm text-muted-foreground">
                {reason ||
                  "Tente outro horário ou verifique se seu endereço tem localização exata."}
              </p>
            </div>

            <div className="space-y-3">
              <PrimaryButton
                className="w-full"
                onClick={() =>
                  navigate("/client/schedule", {
                    state: { serviceId: state?.serviceId },
                  })
                }
              >
                Escolher outro horário
              </PrimaryButton>
              <PrimaryButton
                variant="outline"
                className="w-full"
                onClick={() => navigate("/client/home")}
              >
                Voltar ao início
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
