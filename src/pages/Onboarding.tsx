import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { User, Briefcase, ChevronLeft, Sparkles, Star } from "lucide-react";
import heroCleanerImg from "@/assets/hero-cleaner-new.png";
import { motion } from "framer-motion";

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/20 flex flex-col overflow-hidden fixed inset-0 safe-top">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/30 rounded-full blur-3xl" />
      </div>

      {/* Hero Image - Full Height on Right (Desktop) */}
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
                Comece agora
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 justify-center sm:justify-start">
                <Sparkles className="w-4 h-4 text-primary" />
                Escolha como deseja usar o app
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
              onClick={() => navigate("/onboarding/client")}
              className="w-full p-5 bg-card/95 backdrop-blur-sm rounded-2xl border border-border card-shadow
                hover:card-shadow-hover hover:border-primary/30 transition-all duration-300
                flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-foreground text-lg">Quero contratar limpeza</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Star className="w-3 h-3 text-warning fill-warning" />
                  Profissionais verificadas
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
              onClick={() => navigate("/onboarding/pro")}
              className="w-full p-5 bg-card/95 backdrop-blur-sm rounded-2xl border border-border card-shadow
                hover:card-shadow-hover hover:border-success/30 transition-all duration-300
                flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center border border-success/10">
                <Briefcase className="w-7 h-7 text-success" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-foreground text-lg">Quero trabalhar como diarista</h3>
                <p className="text-sm text-muted-foreground">
                  Ganhe dinheiro com seus serviços
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
            Já tem conta?{" "}
            <button 
              onClick={() => navigate("/login")}
              className="text-primary font-semibold hover:underline"
            >
              Fazer login
            </button>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}