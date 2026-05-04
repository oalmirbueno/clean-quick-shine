// Templates centralizados para notificações geradas por ações do admin.
// Tom: profissional, direto, acolhedor — alinhado ao "Já Limpo".
// Use sempre estes helpers ao invés de strings inline para garantir consistência.

export type NotifType = "info" | "success" | "warning";

export interface NotificationTemplate {
  title: string;
  message: string;
  type: NotifType;
}

const fmtBRL = (v: number | string | null | undefined) => {
  const n = Number(v ?? 0);
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
};

// ============ Diarista (Pro) ============
export const proTemplates = {
  approved: (): NotificationTemplate => ({
    title: "Cadastro aprovado 🎉",
    message:
      "Sua verificação foi concluída. Você já pode receber pedidos no Já Limpo.",
    type: "success",
  }),
  rejected: (reason: string): NotificationTemplate => ({
    title: "Verificação reprovada",
    message: `Não foi possível aprovar seu cadastro. Motivo: ${reason.trim()}. Reenvie seus documentos para uma nova análise.`,
    type: "warning",
  }),
  suspended: (reason?: string): NotificationTemplate => ({
    title: "Conta suspensa",
    message: reason?.trim()
      ? `Sua conta foi suspensa pela equipe Já Limpo. Motivo: ${reason.trim()}. Entre em contato com o suporte.`
      : "Sua conta foi suspensa pela equipe Já Limpo. Entre em contato com o suporte para mais detalhes.",
    type: "warning",
  }),
  reactivated: (): NotificationTemplate => ({
    title: "Conta reativada",
    message: "Sua conta foi reativada. Bem-vinda de volta ao Já Limpo!",
    type: "success",
  }),
};

// ============ Cliente ============
export const clientTemplates = {
  blocked: (reason?: string): NotificationTemplate => ({
    title: "Conta bloqueada",
    message: reason?.trim()
      ? `Sua conta foi bloqueada pela equipe Já Limpo. Motivo: ${reason.trim()}. Entre em contato com o suporte.`
      : "Sua conta foi bloqueada pela equipe Já Limpo. Entre em contato com o suporte para mais detalhes.",
    type: "warning",
  }),
  unblocked: (): NotificationTemplate => ({
    title: "Conta reativada",
    message: "Sua conta foi reativada. Bem-vindo de volta ao Já Limpo!",
    type: "success",
  }),
};

// ============ Saques ============
export const withdrawalTemplates = {
  approved: (amount: number | string): NotificationTemplate => ({
    title: "Saque em processamento",
    message: `Seu saque de ${fmtBRL(amount)} foi aprovado e está sendo processado. Em breve cairá na sua conta.`,
    type: "success",
  }),
  completed: (amount: number | string): NotificationTemplate => ({
    title: "Saque concluído ✅",
    message: `Seu saque de ${fmtBRL(amount)} foi transferido com sucesso.`,
    type: "success",
  }),
  rejected: (amount: number | string, reason?: string): NotificationTemplate => ({
    title: "Saque rejeitado",
    message: reason?.trim()
      ? `Seu saque de ${fmtBRL(amount)} foi rejeitado. Motivo: ${reason.trim()}. O valor foi devolvido ao seu saldo.`
      : `Seu saque de ${fmtBRL(amount)} foi rejeitado. O valor foi devolvido ao seu saldo.`,
    type: "warning",
  }),
};

// ============ Mensagem manual do admin ============
export const adminCustomMessage = (
  title: string,
  message: string,
): NotificationTemplate => ({
  title: title.trim(),
  message: message.trim(),
  type: "info",
});
