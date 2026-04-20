import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { User, Briefcase, Check, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { validatePassword } from "@/lib/passwordValidation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { InputField } from "@/components/ui/InputField";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type UserType = "client" | "pro";

const weekdays = [
  { id: "mon", label: "Seg" },
  { id: "tue", label: "Ter" },
  { id: "wed", label: "Qua" },
  { id: "thu", label: "Qui" },
  { id: "fri", label: "Sex" },
  { id: "sat", label: "Sáb" },
];
const periods = [
  { id: "morning", label: "Manhã" },
  { id: "afternoon", label: "Tarde" },
  { id: "evening", label: "Noite" },
];

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [userType, setUserType] = useState<UserType>("client");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneDisplay, setPhoneDisplay] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [radius, setRadius] = useState("10");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhone(raw);
    setPhoneDisplay(formatPhone(raw));
  };

  const toggle = (
    list: string[],
    setter: (v: string[]) => void,
    value: string
  ) => setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const validateStep1 = (): boolean => {
    if (!name.trim() || name.trim().length < 3) {
      toast.error("Informe seu nome completo");
      return false;
    }
    if (phone.length < 10 || phone.length > 11) {
      toast.error("Telefone inválido. Use DDD + número.");
      return false;
    }
    if (!email.includes("@")) {
      toast.error("E-mail inválido");
      return false;
    }
    const pwdError = validatePassword(password);
    if (pwdError) {
      toast.error(pwdError);
      return false;
    }
    if (userType === "client" && !acceptTerms) {
      toast.error("Aceite os termos para continuar");
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (!validateStep1()) return;
    if (userType === "pro") {
      setStep(2);
    } else {
      void handleSubmit();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) return;

    if (userType === "pro") {
      if (selectedDays.length === 0) return toast.error("Selecione pelo menos um dia");
      if (selectedPeriods.length === 0) return toast.error("Selecione pelo menos um turno");
      if (!acceptTerms) return toast.error("Aceite os termos para continuar");
    }

    setLoading(true);
    try {
      const { error } = await signUp(email.trim(), password, name.trim(), phone, userType);
      if (error) {
        toast.error(
          error.message.includes("already registered")
            ? "Este email já está cadastrado"
            : error.message
        );
        return;
      }

      if (userType === "pro") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: profileError } = await supabase.from("pro_profiles").insert({
            user_id: user.id,
            radius_km: parseInt(radius, 10),
            bio: `Disponível: ${selectedDays.join(", ")} - ${selectedPeriods.join(", ")}`,
          });
          if (profileError) {
            console.error("Pro profile insert error:", profileError);
            toast.error("Erro ao criar perfil profissional. Contate o suporte.");
            return;
          }
        }
      }

      toast.success("Conta criada! Faça login para continuar.");
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const onBack = () => {
    if (step === 2) setStep(1);
    else navigate("/onboarding");
  };

  return (
    <AuthLayout
      onBack={onBack}
      eyebrow={step === 2 ? "Etapa 2 de 2" : "Criar conta"}
      title={step === 2 ? "Sua disponibilidade" : "Vamos começar"}
      subtitle={
        step === 2
          ? "Quando e onde você quer atender?"
          : "Cadastro rápido em menos de 1 minuto."
      }
    >
      {step === 1 && (
        <>
          {/* Tipo de conta — chips inline */}
          <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-muted/50 rounded-2xl">
            {([
              { id: "client", label: "Sou Cliente", Icon: User },
              { id: "pro", label: "Sou Diarista", Icon: Briefcase },
            ] as const).map(({ id, label, Icon }) => {
              const active = userType === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setUserType(id)}
                  className={cn(
                    "relative flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-colors",
                    active
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="account-type-bg"
                      className="absolute inset-0 rounded-xl bg-card shadow-sm border border-border/60"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon className="relative w-4 h-4" />
                  <span className="relative">{label}</span>
                </button>
              );
            })}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleContinue();
            }}
            className="space-y-4"
            noValidate
          >
            <InputField
              label="Nome completo"
              autoComplete="name"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <InputField
              label="Telefone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              value={phoneDisplay}
              onChange={handlePhoneChange}
              required
            />
            <InputField
              label="E-mail"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-2">
              <PasswordField
                label="Senha"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <PasswordStrengthMeter password={password} />
            </div>

            <label className="flex items-start gap-3 pt-1 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setAcceptTerms(!acceptTerms)}
                aria-pressed={acceptTerms}
                className={cn(
                  "w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                  acceptTerms
                    ? "bg-primary border-primary"
                    : "border-input hover:border-primary/50"
                )}
              >
                {acceptTerms && <Check className="w-3 h-3 text-primary-foreground" />}
              </button>
              <span className="text-xs text-muted-foreground leading-relaxed">
                Aceito os{" "}
                <a href="/terms" target="_blank" className="text-primary hover:underline">
                  termos de uso
                </a>{" "}
                e{" "}
                <a href="/privacy" target="_blank" className="text-primary hover:underline">
                  política de privacidade
                </a>
              </span>
            </label>

            <PrimaryButton
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={!acceptTerms}
              className="group"
            >
              {userType === "pro" ? "Continuar" : "Criar conta"}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </PrimaryButton>
          </form>
        </>
      )}

      <AnimatePresence mode="wait">
        {step === 2 && userType === "pro" && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <InputField
              label="Cidade"
              placeholder="São Paulo"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Raio de atendimento
              </label>
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                {[5, 10, 15, 20, 30].map((km) => (
                  <option key={km} value={km}>
                    {km} km
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Dias disponíveis
              </label>
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => {
                  const active = selectedDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggle(selectedDays, setSelectedDays, day.id)}
                      className={cn(
                        "px-3.5 py-2 rounded-xl text-sm font-medium transition-all",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Turnos
              </label>
              <div className="flex flex-wrap gap-2">
                {periods.map((p) => {
                  const active = selectedPeriods.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggle(selectedPeriods, setSelectedPeriods, p.id)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-start gap-3 pt-1 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setAcceptTerms(!acceptTerms)}
                aria-pressed={acceptTerms}
                className={cn(
                  "w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                  acceptTerms
                    ? "bg-primary border-primary"
                    : "border-input hover:border-primary/50"
                )}
              >
                {acceptTerms && <Check className="w-3 h-3 text-primary-foreground" />}
              </button>
              <span className="text-xs text-muted-foreground leading-relaxed">
                Aceito os{" "}
                <a href="/terms" target="_blank" className="text-primary hover:underline">
                  termos
                </a>{" "}
                e{" "}
                <a href="/privacy" target="_blank" className="text-primary hover:underline">
                  política de privacidade
                </a>
              </span>
            </label>

            <PrimaryButton
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={!acceptTerms}
            >
              Criar conta de Diarista
            </PrimaryButton>
          </motion.form>
        )}
      </AnimatePresence>

      <p className="text-sm text-muted-foreground mt-6 text-center">
        Já tem conta?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-primary font-semibold hover:underline"
        >
          Entrar
        </button>
      </p>
    </AuthLayout>
  );
}
