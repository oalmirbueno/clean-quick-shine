import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, Send, ImageIcon, Loader2, X, Check, CheckCheck, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOrderChat, type ChatRole, type OrderMessage } from "@/hooks/useOrderChat";
import { useOrder } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const ROLE_STORAGE_KEY = (orderId: string) => `chat:role:${orderId}`;

function formatDayLabel(date: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(date, today)) return "Hoje";
  if (sameDay(date, yesterday)) return "Ontem";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

export default function OrderChatPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const orderId = id || null;

  const { data: order } = useOrder(orderId);
  const { messages, loading, send } = useOrderChat(orderId);

  // Determine active role: URL ?as=, then sessionStorage, then infer from auth
  const activeRole: ChatRole = useMemo(() => {
    const fromUrl = searchParams.get("as") as ChatRole | null;
    if (fromUrl === "client" || fromUrl === "pro") return fromUrl;
    if (orderId) {
      const cached = sessionStorage.getItem(ROLE_STORAGE_KEY(orderId)) as ChatRole | null;
      if (cached === "client" || cached === "pro") return cached;
    }
    if (order?.client_id === user?.id) return "client";
    if (order?.pro_id === user?.id) return "pro";
    return "client";
  }, [searchParams, orderId, order?.client_id, order?.pro_id, user?.id]);

  useEffect(() => {
    if (orderId) sessionStorage.setItem(ROLE_STORAGE_KEY(orderId), activeRole);
  }, [activeRole, orderId]);

  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  // Focus composer on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Mark incoming as read
  useEffect(() => {
    if (!orderId || !user?.id) return;
    const unread = messages
      .filter((m) => !isMine(m, activeRole, user.id) && !m.read_at)
      .map((m) => m.id);
    if (!unread.length) return;
    supabase
      .from("order_messages" as any)
      .update({ read_at: new Date().toISOString() })
      .in("id", unread)
      .then(() => {});
  }, [messages, orderId, user?.id, activeRole]);

  const handleFile = (f: File | null) => {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleSend = async () => {
    if (sending) return;
    if (!text.trim() && !file) return;
    setSending(true);
    await send(text, file, activeRole);
    setText("");
    handleFile(null);
    setSending(false);
    textareaRef.current?.focus();
  };

  const counterpart =
    activeRole === "client"
      ? { name: order?.pro_profile?.full_name || "Profissional", label: "Diarista" }
      : { name: "Cliente", label: "Cliente do pedido" };

  const backTo =
    activeRole === "client"
      ? `/client/order-tracking?orderId=${orderId}`
      : `/pro/order/${orderId}`;

  // Group by day
  const groups = useMemo(() => groupByDay(messages), [messages]);

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border/60 px-3 py-2.5 flex items-center gap-3 z-10">
        <button
          onClick={() => navigate(backTo)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary transition-colors -ml-1"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-primary">{initials(counterpart.name)}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-[15px] leading-tight truncate">{counterpart.name}</h1>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            online · #{orderId?.slice(0, 6)} · {order?.service?.name}
          </p>
        </div>

        <span
          className={cn(
            "text-[10px] font-medium px-2 py-1 rounded-full border",
            activeRole === "client"
              ? "bg-primary/10 text-primary border-primary/30"
              : "bg-accent/40 text-accent-foreground border-border"
          )}
        >
          {activeRole === "client" ? "Você: Cliente" : "Você: Diarista"}
        </span>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-4"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--muted-foreground) / 0.06) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState role={activeRole} />
        ) : (
          <div className="space-y-1">
            <AnimatePresence initial={false}>
              {groups.map((group) => (
                <div key={group.day} className="space-y-1">
                  <div className="flex justify-center my-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider px-3 py-1 rounded-full bg-card/80 text-muted-foreground border border-border/60 backdrop-blur-sm">
                      {group.day}
                    </span>
                  </div>
                  {group.items.map((m, idx) => {
                    const mine = isMine(m, activeRole, user?.id);
                    const prev = group.items[idx - 1];
                    const grouped =
                      prev &&
                      isMine(prev, activeRole, user?.id) === mine &&
                      new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 60_000;

                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                        className={cn("flex", mine ? "justify-end" : "justify-start", grouped ? "mt-0.5" : "mt-2")}
                      >
                        <div
                          className={cn(
                            "max-w-[78%] px-3.5 py-2 shadow-sm",
                            mine
                              ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                              : "bg-card text-foreground border border-border/60 rounded-2xl rounded-bl-sm"
                          )}
                        >
                          {m.attachment_url && (
                            <a href={m.attachment_url} target="_blank" rel="noreferrer" className="block">
                              <img
                                src={m.attachment_url}
                                alt="anexo"
                                className={cn(
                                  "rounded-lg max-h-72 object-cover",
                                  m.content ? "mb-1.5" : ""
                                )}
                              />
                            </a>
                          )}
                          {m.content && (
                            <p className="text-[14px] whitespace-pre-wrap break-words leading-snug">
                              {m.content}
                            </p>
                          )}
                          <div
                            className={cn(
                              "flex items-center gap-1 mt-1 -mr-0.5",
                              mine ? "justify-end text-primary-foreground/75" : "justify-end text-muted-foreground"
                            )}
                          >
                            <span className="text-[10px]">
                              {new Date(m.created_at).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {mine && (
                              m.read_at ? (
                                <CheckCheck className="w-3.5 h-3.5" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Attachment preview */}
      {preview && (
        <div className="px-3 pt-2 pb-1 bg-card border-t border-border/60">
          <div className="relative inline-block">
            <img
              src={preview}
              alt=""
              className="h-20 w-20 rounded-xl object-cover border border-border/60"
            />
            <button
              onClick={() => handleFile(null)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center shadow-md"
              aria-label="Remover anexo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="flex-shrink-0 px-3 py-2.5 bg-card border-t border-border/60 safe-bottom">
        <div className="flex items-end gap-2">
          <button
            onClick={() => inputRef.current?.click()}
            className="w-10 h-10 rounded-full bg-secondary/70 hover:bg-secondary flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Anexar imagem"
          >
            <ImageIcon className="w-[18px] h-[18px] text-muted-foreground" />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <textarea
            ref={textareaRef}
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
            className="flex-1 resize-none rounded-2xl border border-border/60 bg-background px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-32 leading-snug"
          />
          <button
            onClick={handleSend}
            disabled={sending || (!text.trim() && !file)}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 hover:bg-primary/90 transition-colors shadow-sm"
            aria-label="Enviar"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-[18px] h-[18px]" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function isMine(msg: OrderMessage, activeRole: ChatRole, uid?: string) {
  // Prefer explicit role (handles admin testing both sides on same auth user)
  if (msg.sender_role === "client" || msg.sender_role === "pro") {
    return msg.sender_role === activeRole;
  }
  return msg.sender_id === uid;
}

function groupByDay(messages: OrderMessage[]) {
  const map = new Map<string, OrderMessage[]>();
  for (const m of messages) {
    const d = new Date(m.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return Array.from(map.entries()).map(([key, items]) => ({
    key,
    day: formatDayLabel(new Date(items[0].created_at)),
    items,
  }));
}

function EmptyState({ role }: { role: ChatRole }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
        {role === "client" ? (
          <Sparkles className="w-6 h-6 text-primary" />
        ) : (
          <User className="w-6 h-6 text-primary" />
        )}
      </div>
      <h3 className="font-semibold text-[15px] mb-1">Comece a conversa</h3>
      <p className="text-[13px] text-muted-foreground max-w-xs leading-relaxed">
        {role === "client"
          ? "Tire dúvidas, combine detalhes do acesso ou envie uma foto do local."
          : "Confirme detalhes com o cliente. Seja claro e cordial."}
      </p>
    </div>
  );
}
