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

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("pro-documents")
        .getPublicUrl(filePath);

      // Check if document already exists
      const { data: existing } = await supabase
        .from("pro_documents")
        .select("id")
        .eq("user_id", user.id)
        .eq("doc_type", docType)
        .maybeSingle();

      if (existing) {
        // Update existing document
        const { error: updateError } = await supabase
          .from("pro_documents")
          .update({
            file_url: urlData.publicUrl,
            file_name: file.name,
            status: "pending",
            rejection_reason: null,
          })
          .eq("id", existing.id);

        if (updateError) throw updateError;
      } else {
        // Insert new document
        const { error: insertError } = await supabase
          .from("pro_documents")
          .insert({
            user_id: user.id,
            doc_type: docType,
            file_url: urlData.publicUrl,
            file_name: file.name,
            status: "pending",
          });

        if (insertError) throw insertError;
      }

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
    return documents.find((d) => d.doc_type === docType);
  };

  return {
    documents,
    isLoading,
    uploadDocument: uploadDocument.mutate,
    isUploading: uploadDocument.isPending,
    getDocumentStatus,
  };
}
