import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageTransition } from "@/components/ui/PageTransition";
import { User, Briefcase, ChevronLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import heroCleanerImg from "@/assets/hero-cleaner-bg.png";
import { motion } from "framer-motion";

type UserType = "client" | "pro" | null;

export default function Login() {
  const navigate = useNavigate();
  const { signIn, refreshRoles } = useAuth();
  const [userType, setUserType] = useState<UserType>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      } else if (userRoles.includes("client")) {
        navigate("/client/home");
      } else if (userRoles.includes("pro")) {
        navigate("/pro/home");
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
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/20 flex flex-col overflow-hidden fixed inset-0 safe-top">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/30 rounded-full blur-3xl" />
          </div>

          {/* Hero Image - Full Height on Right */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute right-0 bottom-0 h-full w-1/2 pointer-events-none hidden sm:block"
          >
            <div className="relative h-full w-full flex items-end justify-center">
              <img 
                src={heroCleanerImg} 
                alt="Profissional de limpeza" 
                className="h-[85%] w-auto object-contain object-bottom drop-shadow-2xl"
              />
              {/* Gradient overlay to blend with background */}
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
            </div>
          </motion.div>

          {/* Mobile Hero Image */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 0.15, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute right-0 bottom-0 sm:hidden pointer-events-none"
          >
            <img 
              src={heroCleanerImg} 
              alt="" 
              className="h-[50vh] w-auto object-contain object-bottom"
            />
          </motion.div>

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col justify-center p-6 sm:w-1/2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-sm mx-auto sm:mx-0 sm:ml-auto sm:mr-8 lg:mr-16"
            >
              {/* Logo and Title */}
              <div className="text-center sm:text-left mb-10">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="flex justify-center sm:justify-start mb-6"
                >
                  <Logo size="2xl" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    Bem-vindo ao Já Limpo
                  </h1>
                  <p className="text-muted-foreground flex items-center gap-2 justify-center sm:justify-start">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Limpeza de qualidade a um clique
                  </p>
                </motion.div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02, translateX: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserType("client")}
                  className="w-full p-5 bg-card/95 backdrop-blur-sm rounded-2xl border border-border card-shadow
                    hover:card-shadow-hover hover:border-primary/30 transition-all duration-300
                    flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                    <User className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-foreground text-lg">Sou Cliente</h3>
                    <p className="text-sm text-muted-foreground">
                      Quero contratar limpeza
                    </p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180" />
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02, translateX: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserType("pro")}
                  className="w-full p-5 bg-card/95 backdrop-blur-sm rounded-2xl border border-border card-shadow
                    hover:card-shadow-hover hover:border-success/30 transition-all duration-300
                    flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center border border-success/10">
                    <Briefcase className="w-7 h-7 text-success" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-foreground text-lg">Sou Diarista</h3>
                    <p className="text-sm text-muted-foreground">
                      Quero oferecer meus serviços
                    </p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180" />
                </motion.button>
              </div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center sm:text-left text-sm text-muted-foreground mt-8"
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/20 flex flex-col overflow-hidden fixed inset-0 safe-top">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/30 rounded-full blur-3xl" />
        </div>

        {/* Hero Image - Desktop */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute right-0 bottom-0 h-full w-1/2 pointer-events-none hidden sm:block"
        >
          <div className="relative h-full w-full flex items-end justify-center">
            <img 
              src={heroCleanerImg} 
              alt="Profissional de limpeza" 
              className="h-[85%] w-auto object-contain object-bottom drop-shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
          </div>
        </motion.div>

        {/* Mobile Hero Image */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 0.1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="absolute right-0 bottom-0 sm:hidden pointer-events-none"
        >
          <img 
            src={heroCleanerImg} 
            alt="" 
            className="h-[45vh] w-auto object-contain object-bottom"
          />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center p-6 sm:w-1/2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm mx-auto sm:mx-0 sm:ml-auto sm:mr-8 lg:mr-16"
          >
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setUserType(null)}
              className="w-11 h-11 rounded-xl bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-card transition-colors mb-6 card-shadow"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </motion.button>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center sm:text-left mb-8"
            >
              <div className="flex justify-center sm:justify-start mb-4">
                <Logo size="xl" />
              </div>
              <h1 className="text-xl font-bold text-foreground">
                {userType === "client" ? "Entrar como Cliente" : "Entrar como Diarista"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Digite seus dados para continuar
              </p>
            </motion.div>

            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleLogin} 
              className="space-y-4"
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

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-primary font-medium hover:underline"
              >
                Esqueceu a senha?
              </button>

              <PrimaryButton type="submit" fullWidth loading={loading}>
                Entrar
              </PrimaryButton>
            </motion.form>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center sm:text-left text-sm text-muted-foreground mt-6"
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