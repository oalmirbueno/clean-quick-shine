import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Search, Shield, UserCog, KeyRound, Trash2, Mail, Loader2, ShieldCheck,
  UserPlus, UserMinus, Copy,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/PasswordField";
import { validatePassword } from "@/lib/passwordValidation";
import { getPublicOrigin } from "@/lib/platform";

type AppRole = "admin" | "pro" | "client";

interface AdminUserRow {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  full_name: string | null;
  phone: string | null;
  roles: AppRole[];
}

const ROLE_STYLES: Record<AppRole, string> = {
  admin: "bg-primary/15 text-primary border-primary/30",
  pro: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  client: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
};
const ROLE_LABEL: Record<AppRole, string> = { admin: "Admin", pro: "Diarista", client: "Cliente" };

export default function AdminUsers() {
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | AppRole>("all");
  const [pwdTarget, setPwdTarget] = useState<AdminUserRow | null>(null);
  const [pwdValue, setPwdValue] = useState("");
  const [delTarget, setDelTarget] = useState<AdminUserRow | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["admin_all_users"],
    queryFn: async (): Promise<AdminUserRow[]> => {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "list", perPage: 200 },
      });
      if (error) throw error;
      return (data?.users ?? []) as AdminUserRow[];
    },
  });

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();
    const matches = !q
      || (u.email || "").toLowerCase().includes(q)
      || (u.full_name || "").toLowerCase().includes(q)
      || (u.phone || "").toLowerCase().includes(q);
    if (!matches) return false;
    if (filter === "all") return true;
    return u.roles.includes(filter);
  });

  const counts = {
    total: users.length,
    admin: users.filter((u) => u.roles.includes("admin")).length,
    pro: users.filter((u) => u.roles.includes("pro")).length,
    client: users.filter((u) => u.roles.includes("client")).length,
  };

  async function call(action: string, payload: Record<string, unknown>) {
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action, ...payload },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  }

  async function toggleRole(u: AdminUserRow, role: AppRole) {
    const has = u.roles.includes(role);
    if (has && u.id === me?.id && role === "admin") {
      toast.error("Use outra conta admin para remover seu próprio acesso.");
      return;
    }
    setBusy(true);
    try {
      await call(has ? "remove_role" : "add_role", { targetUserId: u.id, role });
      toast.success(has ? `Removido papel ${ROLE_LABEL[role]}` : `Adicionado papel ${ROLE_LABEL[role]}`);
      qc.invalidateQueries({ queryKey: ["admin_all_users"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmSetPassword() {
    if (!pwdTarget) return;
    const err = validatePassword(pwdValue);
    if (err) { toast.error(err); return; }
    setBusy(true);
    try {
      await call("set_password", { targetUserId: pwdTarget.id, password: pwdValue });
      toast.success("Senha redefinida com sucesso");
      setPwdTarget(null);
      setPwdValue("");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function sendResetEmail(u: AdminUserRow) {
    if (!u.email) return;
    setBusy(true);
    try {
      await call("send_reset_email", {
        targetUserId: u.id,
        email: u.email,
        redirectTo: `${getPublicOrigin()}/reset-password`,
      });
      toast.success("Email de recuperação enviado");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!delTarget) return;
    setBusy(true);
    try {
      await call("delete_user", { targetUserId: delTarget.id });
      toast.success("Usuário excluído");
      setDelTarget(null);
      qc.invalidateQueries({ queryKey: ["admin_all_users"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function generatePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const symbols = "!@#$%&*";
    let p = "";
    for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)];
    p += symbols[Math.floor(Math.random() * symbols.length)];
    p += Math.floor(Math.random() * 10);
    setPwdValue(p);
  }

  return (
    <AdminLayout>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controle total: papéis, senhas e exclusão de contas.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Atualizar"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.total, icon: UserCog },
          { label: "Admins", value: counts.admin, icon: Shield },
          { label: "Diaristas", value: counts.pro, icon: ShieldCheck },
          { label: "Clientes", value: counts.client, icon: UserPlus },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email ou telefone…"
            className="w-full pl-10 pr-3 h-11 rounded-xl bg-card border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex gap-1.5 p-1 rounded-xl bg-card border border-border/60">
          {(["all", "admin", "pro", "client"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 h-9 rounded-lg text-xs font-medium transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "Todos" : ROLE_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground bg-card rounded-2xl border border-border/60">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground bg-card rounded-2xl border border-border/60">
          Nenhum usuário encontrado
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => {
            const isMe = u.id === me?.id;
            return (
              <div
                key={u.id}
                className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm hover:border-primary/40 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                  {/* Identity */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold truncate">{u.full_name || "—"}</p>
                      {isMe && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30">
                          Você
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3 shrink-0" />
                      {u.email || "—"}
                      {u.email && (
                        <button
                          type="button"
                          onClick={() => { navigator.clipboard.writeText(u.email!); toast.success("Email copiado"); }}
                          className="hover:text-foreground"
                          title="Copiar"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </p>
                    {u.phone && <p className="text-xs text-muted-foreground mt-0.5">{u.phone}</p>}
                  </div>

                  {/* Role toggles */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(["admin", "pro", "client"] as AppRole[]).map((r) => {
                      const has = u.roles.includes(r);
                      return (
                        <button
                          key={r}
                          disabled={busy}
                          onClick={() => toggleRole(u, r)}
                          className={`text-xs px-2.5 h-8 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                            has ? ROLE_STYLES[r] : "border-border/60 text-muted-foreground hover:border-border"
                          }`}
                          title={has ? `Remover ${ROLE_LABEL[r]}` : `Conceder ${ROLE_LABEL[r]}`}
                        >
                          {has ? <UserMinus className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                          {ROLE_LABEL[r]}
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm" variant="outline" disabled={busy}
                      onClick={() => { setPwdTarget(u); setPwdValue(""); }}
                      title="Definir nova senha"
                    >
                      <KeyRound className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm" variant="outline" disabled={busy || !u.email}
                      onClick={() => sendResetEmail(u)}
                      title="Enviar email de recuperação"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm" variant="outline" disabled={busy || isMe}
                      onClick={() => setDelTarget(u)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      title="Excluir usuário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Password Dialog */}
      <Dialog open={!!pwdTarget} onOpenChange={(o) => { if (!o) { setPwdTarget(null); setPwdValue(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir nova senha</DialogTitle>
            <DialogDescription>
              {pwdTarget?.email} — mínimo 8 caracteres com maiúscula, minúscula, número e símbolo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <PasswordField
              label="Nova senha"
              value={pwdValue}
              onChange={(e) => setPwdValue(e.target.value)}
              autoComplete="new-password"
            />
            <Button type="button" variant="outline" size="sm" onClick={generatePassword} className="w-full">
              Gerar senha aleatória
            </Button>
            {pwdValue && (
              <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-2 font-mono break-all">
                {pwdValue}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setPwdTarget(null); setPwdValue(""); }}>Cancelar</Button>
            <Button onClick={confirmSetPassword} disabled={busy || !pwdValue}>
              {busy && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Salvar senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!delTarget} onOpenChange={(o) => !o && setDelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é permanente. <b>{delTarget?.email}</b> perderá acesso e todos os dados vinculados via cascata serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={busy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
