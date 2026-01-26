import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn, hasRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message === "Invalid login credentials" 
        ? "Email ou senha incorretos" 
        : signInError.message);
      setLoading(false);
      return;
    }

    // Small delay to allow roles to load
    setTimeout(() => {
      toast.success("Login realizado com sucesso!");
      navigate("/admin/dashboard");
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <Logo size="md" className="justify-center mb-2" />
          <p className="text-muted-foreground">Painel Administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <InputField
            label="E-mail"
            type="email"
            placeholder="admin@jalimpo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
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

          <PrimaryButton type="submit" fullWidth loading={loading}>
            Entrar no painel
          </PrimaryButton>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Para criar um admin, cadastre um usuário e adicione a role 'admin' no banco.
        </p>
      </div>
    </div>
  );
}
