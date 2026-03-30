// Shared type definitions for the application
// These types are used across components and pages

export type OrderStatus = 
  | "draft" 
  | "scheduled" 
  | "matching" 
  | "confirmed" 
  | "en_route"
  | "in_progress" 
  | "completed" 
  | "rated"
  | "paid_out"
  | "cancelled"
  | "in_review";

export type ProVerifiedStatus = "pending" | "approved" | "rejected";
export type PaymentStatus = "pending" | "authorized" | "held" | "released" | "refunded";
export type WithdrawalStatus = "pending" | "processing" | "completed" | "rejected";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high";
export type QualityLevel = "A" | "B" | "C" | "D";

export interface Zone {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  feeExtra: number;
  active: boolean;
  cityId?: string;
}

export interface ZoneRule {
  id: string;
  zoneId: string;
  minProsOnline: number;
  surgeMultiplier: number;
  active: boolean;
}

export interface ClientSubscription {
  id: string;
  clientId: string;
  planId: string;
  status: "active" | "paused" | "cancelled";
  startAt: string;
  renewAt: string;
  creditsTotal: number;
  creditsUsed: number;
}

export interface ClientPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  cleaningsPerMonth: number;
  feeDiscountPercent: number;
  priorityBoost: number;
  features: string[];
  active: boolean;
}
