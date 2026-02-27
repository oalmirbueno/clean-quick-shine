import { useNavigate, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { MapView } from "@/components/ui/MapView";
import { AddressSearch } from "@/components/ui/AddressSearch";
import { useGeocode } from "@/hooks/useGeocode";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { MapPin, ChevronLeft, Trash2, Star, Loader2, Home, Briefcase, Tag } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useAddresses, useCreateAddress, useDeleteAddress, useSetDefaultAddress } from "@/hooks/useAddresses";
import { cn } from "@/lib/utils";

const labelOptions = [
  { value: "Casa", icon: Home },
  { value: "Trabalho", icon: Briefcase },
  { value: "Outro", icon: Tag },
];

export default function ClientLocation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { serviceId, date, time } = location.state || {};

  const { data: addresses, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();
  const { reverseGeocode } = useGeocode();

  const [mapCenter, setMapCenter] = useState({ lat: -25.4284, lng: -49.2733 });
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);
  const [customLabel, setCustomLabel] = useState("");
  const [formData, setFormData] = useState({
    label: "Casa",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
    lat: null as number | null,
    lng: null as number | null,
  });

  const fillFromGeocode = useCallback(async (lat: number, lng: number) => {
    setMarkerPos({ lat, lng });
    setMapCenter({ lat, lng });
    setFormData(prev => ({ ...prev, lat, lng }));

    const result = await reverseGeocode(lat, lng);
    if (result?.address) {
      const a = result.address;
      setFormData(prev => ({
        ...prev,
        street: a.road || prev.street,
        number: a.house_number || prev.number,
        neighborhood: a.suburb || a.neighbourhood || prev.neighborhood,
        city: a.city || a.town || prev.city,
        state: a.state || prev.state,
        zip_code: a.postcode || prev.zip_code,
        lat,
        lng,
      }));
    }
  }, [reverseGeocode]);

  const handleAddressSelect = useCallback((addr: {
    display_name: string; lat: number; lng: number;
    street?: string; number?: string; neighborhood?: string;
    city?: string; state?: string; postalCode?: string;
  }) => {
    setMarkerPos({ lat: addr.lat, lng: addr.lng });
    setMapCenter({ lat: addr.lat, lng: addr.lng });
    setFormData(prev => ({
      ...prev,
      street: addr.street || prev.street,
      number: addr.number || prev.number,
      neighborhood: addr.neighborhood || prev.neighborhood,
      city: addr.city || prev.city,
      state: addr.state || prev.state,
      zip_code: addr.postalCode || prev.zip_code,
      lat: addr.lat,
      lng: addr.lng,
    }));
  }, []);

  const handleSubmit = async () => {
    const label = formData.label === "Outro" ? customLabel : formData.label;
    if (!label || !formData.street || !formData.number || !formData.neighborhood || !formData.city || !formData.zip_code) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const result = await createAddress.mutateAsync({
        label,
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        lat: formData.lat,
        lng: formData.lng,
      });
      toast.success("Endereço salvo!");

      if (serviceId) {
        navigate("/client/matching", {
          state: { serviceId, date, time, addressId: result.id },
        });
      }
    } catch {
      toast.error("Erro ao salvar endereço");
    }
  };

  const handleSelectSaved = (addressId: string) => {
    if (serviceId) {
      navigate("/client/matching", {
        state: { serviceId, date, time, addressId },
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress.mutateAsync(id);
      toast.success("Endereço removido");
    } catch {
      toast.error("Erro ao remover endereço");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress.mutateAsync(id);
      toast.success("Endereço padrão atualizado");
    } catch {
      toast.error("Erro ao definir padrão");
    }
  };

  const markers = markerPos ? [{ lat: markerPos.lat, lng: markerPos.lng, color: "blue" as const, label: "Endereço selecionado" }] : [];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col safe-top">
      {/* Header */}
      <header className="flex-shrink-0 bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Endereço do serviço</h1>
            <p className="text-sm text-muted-foreground">Selecione ou adicione um endereço</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto animate-fade-in">
        {/* Search */}
        <div className="p-4 pb-2">
          <AddressSearch
            onSelect={handleAddressSelect}
            placeholder="Buscar endereço..."
          />
        </div>

        {/* Map */}
        <div className="px-4 pb-3">
          <MapView
            center={mapCenter}
            zoom={15}
            markers={markers}
            height="250px"
            draggableMarker
            onMarkerDrag={fillFromGeocode}
            onMapClick={fillFromGeocode}
            showUserLocation
          />
        </div>

        {/* Address Form */}
        <div className="px-4 space-y-3">
          {/* Label selector */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Apelido *</label>
            <div className="flex gap-2">
              {labelOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFormData(prev => ({ ...prev, label: opt.value }))}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium",
                    formData.label === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-foreground hover:border-primary/30"
                  )}
                >
                  <opt.icon className="w-4 h-4" />
                  {opt.value}
                </button>
              ))}
            </div>
            {formData.label === "Outro" && (
              <div className="mt-2">
                <InputField
                  placeholder="Nome do endereço"
                  value={customLabel}
                  onChange={e => setCustomLabel(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <InputField
                label="Rua *"
                value={formData.street}
                onChange={e => setFormData(prev => ({ ...prev, street: e.target.value }))}
              />
            </div>
            <InputField
              label="Número *"
              value={formData.number}
              onChange={e => setFormData(prev => ({ ...prev, number: e.target.value }))}
            />
          </div>

          <InputField
            label="Complemento"
            value={formData.complement}
            onChange={e => setFormData(prev => ({ ...prev, complement: e.target.value }))}
            placeholder="Apto, Bloco, etc"
          />

          <InputField
            label="Bairro *"
            value={formData.neighborhood}
            onChange={e => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Cidade *"
              value={formData.city}
              onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
            />
            <InputField
              label="CEP *"
              value={formData.zip_code}
              onChange={e => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
            />
          </div>

          <InputField
            label="Estado"
            value={formData.state}
            onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
          />
        </div>

        {/* Saved addresses */}
        {addresses && addresses.length > 0 && (
          <div className="px-4 mt-6 space-y-2">
            <h2 className="font-medium text-foreground text-sm">Endereços salvos</h2>
            {addresses.map(address => (
              <button
                key={address.id}
                onClick={() => handleSelectSaved(address.id)}
                className={cn(
                  "w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3",
                  address.is_default
                    ? "border-primary bg-accent"
                    : "border-border bg-card hover:border-primary/20"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  address.is_default ? "bg-primary" : "bg-secondary"
                )}>
                  <MapPin className={cn(
                    "w-5 h-5",
                    address.is_default ? "text-primary-foreground" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{address.label}</p>
                    {address.is_default && (
                      <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">Padrão</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {address.street}, {address.number} — {address.neighborhood}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!address.is_default && (
                    <button
                      onClick={e => { e.stopPropagation(); handleSetDefault(address.id); }}
                      className="p-2 hover:bg-secondary rounded-lg"
                    >
                      <Star className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(address.id); }}
                    className="p-2 hover:bg-destructive/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="h-6" />
      </main>

      {/* Bottom CTA */}
      <div className="flex-shrink-0 p-4 bg-card border-t border-border safe-bottom">
        <PrimaryButton
          fullWidth
          loading={createAddress.isPending}
          disabled={!formData.street || !formData.number || !formData.neighborhood || !formData.city}
          onClick={handleSubmit}
        >
          Confirmar endereço
        </PrimaryButton>
      </div>

      {!serviceId && <BottomNav variant="client" />}
    </div>
  );
}
