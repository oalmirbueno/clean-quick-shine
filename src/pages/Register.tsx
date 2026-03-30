import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { User, Briefcase, Check, ChevronLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

type UserType = "client" | "pro" | null;

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
  const [userType, setUserType] = useState<UserType>(null);
  const [step, setStep] = useState(1);
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

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const togglePeriod = (period: string) => {
    setSelectedPeriods(prev => 
      prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period]
    );
  };

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

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "Senha deve ter no mínimo 8 caracteres";
    if (!/[A-Z]/.test(pwd)) return "Senha deve ter pelo menos 1 letra maiúscula";
    if (!/[a-z]/.test(pwd)) return "Senha deve ter pelo menos 1 letra minúscula";
    if (!/[0-9]/.test(pwd)) return "Senha deve ter pelo menos 1 número";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Senha deve ter pelo menos 1 caractere especial";
    const commonPasswords = [
      "12345678", "password", "123456789", "qwerty123", "password1",
      "11111111", "abc12345", "iloveyou", "admin123", "welcome1",
      "monkey12", "master12", "qwerty12", "letmein1", "trustno1",
      "jalimpo1", "jalimpo123", "limpeza1", "limpeza123",
    ];
    if (commonPasswords.includes(pwd.toLowerCase())) {
      return "Esta senha é muito comum. Escolha uma senha mais segura.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phone.length < 10 || phone.length > 11) {
      toast.error("Telefone inválido. Use DDD + número (10 ou 11 dígitos).");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (userType === "pro" && step === 2) {
      if (selectedDays.length === 0) {
        toast.error("Selecione pelo menos um dia disponível");
        return;
      }
      if (selectedPeriods.length === 0) {
        toast.error("Selecione pelo menos um turno disponível");
        return;
      }
    }

    setLoading(true);
    
    const role = userType === "client" ? "client" : "pro";
    const { error } = await signUp(email, password, name, phone, role);
    
    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Este email já está cadastrado");
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }

    if (userType === "pro") {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { error: profileError } = await supabase.from("pro_profiles").insert({
          user_id: currentUser.id,
          radius_km: parseInt(radius),
          bio: `Disponível: ${selectedDays.join(", ")} - ${selectedPeriods.join(", ")}`,
        });
        if (profileError) {
          console.error("Pro profile insert error:", profileError);
          toast.error("Erro ao criar perfil profissional. Tente novamente ou entre em contato com o suporte.");
          setLoading(false);
          return;
        }
      }
    }

    toast.success("Conta criada! Faça login.");
    navigate("/login");
  };

  if (!userType) {
    return (
      <div className="h-full bg-background flex flex-col overflow-hidden"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* Subtle gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            <div className="text-center mb-10">
              <Logo size="xl" className="justify-center mb-5" />
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Criar conta
              </h1>
              <p className="text-muted-foreground">
                Como você quer usar o Já Limpo?
              </p>
            </div>

            <div className="space-y-3">
              <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUserType("client")}
                className="w-full p-4 bg-card rounded-2xl border border-border/60
                  hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300
                  flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-foreground">Sou Cliente</h3>
                  <p className="text-sm text-muted-foreground">Quero contratar limpeza</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUserType("pro")}
                className="w-full p-4 bg-card rounded-2xl border border-border/60
                  hover:border-success/40 hover:shadow-lg hover:shadow-success/5 transition-all duration-300
                  flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success/15 transition-colors">
                  <Briefcase className="w-6 h-6 text-success" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-foreground">Sou Diarista</h3>
                  <p className="text-sm text-muted-foreground">Quero oferecer meus serviços</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-success group-hover:translate-x-0.5 transition-all" />
              </motion.button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Já tem conta?{" "}
              <button 
                onClick={() => navigate("/login")}
                className="text-primary font-semibold hover:underline"
              >
                Entrar
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background flex flex-col"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Header */}
      <header className="flex-shrink-0 px-5 pt-3 pb-0">
        <div className="w-full max-w-sm mx-auto">
          <button
            onClick={() => step === 1 ? setUserType(null) : setStep(1)}
            className="w-10 h-10 rounded-xl bg-card border border-border/60 flex items-center justify-center hover:bg-muted transition-colors mb-5"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="mb-5">
            <Logo size="md" className="mb-4" />
            <h1 className="text-xl font-bold text-foreground">
              {userType === "client" ? "Cadastro Cliente" : "Cadastro Diarista"}
            </h1>
            {userType === "pro" && (
              <div className="flex gap-2 mt-4">
                <div className={cn(
                  "flex-1 h-1 rounded-full transition-colors",
                  step >= 1 ? "bg-primary" : "bg-border"
                )} />
                <div className={cn(
                  "flex-1 h-1 rounded-full transition-colors",
                  step >= 2 ? "bg-primary" : "bg-border"
                )} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Scrollable Form Area */}
      <main className="flex-1 overflow-y-auto px-5">
        <div className="w-full max-w-sm mx-auto py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <InputField
                label="Nome completo"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              
              <InputField
                label="Telefone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phoneDisplay}
                onChange={handlePhoneChange}
                required
              />
              
              <InputField
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <InputField
                label="Senha"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {userType === "client" && (
                <label className="flex items-start gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAcceptTerms(!acceptTerms)}
                    className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5",
                      "transition-colors",
                      acceptTerms 
                        ? "bg-primary border-primary" 
                        : "border-input hover:border-primary/50"
                    )}
                  >
                    {acceptTerms && <Check className="w-3 h-3 text-primary-foreground" />}
                  </button>
                  <span className="text-sm text-muted-foreground">
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
              )}

              {userType === "client" ? (
                <PrimaryButton 
                  type="submit" 
                  fullWidth
                  size="lg"
                  loading={loading}
                  disabled={!acceptTerms}
                >
                  Criar conta
                </PrimaryButton>
              ) : (
              <PrimaryButton 
                type="button" 
                fullWidth
                size="lg"
                disabled={password.length < 8 || !name || !phone || !email}
                onClick={() => setStep(2)}
              >
                  Continuar
                </PrimaryButton>
              )}
            </>
          )}

          {step === 2 && userType === "pro" && (
            <>
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
                  className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background
                    text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 
                    focus:border-primary transition-all duration-200"
                >
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="15">15 km</option>
                  <option value="20">20 km</option>
                  <option value="30">30 km</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  Dias disponíveis
                </label>
                <div className="flex flex-wrap gap-2">
                  {weekdays.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                        selectedDays.includes(day.id)
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  Turnos disponíveis
                </label>
                <div className="flex flex-wrap gap-2">
                  {periods.map((period) => (
                    <button
                      key={period.id}
                      type="button"
                      onClick={() => togglePeriod(period.id)}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                        selectedPeriods.includes(period.id)
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAcceptTerms(!acceptTerms)}
                  className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5",
                    "transition-colors",
                    acceptTerms 
                      ? "bg-primary border-primary" 
                      : "border-input hover:border-primary/50"
                  )}
                >
                  {acceptTerms && <Check className="w-3 h-3 text-primary-foreground" />}
                </button>
                <span className="text-sm text-muted-foreground">
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
              >
                Criar conta
              </PrimaryButton>
            </>
          )}
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6 pb-6">
            Já tem conta?{" "}
            <button 
              onClick={() => navigate("/login")}
              className="text-primary font-semibold hover:underline"
            >
              Entrar
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
