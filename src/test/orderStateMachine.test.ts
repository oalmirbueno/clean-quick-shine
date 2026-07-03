import { describe, it, expect } from "vitest";
import { isOrderUpdateAllowed, type OrderUpdateContext } from "@/lib/orderStateMachine";

const CLIENT = "client-uuid";
const PRO = "pro-uuid";
const OTHER = "other-uuid";

function base(overrides: Partial<OrderUpdateContext> = {}): OrderUpdateContext {
  return {
    privileged: false,
    uid: CLIENT,
    clientId: CLIENT,
    oldProId: null,
    newProId: null,
    hasProRole: false,
    oldStatus: "draft",
    newStatus: "draft",
    changed: [],
    clientRating: null,
    ...overrides,
  };
}

describe("orderStateMachine — bypass e no-op", () => {
  it("admin/service role passa livre mesmo mudando total_price", () => {
    expect(isOrderUpdateAllowed(base({ privileged: true, changed: ["total_price", "status"] }))).toBe(true);
  });

  it("update sem colunas alteradas é permitido (no-op)", () => {
    expect(isOrderUpdateAllowed(base({ changed: [] }))).toBe(true);
  });
});

describe("orderStateMachine — cliente cancela", () => {
  it("permite cancelar a partir de status cancelável mudando só status", () => {
    for (const oldStatus of ["draft", "scheduled", "matching", "confirmed", "en_route", "in_progress"] as const) {
      expect(isOrderUpdateAllowed(base({ oldStatus, newStatus: "cancelled", changed: ["status"] }))).toBe(true);
    }
  });

  it("nega cancelar a partir de status não-cancelável (completed/rated)", () => {
    expect(isOrderUpdateAllowed(base({ oldStatus: "completed", newStatus: "cancelled", changed: ["status"] }))).toBe(false);
    expect(isOrderUpdateAllowed(base({ oldStatus: "rated", newStatus: "cancelled", changed: ["status"] }))).toBe(false);
  });

  it("nega cancelar se junto tenta mudar total_price", () => {
    expect(isOrderUpdateAllowed(base({ oldStatus: "scheduled", newStatus: "cancelled", changed: ["status", "total_price"] }))).toBe(false);
  });

  it("nega se quem cancela não é o dono do pedido", () => {
    expect(isOrderUpdateAllowed(base({ uid: OTHER, oldStatus: "scheduled", newStatus: "cancelled", changed: ["status"] }))).toBe(false);
  });
});

describe("orderStateMachine — cliente avalia", () => {
  it("permite completed → rated com nota válida e colunas de avaliação", () => {
    expect(isOrderUpdateAllowed(base({
      oldStatus: "completed", newStatus: "rated",
      changed: ["status", "client_rating", "client_review"], clientRating: 5,
    }))).toBe(true);
  });

  it("nega avaliar antes de completed", () => {
    expect(isOrderUpdateAllowed(base({
      oldStatus: "in_progress", newStatus: "rated",
      changed: ["status", "client_rating"], clientRating: 5,
    }))).toBe(false);
  });

  it("nega nota fora de 1..5", () => {
    expect(isOrderUpdateAllowed(base({ oldStatus: "completed", newStatus: "rated", changed: ["status", "client_rating"], clientRating: 0 }))).toBe(false);
    expect(isOrderUpdateAllowed(base({ oldStatus: "completed", newStatus: "rated", changed: ["status", "client_rating"], clientRating: 6 }))).toBe(false);
  });

  it("nega mexer em pro_rating junto da avaliação", () => {
    expect(isOrderUpdateAllowed(base({
      oldStatus: "completed", newStatus: "rated",
      changed: ["status", "client_rating", "pro_rating"], clientRating: 5,
    }))).toBe(false);
  });
});

