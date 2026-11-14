// Contas da calculadora de planos (Admin → Calculadora de planos).
// Preços e comissões decididos na reunião de 14/11/2026; clube da cliente,
// fidelidade e indicação ainda são proposta. O plano PREMIUM foi aprovado
// pelo Almir em 14/11, depois da reunião.
// Taxas do Asaas: asaas.com/precos-e-taxas (lidas em 14/11/2026).

export interface PlanoDiarista {
  id: "livre" | "pro" | "elite" | "premium";
  nome: string;
  mensalidade: number;
  comissao: number; // em %
  extras?: string;
}

export interface ConfigCalc {
  precoDiaria: number;
  precoMeio: number;
  precoEmergencia: number;
  planos: PlanoDiarista[];
  /** PREMIUM: custo do uniforme + kit a cada 3 meses, por diarista. */
  custoKitTrimestre: number;
  clubeCasa: number;
  clubeEmpresa: number;
  descontoCasa: [number, number, number]; // diária, meio, emergência
  descontoEmpresa: [number, number, number];
  premio: [number, number, number]; // fidelidade e indicação
  fidelidadeCada: number;
  pix: number;
  cartaoPct: number;
  cartaoFixo: number;
  repasse: number;
  antecipacaoPct: number;
  impostoPct: number;
}

export const CONFIG_PADRAO: ConfigCalc = {
  precoDiaria: 350,
  precoMeio: 200,
  precoEmergencia: 250,
  planos: [
    { id: "livre", nome: "Sem plano", mensalidade: 0, comissao: 20 },
    { id: "pro", nome: "PRO", mensalidade: 49.9, comissao: 15 },
    { id: "elite", nome: "ELITE", mensalidade: 99.9, comissao: 10 },
    { id: "premium", nome: "PREMIUM", mensalidade: 149.9, comissao: 10, extras: "Uniforme, crachá e kit de produtos a cada 3 meses" },
  ],
  custoKitTrimestre: 0,
  clubeCasa: 19.9,
  clubeEmpresa: 49.9,
  descontoCasa: [10, 5, 5],
  descontoEmpresa: [15, 5, 5],
  premio: [15, 5, 10],
  fidelidadeCada: 5,
  pix: 1.99,
  cartaoPct: 2.99,
  cartaoFixo: 0.49,
  repasse: 2,
  antecipacaoPct: 0,
  impostoPct: 0,
};

export const SERVICOS = ["Diária completa", "Meio período", "Emergência"] as const;

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const comSinal = (v: number) => `${v >= 0 ? "+" : "−"} ${brl(Math.abs(v))}`;

export const precos = (c: ConfigCalc): [number, number, number] => [c.precoDiaria, c.precoMeio, c.precoEmergencia];

/** Mensalidade depois da taxa do cartão. */
export const mensalidadeLiquida = (c: ConfigCalc, valor: number) =>
  valor > 0 ? valor - (valor * c.cartaoPct) / 100 - c.cartaoFixo : 0;

/** Quanto a diarista recebe no mês, já paga a mensalidade. */
export function ganhoDiarista(c: ConfigCalc, plano: PlanoDiarista, qtd: [number, number, number]) {
  const p = precos(c);
  const bruto = qtd[0] * p[0] + qtd[1] * p[1] + qtd[2] * p[2];
  return bruto * (1 - plano.comissao / 100) - plano.mensalidade;
}

/** Diárias completas no mês para a mensalidade se pagar (contra ficar sem plano). */
export function diariasParaCompensar(c: ConfigCalc, plano: PlanoDiarista) {
  const livre = c.planos[0];
  const extraPorDiaria = (c.precoDiaria * (livre.comissao - plano.comissao)) / 100;
  if (plano.mensalidade <= 0 || extraPorDiaria <= 0) return null;
  return Math.max(1, Math.ceil(plano.mensalidade / extraPorDiaria - 1e-9));
}

/** Sobra do Já Limpo em um pedido: comissão menos desconto, taxas, repasse e imposto. */
export function sobraPorPedido(c: ConfigCalc, preco: number, comissaoPct: number, desconto: number, cartao: boolean) {
  const pago = preco - desconto;
  const taxa = cartao ? (pago * (c.cartaoPct + c.antecipacaoPct)) / 100 + c.cartaoFixo : c.pix;
  const receita = (preco * comissaoPct) / 100;
  return receita - desconto - taxa - c.repasse - (receita * c.impostoPct) / 100;
}

export const maiorDesconto = (c: ConfigCalc, i: number) => Math.max(c.descontoCasa[i], c.descontoEmpresa[i], c.premio[i]);

export interface Movimento {
  porDia: [number, number, number];
  dias: number;
  cartaoPct: number;
  diaristasAtivas: number;
  /** Diaristas em cada plano pago, na ordem de config.planos (sem o primeiro). */
  assinantes: number[];
  clubeCasa: number;
  clubeEmpresa: number;
  pedidosPorAssinante: number;
  indicacoes: number;
  fidelidade: boolean;
}

