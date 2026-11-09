import { describe, expect, it } from "vitest";
import { ganhoDiarista, saldoLiberado } from "@/lib/ganhoDiarista";

describe("ganhoDiarista", () => {
  it("paga 80% do valor sem cupom", () => {
    expect(ganhoDiarista({ total_price: 180, discount: 0 })).toBeCloseTo(144);
  });
  it("cupom não reduz o ganho da diarista", () => {
    expect(ganhoDiarista({ total_price: 160, discount: 20 })).toBeCloseTo(144);
  });
  it("aceita valor em texto, como vem do banco", () => {
    expect(ganhoDiarista({ total_price: "300.00", discount: null })).toBeCloseTo(240);
  });
});

describe("saldoLiberado", () => {
  const agora = new Date("2026-12-10T12:00:00Z");
  it("libera quando o cliente avalia", () => {
    expect(saldoLiberado({ status: "rated" }, agora)).toBe(true);
  });
  it("segura antes de 48 horas sem avaliação", () => {
    expect(saldoLiberado({ status: "completed", completed_at: "2026-12-09T12:00:00Z" }, agora)).toBe(false);
  });
  it("libera depois de 48 horas sem avaliação", () => {
    expect(saldoLiberado({ status: "completed", completed_at: "2026-12-08T12:00:00Z" }, agora)).toBe(true);
  });
  it("não libera pedido em andamento", () => {
    expect(saldoLiberado({ status: "in_progress", completed_at: "2026-12-01T12:00:00Z" }, agora)).toBe(false);
  });
});
