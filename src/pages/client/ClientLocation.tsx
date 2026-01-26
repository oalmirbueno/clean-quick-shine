import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { MapMock } from "@/components/ui/MapMock";
import { MapPin, Navigation, ChevronRight, Trash2, Star, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddresses, useCreateAddress, useDeleteAddress, useSetDefaultAddress } from "@/hooks/useAddresses";
import { cn } from "@/lib/utils";

export default function ClientLocation() {
  const navigate = useNavigate();
  const { data: addresses, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "SP",
    zip_code: "",
  });

  const handleUseCurrentLocation = () => {
    setFormData({
      ...formData,
      street: "Rua Oscar Freire",
      number: "300",
      neighborhood: "Jardins",
      city: "São Paulo",
      state: "SP",
      zip_code: "01426-000",
      label: "Casa",
    });
    setShowForm(true);
    toast.success("Localização detectada: Jardins, São Paulo");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.label || !formData.street || !formData.number || !formData.neighborhood || !formData.city || !formData.zip_code) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createAddress.mutateAsync(formData);
      toast.success("Endereço salvo com sucesso!");
      setShowForm(false);
      setFormData({
        label: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "SP",
        zip_code: "",
      });
    } catch (error) {
      toast.error("Erro ao salvar endereço");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress.mutateAsync(id);
      toast.success("Endereço removido");
    } catch (error) {
      toast.error("Erro ao remover endereço");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress.mutateAsync(id);
      toast.success("Endereço padrão atualizado");
    } catch (error) {
      toast.error("Erro ao definir endereço padrão");
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <BottomNav variant="client" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col safe-top">
      <header className="flex-shrink-0 bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-lg">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-lg font-semibold">Meus endereços</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-4 animate-fade-in">
        {!showForm ? (
          <>
            <MapMock
              centerLat={-23.5634}
              centerLng={-46.6542}
              showRadius
              radius={3}
              markers={addresses?.filter(a => a.lat && a.lng).map(a => ({
                id: a.id,
                lat: Number(a.lat),
                lng: Number(a.lng),
                type: "address" as const
              })) || []}
            />

            <button
              onClick={handleUseCurrentLocation}
              className="w-full p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3 hover:bg-primary/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">Adicionar endereço atual</p>
                <p className="text-sm text-muted-foreground">Detectar automaticamente</p>
              </div>
            </button>

            {/* Saved Addresses */}
            {addresses && addresses.length > 0 && (
              <div className="space-y-2">
                <h2 className="font-medium text-foreground">Endereços salvos</h2>
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={cn(
                      "p-4 rounded-xl border bg-card",
                      address.is_default ? "border-primary" : "border-border"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        address.is_default ? "bg-primary" : "bg-secondary"
                      )}>
                        <MapPin className={cn(
                          "w-5 h-5",
                          address.is_default ? "text-primary-foreground" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{address.label}</p>
                          {address.is_default && (
                            <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                              Padrão
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {address.street}, {address.number}
                          {address.complement && ` - ${address.complement}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.neighborhood}, {address.city} - {address.state}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!address.is_default && (
                          <button
                            onClick={() => handleSetDefault(address.id)}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors"
                            title="Definir como padrão"
                          >
                            <Star className="w-4 h-4 text-muted-foreground" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(address.id)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowForm(true)}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Adicionar novo endereço
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Nome do endereço *</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Ex: Casa, Trabalho"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium text-foreground">Rua *</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Número *</label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Complemento</label>
              <input
                type="text"
                value={formData.complement}
                onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                placeholder="Apto, Bloco, etc"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Bairro *</label>
              <input
                type="text"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Cidade *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">CEP *</label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 border border-border rounded-xl font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createAddress.isPending}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {createAddress.isPending ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        )}
      </main>

      <BottomNav variant="client" />
    </div>
  );
}
