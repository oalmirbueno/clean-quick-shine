import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { User, Briefcase, ChevronLeft, Shield, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden fixed inset-0 safe-top">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary/3 to-transparent" />
      </div>


      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-4 lg:items-start lg:w-[45%]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm text-center lg:text-left lg:ml-auto lg:mr-12"
        >
          {/* Logo */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex justify-center lg:justify-start mb-5"
          >
            <Logo size="2xl" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-5"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Comece agora
            </h1>
            <p className="text-muted-foreground text-lg">
              Escolha como deseja usar o app
            </p>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 mb-5 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-primary" />
              <span>Verificado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span>4.9</span>
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
              onClick={() => navigate("/onboarding/client")}
              className="w-full p-4 bg-card rounded-2xl border border-border
                hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300
                flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-foreground">Quero contratar limpeza</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Star className="w-3 h-3 text-warning fill-warning" />
                  Profissionais verificadas
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
              onClick={() => navigate("/onboarding/pro")}
              className="w-full p-4 bg-card rounded-2xl border border-border
                hover:border-success/40 hover:shadow-lg hover:shadow-success/5 transition-all duration-300
                flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success/15 transition-colors">
                <Briefcase className="w-6 h-6 text-success" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-foreground">Quero trabalhar como diarista</h3>
                <p className="text-sm text-muted-foreground">
                  Ganhe dinheiro com seus serviços
                </p>
              </div>
              <ChevronLeft className="w-5 h-5 text-muted-foreground/50 rotate-180 group-hover:text-success group-hover:translate-x-1 transition-all" />
            </motion.button>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground mt-4"
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
