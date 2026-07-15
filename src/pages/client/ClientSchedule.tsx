import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ChevronLeft, MapPin, Plus, Loader2, Sun, Sunset, Moon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useService } from "@/hooks/useServices";
import { useAddresses } from "@/hooks/useAddresses";

const morningSlots = ["08:00", "09:00", "10:00", "11:00"];
const afternoonSlots = ["12:00", "13:00", "14:00", "15:00", "16:00"];
const eveningSlots = ["17:00", "18:00"];

export default function ClientSchedule() {
  const navigate = useNavigate();
  const location = useLocation();
  const serviceId = location.state?.serviceId || null;

  const { data: service, isLoading: serviceLoading } = useService(serviceId);
  const { data: addresses, isLoading: addressesLoading } = useAddresses();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
      setSelectedAddress(defaultAddr.id);
    }
  }, [addresses, selectedAddress]);

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

  const TimeGroup = ({
    label,
    icon: Icon,
    slots,
  }: {
    label: string;
    icon: any;
    slots: string[];
  }) => (
    <div>
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((time) => (
          <button
            key={time}
            onClick={() => setSelectedTime(time)}
            className={cn(
              "h-11 rounded-xl text-[13px] font-medium transition-all border",
              selectedTime === time
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-foreground border-border/60 hover:border-primary/40",
            )}
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      {/* Header */}
      <header
        className="shrink-0 px-5 pt-3 pb-4"
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}
      >
        <div className="mx-auto max-w-lg flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card border border-border/60 flex items-center justify-center text-foreground hover:bg-secondary transition-colors shadow-sm"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <p className="text-[12px] text-muted-foreground leading-none mb-1">
              Passo 2 de 3
            </p>
            <h1 className="text-[20px] font-semibold text-foreground leading-tight tracking-tight">
              Quando você quer?
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-32">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Service summary card */}
          {service && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 flex items-center justify-between"
            >
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">
                  Serviço
                </p>
                <p className="text-[14px] font-semibold text-foreground truncate">
                  {service.name}
                </p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">
                  Valor
                </p>
                <p className="text-[14px] font-bold text-foreground tracking-tight">
                  R$ {Number(service.base_price).toFixed(2).replace(".", ",")}
                </p>
              </div>
            </motion.div>
          )}

          {/* Date */}
          <section>
            <h2 className="text-[13px] font-semibold text-foreground mb-3 px-1">
              Escolha a data
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 snap-x scrollbar-hide">
              {dates.map((date) => {
                const isSelected =
                  selectedDate?.toDateString() === date.toDateString();
                const isToday =
                  date.toDateString() === new Date().toDateString();

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "snap-start flex flex-col items-center justify-center min-w-[62px] h-[78px] rounded-2xl border transition-all shrink-0",
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground shadow-sm"
                        : "bg-card border-border/60 hover:border-primary/30",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10.5px] font-medium uppercase tracking-wider",
                        isSelected
                          ? "text-primary-foreground/85"
                          : "text-muted-foreground",
                      )}
                    >
                      {isToday ? "Hoje" : formatDay(date)}
                    </span>
                    <span
                      className={cn(
                        "text-[20px] font-bold leading-tight mt-0.5",
                        isSelected ? "text-primary-foreground" : "text-foreground",
                      )}
                    >
                      {date.getDate()}
                    </span>
                    <span
                      className={cn(
                        "text-[10.5px]",
                        isSelected
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {date
                        .toLocaleDateString("pt-BR", { month: "short" })
                        .replace(".", "")}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Time */}
          <section className="space-y-4">
            <h2 className="text-[13px] font-semibold text-foreground px-1">
              Escolha o horário
            </h2>
            <TimeGroup label="Manhã" icon={Sun} slots={morningSlots} />
            <TimeGroup label="Tarde" icon={Sunset} slots={afternoonSlots} />
            <TimeGroup label="Noite" icon={Moon} slots={eveningSlots} />
          </section>

          {/* Address */}
          <section>
            <h2 className="text-[13px] font-semibold text-foreground mb-3 px-1">
              Endereço do serviço
            </h2>
            <div className="space-y-2">
              {addresses && addresses.length > 0 ? (
                addresses.map((address) => {
                  const active = selectedAddress === address.id;
                  return (
                    <button
                      key={address.id}
                      onClick={() => setSelectedAddress(address.id)}
                      className={cn(
                        "w-full p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3",
                        active
                          ? "border-primary/50 bg-primary/5 ring-2 ring-primary/15"
                          : "border-border/60 bg-card hover:border-primary/30",
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          active ? "bg-primary/15" : "bg-secondary/70",
                        )}
                      >
                        <MapPin
                          className={cn(
                            "w-[18px] h-[18px]",
                            active ? "text-primary" : "text-foreground/70",
                          )}
                          strokeWidth={2}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-foreground leading-tight">
                          {address.label}
                        </p>
                        <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
                          {address.street}, {address.number} — {address.neighborhood}
                        </p>
                      </div>
                      {active && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-[13px] p-4 text-center">
                  Nenhum endereço cadastrado
                </p>
              )}

              <button
                onClick={() => navigate("/client/location")}
                className="w-full p-3.5 rounded-2xl border border-dashed border-border flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-[13px] font-medium">Adicionar novo endereço</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Bottom Action */}
      <div
        className="shrink-0 px-5 pt-3 pb-5 bg-card/95 backdrop-blur border-t border-border/60"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 20px)" }}
      >
        <div className="mx-auto max-w-lg">
          {isComplete && selectedDate && (
            <p className="mb-2.5 text-[12px] text-muted-foreground text-center">
              {selectedDate.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}{" "}
              · {selectedTime}
            </p>
          )}
          <PrimaryButton
            fullWidth
            disabled={!isComplete}
            onClick={() =>
              navigate("/client/matching", {
                state: {
                  serviceId,
                  date: selectedDate,
                  time: selectedTime,
                  addressId: selectedAddress,
                },
              })
            }
          >
            Confirmar agendamento
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
