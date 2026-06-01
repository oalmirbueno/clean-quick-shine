import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type ChatRole = "client" | "pro";

export interface OrderMessage {
  id: string;
  order_id: string;
  sender_id: string;
  sender_role: ChatRole | null;
  content: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  read_at: string | null;
  created_at: string;
}

export function useOrderChat(orderId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("order_messages" as any)
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });
      if (!cancelled) {
        if (error) console.error("chat fetch error", error);
        setMessages(((data as unknown) as OrderMessage[]) || []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // Realtime
  useEffect(() => {
    if (!orderId) return;
    const channel = supabase
      .channel(`order-chat-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "order_messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const msg = payload.new as OrderMessage;
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const send = useCallback(
    async (content: string, file?: File | null) => {
      if (!orderId || !user?.id) return;
      const trimmed = content.trim();
      if (!trimmed && !file) return;

      let attachment_url: string | null = null;
      let attachment_type: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${orderId}/${user.id}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("chat-attachments")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) {
          toast.error("Falha ao enviar imagem");
          return;
        }
        const { data: signed } = await supabase.storage
          .from("chat-attachments")
          .createSignedUrl(path, 60 * 60 * 24 * 7);
        attachment_url = signed?.signedUrl || null;
        attachment_type = file.type;
      }

      const { error } = await supabase.from("order_messages" as any).insert({
        order_id: orderId,
        sender_id: user.id,
        content: trimmed || null,
        attachment_url,
        attachment_type,
      });
      if (error) {
        toast.error("Não foi possível enviar a mensagem");
        console.error(error);
      }
    },
    [orderId, user?.id]
  );

  return { messages, loading, send };
}
