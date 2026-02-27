import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PageTransition } from "@/components/ui/PageTransition";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Logo } from "@/components/ui/Logo";
import { supabase } from "@/integrations/supabase/client";
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const email = (location.state as { email?: string })?.email || "";

  const handleResend = async () => {
    if (!email) {
      toast.error("Email não encontrado. Faça o cadastro novamente.");
      return;
    }

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        toast.error("Erro ao reenviar email. Tente novamente.");
      } else {
        setResent(true);
        toast.success("Email reenviado!");
        setTimeout(() => setResent(false), 30000);
      }
    } catch {
      toast.error("Erro ao reenviar email");
    } finally {
      setResending(false);
    }
  };

  return (
    <PageTransition>
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 safe-top safe-bottom">
        <div className="w-full max-w-sm animate-fade-in text-center">
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-3">
            Confirme seu email
          </h1>

          <p className="text-muted-foreground mb-2">
            Enviamos um link de confirmação para:
          </p>

          {email && (
            <p className="font-semibold text-foreground mb-4 break-all">
              {email}
            </p>
          )}

          <p className="text-sm text-muted-foreground mb-8">
            Clique no link do email para ativar sua conta. Verifique também a pasta de spam.
          </p>

          <div className="space-y-3">
            <PrimaryButton
              fullWidth
              onClick={handleResend}
              loading={resending}
              disabled={resent}
              variant="outline"
            >
              {resent ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Email reenviado!
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reenviar email
                </>
              )}
            </PrimaryButton>

            <PrimaryButton
              fullWidth
              onClick={() => navigate("/login")}
            >
              Já confirmei, fazer login
            </PrimaryButton>

            <button
              onClick={() => navigate("/register")}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao cadastro
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
