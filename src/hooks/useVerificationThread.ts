import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface VerificationMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_role: "admin" | "pro" | "system";
  body: string;
  attachment_url: string | null;
  created_at: string;
}

export interface VerificationThread {
  id: string;
  user_id: string;
  status: "open" | "resolved";
  last_message_at: string | null;
  unread_admin: number;
  unread_pro: number;
  created_at: string;
  updated_at: string;
}

const client = supabase as any;

/**
 * Hook to load/create a verification thread and its messages.
 * Works for both admin (viewing any pro's thread) and pro (own thread).
 */
export function useVerificationThread(proUserId: string | undefined) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const threadQuery = useQuery({
    queryKey: ["verification_thread", proUserId],
    enabled: !!proUserId && !!user?.id,
    queryFn: async (): Promise<VerificationThread | null> => {
      if (!proUserId) return null;
      const { data: idData, error: rpcErr } = await client.rpc(
        "get_or_create_verification_thread",
        { p_user_id: proUserId }
      );
      if (rpcErr) throw rpcErr;
      const { data, error } = await client
        .from("verification_threads")
        .select("*")
        .eq("id", idData)
        .maybeSingle();
      if (error) throw error;
      return data as VerificationThread;
    },
  });

  const threadId = threadQuery.data?.id;

  const messagesQuery = useQuery({
    queryKey: ["verification_messages", threadId],
    enabled: !!threadId,
    queryFn: async (): Promise<VerificationMessage[]> => {
      const { data, error } = await client
        .from("verification_messages")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as VerificationMessage[];
    },
  });

  // Realtime updates
  useEffect(() => {
    if (!threadId) return;
    const channel = supabase
      .channel(`verification_messages_${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "verification_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["verification_messages", threadId] });
          qc.invalidateQueries({ queryKey: ["verification_thread", proUserId] });
          qc.invalidateQueries({ queryKey: ["admin_verifications"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, proUserId, qc]);

  const sendMessage = useMutation({
    mutationFn: async ({
      body,
      role,
      attachmentUrl,
    }: {
      body: string;
      role: "admin" | "pro";
      attachmentUrl?: string | null;
    }) => {
      if (!user?.id || !threadId) throw new Error("Sem sessão ou thread");
      const { error } = await client.from("verification_messages").insert({
        thread_id: threadId,
        sender_id: user.id,
        sender_role: role,
        body: body.trim(),
        attachment_url: attachmentUrl ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["verification_messages", threadId] });
      qc.invalidateQueries({ queryKey: ["admin_verifications"] });
    },
    onError: (e: any) => {
      toast.error("Erro ao enviar mensagem: " + (e?.message || "tente novamente"));
    },
  });

  const markRead = useMutation({
    mutationFn: async () => {
      if (!threadId) return;
      await client.rpc("mark_verification_thread_read", { p_thread_id: threadId });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["verification_thread", proUserId] });
      qc.invalidateQueries({ queryKey: ["admin_verifications"] });
    },
  });

  return {
    thread: threadQuery.data,
    messages: messagesQuery.data || [],
    isLoading: threadQuery.isLoading || messagesQuery.isLoading,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
    markRead: markRead.mutate,
  };
}
