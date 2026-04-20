import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

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
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      setSent(true);
      toast.success("E-mail enviado!");
    } catch (err) {
      console.error("Reset email error:", err);
      toast.error("Erro ao enviar e-mail. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout
        hideMarketing
        showTrust={false}
        onBack={() => navigate("/login")}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Verifique seu e-mail
          </h1>
          <p className="text-sm text-muted-foreground">
            Enviamos um link de recuperação para{" "}
            <strong className="text-foreground">{email}</strong>. Confira sua caixa de
            entrada e a pasta de spam.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <PrimaryButton fullWidth size="lg" onClick={() => navigate("/login")}>
            Voltar para o login
          </PrimaryButton>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Tentar com outro e-mail
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      onBack={() => navigate("/login")}
      eyebrow="Recuperação"
      title="Esqueceu sua senha?"
      subtitle="Enviaremos um link para você criar uma nova."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <PrimaryButton type="submit" fullWidth size="lg" loading={loading}>
          Enviar link de recuperação
        </PrimaryButton>
      </form>

      <button
        type="button"
        onClick={() => navigate("/login")}
        className="mt-6 mx-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Lembrei minha senha
      </button>
    </AuthLayout>
  );
}
