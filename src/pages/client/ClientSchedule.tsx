import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ChevronLeft, MapPin, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useService } from "@/hooks/useServices";
import { useAddresses } from "@/hooks/useAddresses";

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00"
];

export default function ClientSchedule() {
  const navigate = useNavigate();
  const location = useLocation();
  const serviceId = location.state?.serviceId || null;
  
  const { data: service, isLoading: serviceLoading } = useService(serviceId);
  const { data: addresses, isLoading: addressesLoading } = useAddresses();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  // Set default address when loaded
  useState(() => {
    if (addresses && addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
      setSelectedAddress(defaultAddr.id);
    }
  });

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const formatDay = (date: Date) => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return days[date.getDay()];
  };

  const isComplete = selectedDate && selectedTime && selectedAddress;
  const isLoading = serviceLoading || addressesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Quando você quer?
            </h1>
            <p className="text-sm text-muted-foreground">{service?.name || "Serviço"}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto animate-fade-in">
        {/* Date Selection */}
        <section className="p-4">
          <h2 className="font-medium text-foreground mb-3">Escolha a data</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {dates.map((date) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[60px] h-[72px] rounded-xl",
                    "border transition-all duration-200 flex-shrink-0",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-card border-border hover:border-primary/20"
                  )}
                >
                  <span className={cn(
                    "text-xs font-medium",
                    isSelected ? "text-primary-foreground" : "text-muted-foreground"
                  )}>
                    {isToday ? "Hoje" : formatDay(date)}
                  </span>
                  <span className={cn(
                    "text-lg font-semibold",
                    isSelected ? "text-primary-foreground" : "text-foreground"
                  )}>
                    {date.getDate()}
                  </span>
                  <span className={cn(
                    "text-xs",
                    isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Time Selection */}
        <section className="p-4 pt-0">
          <h2 className="font-medium text-foreground mb-3">Escolha o horário</h2>
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={cn(
                  "px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  selectedTime === time
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {time}
              </button>
            ))}
          </div>
        </section>

        {/* Address Selection */}
        <section className="p-4">
          <h2 className="font-medium text-foreground mb-3">Endereço</h2>
          <div className="space-y-2">
            {addresses && addresses.length > 0 ? (
              addresses.map((address) => (
                <button
                  key={address.id}
                  onClick={() => setSelectedAddress(address.id)}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all duration-200",
                    "flex items-start gap-3",
                    selectedAddress === address.id
                      ? "border-primary bg-accent"
                      : "border-border bg-card hover:border-primary/20"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    selectedAddress === address.id ? "bg-primary" : "bg-secondary"
                  )}>
                    <MapPin className={cn(
                      "w-5 h-5",
                      selectedAddress === address.id ? "text-primary-foreground" : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{address.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.street}, {address.number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.neighborhood}, {address.city} - {address.state}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-muted-foreground text-sm p-4 text-center">
                Nenhum endereço cadastrado
              </p>
            )}

            <button
              onClick={() => navigate("/client/location")}
              className="w-full p-4 rounded-xl border border-dashed border-border
                flex items-center justify-center gap-2 text-muted-foreground
                hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Adicionar novo endereço</span>
            </button>
          </div>
        </section>
      </main>

      {/* Bottom Action */}
      <div className="p-4 bg-card border-t border-border">
        <PrimaryButton
          fullWidth
          disabled={!isComplete}
          onClick={() => navigate("/client/matching", { 
            state: { 
              serviceId, 
              date: selectedDate, 
              time: selectedTime,
              addressId: selectedAddress 
            } 
          })}
        >
          Confirmar agendamento
        </PrimaryButton>
      </div>
    </div>
  );
}
