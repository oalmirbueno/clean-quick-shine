import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { User, Briefcase, Check, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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
    
    // Password validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    // Pro step 2 validation
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

    // For pro users, create pro_profile
    if (userType === "pro") {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("pro_profiles").insert({
          user_id: user.id,
          radius_km: parseInt(radius),
          bio: `Disponível: ${selectedDays.join(", ")} - ${selectedPeriods.join(", ")}`,
        });
      }
    }

    toast.success("Conta criada! Faça login.");
    navigate("/login");
  };

  if (!userType) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 overflow-hidden"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-12">
            <Logo size="lg" className="justify-center mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">
              Criar conta
            </h1>
            <p className="text-muted-foreground">
              Como você quer usar o JáLimpo?
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setUserType("client")}
              className="w-full p-5 bg-card rounded-xl border border-border card-shadow
                hover:card-shadow-hover hover:border-primary/20 transition-all duration-200
                flex items-center gap-4 active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Sou Cliente</h3>
                <p className="text-sm text-muted-foreground">
                  Quero contratar limpeza
                </p>
              </div>
            </button>

            <button
              onClick={() => setUserType("pro")}
              className="w-full p-5 bg-card rounded-xl border border-border card-shadow
                hover:card-shadow-hover hover:border-primary/20 transition-all duration-200
                flex items-center gap-4 active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Sou Diarista</h3>
                <p className="text-sm text-muted-foreground">
                  Quero oferecer meus serviços
                </p>
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Já tem conta?{" "}
            <button 
              onClick={() => navigate("/login")}
              className="text-primary font-medium hover:underline"
            >
              Entrar
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Header */}
      <header className="flex-shrink-0 p-6 pb-0">
        <div className="w-full max-w-sm mx-auto">
          <button
            onClick={() => step === 1 ? setUserType(null) : setStep(1)}
            className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <Logo size="md" className="justify-center mb-4" />
            <h1 className="text-xl font-semibold text-foreground">
              {userType === "client" ? "Cadastro Cliente" : "Cadastro Diarista"}
            </h1>
            {userType === "pro" && (
              <div className="flex justify-center gap-2 mt-4">
                <div className={cn(
                  "w-8 h-1 rounded-full transition-colors",
                  step >= 1 ? "bg-primary" : "bg-border"
                )} />
                <div className={cn(
                  "w-8 h-1 rounded-full transition-colors",
                  step >= 2 ? "bg-primary" : "bg-border"
                )} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Scrollable Form Area */}
      <main className="flex-1 overflow-y-auto px-6">
        <div className="w-full max-w-sm mx-auto animate-fade-in py-4">
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                    <a href="#" className="text-primary hover:underline">
                      termos de uso
                    </a>{" "}
                    e{" "}
                    <a href="#" className="text-primary hover:underline">
                      política de privacidade
                    </a>
                  </span>
                </label>
              )}

              {userType === "client" ? (
                <PrimaryButton 
                  type="submit" 
                  fullWidth 
                  loading={loading}
                  disabled={!acceptTerms}
                >
                  Criar conta
                </PrimaryButton>
              ) : (
              <PrimaryButton 
                type="button" 
                fullWidth 
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
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background
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
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        selectedDays.includes(day.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
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
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        selectedPeriods.includes(period.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
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
                  <a href="#" className="text-primary hover:underline">
                    termos de uso
                  </a>{" "}
                  e{" "}
                  <a href="#" className="text-primary hover:underline">
                    política de privacidade
                  </a>
                </span>
              </label>

              <PrimaryButton 
                type="submit" 
                fullWidth 
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
              className="text-primary font-medium hover:underline"
            >
              Entrar
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
