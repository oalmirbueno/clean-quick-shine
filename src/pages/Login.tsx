import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { InputField } from "@/components/ui/InputField";
import { PasswordField } from "@/components/auth/PasswordField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("confirmed") === "true") {
      toast.success("Email confirmado! Faça login para continuar.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const { error, roles } = await signIn(email.trim(), password);

      if (error) {
        const isInvalid = error.message === "Invalid login credentials";
        toast.error(isInvalid ? "Email ou senha incorretos" : error.message);
        return;
      }

      toast.success("Bem-vindo de volta!");
      const userRoles = roles ?? [];

      if (userRoles.includes("admin")) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }
      if (userRoles.includes("pro")) {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: proProfile } = await supabase
          .from("pro_profiles")
          .select("verified")
          .eq("user_id", user?.id ?? "")
          .maybeSingle();
        navigate(proProfile && !proProfile.verified ? "/pro/verification" : "/pro/home", {
          replace: true,
        });
        return;
      }
      if (userRoles.includes("client")) {
        navigate("/client/home", { replace: true });
        return;
      }
      // No role — likely a stale account
      toast.error("Sua conta não tem acesso configurado. Contate o suporte.");
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      onBack={() => navigate("/onboarding")}
      eyebrow="Entrar"
      title="Bem-vindo de volta"
      subtitle="Use seu email e senha para acessar."
    >
      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        <InputField
          label="E-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div>
          <PasswordField
            label="Senha"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end mt-1.5">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-xs font-medium text-primary hover:underline"
            >
              Esqueceu a senha?
            </button>
          </div>
        </div>

        <PrimaryButton
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          disabled={!email || !password}
        >
          Entrar
        </PrimaryButton>
      </form>

      <p className="text-sm text-muted-foreground mt-6 text-center">
        Não tem conta?{" "}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="text-primary font-semibold hover:underline"
        >
          Cadastre-se grátis
        </button>
      </p>
    </AuthLayout>
  );
}
