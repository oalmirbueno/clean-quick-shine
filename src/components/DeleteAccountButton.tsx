import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

/**
 * Botão de "Excluir minha conta" (LGPD). Confirma, chama a edge function,
 * desloga e volta para o login. Exibível nas telas de perfil.
 */
export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const deleteAccount = useDeleteAccount();

  const handleConfirm = async () => {
    try {
      await deleteAccount.mutateAsync();
      toast.success("Conta excluída. Sentiremos sua falta.");
      await signOut();
      navigate("/login", { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir conta");
      setOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full mt-3 p-4 bg-card rounded-xl border border-border flex items-center gap-4
          hover:bg-destructive/5 hover:border-destructive/20 transition-colors card-shadow"
      >
        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
          <Trash2 className="w-5 h-5 text-destructive" />
        </div>
        <span className="font-medium text-destructive">Excluir minha conta</span>
      </button>

      <ConfirmModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Excluir sua conta?"
        description="Esta ação é permanente. Seus dados pessoais serão removidos. Pedidos e pagamentos são mantidos de forma anonimizada por obrigação fiscal. Serviços ou saques em aberto impedem a exclusão."
        confirmText="Excluir definitivamente"
        loading={deleteAccount.isPending}
      />
    </>
  );
}
