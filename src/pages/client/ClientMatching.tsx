import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/ui/PageTransition";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Search, UserCheck, AlertCircle, MapPin, Star, X } from "lucide-react";
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

const messages = [
  "Buscando profissionais próximas",
  "Verificando disponibilidade",
  "Priorizando avaliações",
  "Quase lá",
];

export default function ClientMatching() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as MatchingState | null;

  const [status, setStatus] = useState<"searching" | "found" | "not_found">(
    "searching",
  );
  const [foundPro, setFoundPro] = useState<FoundPro | null>(null);
  const [progress, setProgress] = useState(0);
  const [reason, setReason] = useState<string>("");
  const [msgIdx, setMsgIdx] = useState(0);

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

  useEffect(() => {
    if (status !== "searching") return;
    const rotate = setInterval(() => {
      setMsgIdx((i) => (i + 1) % messages.length);
    }, 1400);
    return () => clearInterval(rotate);
  }, [status]);

  const searchPro = async () => {
    try {
      const { data: address, error: addrErr } = await supabase
        .from("addresses")
        .select("id, lat, lng, zone_id, city, state")
        .eq("id", state!.addressId)
        .maybeSingle();

      if (addrErr || !address) {
        setReason("Endereço inválido.");
        setProgress(100);
        setTimeout(() => setStatus("not_found"), 400);
        return;
      }

      if (address.lat == null || address.lng == null) {
        setReason(
          "Seu endereço não tem coordenadas. Edite-o e selecione no mapa.",
        );
        setProgress(100);
        setTimeout(() => setStatus("not_found"), 400);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: pros, error: rpcErr } = await supabase.rpc(
        "find_matching_pros",
        {
          p_lat: Number(address.lat),
          p_lng: Number(address.lng),
          p_zone_id: address.zone_id,
          p_max_km: 15,
          p_limit: 10,
          p_exclude_client: user?.id ?? null,
        },
      );

      if (rpcErr) {
        setReason("Falha ao buscar profissionais.");
        setProgress(100);
        setTimeout(() => setStatus("not_found"), 400);
        return;
      }

      const candidates = (pros as any[]) || [];

      if (candidates.length === 0) {
        setReason(
          `Nenhuma profissional disponível em ${address.city}/${address.state} no momento.`,
        );
        setProgress(100);
        setTimeout(() => setStatus("not_found"), 400);
        return;
      }

      const best = candidates[0];

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .eq("user_id", best.user_id)
        .maybeSingle();

      try {
        await supabase.from("matching_logs").insert({
          order_id: state!.addressId,
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
      setReason("Erro inesperado. Tente novamente.");
      setProgress(100);
      setTimeout(() => setStatus("not_found"), 400);
    }
  };

  return (
    <PageTransition>
      <div className="h-full bg-background flex flex-col relative overflow-hidden safe-top safe-bottom">
        {/* Cancel button top-right when searching */}
        {status === "searching" && (
          <button
            onClick={() => navigate("/client/home")}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-card border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm"
            style={{ top: "max(env(safe-area-inset-top, 0px), 16px)" }}
            aria-label="Cancelar busca"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {status === "searching" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center w-full max-w-sm"
            >
              {/* Concentric pulse */}
              <div className="relative w-40 h-40 mx-auto mb-8">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-primary/40"
                    initial={{ scale: 0.4, opacity: 0.6 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      delay: i * 0.8,
                      ease: "easeOut",
                    }}
                  />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg"
                    style={{
                      boxShadow:
                        "0 12px 40px -8px hsl(var(--primary) / 0.5)",
                    }}
                  >
                    <Search
                      className="w-8 h-8 text-primary-foreground"
                      strokeWidth={2.5}
                    />
                  </motion.div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.h1
                  key={msgIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="text-[20px] font-semibold text-foreground mb-2 leading-tight"
                >
                  {messages[msgIdx]}
                </motion.h1>
              </AnimatePresence>

              <p className="text-[13px] text-muted-foreground mb-8">
                Profissionais verificadas na sua região
              </p>

              <div className="w-56 mx-auto">
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  {progress}%
                </p>
              </div>
            </motion.div>
          )}

          {status === "found" && foundPro && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-sm"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-4"
                >
                  <UserCheck
                    className="w-8 h-8 text-primary"
                    strokeWidth={2.2}
                  />
                </motion.div>
                <h1 className="text-[20px] font-semibold text-foreground leading-tight">
                  Encontramos uma profissional
                </h1>
                <p className="text-[13px] text-muted-foreground mt-1">
                  Verificada e próxima de você
                </p>
              </div>

              <div className="rounded-3xl border border-border/60 bg-card p-5 mb-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-lg shrink-0">
                    {foundPro.full_name?.charAt(0)?.toUpperCase() || "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-[16px] truncate leading-tight">
                      {foundPro.full_name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[12px] text-muted-foreground">
                      <span className="inline-flex items-center gap-0.5 text-amber-500 font-medium">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        {foundPro.rating?.toFixed(1) || "5.0"}
                      </span>
                      <span>·</span>
                      <span>{foundPro.jobs_done || 0} serviços</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/60 flex items-center gap-1.5 text-[12px] text-primary font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  {foundPro.same_zone
                    ? "Mesma região que você"
                    : `A ${(foundPro.distance_km ?? 0).toFixed(1)} km de você`}
                </div>
              </div>

              <PrimaryButton
                fullWidth
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
            </motion.div>
          )}

          {status === "not_found" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center w-full max-w-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle
                  className="w-8 h-8 text-destructive"
                  strokeWidth={2}
                />
              </div>
              <h1 className="text-[20px] font-semibold text-foreground mb-2 leading-tight">
                Nenhuma profissional disponível
              </h1>
              <p className="text-[13px] text-muted-foreground mb-8 leading-relaxed">
                {reason ||
                  "Tente outro horário ou verifique se seu endereço tem localização exata."}
              </p>

              <div className="space-y-2.5">
                <PrimaryButton
                  fullWidth
                  onClick={() =>
                    navigate("/client/schedule", {
                      state: { serviceId: state?.serviceId },
                    })
                  }
                >
                  Escolher outro horário
                </PrimaryButton>
                <PrimaryButton
                  fullWidth
                  variant="outline"
                  onClick={() => navigate("/client/home")}
                >
                  Voltar ao início
                </PrimaryButton>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
