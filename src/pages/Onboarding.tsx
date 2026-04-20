import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

/**
 * Welcome screen — replaces the old role-selector onboarding.
 * Single, clear entry point: Sign in or Create account.
 */
export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      eyebrow={
        <>
          <Sparkles className="w-3 h-3" /> Bem-vindo ao Já Limpo
        </>
      }
      title="Limpeza profissional, em poucos toques."
      subtitle="Agende, acompanhe e pague com segurança. Tudo em um só app."
    >
      <div className="space-y-3">
        <PrimaryButton
          fullWidth
          size="lg"
          onClick={() => navigate("/register")}
          className="group"
        >
          Criar conta grátis
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </PrimaryButton>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/login")}
          className="w-full h-12 rounded-2xl border border-border/60 bg-card text-foreground font-medium hover:bg-muted transition-colors"
        >
          Já tenho conta · Entrar
        </motion.button>
      </div>

      <p className="mt-5 text-[11px] text-center text-muted-foreground leading-relaxed">
        Ao continuar você aceita nossos{" "}
        <a href="/terms" className="text-primary hover:underline">
          termos
        </a>{" "}
        e{" "}
        <a href="/privacy" className="text-primary hover:underline">
          política de privacidade
        </a>
        .
      </p>
    </AuthLayout>
  );
}
