import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageTransition } from "@/components/ui/PageTransition";
import { User, Briefcase, ChevronLeft, Shield, Clock, Star, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type UserType = "client" | "pro" | null;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const [userType, setUserType] = useState<UserType>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("confirmed") === "true") {
      toast.success("Email confirmado com sucesso! Agora faça login.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error, roles } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message === "Invalid login credentials" 
          ? "Email ou senha incorretos" 
          : error.message);
        return;
      }

      toast.success("Login realizado com sucesso!");
      
      const userRoles = roles || [];
      
      if (userRoles.includes("admin")) {
        navigate("/admin/dashboard");
      } else if (userRoles.includes("pro")) {
        const { data: proProfile } = await supabase
          .from("pro_profiles")
          .select("verified")
          .eq("user_id", (await supabase.auth.getUser()).data.user?.id || "")
          .maybeSingle();
        if (proProfile && !proProfile.verified) {
          navigate("/pro/verification");
        } else {
          navigate("/pro/home");
        }
      } else if (userRoles.includes("client")) {
        navigate("/client/home");
      } else if (userType) {
        navigate(userType === "client" ? "/client/home" : "/pro/home");
      } else {
        toast.error("Erro ao determinar tipo de conta");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!userType) {
    return (
      <PageTransition>
        <div className="h-full bg-background flex flex-col overflow-hidden"
          style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          {/* Subtle gradient accent */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/8 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-sm"
            >
              {/* Logo */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex justify-center mb-8"
              >
                <Logo size="2xl" />
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-center mb-8"
              >
                <h1 className="text-3xl font-bold text-foreground mb-1">
                  Bem-vindo
                </h1>
                <p className="text-muted-foreground">
                  Serviços de limpeza profissional
                </p>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex items-center justify-center gap-5 mb-8"
              >
                {[
                  { icon: Shield, label: "Verificado", color: "text-primary" },
                  { icon: Star, label: "4.9", color: "text-warning" },
                  { icon: Clock, label: "Rápido", color: "text-success" },
                ].map((badge) => (
                  <div key={badge.label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <badge.icon className={`w-4 h-4 ${badge.color} ${badge.label === "4.9" ? "fill-warning" : ""}`} />
                    <span>{badge.label}</span>
                  </div>
                ))}
              </motion.div>

              {/* Options */}
              <div className="space-y-3">
                <motion.button
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.01 }}
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
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.01 }}
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

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-muted-foreground mt-6 text-center"
              >
                Não tem conta?{" "}
                <button 
                  onClick={() => navigate("/register")}
                  className="text-primary font-semibold hover:underline"
                >
                  Cadastre-se grátis
                </button>
              </motion.p>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
       <div className="h-full bg-background flex flex-col overflow-hidden"
          style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* Subtle gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/8 blur-3xl" />
        </div>

        {/* Back button at top */}
        <div className="relative z-10 px-5 py-3 shrink-0">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUserType(null)}
            className="w-10 h-10 rounded-xl bg-card border border-border/60 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 pb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm mx-auto"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex justify-center mb-6">
                <Logo size="lg" />
              </div>
              <h1 className="text-2xl font-bold text-foreground text-center">
                {userType === "client" ? "Entrar como Cliente" : "Entrar como Diarista"}
              </h1>
              <p className="text-muted-foreground mt-1 text-center">
                Digite seus dados para continuar
              </p>
            </motion.div>

            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleLogin} 
              className="space-y-5"
            >
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <PrimaryButton type="submit" fullWidth size="lg" loading={loading}>
                Entrar
              </PrimaryButton>
            </motion.form>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground mt-6 text-center"
            >
              Não tem conta?{" "}
              <button 
                onClick={() => navigate("/register")}
                className="text-primary font-semibold hover:underline"
              >
                Cadastre-se grátis
              </button>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
