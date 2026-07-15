import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { VerificationThreadDrawer } from "@/components/admin/VerificationThreadDrawer";
import { useAdminVerifications, VerificationRow } from "@/hooks/useAdminVerifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldCheck,
  ShieldAlert,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Phone,
  Search,
  Clock,
  User,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

type Filter = "pending" | "rejected" | "approved" | "all";

export default function AdminVerifications() {
  const { rows, isLoading, approve, reject, isApproving, isRejecting } =
    useAdminVerifications();

  const [filter, setFilter] = useState<Filter>("pending");
  const [search, setSearch] = useState("");
  const [threadUser, setThreadUser] = useState<VerificationRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<VerificationRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rows.filter((r) => {
      if (filter === "pending" && r.requiredPending === 0) return false;
      if (filter === "rejected" && !r.hasRejected) return false;
      if (filter === "approved" && !r.verified) return false;
      if (
        q &&
        !r.name.toLowerCase().includes(q) &&
        !(r.phone || "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [rows, filter, search]);

  const counts = useMemo(
    () => ({
      pending: rows.filter((r) => r.requiredPending > 0).length,
      rejected: rows.filter((r) => r.hasRejected && r.requiredPending === 0).length,
      approved: rows.filter((r) => r.verified).length,
      all: rows.length,
    }),
    [rows]
  );

  const handleReject = () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    reject({ userId: rejectTarget.userId, reason: rejectReason.trim() });
    setRejectTarget(null);
    setRejectReason("");
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" /> Verificações
          </h1>
          <p className="text-muted-foreground text-sm">
            {counts.pending} diarista{counts.pending !== 1 ? "s" : ""} aguardando decisão
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou telefone..."
              className="pl-9 rounded-xl border-border/60"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1">
            {(
              [
                { id: "pending", label: "Aguardando", count: counts.pending },
                { id: "rejected", label: "Recusadas", count: counts.rejected },
                { id: "approved", label: "Aprovadas", count: counts.approved },
                { id: "all", label: "Todas", count: counts.all },
              ] as { id: Filter; label: string; count: number }[]
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "shrink-0 px-3 py-2 rounded-xl text-xs font-medium border transition-colors",
                  filter === f.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border/60 hover:bg-muted"
                )}
              >
                {f.label} <span className="ml-1 opacity-70">{f.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border/60">
          <ShieldCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">
            Nenhuma solicitação nesta aba
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Assim que um diarista enviar documentos, a solicitação aparece aqui.
          </p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.04 } },
          }}
          className="space-y-3"
        >
          {filtered.map((r) => (
            <VerificationCard
              key={r.userId}
              row={r}
              onOpenChat={() => setThreadUser(r)}
              onApprove={() => approve(r.userId)}
              onReject={() => {
                setRejectTarget(r);
                setRejectReason("");
              }}
              isApproving={isApproving}
              isRejecting={isRejecting}
            />
          ))}
        </motion.div>
      )}

      {/* Thread drawer */}
      <VerificationThreadDrawer
        open={!!threadUser}
        onOpenChange={(o) => !o && setThreadUser(null)}
        proUserId={threadUser?.userId}
        proName={threadUser?.name}
        role="admin"
      />

      {/* Reject modal */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(o) => {
          if (!o) {
            setRejectTarget(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Recusar verificação</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Descreva o motivo. A mensagem será enviada ao diarista e todos os
              documentos obrigatórios pendentes serão marcados como recusados.
            </p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex.: foto do documento ilegível, faltando verso..."
              rows={4}
              className="rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || isRejecting}
            >
              {isRejecting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Recusar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function VerificationCard({
  row,
  onOpenChat,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
  row: VerificationRow;
  onOpenChat: () => void;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  const progress = (row.requiredApproved / row.requiredTotal) * 100;
  const canDecide = row.requiredPending > 0;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0 },
      }}
      className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden"
    >
      <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Avatar */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/admin/pros/${row.userId}`}
                className="font-semibold text-foreground hover:text-primary truncate"
              >
                {row.name}
              </Link>
              {row.verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success">
                  <ShieldCheck className="w-3 h-3" /> Verificado
                </span>
              )}
              {row.hasRejected && !row.verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                  <ShieldAlert className="w-3 h-3" /> Recusado
                </span>
              )}
              {row.requiredPending > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning">
                  {row.requiredPending} pend.
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
              {row.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {row.phone}
                </span>
              )}
              {row.lastDocAt && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Enviado {formatDistanceToNow(new Date(row.lastDocAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              )}
            </div>

            {/* Progress */}
            <div className="mt-2.5">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Documentos obrigatórios</span>
                <span className="font-semibold">
                  {row.requiredApproved}/{row.requiredTotal}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    row.verified
                      ? "bg-success"
                      : row.hasRejected
                      ? "bg-destructive"
                      : "bg-primary"
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col gap-2 sm:min-w-[140px]">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenChat}
            className="rounded-xl flex-1 sm:flex-none relative"
          >
            <MessageSquare className="w-4 h-4 mr-1.5" />
            Conversa
            {row.unreadAdmin > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {row.unreadAdmin}
              </span>
            )}
          </Button>
          {canDecide && (
            <>
              <Button
                size="sm"
                onClick={onApprove}
                disabled={isApproving}
                className="rounded-xl flex-1 sm:flex-none bg-success hover:bg-success/90 text-success-foreground"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={onReject}
                disabled={isRejecting}
                className="rounded-xl flex-1 sm:flex-none"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Recusar
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
