import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type GrupoDoUsuario = {
  obrigatorio: boolean;
  confirmado: boolean;
  audience?: "client" | "pro";
  grupo: { id: string; name: string; invite_url: string } | null;
};

/** Diz se a pessoa ainda precisa passar pela tela "Entre no grupo". */
export function useGrupo() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["grupo_do_usuario", user?.id],
    queryFn: async (): Promise<GrupoDoUsuario> => {
      const { data, error } = await (supabase as any).rpc("grupo_do_usuario");
      if (error) throw error;
      return data as GrupoDoUsuario;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

/** Registra clique ou confirmação; devolve o link do grupo atual. */
export async function registrarGrupo(tipo: "clique" | "confirmou", audience?: "client" | "pro") {
  const { data, error } = await (supabase as any).rpc("grupo_registrar", {
    p_tipo: tipo,
    p_audience: audience ?? null,
  });
  if (error) throw error;
  return (data as string | null) ?? null;
}
