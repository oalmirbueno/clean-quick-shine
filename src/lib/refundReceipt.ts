import jsPDF from "jspdf";
import logoFull from "@/assets/logo-full.png";

export interface RefundReceiptData {
  orderId: string;
  protocol: string;
  refundDate: Date;
  clientName: string;
  clientCpf?: string | null;
  serviceName: string;
  scheduledDate?: string;
  amount: number;
  reason?: string;
  asaasTransactionId?: string | null;
  paymentMethod?: string | null;
}

const BRAND = {
  primary: "#0066FF", // confidence blue
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  bgSoft: "#F8FAFC",
  success: "#10B981",
};

async function loadImageAsDataURL(src: string): Promise<string> {
  const res = await fetch(src);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function fmtCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function buildProtocol(orderId: string, refundDate: Date) {
  const ts = refundDate.getTime().toString(36).toUpperCase().slice(-6);
  return `JL-EST-${orderId.slice(0, 8).toUpperCase()}-${ts}`;
}

export async function generateRefundReceipt(data: RefundReceiptData): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;

  // Header bar
  doc.setFillColor(BRAND.primary);
  doc.rect(0, 0, pageW, 38, "F");

  // Logo
  try {
    const logoData = await loadImageAsDataURL(logoFull);
    doc.addImage(logoData, "PNG", margin, 10, 36, 18, undefined, "FAST");
  } catch {
    doc.setTextColor("#FFFFFF");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Já Limpo", margin, 22);
  }

  doc.setTextColor("#FFFFFF");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("COMPROVANTE DE ESTORNO", pageW - margin, 18, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("jalimpo.com  •  Chamou, tá limpo", pageW - margin, 26, { align: "right" });

  // Protocol box
  let y = 50;
  doc.setFillColor(BRAND.bgSoft);
  doc.setDrawColor(BRAND.border);
  doc.roundedRect(margin, y, pageW - margin * 2, 22, 3, 3, "FD");
  doc.setTextColor(BRAND.muted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("PROTOCOLO", margin + 5, y + 7);
  doc.setTextColor(BRAND.text);
  doc.setFontSize(13);
  doc.text(data.protocol, margin + 5, y + 15);

  doc.setTextColor(BRAND.muted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("DATA DO ESTORNO", pageW - margin - 5, y + 7, { align: "right" });
  doc.setTextColor(BRAND.text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(fmtDate(data.refundDate), pageW - margin - 5, y + 15, { align: "right" });

  y += 32;

  // Status badge
  doc.setFillColor(BRAND.success);
  doc.roundedRect(margin, y, 60, 9, 2, 2, "F");
  doc.setTextColor("#FFFFFF");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("✓ ESTORNO PROCESSADO", margin + 30, y + 6, { align: "center" });

  y += 18;

  // Section: Cliente
  drawSectionTitle(doc, "DADOS DO CLIENTE", margin, y);
  y += 8;
  drawRow(doc, "Nome", data.clientName, margin, y, pageW);
  y += 7;
  if (data.clientCpf) {
    drawRow(doc, "CPF", data.clientCpf, margin, y, pageW);
    y += 7;
  }

  y += 5;

  // Section: Pedido
  drawSectionTitle(doc, "DETALHES DO PEDIDO", margin, y);
  y += 8;
  drawRow(doc, "ID do Pedido", `#${data.orderId.slice(0, 8).toUpperCase()}`, margin, y, pageW);
  y += 7;
  drawRow(doc, "Serviço", data.serviceName, margin, y, pageW);
  y += 7;
  if (data.scheduledDate) {
    drawRow(doc, "Data agendada", data.scheduledDate, margin, y, pageW);
    y += 7;
  }
  if (data.paymentMethod) {
    drawRow(doc, "Método de pagamento", data.paymentMethod, margin, y, pageW);
    y += 7;
  }
  if (data.asaasTransactionId) {
    drawRow(doc, "ID da transação", data.asaasTransactionId, margin, y, pageW);
    y += 7;
  }

  y += 5;

  // Section: Motivo
  if (data.reason) {
    drawSectionTitle(doc, "MOTIVO DO ESTORNO", margin, y);
    y += 8;
    doc.setTextColor(BRAND.text);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(data.reason, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 5;
  }

  // Amount highlight
  y += 4;
  doc.setFillColor(BRAND.primary);
  doc.roundedRect(margin, y, pageW - margin * 2, 26, 4, 4, "F");
  doc.setTextColor("#FFFFFF");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("VALOR ESTORNADO", margin + 8, y + 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(fmtCurrency(data.amount), pageW - margin - 8, y + 17, { align: "right" });

  y += 34;

  // Info note
  doc.setFillColor(BRAND.bgSoft);
  doc.setDrawColor(BRAND.border);
  doc.roundedRect(margin, y, pageW - margin * 2, 22, 3, 3, "FD");
  doc.setTextColor(BRAND.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Prazo de devolução", margin + 5, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(BRAND.muted);
  const note = "O valor retornará para sua forma de pagamento original em até 7 dias úteis. " +
    "Em caso de cartão, o estorno aparece na próxima fatura ou na mesma, conforme a operadora.";
  doc.text(doc.splitTextToSize(note, pageW - margin * 2 - 10), margin + 5, y + 13);

  // Footer
  const footY = pageH - 22;
  doc.setDrawColor(BRAND.border);
  doc.line(margin, footY, pageW - margin, footY);
  doc.setTextColor(BRAND.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Já Limpo • Plataforma de serviços de limpeza sob demanda", pageW / 2, footY + 6, { align: "center" });
  doc.text("Suporte: suporte@jalimpo.com  •  jalimpo.com", pageW / 2, footY + 11, { align: "center" });
  doc.setFontSize(7);
  doc.text(`Documento gerado eletronicamente • Protocolo ${data.protocol}`, pageW / 2, footY + 16, { align: "center" });

  return doc;
}

function drawSectionTitle(doc: jsPDF, title: string, x: number, y: number) {
  doc.setTextColor(BRAND.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(title, x, y);
  doc.setDrawColor(BRAND.primary);
  doc.setLineWidth(0.4);
  doc.line(x, y + 1.5, x + 40, y + 1.5);
}

function drawRow(doc: jsPDF, label: string, value: string, x: number, y: number, pageW: number) {
  doc.setTextColor(BRAND.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(label, x, y);
  doc.setTextColor(BRAND.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(value, pageW - x * 2 - 50);
  doc.text(lines, x + 50, y);
}

export async function downloadRefundReceipt(data: RefundReceiptData) {
  const doc = await generateRefundReceipt(data);
  doc.save(`comprovante-estorno-${data.protocol}.pdf`);
}
