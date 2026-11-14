import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, MessageCircle } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Logo } from "@/components/ui/Logo";
import { registrarGrupo } from "@/hooks/useGrupo";

/**
 * Link fixo para o site e materiais impressos: jalimpo.com/grupo/clientes e
 * jalimpo.com/grupo/diaristas. Sempre leva ao grupo ATUAL cadastrado no admin
 * e conta o clique, sem precisar trocar link no site quando o grupo muda.
 */
export default function GrupoPublico() {
  const { tipo } = useParams();
  const navigate = useNavigate();
  const audience = tipo === "diaristas" ? "pro" : tipo === "clientes" ? "client" : null;
  const [estado, setEstado] = useState<"indo" | "sem-grupo">("indo");
  const [link, setLink] = useState<string | null>(null);

  useEffect(() => {
    if (!audience) {
      setEstado("sem-grupo");
      return;
    }
    let vivo = true;
    registrarGrupo("clique", audience)
      .then((url) => {
        if (!vivo) return;
        if (!url) return setEstado("sem-grupo");
        setLink(url);
        window.location.replace(url);
      })
      .catch(() => vivo && setEstado("sem-grupo"));
    return () => {
      vivo = false;
    };
  }, [audience]);

  return (
    <div className="h-full bg-background flex flex-col items-center justify-center gap-6 p-6 text-center">
      <Logo size="sm" />
      {estado === "indo" ? (
        <>
          <Loader2 className="w-8 h-8 animate-spin text-primary" aria-label="Carregando" />
          <p className="text-muted-foreground">Abrindo o grupo no WhatsApp…</p>
          {link && (
            <a href={link} className="inline-flex items-center gap-2 text-primary font-medium underline-offset-4 hover:underline">
              <MessageCircle className="w-4 h-4" /> Toque aqui se não abrir
            </a>
          )}
        </>
      ) : (
        <>
          <p className="text-foreground font-medium">O grupo ainda não está disponível.</p>
          <p className="text-sm text-muted-foreground max-w-xs">Entre no Já Limpo e avisaremos por lá assim que o grupo abrir.</p>
          <PrimaryButton onClick={() => navigate("/app", { replace: true })}>Abrir o Já Limpo</PrimaryButton>
        </>
      )}
    </div>
  );
}
