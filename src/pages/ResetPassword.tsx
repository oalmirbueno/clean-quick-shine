import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { validatePassword } from "@/lib/passwordValidation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session) {
        toast.error("Link inválido ou expirado. Solicite um novo.");
        navigate("/forgot-password", { replace: true });
        return;
      }
      setChecking(false);
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwdError = validatePassword(password);
    if (pwdError) return toast.error(pwdError);
    if (password !== confirmPassword) return toast.error("As senhas não coincidem");

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return toast.error(error.message);

      setSuccess(true);
      toast.success("Senha atualizada com sucesso!");
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Reset password error:", err);
      toast.error("Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <AuthLayout hideMarketing showTrust={false}><div /></AuthLayout>;
  }

  if (success) {
    return (
      <AuthLayout hideMarketing showTrust={false}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Senha atualizada!
          </h1>
          <p className="text-sm text-muted-foreground">
            Agora você pode entrar com sua nova senha.
          </p>
        </div>
        <PrimaryButton
          fullWidth
          size="lg"
          className="mt-6"
          onClick={() => navigate("/login")}
        >
          Ir para o login
        </PrimaryButton>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      hideMarketing
      showTrust={false}
      eyebrow="Recuperação"
      title="Crie uma nova senha"
      subtitle="Use uma senha forte que você lembre."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <PasswordField
            label="Nova senha"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <PasswordField
          label="Confirmar nova senha"
          autoComplete="new-password"
          placeholder="Repita a senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          error={
            confirmPassword && confirmPassword !== password
              ? "As senhas não coincidem"
              : undefined
          }
        />

        <PrimaryButton
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          disabled={!password || password !== confirmPassword}
        >
          Redefinir senha
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
