/**
 * Identificação oficial da empresa (Cartão CNPJ / Contrato Social).
 * As lojas cruzam estes dados com o titular da conta de desenvolvedor:
 * mantenha igual ao cadastro na Receita.
 */
export const EMPRESA = {
  razaoSocial: "JÁ LIMPO LTDA",
  nomeFantasia: "Já Limpo",
  cnpj: "69.485.100/0001-51",
  cidade: "Brusque/SC",
  emailSuporte: "suporte@jalimpo.com",
  /** WhatsApp do suporte só com DDI+DDD, ex.: "5547999999999". Vazio esconde o botão. */
  whatsappSuporte: "",
  site: "https://jalimpo.com",
} as const;

export const linkWhatsappSuporte = () =>
  EMPRESA.whatsappSuporte ? `https://wa.me/${EMPRESA.whatsappSuporte}` : "";

export const identificacaoEmpresa = () => `${EMPRESA.razaoSocial} · CNPJ ${EMPRESA.cnpj} · ${EMPRESA.cidade}`;
