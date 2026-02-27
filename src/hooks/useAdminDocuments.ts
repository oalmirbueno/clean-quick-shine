import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminDocument {
  id: string;
  user_id: string;
  doc_type: string;
  file_url: string;
  file_name: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    phone: string | null;
  };
}

export function useAdminDocuments() {
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["admin_documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pro_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each document
      const userIds = [...new Set(data.map((d) => d.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      return data.map((doc) => ({
        ...doc,
        status: doc.status as "pending" | "approved" | "rejected",
        profile: profileMap.get(doc.user_id) || null,
      })) as AdminDocument[];
    },
  });

  const approveDocument = useMutation({
    mutationFn: async (documentId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("pro_documents")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          rejection_reason: null,
        })
        .eq("id", documentId);

      if (error) throw error;

      // Get document info for notification
      const doc = documents.find((d) => d.id === documentId);
      if (doc) {
        await supabase.from("notifications").insert({
          user_id: doc.user_id,
          title: "Documento aprovado",
          message: `Seu documento "${getDocTypeName(doc.doc_type)}" foi aprovado!`,
          type: "success",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_documents"] });
      toast.success("Documento aprovado!");
    },
    onError: () => {
      toast.error("Erro ao aprovar documento");
    },
  });

  const rejectDocument = useMutation({
    mutationFn: async ({
      documentId,
      reason,
    }: {
      documentId: string;
      reason: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("pro_documents")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          rejection_reason: reason,
        })
        .eq("id", documentId);

      if (error) throw error;

      // Get document info for notification
      const doc = documents.find((d) => d.id === documentId);
      if (doc) {
        await supabase.from("notifications").insert({
          user_id: doc.user_id,
          title: "Documento rejeitado",
          message: `Seu documento "${getDocTypeName(doc.doc_type)}" foi rejeitado. Motivo: ${reason}`,
          type: "warning",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_documents"] });
      toast.success("Documento rejeitado");
    },
    onError: () => {
      toast.error("Erro ao rejeitar documento");
    },
  });

  const pendingCount = documents.filter((d) => d.status === "pending").length;

  const getSignedUrl = async (filePath: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from("pro-documents")
      .createSignedUrl(filePath, 3600); // 1 hour expiry
    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }
    return data.signedUrl;
  };

  return {
    documents,
    isLoading,
    approveDocument: approveDocument.mutate,
    rejectDocument: rejectDocument.mutate,
    isApproving: approveDocument.isPending,
    isRejecting: rejectDocument.isPending,
    pendingCount,
    getSignedUrl,
  };
}

function getDocTypeName(docType: string): string {
  const names: Record<string, string> = {
    cpf: "CPF",
    rg: "RG ou CNH",
    selfie: "Selfie com documento",
    comprovante_endereco: "Comprovante de Endereço",
    antecedentes: "Certidão de Antecedentes",
    id_front: "RG/CNH (Frente)",
    id_back: "RG/CNH (Verso)",
    proof_residence: "Comprovante de Residência",
  };
  return names[docType] || docType;
}
