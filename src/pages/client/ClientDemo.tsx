import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  Search,
  UserCheck,
  MapPin,
  ShieldCheck,
  Clock,
  Check,
  Sparkles,
  Play,
  RotateCcw,
  Home as HomeIcon,
} from "lucide-react";
import { MapView } from "@/components/ui/MapView";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type Step = "home" | "matching" | "found" | "tracking" | "completed";

// Demo: profissional saindo do centro de Curitiba até o destino do cliente
const DESTINATION = { lat: -25.4284, lng: -49.2733 };
const PRO_START = { lat: -25.4484, lng: -49.2933 };

const DEMO_PRO = {
  name: "Mariana S.",
  rating: 4.9,
  jobs: 142,
  distanceKm: 2.3,
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function ClientDemo() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("home");
  const [progress, setProgress] = useState(0);
  const [proPos, setProPos] = useState(PRO_START);
  const [trackProgress, setTrackProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Matching: barra de progresso 0->100 em ~2s, depois "found"
  useEffect(() => {
    if (step !== "matching") return;
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + 4;
        if (next >= 100) {
          clearInterval(id);
          setTimeout(() => setStep("found"), 350);
          return 100;
        }
        return next;
      });
    }, 80);
    return () => clearInterval(id);
  }, [step]);

  // Tracking: pro caminha do start até o destino em ~12s
  useEffect(() => {
    if (step !== "tracking") return;
    setTrackProgress(0);
    setProPos(PRO_START);
    const start = Date.now();
    const DURATION = 12_000;
    timerRef.current = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / DURATION);
      setTrackProgress(t);
      setProPos({
        lat: lerp(PRO_START.lat, DESTINATION.lat, t),
        lng: lerp(PRO_START.lng, DESTINATION.lng, t),
      });
      if (t >= 1) {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeout(() => setStep("completed"), 600);
      }
    }, 200);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStep("home");
    setProgress(0);
    setTrackProgress(0);
    setProPos(PRO_START);
  };

  const mapMarkers = useMemo(
    () => [
      { lat: DESTINATION.lat, lng: DESTINATION.lng, color: "green" as const, label: "Você" },
      { lat: proPos.lat, lng: proPos.lng, color: "blue" as const, label: DEMO_PRO.name },
    ],
    [proPos]
  );

  const etaMin = Math.max(1, Math.round((1 - trackProgress) * 8));

  return (
    <div
      className="h-full flex flex-col bg-background overflow-hidden"
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}
    >
      {/* Top bar */}
      <header className="shrink-0 px-4 pt-2 pb-3 flex items-center gap-2 z-10">
        <button
          onClick={() => navigate("/client/home")}
          className="w-9 h-9 rounded-2xl bg-card border border-border/60 flex items-center justify-center shadow-sm"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-primary font-semibold leading-none">
            Modo demo
          </p>
          <h1 className="text-[16px] font-semibold text-foreground leading-tight tracking-tight truncate">
            Simulação do fluxo
          </h1>
        </div>
        {step !== "home" && (
          <button
            onClick={reset}
            className="h-9 px-3 rounded-2xl bg-card border border-border/60 flex items-center gap-1.5 text-[12px] font-medium text-foreground shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reiniciar
          </button>
        )}
      </header>

      {/* Stepper */}
      <div className="shrink-0 px-4 pb-3">
        <div className="flex items-center gap-1.5">
          {(["home", "matching", "tracking"] as const).map((s, i) => {
            const order: Step[] = ["home", "matching", "found", "tracking", "completed"];
            const currentIdx = order.indexOf(step);
            const stageIdx = order.indexOf(s === "tracking" ? "tracking" : s);
            const active = currentIdx >= stageIdx;
            return (
              <div key={s} className="flex-1 flex items-center gap-1.5">
                <div
                  className={`flex-1 h-1.5 rounded-full transition-colors ${
                    active ? "bg-primary" : "bg-muted"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <main className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          {step === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="px-4 pb-6 mx-auto w-full max-w-lg flex flex-col gap-3"
            >
              <div
                className="relative overflow-hidden rounded-3xl p-5 border border-primary/20"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--primary) / 0.95) 0%, hsl(var(--primary) / 0.78) 100%)",
                  boxShadow: "0 18px 40px -22px hsl(var(--primary) / 0.45)",
                }}
              >
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" strokeWidth={2.5} />
                  Pré-visualização
                </span>
                <h2 className="mt-3 text-primary-foreground font-bold text-[22px] leading-tight tracking-tight">
                  Veja como funciona em 30 segundos
                </h2>
                <p className="mt-1 text-primary-foreground/85 text-[13px]">
                  Sem cadastrar nada. Só pra você sentir o ritmo.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                <p className="text-[13px] font-semibold text-foreground mb-3">
                  Etapas da simulação
                </p>
                <ul className="space-y-2.5">
                  {[
                    { icon: Search, t: "Busca uma profissional perto" },
                    { icon: UserCheck, t: "Mostra quem foi encontrada" },
                    { icon: MapPin, t: "Acompanha em tempo real" },
                  ].map((row, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <row.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-[13.5px] text-foreground">{row.t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <PrimaryButton
                className="w-full"
                onClick={() => setStep("matching")}
              >
                <Play className="w-4 h-4 mr-1.5" />
                Iniciar simulação
              </PrimaryButton>
            </motion.div>
          )}

          {step === "matching" && (
            <motion.div
              key="matching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center px-6 text-center"
            >
              <div className="relative mb-7">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Search className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <div
                  className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"
                  style={{ animationDuration: "1.5s" }}
                />
              </div>
              <h2 className="text-[18px] font-semibold text-foreground mb-1">
                Buscando na sua região
              </h2>
              <p className="text-[13px] text-muted-foreground mb-6">
                Profissionais verificadas próximas a você
              </p>
              <div className="w-56">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === "found" && (
            <motion.div
              key="found"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-4 pb-6 mx-auto w-full max-w-lg flex flex-col gap-3"
            >
              <div className="text-center pt-2">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-[18px] font-semibold text-foreground">
                  Profissional encontrada
                </h2>
                <p className="text-[13px] text-muted-foreground">Perto de você</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                    {DEMO_PRO.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {DEMO_PRO.name}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      ⭐ {DEMO_PRO.rating.toFixed(1)} • {DEMO_PRO.jobs} serviços
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    Verificada
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[12px] text-primary">
                  <MapPin className="w-3.5 h-3.5" />A {DEMO_PRO.distanceKm} km de você
                </div>
              </div>

              <PrimaryButton className="w-full" onClick={() => setStep("tracking")}>
                Acompanhar em tempo real
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </PrimaryButton>
            </motion.div>
          )}

          {step === "tracking" && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              <div className="relative">
                <MapView
                  center={proPos}
                  zoom={14}
                  markers={mapMarkers}
                  height="300px"
                  className="rounded-none"
                />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-card/90 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-border/60 flex items-center gap-2 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[13px] font-medium text-foreground">
                      A caminho • chega em ~{etaMin} min
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-4 py-4 flex flex-col gap-3 mx-auto w-full max-w-lg">
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {DEMO_PRO.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-foreground leading-tight">
                      {DEMO_PRO.name}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      ⭐ {DEMO_PRO.rating} • {DEMO_PRO.jobs} serviços
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Tempo real
                  </span>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between text-[12px] text-muted-foreground mb-2">
                    <span>Saída</span>
                    <span>Destino</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-200"
                      style={{ width: `${Math.round(trackProgress * 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[12px] text-muted-foreground">
                    GPS atualizando a cada 30s — igual Uber e iFood.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === "completed" && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 pb-6 pt-4 mx-auto w-full max-w-lg flex flex-col gap-3 items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-[18px] font-semibold text-foreground">
                Profissional chegou
              </h2>
              <p className="text-[13px] text-muted-foreground max-w-xs">
                Fim da demo. No app real, o serviço começa aqui e você acompanha tudo
                até a finalização.
              </p>
              <div className="w-full grid grid-cols-2 gap-2.5 mt-2">
                <button
                  onClick={reset}
                  className="h-11 rounded-2xl border border-border/60 bg-card text-[13px] font-medium text-foreground flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Repetir
                </button>
                <PrimaryButton onClick={() => navigate("/client/home")}>
                  <HomeIcon className="w-4 h-4 mr-1.5" />
                  Voltar
                </PrimaryButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