export const MOVIMENTO_PADRAO: Movimento = {
  porDia: [10, 0, 0],
  dias: 22,
  cartaoPct: 50,
  diaristasAtivas: 20,
  assinantes: [0, 0, 0],
  clubeCasa: 0,
  clubeEmpresa: 0,
  pedidosPorAssinante: 2,
  indicacoes: 0,
  fidelidade: false,
};

export interface Resultado {
  pedidos: number;
  valorPago: number;
  comissao: number;
  mensalidadesDiaristas: number;
  mensalidadesClientes: number;
  descontoClube: number;
  descontoFidelidade: number;
  descontoIndicacao: number;
  kits: number;
  taxasPedidos: number;
  taxasMensalidades: number;
  repasse: number;
  imposto: number;
  liquido: number;
}

/**
 * Resultado do mês. Supõe que os pedidos se dividem por igual entre as
 * diaristas ativas. Com `comPlanos = false` devolve a base: tudo a 20%.
 */
export function resultadoDoMes(c: ConfigCalc, m: Movimento, comPlanos = true): Resultado {
  const p = precos(c);
  const n = m.porDia.map((x) => x * m.dias);
  const pedidos = n[0] + n[1] + n[2];
  const valorPago = n[0] * p[0] + n[1] * p[1] + n[2] * p[2];
  const cartao = m.cartaoPct / 100;
  const livre = c.planos[0];
  const pagos = c.planos.slice(1);

  let comissaoMedia = livre.comissao;
  let mensalidadesDiaristas = 0;
  let mensalidadesClientes = 0;
  let descontoClube = 0;
  let descontoFidelidade = 0;
  let descontoIndicacao = 0;
  let kits = 0;
  let nAssinaturas = 0;

  if (comPlanos) {
    const ativas = Math.max(1, m.diaristasAtivas);
    let resto = 1;
    comissaoMedia = 0;
    pagos.forEach((pl, i) => {
      const qtd = m.assinantes[i] || 0;
      const fatia = Math.min(resto, qtd / ativas);
      resto -= fatia;
      comissaoMedia += fatia * pl.comissao;
      mensalidadesDiaristas += qtd * pl.mensalidade;
      nAssinaturas += qtd;
      if (pl.id === "premium") kits = (qtd * c.custoKitTrimestre) / 3;
    });
    comissaoMedia += resto * livre.comissao;

    mensalidadesClientes = m.clubeCasa * c.clubeCasa + m.clubeEmpresa * c.clubeEmpresa;
    nAssinaturas += m.clubeCasa + m.clubeEmpresa;

    if (pedidos > 0) {
      const mix = n.map((x) => x / pedidos);
      const medio = (v: [number, number, number]) => mix[0] * v[0] + mix[1] * v[1] + mix[2] * v[2];
      let pedCasa = m.clubeCasa * m.pedidosPorAssinante;
      let pedEmp = m.clubeEmpresa * m.pedidosPorAssinante;
      let doClube = pedCasa + pedEmp;
      if (doClube > pedidos) {
        pedCasa *= pedidos / doClube;
        pedEmp *= pedidos / doClube;
        doClube = pedidos;
      }
      descontoClube = pedCasa * medio(c.descontoCasa) + pedEmp * medio(c.descontoEmpresa);
      if (m.fidelidade) descontoFidelidade = ((pedidos - doClube) / (c.fidelidadeCada + 1)) * medio(c.premio);
      descontoIndicacao = m.indicacoes * 2 * medio(c.premio);
    }
  }

  const comissao = (valorPago * comissaoMedia) / 100;
  const descontos = descontoClube + descontoFidelidade + descontoIndicacao;
  const recebido = valorPago - descontos;
  const taxasPedidos =
    (1 - cartao) * pedidos * c.pix + cartao * ((recebido * (c.cartaoPct + c.antecipacaoPct)) / 100 + pedidos * c.cartaoFixo);
  const mensalidades = mensalidadesDiaristas + mensalidadesClientes;
  const taxasMensalidades = (mensalidades * c.cartaoPct) / 100 + nAssinaturas * c.cartaoFixo;
  const repasse = pedidos * c.repasse;
  const imposto = ((comissao + mensalidades) * c.impostoPct) / 100;
  const liquido = comissao + mensalidades - descontos - kits - taxasPedidos - taxasMensalidades - repasse - imposto;

  return {
    pedidos,
    valorPago,
    comissao,
    mensalidadesDiaristas,
    mensalidadesClientes,
    descontoClube,
    descontoFidelidade,
    descontoIndicacao,
    kits,
    taxasPedidos,
    taxasMensalidades,
    repasse,
    imposto,
    liquido,
  };
}
