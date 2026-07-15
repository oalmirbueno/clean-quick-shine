# Painel de Verificações de Diaristas

## 1. Banco de dados (nova migração)

**Tabela `verification_threads`** — uma thread por diarista (1:1 com `pro_profiles.user_id`).
- `user_id` (FK auth.users, único), `status` (`open` | `resolved`), `last_message_at`, `unread_admin`, `unread_pro`.

**Tabela `verification_messages`** — mensagens da thread.
- `thread_id`, `sender_id`, `sender_role` (`admin` | `pro`), `body` (text), `attachment_url` (nullable), created_at.

**RLS**
- Pro: SELECT/INSERT apenas na própria thread (`user_id = auth.uid()`).
- Admin: SELECT/INSERT/UPDATE em todas (via `is_admin(auth.uid())`).
- Grants para `authenticated` e `service_role`.

**Trigger**: ao inserir mensagem, atualiza `last_message_at` e incrementa o contador de não-lidas do lado oposto; ao ler, o lado zera seu contador via RPC.

**Notificação**: trigger `AFTER INSERT` cria linha em `notifications` para o destinatário (título "Nova mensagem sobre sua verificação").

## 2. Nova rota `/admin/verifications`

Fila focada em "diaristas aguardando decisão". Card por diarista com:
- Nome, telefone, avatar do primeiro documento (miniatura).
- Progresso `X/3` obrigatórios (id_front, id_back, selfie).
- Chips: `pendente` · `parcialmente aprovado` · `rejeitado` · `verificado`.
- Contador de mensagens não lidas na thread.
- Ações rápidas: **Aprovar verificação** (aprova todos os obrigatórios pendentes em lote) · **Rejeitar** (abre modal com motivo, marca todos os pendentes como rejeitados e envia mensagem na thread).
- Botão **Abrir conversa** → drawer lateral com a thread (composer, anexos opcionais, histórico, marca como lido ao abrir).

Filtros no topo: `Aguardando` (default) · `Em conversa` · `Aprovadas` · `Rejeitadas` · `Todas`. Busca por nome/telefone.

Item de menu novo no `AdminSidebar` e `AdminBottomNav`: **Verificações** (ícone `ShieldCheck`) com badge de count pendente.

## 3. Polish em `/admin/documents`

- Novo card no topo do grupo do diarista com botão **Abrir conversa** (reaproveita o drawer da thread).
- Botão **Aprovar todos obrigatórios** no header do grupo quando houver ≥1 pendente entre os 3 obrigatórios.
- Histórico compacto de decisões (quem aprovou/rejeitou e quando) usando `reviewed_by` + `reviewed_at`, resolvendo nome via `get_users_emails` ou `profiles`.
- Empty state e estados de loading padronizados com o resto do V3.

## 4. Componentes novos

- `src/components/admin/VerificationThreadDrawer.tsx` — sheet lateral com header do diarista, lista de mensagens (bubbles admin/pro), composer com textarea e upload opcional para `chat-attachments`, auto-mark-as-read on open.
- `src/hooks/useVerificationThread.ts` — carrega thread + mensagens, envia mensagem, marca como lido, subscribe realtime em `verification_messages`.
- `src/hooks/useAdminVerifications.ts` — agrega `pro_documents` + `verification_threads` para a fila. Ações batelot approve/reject.
- `src/pages/admin/AdminVerifications.tsx` — página nova.

## 5. Lado do diarista

- Bloco novo em `ProVerification.tsx`: card **Conversa com o suporte de verificação** — mostra últimas mensagens e composer. Reaproveita `useVerificationThread` (mesmo hook, sem role admin).

## Detalhes técnicos

**Aprovar em lote** — RPC nova `admin_approve_verification(p_user_id uuid)` (SECURITY DEFINER, `is_admin` check): atualiza todos os `pro_documents` obrigatórios pendentes desse user para `approved`, o trigger `check_pro_verification` já promove `pro_profiles.verified = true`. Insere mensagem na thread ("Verificação aprovada ✅").

**Rejeitar em lote** — RPC `admin_reject_verification(p_user_id uuid, p_reason text)`: marca todos obrigatórios pendentes como `rejected` com `rejection_reason`, insere mensagem na thread com o motivo.

**Anexos**: bucket `chat-attachments` já existe; signed URLs (1h) para exibição.

**Realtime**: canal por `thread_id` para o drawer aberto; invalidação de queries no `postgres_changes`.

**Query keys** (novos em `useAdminQueryKeys`):
- `adminVerifications: () => ["admin_verifications"]`
- `verificationThread: (id?) => ["verification_thread", id]`
- `verificationMessages: (id?) => ["verification_messages", id]`

## Ordem de execução

1. Migração (tabelas + RLS + grants + triggers + RPCs).
2. Hooks + drawer + página `/admin/verifications` + rota + item de menu.
3. Polish em `/admin/documents` (aprovar todos + botão conversa + histórico).
4. Card de conversa em `ProVerification.tsx`.

Responder **ok** para eu começar pela migração.
