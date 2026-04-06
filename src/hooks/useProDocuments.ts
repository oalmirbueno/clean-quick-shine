import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ProDocument {
  id: string;
  user_id: string;
  doc_type: string;
  file_url: string;
  file_name: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useProDocuments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["pro_documents", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("pro_documents")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as ProDocument[];
    },
    enabled: !!user?.id,
  });

  const uploadDocument = useMutation({
    mutationFn: async ({
      docType,
      file,
    }: {
      docType: string;
      file: File;
    }) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${docType}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("pro-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Always insert a new record to preserve full history
      const { error: insertError } = await supabase
        .from("pro_documents")
        .insert({
          user_id: user.id,
          doc_type: docType,
          file_url: filePath,
          file_name: file.name,
          status: "pending",
        });

      if (insertError) throw insertError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pro_documents", user?.id] });
      toast.success("Documento enviado para análise!");
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast.error("Erro ao enviar documento. Tente novamente.");
    },
  });

  const getDocumentStatus = (docType: string): ProDocument | undefined => {
    // Return the most recent document of this type
    const matching = documents
      .filter((d) => d.doc_type === docType)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return matching[0];
  };

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
    uploadDocument: uploadDocument.mutate,
    uploadDocumentAsync: uploadDocument.mutateAsync,
    isUploading: uploadDocument.isPending,
    getDocumentStatus,
    getSignedUrl,
  };
}
