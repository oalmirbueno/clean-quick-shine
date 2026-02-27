import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageTransition } from "@/components/ui/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Digite seu e-mail");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setSent(true);
      toast.success("E-mail enviado com sucesso!");
    } catch (err) {
      console.error("Error sending reset email:", err);
      toast.error("Erro ao enviar e-mail. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <PageTransition>
        <div className="h-full bg-background flex flex-col items-center justify-center p-6 overflow-hidden safe-top safe-bottom">
          <div className="w-full max-w-sm animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                E-mail enviado!
              </h1>
              <p className="text-muted-foreground">
                Enviamos um link de recuperação para <strong>{email}</strong>. 
                Verifique sua caixa de entrada e spam.
              </p>
            </div>

            <div className="space-y-4">
              <PrimaryButton 
                fullWidth 
                onClick={() => navigate("/login")}
              >
                Voltar para o login
              </PrimaryButton>
              
              <button
                onClick={() => setSent(false)}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Tentar outro e-mail
              </button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div 
        className="h-full bg-background flex flex-col overflow-hidden"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)' }}
      >
        {/* Back button at top */}
        <div className="px-4 py-2 shrink-0">
          <button
            onClick={() => navigate("/login")}
            className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 pb-10">
        <div className="w-full max-w-sm mx-auto animate-fade-in">
          <div className="text-center mb-8">
            <Logo size="md" className="justify-center mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">
              Esqueceu sua senha?
            </h1>
            <p className="text-sm text-muted-foreground">
              Digite seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <InputField
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail className="absolute right-3 top-9 w-5 h-5 text-muted-foreground" />
            </div>

            <PrimaryButton type="submit" fullWidth loading={loading}>
              Enviar link de recuperação
            </PrimaryButton>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Lembrou a senha?{" "}
            <button 
              onClick={() => navigate("/login")}
              className="text-primary font-medium hover:underline"
            >
              Fazer login
            </button>
          </p>
        </div>
        </div>
      </div>
    </PageTransition>
  );
}