describe("orderStateMachine — diarista aceita", () => {
  it("permite pro verificada aceitar pedido sem dono (scheduled/matching → confirmed)", () => {
    for (const oldStatus of ["scheduled", "matching"] as const) {
      expect(isOrderUpdateAllowed(base({
        uid: PRO, clientId: CLIENT, hasProRole: true,
        oldProId: null, newProId: PRO, oldStatus, newStatus: "confirmed",
        changed: ["pro_id", "status"],
      }))).toBe(true);
    }
  });

  it("nega aceitar sem role pro", () => {
    expect(isOrderUpdateAllowed(base({
      uid: PRO, hasProRole: false, oldProId: null, newProId: PRO,
      oldStatus: "scheduled", newStatus: "confirmed", changed: ["pro_id", "status"],
    }))).toBe(false);
  });

  it("nega cliente se auto-atribuir como pro do próprio pedido", () => {
    expect(isOrderUpdateAllowed(base({
      uid: CLIENT, clientId: CLIENT, hasProRole: false, oldProId: null, newProId: CLIENT,
      oldStatus: "scheduled", newStatus: "confirmed", changed: ["pro_id", "status"],
    }))).toBe(false);
  });

  it("nega roubar pedido já atribuído a outra pro", () => {
    expect(isOrderUpdateAllowed(base({
      uid: PRO, hasProRole: true, oldProId: OTHER, newProId: PRO,
      oldStatus: "confirmed", newStatus: "confirmed", changed: ["pro_id"],
    }))).toBe(false);
  });
});

describe("orderStateMachine — diarista progride", () => {
  const assigned = (o: Partial<OrderUpdateContext>) =>
    base({ uid: PRO, clientId: CLIENT, oldProId: PRO, newProId: PRO, hasProRole: true, ...o });

  it("permite confirmed → en_route → in_progress → completed", () => {
    expect(isOrderUpdateAllowed(assigned({ oldStatus: "confirmed", newStatus: "en_route", changed: ["status"] }))).toBe(true);
    expect(isOrderUpdateAllowed(assigned({ oldStatus: "en_route", newStatus: "in_progress", changed: ["status"] }))).toBe(true);
    expect(isOrderUpdateAllowed(assigned({ oldStatus: "in_progress", newStatus: "completed", changed: ["status", "completed_at"] }))).toBe(true);
  });

  it("nega pulo de status (confirmed → completed)", () => {
    expect(isOrderUpdateAllowed(assigned({ oldStatus: "confirmed", newStatus: "completed", changed: ["status"] }))).toBe(false);
  });

  it("nega diarista marcar rated", () => {
    expect(isOrderUpdateAllowed(assigned({ oldStatus: "completed", newStatus: "rated", changed: ["status"] }))).toBe(false);
  });

  it("nega diarista mexer no preço ao progredir", () => {
    expect(isOrderUpdateAllowed(assigned({ oldStatus: "confirmed", newStatus: "en_route", changed: ["status", "total_price"] }))).toBe(false);
  });
});

describe("orderStateMachine — ataques de mesmo status", () => {
  it("nega cliente editar scheduled_date sem mudar status", () => {
    expect(isOrderUpdateAllowed(base({ oldStatus: "scheduled", newStatus: "scheduled", changed: ["scheduled_date"] }))).toBe(false);
  });

  it("nega cliente editar total_price sem mudar status", () => {
    expect(isOrderUpdateAllowed(base({ oldStatus: "confirmed", newStatus: "confirmed", changed: ["total_price"] }))).toBe(false);
  });

  it("nega cliente injetar client_rating fora do fluxo de avaliação", () => {
    expect(isOrderUpdateAllowed(base({ oldStatus: "in_progress", newStatus: "in_progress", changed: ["client_rating"], clientRating: 5 }))).toBe(false);
  });

  it("nega editar notes sem regra explícita", () => {
    expect(isOrderUpdateAllowed(base({ oldStatus: "scheduled", newStatus: "scheduled", changed: ["notes"] }))).toBe(false);
  });
});
