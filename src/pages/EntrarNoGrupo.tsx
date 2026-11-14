import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/ui/PageTransition";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useGrupo, registrarGrupo } from "@/hooks/useGrupo";

/**
 * Passo obrigatório depois do cadastro: entrar no grupo de WhatsApp do
 * próprio tipo (cliente ou diarista). O WhatsApp não avisa quem entrou,
 * então guardamos o clique no convite e a confirmação da pessoa.
 */
export default function EntrarNoGrupo() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, loading, hasRole } = useAuth();
  const { data, isLoading } = useGrupo();
  const [clicou, setClicou] = useState(false);
  const [salvando, setSalvando] = useState(false);

  if (!loading && !user) return <Navigate to="/login" replace />;

  const destino = hasRole("admin") ? "/admin/dashboard" : hasRole("pro") ? "/pro/home" : "/client/home";

  if (loading || isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" aria-label="Carregando" />
      </div>
    );
  }

  if (!data?.grupo) return <Navigate to={destino} replace />;

  const ehDiarista = data.audience === "pro";

  const abrirGrupo = () => {
    // abre na hora (clique direto) para o navegador do iPhone não bloquear
    window.open(data.grupo!.invite_url, "_blank");
    setClicou(true);
    registrarGrupo("clique").catch(() => {});
  };

  const confirmar = async () => {
    setSalvando(true);
    try {
      await registrarGrupo("confirmou");
      await qc.invalidateQueries({ queryKey: ["grupo_do_usuario"] });
      navigate(destino, { replace: true });
    } catch {
      toast.error("Não deu para salvar agora. Tente de novo.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <PageTransition>
      <div className="h-full bg-background flex flex-col safe-top">
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-md min-h-full flex flex-col justify-center gap-7 p-6">
            <div className="flex justify-center">
              <Logo size="sm" />
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-20 h-20 rounded-full bg-[#25D366]/15 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-[#128C7E]" />
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {data.confirmado ? "Seu grupo no WhatsApp" : "Falta só um passo"}
              </h1>
              <p className="text-[15px] text-muted-foreground leading-relaxed max-w-xs">
                {ehDiarista
                  ? "Entre no grupo das diaristas do Já Limpo. É por lá que avisamos sobre serviços, pagamentos e novidades."
                  : "Entre no grupo de clientes do Já Limpo. É por lá que avisamos sobre novidades, vagas e ofertas."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/60 text-center">
              <p className="text-xs text-muted-foreground mb-1">Grupo</p>
              <p className="font-semibold text-foreground">{data.grupo.name}</p>
            </div>

            <div className="space-y-3">
              <PrimaryButton fullWidth onClick={abrirGrupo}>
                <span className="inline-flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  {clicou ? "Abrir o grupo de novo" : "Entrar no grupo"}
                </span>
              </PrimaryButton>

              {!data.confirmado && (
                <button
                  onClick={confirmar}
                  disabled={!clicou || salvando}
                  className="w-full h-12 rounded-xl border border-border bg-card text-foreground font-medium inline-flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
                >
                  {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Já entrei, continuar
                </button>
              )}
              {data.confirmado && (
                <button
                  onClick={() => navigate(destino, { replace: true })}
                  className="w-full h-12 rounded-xl border border-border bg-card text-foreground font-medium"
                >
                  Voltar
                </button>
              )}
              {!data.confirmado && !clicou && (
                <p className="text-xs text-center text-muted-foreground">
                  Toque em “Entrar no grupo” primeiro. Depois volte aqui para continuar.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
