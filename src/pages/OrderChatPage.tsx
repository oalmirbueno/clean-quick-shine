import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Send, ImageIcon, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOrderChat } from "@/hooks/useOrderChat";
import { useOrder } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export default function OrderChatPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const orderId = id || null;

  const { data: order } = useOrder(orderId);
  const { messages, loading, send } = useOrderChat(orderId);

  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  // Mark incoming as read
  useEffect(() => {
    if (!orderId || !user?.id) return;
    const unread = messages.filter((m) => m.sender_id !== user.id && !m.read_at).map((m) => m.id);
    if (!unread.length) return;
    supabase
      .from("order_messages" as any)
      .update({ read_at: new Date().toISOString() })
      .in("id", unread)
      .then(() => {});
  }, [messages, orderId, user?.id]);

  const handleFile = (f: File | null) => {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleSend = async () => {
    if (sending) return;
    if (!text.trim() && !file) return;
    setSending(true);
    await send(text, file);
    setText("");
    handleFile(null);
    setSending(false);
  };

  const isClient = order?.client_id === user?.id;
  const counterpartName = isClient
    ? order?.pro_profile?.full_name || "Profissional"
    : "Cliente";

  const backTo = isClient
    ? `/client/order-tracking?orderId=${orderId}`
    : `/pro/order/${orderId}`;

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      <header className="bg-card border-b border-border/60 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(backTo)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">{counterpartName}</h1>
          <p className="text-xs text-muted-foreground">
            Pedido #{orderId?.slice(0, 8)} · {order?.service?.name}
          </p>
        </div>
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" title="Em tempo real" />
      </header>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-16">
            Nenhuma mensagem ainda. Diga olá 👋
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const mine = m.sender_id === user?.id;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", mine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-sm border",
                      mine
                        ? "bg-primary text-primary-foreground border-primary/40 rounded-br-md"
                        : "bg-card text-foreground border-border/60 rounded-bl-md"
                    )}
                  >
                    {m.attachment_url && (
                      <a href={m.attachment_url} target="_blank" rel="noreferrer">
                        <img
                          src={m.attachment_url}
                          alt="anexo"
                          className="rounded-lg mb-1.5 max-h-64 object-cover"
                        />
                      </a>
                    )}
                    {m.content && (
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {m.content}
                      </p>
                    )}
                    <p
                      className={cn(
                        "text-[10px] mt-1 text-right",
                        mine ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {new Date(m.created_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {preview && (
        <div className="px-4 pt-2 pb-1">
          <div className="relative inline-block">
            <img src={preview} alt="" className="h-20 w-20 rounded-lg object-cover border border-border/60" />
            <button
              onClick={() => handleFile(null)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center shadow"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-shrink-0 p-3 bg-card border-t border-border/60 safe-bottom">
        <div className="flex items-end gap-2">
          <button
            onClick={() => inputRef.current?.click()}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors flex-shrink-0"
            aria-label="Anexar imagem"
          >
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Escreva uma mensagem…"
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-border/60 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={sending || (!text.trim() && !file)}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 flex-shrink-0 hover:bg-primary/90 transition-colors"
            aria-label="Enviar"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
