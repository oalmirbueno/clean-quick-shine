import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Loader2, UserX } from "lucide-react";
import { ProCard } from "@/components/ui/ProCard";
import { useService } from "@/hooks/useServices";
import { useAvailablePros } from "@/hooks/usePros";
import { useAddress } from "@/hooks/useAddresses";

export default function ClientOffer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { serviceId, addressId, date, time } = location.state || {};
  
  const { data: service, isLoading: serviceLoading } = useService(serviceId);
  const { data: address } = useAddress(addressId);
  const { data: pros, isLoading: prosLoading } = useAvailablePros(address?.zone_id);

  const isLoading = serviceLoading || prosLoading;

  // Get the best available pro (first one, sorted by rating)
  const matchedPro = pros && pros.length > 0 ? pros[0] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              Buscando profissionais...
            </h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Procurando profissionais disponíveis</p>
          </div>
        </main>
      </div>
    );
  }

  if (!matchedPro) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              Nenhum profissional disponível
            </h1>
          </div>
        </header>
        <main className="flex-1 p-4 flex flex-col items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <UserX className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Ops! Nenhum profissional disponível
            </h2>
            <p className="text-muted-foreground mb-6">
              No momento não encontramos profissionais disponíveis na sua região. Tente novamente mais tarde ou escolha outro horário.
            </p>
            <button
              onClick={() => navigate("/client/schedule", { state: { serviceId } })}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Escolher outro horário
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Get pro name from profile or use fallback
  const proName = matchedPro.profile?.full_name || "Profissional";
  const proAvatar = matchedPro.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${matchedPro.user_id}`;

  // Calculate mock distance based on location (would use real geolocation in production)
  const distance = matchedPro.current_lat && matchedPro.current_lng 
    ? `${(Math.random() * 5 + 1).toFixed(1)} km`
    : "~3 km";
  
  const arrivalTime = `${Math.floor(Math.random() * 30 + 15)} min`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/client/home")}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            Encontramos uma profissional!
          </h1>
        </div>
      </header>

      <main className="flex-1 p-4 flex flex-col items-center justify-center animate-slide-up">
        <div className="w-full max-w-md">
          <p className="text-center text-muted-foreground mb-6">
            Esta profissional está disponível para o seu serviço de{" "}
            <span className="font-medium text-foreground">{service?.name || "limpeza"}</span>
          </p>

          <ProCard
            name={proName}
            avatar={proAvatar}
            rating={matchedPro.rating || 5.0}
            reviews={matchedPro.jobs_done || 0}
            distance={distance}
            arrivalTime={arrivalTime}
            verified={matchedPro.verified || false}
            onConfirm={() => navigate("/client/checkout", { 
              state: { 
                ...location.state,
                proId: matchedPro.user_id,
                proName,
                proRating: matchedPro.rating,
              } 
            })}
            onDetails={() => {}}
          />

          {/* Other available pros */}
          {pros && pros.length > 1 && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground text-center mb-3">
                +{pros.length - 1} outros profissionais disponíveis
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
