import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PageTransition } from "@/components/ui/PageTransition";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Loader2, Search, UserCheck, AlertCircle } from "lucide-react";
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
}

export default function ClientMatching() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as MatchingState | null;

  const [status, setStatus] = useState<"searching" | "found" | "not_found">("searching");
  const [foundPro, setFoundPro] = useState<FoundPro | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!state?.serviceId || !state?.addressId) {
      navigate("/client/home");
      return;
    }

    searchPro();
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
      // Buscar profissionais disponíveis e verificados
      const { data: pros } = await supabase
        .from("pro_profiles")
        .select("user_id, rating, jobs_done, verified, available_now")
        .eq("verified", true)
        .eq("available_now", true)
        .order("rating", { ascending: false })
        .order("jobs_done", { ascending: false })
        .limit(5);

      if (pros && pros.length > 0) {
        const proIds = pros.map((p) => p.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", proIds);

        const bestPro = pros[0];
        const proProfile = profiles?.find((p) => p.user_id === bestPro.user_id);

        setProgress(100);
        setFoundPro({
          ...bestPro,
          full_name: proProfile?.full_name || "Profissional",
          avatar_url: proProfile?.avatar_url || null,
        });

        setTimeout(() => setStatus("found"), 500);
      } else {
        setProgress(100);
        setTimeout(() => setStatus("not_found"), 500);
      }
    } catch (error) {
      console.error("Erro no matching:", error);
      setProgress(100);
      setTimeout(() => setStatus("not_found"), 500);
    }
  };

  return (
    <PageTransition>
      <div className="h-full bg-background flex flex-col items-center justify-center p-6 safe-top safe-bottom">
        {/* Buscando */}
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
                Buscando profissional...
              </h1>
              <p className="text-muted-foreground">
                Encontrando a melhor diarista para você
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

        {/* Encontrou */}
        {status === "found" && foundPro && (
          <div className="text-center animate-fade-in w-full max-w-sm">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-primary" />
            </div>

            <div className="mb-6">
              <h1 className="text-xl font-semibold text-foreground mb-1">
                Profissional encontrada!
              </h1>
              <p className="text-sm text-muted-foreground">
                Encontramos a melhor opção para seu serviço
              </p>
            </div>

            {/* Card do Pro */}
            <div className="bg-card rounded-2xl border border-border p-5 mb-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                  {foundPro.full_name?.charAt(0)?.toUpperCase() || "P"}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{foundPro.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    ⭐ {foundPro.rating?.toFixed(1) || "5.0"}
                    <span className="mx-1">•</span>
                    {foundPro.jobs_done || 0} serviços
                  </p>
                </div>
              </div>

              {foundPro.verified && (
                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <UserCheck className="w-3.5 h-3.5" />
                  Profissional verificada
                </div>
              )}
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
                  },
                });
              }}
            >
              Ver oferta
            </PrimaryButton>
          </div>
        )}

        {/* Não encontrou */}
        {status === "not_found" && (
          <div className="text-center animate-fade-in w-full max-w-sm">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>

            <div className="mb-6">
              <h1 className="text-xl font-semibold text-foreground mb-2">
                Nenhum profissional disponível
              </h1>
              <p className="text-sm text-muted-foreground">
                No momento não encontramos profissionais disponíveis na sua região.
                Tente novamente mais tarde ou escolha outro horário.
              </p>
            </div>

            <div className="space-y-3">
              <PrimaryButton
                className="w-full"
                onClick={() => navigate("/client/schedule", { state: { serviceId: state?.serviceId } })}
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
