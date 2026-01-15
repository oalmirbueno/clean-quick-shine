import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { ProCard } from "@/components/ui/ProCard";
import { mockProProfile, services } from "@/lib/mockData";

export default function ClientOffer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { serviceId } = location.state || {};
  const service = services.find(s => s.id === serviceId) || services[0];

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
            Esta profissional está disponível para o seu serviço de <span className="font-medium text-foreground">{service.name}</span>
          </p>

          <ProCard
            name={mockProProfile.name}
            avatar={mockProProfile.avatar}
            rating={mockProProfile.ratingAvg}
            reviews={mockProProfile.jobsDone}
            distance="2,3 km"
            arrivalTime="30 min"
            verified={mockProProfile.verified}
            onConfirm={() => navigate("/client/checkout", { state: location.state })}
            onDetails={() => {}}
          />
        </div>
      </main>
    </div>
  );
}
