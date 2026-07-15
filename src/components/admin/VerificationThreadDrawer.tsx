import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, Send, MessageSquare, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useVerificationThread,
  type VerificationMessage,
} from "@/hooks/useVerificationThread";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proUserId: string | undefined;
  proName?: string;
  role?: "admin" | "pro";
}

export function VerificationThreadDrawer({
  open,
  onOpenChange,
  proUserId,
  proName,
  role = "admin",
}: Props) {
  const { messages, isLoading, sendMessage, isSending, markRead, thread } =
    useVerificationThread(open ? proUserId : undefined);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mark as read when opened
  useEffect(() => {
    if (open && thread) markRead();
  }, [open, thread?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = () => {
    const body = text.trim();
    if (!body) return;
    sendMessage({ body, role });
    setText("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col gap-0"
      >
        <SheetHeader className="p-4 border-b border-border/60">
          <SheetTitle className="flex items-center gap-2 text-base">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="font-semibold truncate">
                {proName || "Conversa de verificação"}
              </p>
              <p className="text-xs text-muted-foreground font-normal">
                Suporte de verificação
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20"
        >
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhuma mensagem ainda. Envie a primeira!
              </p>
            </div>
          ) : (
            messages.map((m) => <Bubble key={m.id} m={m} viewerRole={role} />)
          )}
        </div>

        <div className="p-3 border-t border-border/60 bg-background">
          <div className="flex items-end gap-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                role === "admin"
                  ? "Mensagem para o diarista..."
                  : "Escreva ao suporte..."
              }
              rows={2}
              className="resize-none rounded-xl border-border/60"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!text.trim() || isSending}
              className="h-10 w-10 rounded-xl shrink-0"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
            Enter para enviar · Shift+Enter para nova linha
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Bubble({
  m,
  viewerRole,
}: {
  m: VerificationMessage;
  viewerRole: "admin" | "pro";
}) {
  const isMine = m.sender_role === viewerRole;
  const isSystem = m.sender_role === "system";
  return (
    <div
      className={cn(
        "flex gap-2",
        isMine ? "justify-end" : "justify-start",
        isSystem && "justify-center"
      )}
    >
      {!isMine && !isSystem && (
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-auto">
          {m.sender_role === "admin" ? (
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          ) : (
            <User className="w-3.5 h-3.5 text-primary" />
          )}
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm border",
          isMine
            ? "bg-primary text-primary-foreground border-transparent"
            : isSystem
            ? "bg-muted text-muted-foreground text-xs border-border/40"
            : "bg-card text-foreground border-border/60"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{m.body}</p>
        <p
          className={cn(
            "text-[10px] mt-1 opacity-70",
            isMine ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          {format(new Date(m.created_at), "dd/MM HH:mm", { locale: ptBR })}
        </p>
      </div>
    </div>
  );
}
