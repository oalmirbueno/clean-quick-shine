import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageTransition } from "@/components/ui/PageTransition";
import { User, Briefcase, ChevronLeft, Shield, Clock, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import heroCleanerImg from "@/assets/hero-cleaner-pro.png";
import { motion } from "framer-motion";

type UserType = "client" | "pro" | null;

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
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
        <div className="min-h-screen bg-background flex flex-col overflow-hidden fixed inset-0">
          {/* Background Pattern */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-primary/5 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary/3 to-transparent" />
          </div>

          {/* Hero Image - Desktop */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute right-0 bottom-0 h-full w-[55%] pointer-events-none hidden lg:flex items-end justify-center"
          >
            <img 
              src={heroCleanerImg} 
              alt="Profissional de limpeza" 
              className="h-[92%] w-auto object-contain object-bottom drop-shadow-2xl"
            />
          </motion.div>

          {/* Mobile Hero Image */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute right-0 bottom-0 lg:hidden pointer-events-none"
          >
            <img 
              src={heroCleanerImg} 
              alt="" 
              className="h-[55vh] w-auto object-contain object-bottom"
            />
          </motion.div>

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-12 lg:w-[45%]">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto lg:mr-12"
            >
              {/* Logo */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mb-8"
              >
                <Logo size="2xl" />
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-10"
              >
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Bem-vindo
                </h1>
                <p className="text-muted-foreground text-lg">
                  Serviços de limpeza profissional
                </p>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex items-center gap-6 mb-8 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Verificado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  <span>4.9 estrelas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-success" />
                  <span>Rápido</span>
                </div>
              </motion.div>

              {/* Options */}
              <div className="space-y-4">
                <motion.button
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setUserType("client")}
                  className="w-full p-5 bg-card rounded-2xl border border-border
                    hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300
                    flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <User className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-foreground text-lg">Sou Cliente</h3>
                    <p className="text-sm text-muted-foreground">
                      Quero contratar limpeza
                    </p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-muted-foreground/50 rotate-180 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setUserType("pro")}
                  className="w-full p-5 bg-card rounded-2xl border border-border
                    hover:border-success/40 hover:shadow-lg hover:shadow-success/5 transition-all duration-300
                    flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success/15 transition-colors">
                    <Briefcase className="w-7 h-7 text-success" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-foreground text-lg">Sou Diarista</h3>
                    <p className="text-sm text-muted-foreground">
                      Quero oferecer meus serviços
                    </p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-muted-foreground/50 rotate-180 group-hover:text-success group-hover:translate-x-1 transition-all" />
                </motion.button>
              </div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-muted-foreground mt-10"
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
      <div className="min-h-screen bg-background flex flex-col overflow-hidden fixed inset-0">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-primary/5 to-transparent" />
        </div>

        {/* Hero Image - Desktop */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute right-0 bottom-0 h-full w-[55%] pointer-events-none hidden lg:flex items-end justify-center"
        >
          <img 
            src={heroCleanerImg} 
            alt="Profissional de limpeza" 
            className="h-[92%] w-auto object-contain object-bottom drop-shadow-2xl"
          />
        </motion.div>

        {/* Mobile Hero Image */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="absolute right-0 bottom-0 lg:hidden pointer-events-none"
        >
          <img 
            src={heroCleanerImg} 
            alt="" 
            className="h-[50vh] w-auto object-contain object-bottom"
          />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-12 lg:w-[45%]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto lg:mr-12"
          >
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setUserType(null)}
              className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors mb-8"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </motion.button>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <Logo size="xl" />
              <h1 className="text-2xl font-bold text-foreground mt-6">
                {userType === "client" ? "Entrar como Cliente" : "Entrar como Diarista"}
              </h1>
              <p className="text-muted-foreground mt-1">
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
              className="text-sm text-muted-foreground mt-8"
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
