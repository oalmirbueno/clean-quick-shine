import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageTransition } from "@/components/ui/PageTransition";
import {
  ChevronRight,
  User,
  MapPin,
  Calendar,
  Settings,
  LogOut,
  HelpCircle,
  CheckCircle2,
  Crown,
  Wallet,
  Shield,
  Save,
  Loader2,
  Phone,
  Mail,
  FileText,
  Plus,
  Trash2,
  Star as StarIcon,
  Pencil,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress } from "@/hooks/useAddresses";
import { toast } from "sonner";

type EditSection = null | "personal" | "bio" | "address-new" | string; // string = address id

export default function ProProfile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();

  const [editSection, setEditSection] = useState<EditSection>(null);

  // --- Data fetching ---
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: proProfile } = useQuery({
    queryKey: ["pro_profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("pro_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: metrics } = useQuery({
    queryKey: ["pro_metrics", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("pro_metrics")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: addresses } = useAddresses();

  // --- Personal data form ---
  const [personalForm, setPersonalForm] = useState({ full_name: "", phone: "", cpf: "" });
  useEffect(() => {
    if (profile) {
      setPersonalForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        cpf: profile.cpf || "",
      });
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (data: { full_name: string; phone: string; cpf: string }) => {
      if (!user?.id) throw new Error("Não autenticado");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name.trim(),
          phone: data.phone.replace(/\D/g, ""),
          cpf: data.cpf.replace(/\D/g, ""),
        })
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dados pessoais atualizados!");
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      setEditSection(null);
    },
    onError: () => toast.error("Erro ao salvar dados pessoais"),
  });

  // --- Bio form ---
  const [bioForm, setBioForm] = useState({ bio: "", radius_km: "" });
  useEffect(() => {
    if (proProfile) {
      setBioForm({
        bio: proProfile.bio || "",
        radius_km: String(proProfile.radius_km || 10),
      });
    }
  }, [proProfile]);

  const updateBio = useMutation({
    mutationFn: async (data: { bio: string; radius_km: number }) => {
      if (!user?.id) throw new Error("Não autenticado");
      const { error } = await supabase
        .from("pro_profiles")
        .update({ bio: data.bio.trim(), radius_km: data.radius_km })
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Perfil profissional atualizado!");
      queryClient.invalidateQueries({ queryKey: ["pro_profile", user?.id] });
      setEditSection(null);
    },
    onError: () => toast.error("Erro ao salvar perfil"),
  });

  // --- Address forms ---
  const [addressForm, setAddressForm] = useState({
    label: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
  });

  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const openAddressEdit = (addr: any) => {
    setAddressForm({
      label: addr.label || "",
      street: addr.street || "",
      number: addr.number || "",
      complement: addr.complement || "",
      neighborhood: addr.neighborhood || "",
      city: addr.city || "",
      state: addr.state || "",
      zip_code: addr.zip_code || "",
    });
    setEditSection(addr.id);
  };

  const openNewAddress = () => {
    setAddressForm({ label: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zip_code: "" });
    setEditSection("address-new");
  };

  const handleSaveAddress = async () => {
    if (!addressForm.label || !addressForm.street || !addressForm.number || !addressForm.neighborhood || !addressForm.city || !addressForm.state || !addressForm.zip_code) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editSection === "address-new") {
      await createAddress.mutateAsync(addressForm);
      toast.success("Endereço adicionado!");
    } else if (editSection) {
      await updateAddress.mutateAsync({ id: editSection, ...addressForm });
      toast.success("Endereço atualizado!");
    }
    setEditSection(null);
  };

  const handleDeleteAddress = async (id: string) => {
    await deleteAddress.mutateAsync(id);
    toast.success("Endereço removido");
    setEditSection(null);
  };

  // --- Availability toggle ---
  const toggleAvailability = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Não autenticado");
      const { error } = await supabase
        .from("pro_profiles")
        .update({ available_now: !proProfile?.available_now })
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pro_profile", user?.id] });
      toast.success(proProfile?.available_now ? "Você está offline" : "Você está disponível!");
    },
  });

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const userName = profile?.full_name || user?.email?.split("@")[0] || "Profissional";
  const isVerified = proProfile?.verified || false;
  const rating = proProfile?.rating || 5.0;
  const jobsDone = proProfile?.jobs_done || 0;
  const acceptanceRate = metrics?.acceptance_rate || 100;

  const formatPhone = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length <= 2) return n;
    if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  };

  const formatCpf = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    return n.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatCep = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 8);
    if (n.length <= 5) return n;
    return `${n.slice(0, 5)}-${n.slice(5)}`;
  };

  // --- Menu items that navigate away ---
  const navItems = [
    { icon: Shield, label: "Verificação", path: "/pro/verification" },
    { icon: Crown, label: "Plano", path: "/pro/plan" },
    { icon: Calendar, label: "Disponibilidade", path: "/pro/availability" },
    { icon: Wallet, label: "Saque", path: "/pro/withdraw" },
    { icon: HelpCircle, label: "Suporte", path: "/pro/support" },
    { icon: Settings, label: "Configurações", path: "/settings" },
  ];

  return (
    <PageTransition className="h-full">
      <div className="h-full bg-background flex flex-col safe-top">
        {/* Header */}
        <header className="flex-shrink-0 bg-card border-b border-border p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold border-2 border-primary/20">
                {userName.charAt(0).toUpperCase()}
              </div>
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                  <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">{userName}</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={isVerified ? "approved" : "pending"} />
                <button
                  onClick={() => toggleAvailability.mutate()}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                    proProfile?.available_now
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {proProfile?.available_now ? "● Online" : "○ Offline"}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 animate-fade-in" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card rounded-xl border border-border p-3 text-center">
              <p className="text-xl font-bold text-foreground">{rating.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Nota</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-3 text-center">
              <p className="text-xl font-bold text-foreground">{jobsDone}</p>
              <p className="text-xs text-muted-foreground">Serviços</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-3 text-center">
              <p className="text-xl font-bold text-foreground">{acceptanceRate}%</p>
              <p className="text-xs text-muted-foreground">Aceitação</p>
            </div>
          </div>

          {/* === DADOS PESSOAIS === */}
          <section className="bg-card rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setEditSection(editSection === "personal" ? null : "personal")}
              className="w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <span className="flex-1 text-left font-medium text-foreground">Dados pessoais</span>
              {editSection === "personal" ? (
                <X className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Pencil className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {editSection === "personal" && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                <InputField
                  label="Nome completo"
                  value={personalForm.full_name}
                  onChange={(e) => setPersonalForm({ ...personalForm, full_name: e.target.value })}
                  icon={<User className="w-4 h-4 text-muted-foreground" />}
                />
                <InputField
                  label="Telefone"
                  value={formatPhone(personalForm.phone)}
                  onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                  icon={<Phone className="w-4 h-4 text-muted-foreground" />}
                  inputMode="numeric"
                />
                <InputField
                  label="CPF"
                  value={formatCpf(personalForm.cpf)}
                  onChange={(e) => setPersonalForm({ ...personalForm, cpf: e.target.value })}
                  icon={<FileText className="w-4 h-4 text-muted-foreground" />}
                  inputMode="numeric"
                />
                <PrimaryButton
                  className="w-full"
                  onClick={() => updateProfile.mutate(personalForm)}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Salvar dados pessoais</span>
                  )}
                </PrimaryButton>
              </div>
            )}
          </section>

          {/* === BIO / PERFIL PRO === */}
          <section className="bg-card rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setEditSection(editSection === "bio" ? null : "bio")}
              className="w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <StarIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-medium text-foreground block">Perfil profissional</span>
                {proProfile?.bio && (
                  <span className="text-xs text-muted-foreground line-clamp-1">{proProfile.bio}</span>
                )}
              </div>
              {editSection === "bio" ? (
                <X className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Pencil className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {editSection === "bio" && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">Sobre você</label>
                  <textarea
                    value={bioForm.bio}
                    onChange={(e) => setBioForm({ ...bioForm, bio: e.target.value })}
                    placeholder="Conte um pouco sobre sua experiência..."
                    rows={3}
                    maxLength={500}
                    className="w-full py-3 px-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">{bioForm.bio.length}/500</p>
                </div>
                <InputField
                  label="Raio de atendimento (km)"
                  value={bioForm.radius_km}
                  onChange={(e) => setBioForm({ ...bioForm, radius_km: e.target.value.replace(/\D/g, "") })}
                  inputMode="numeric"
                  icon={<MapPin className="w-4 h-4 text-muted-foreground" />}
                />
                <PrimaryButton
                  className="w-full"
                  onClick={() => updateBio.mutate({ bio: bioForm.bio, radius_km: Number(bioForm.radius_km) || 10 })}
                  disabled={updateBio.isPending}
                >
                  {updateBio.isPending ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Salvar perfil</span>
                  )}
                </PrimaryButton>
              </div>
            )}
          </section>

          {/* === ENDEREÇOS === */}
          <section className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <span className="flex-1 font-medium text-foreground">Endereços</span>
              <button
                onClick={openNewAddress}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <Plus className="w-5 h-5 text-primary" />
              </button>
            </div>

            {/* List */}
            {addresses && addresses.length > 0 && (
              <div className="border-t border-border">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => openAddressEdit(addr)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors border-b border-border last:border-b-0"
                  >
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium text-foreground text-sm">{addr.label}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {addr.street}, {addr.number} - {addr.neighborhood}
                      </p>
                    </div>
                    <Pencil className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* New / Edit address form */}
            {(editSection === "address-new" || (editSection && editSection !== "personal" && editSection !== "bio" && addresses?.some((a) => a.id === editSection))) && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                <h3 className="text-sm font-medium text-foreground">
                  {editSection === "address-new" ? "Novo endereço" : "Editar endereço"}
                </h3>
                <InputField
                  label="Apelido (ex: Casa, Trabalho)"
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                />
                <InputField
                  label="CEP"
                  value={formatCep(addressForm.zip_code)}
                  onChange={(e) => setAddressForm({ ...addressForm, zip_code: e.target.value })}
                  inputMode="numeric"
                />
                <InputField
                  label="Rua"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                />
                <div className="grid grid-cols-3 gap-2">
                  <InputField
                    label="Número"
                    value={addressForm.number}
                    onChange={(e) => setAddressForm({ ...addressForm, number: e.target.value })}
                  />
                  <div className="col-span-2">
                    <InputField
                      label="Complemento"
                      value={addressForm.complement}
                      onChange={(e) => setAddressForm({ ...addressForm, complement: e.target.value })}
                    />
                  </div>
                </div>
                <InputField
                  label="Bairro"
                  value={addressForm.neighborhood}
                  onChange={(e) => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <InputField
                    label="Cidade"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  />
                  <InputField
                    label="Estado"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value.toUpperCase().slice(0, 2) })}
                    maxLength={2}
                  />
                </div>

                <div className="flex gap-2">
                  <PrimaryButton
                    className="flex-1"
                    onClick={handleSaveAddress}
                    disabled={createAddress.isPending || updateAddress.isPending}
                  >
                    {(createAddress.isPending || updateAddress.isPending) ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Salvar</span>
                    )}
                  </PrimaryButton>
                  {editSection !== "address-new" && (
                    <button
                      onClick={() => handleDeleteAddress(editSection!)}
                      disabled={deleteAddress.isPending}
                      className="p-3 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* === NAVIGATION MENU === */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {navItems.map((item, index) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors
                  ${index !== navItems.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full p-4 bg-card rounded-xl border border-border flex items-center gap-4 hover:bg-destructive/5 hover:border-destructive/20 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <span className="font-medium text-destructive">Sair da conta</span>
          </button>

          <p className="text-center text-sm text-muted-foreground mt-4 pb-4">Já Limpo v1.0.0</p>
        </main>

        <BottomNav variant="pro" />
      </div>
    </PageTransition>
  );
}
