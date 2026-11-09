type PedidoComValor = {
  total_price?: number | string | null;
  discount?: number | string | null;
};

const PARTE_DA_DIARISTA = 0.8;
const HORAS_PARA_LIBERAR = 48;

/** Diarista recebe 80% do preço antes do desconto: o cupom é pago pela Já Limpo. */
export function ganhoDiarista(pedido: PedidoComValor | null | undefined): number {
  return (Number(pedido?.total_price || 0) + Number(pedido?.discount || 0)) * PARTE_DA_DIARISTA;
}

/** Mesma regra do banco: libera com a avaliação ou 48 h depois de concluído. */
export function saldoLiberado(
  pedido: { status?: string | null; completed_at?: string | null },
  agora: Date = new Date(),
): boolean {
  if (pedido.status === "rated") return true;
  if (pedido.status !== "completed" || !pedido.completed_at) return false;
  const limite = new Date(pedido.completed_at).getTime() + HORAS_PARA_LIBERAR * 3600 * 1000;
  return agora.getTime() >= limite;
}
