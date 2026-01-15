// Mock data V3 for LimpaJá - National scale marketplace

// ============= TYPES V3 =============
export type UserRole = "client" | "pro" | "admin";
export type UserStatus = "active" | "suspended" | "blocked";
export type ProVerifiedStatus = "pending" | "approved" | "rejected";
export type ProPlanType = "free" | "pro" | "elite";
export type ProStatus = "active" | "suspended";
export type DocStatus = "pending" | "approved" | "rejected";
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
export type PaymentStatus = "pending" | "authorized" | "held" | "released" | "refunded";
export type WithdrawalStatus = "requested" | "approved" | "paid";
export type TicketStatus = "open" | "in_progress" | "resolved";
export type TicketPriority = "low" | "medium" | "high";
export type CouponType = "percent" | "fixed";
export type QualityLevel = "A" | "B" | "C" | "D";
export type RiskFlagType = "cancellations" | "complaints" | "chargeback" | "no_show" | "low_rating" | "refusals" | "late";
export type ReferralStatus = "pending" | "qualified" | "rewarded";
export type SubscriptionStatus = "active" | "paused" | "cancelled";
export type QuoteStatus = "pending" | "approved" | "rejected" | "active";

// ============= INTERFACES V3 =============
export interface City {
  id: string;
  name: string;
  state: string;
}

export interface Zone {
  id: string;
  cityId: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  feeExtra: number;
  active: boolean;
}

export interface ZoneRule {
  id: string;
  zoneId: string;
  minProsOnline: number;
  surgeMultiplier: number;
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  totalOrders?: number;
  totalSpent?: number;
  riskLevel?: "low" | "medium" | "high";
  referralCode?: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  basePrice: number;
  category: string;
  eliteOnly?: boolean;
}

export interface ProMetrics {
  proId: string;
  onTimeRate: number;
  cancelRate: number;
  responseTimeAvg: number;
  last30dJobs: number;
  last7dCancels: number;
  qualityScore: number;
  qualityLevel: QualityLevel;
  updatedAt: string;
}

export interface Pro {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  city: string;
  zoneIds: string[];
  radiusKm: number;
  verifiedStatus: ProVerifiedStatus;
  plan: ProPlanType;
  ratingAvg: number;
  jobsDone: number;
  acceptanceRate: number;
  priorityScore: number;
  status: ProStatus;
  balance: number;
  pixKey?: string;
  isAvailableNow?: boolean;
  currentLat?: number;
  currentLng?: number;
  metrics?: ProMetrics;
}

export interface ProDocument {
  id: string;
  proId: string;
  docType: "id_front" | "id_back" | "selfie" | "proof";
  status: DocStatus;
  createdAt: string;
}

export interface ProPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  priorityBoost: number;
  accessCategories: string[];
  features: string[];
  active: boolean;
}

export interface ProSubscription {
  id: string;
  proId: string;
  planId: string;
  status: SubscriptionStatus;
  startAt: string;
  renewAt: string;
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

export interface ClientSubscription {
  id: string;
  clientId: string;
  planId: string;
  status: SubscriptionStatus;
  startAt: string;
  renewAt: string;
  creditsTotal: number;
  creditsUsed: number;
}

export interface RecurringRule {
  id: string;
  subscriptionId: string;
  weekday: number;
  time: string;
  addressId: string;
  serviceId: string;
  active: boolean;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  proId?: string;
  proName?: string;
  serviceId: string;
  serviceName: string;
  addressId: string;
  address: string;
  neighborhood: string;
  city: string;
  zoneId?: string;
  dateTime: string;
  date: string;
  time: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  fee: number;
  zoneFee: number;
  totalPrice: number;
  commissionPercent: number;
  commissionValue: number;
  proEarning: number;
  couponCode?: string;
  isRecurring?: boolean;
  subscriptionId?: string;
  matchingScore?: number;
  createdAt: string;
}

export interface MatchingLog {
  id: string;
  orderId: string;
  candidates: MatchingCandidate[];
  chosenProId?: string;
  reason: string;
  createdAt: string;
}

export interface MatchingCandidate {
  proId: string;
  proName: string;
  score: number;
  distanceKm: number;
  rating: number;
  plan: ProPlanType;
  accepted?: boolean;
}

export interface OrderTimeline {
  id: string;
  orderId: string;
  status: OrderStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: "pix" | "card";
  status: PaymentStatus;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  proId: string;
  proName: string;
  amount: number;
  pixKey: string;
  status: WithdrawalStatus;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  expiresAt: string;
  maxUses: number;
  currentUses: number;
  minOrderValue: number;
  active: boolean;
}

export interface Rating {
  id: string;
  orderId: string;
  clientId: string;
  proId: string;
  stars: number;
  tags: string[];
  comment: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  orderId?: string;
  createdByUserId: string;
  createdByName: string;
  createdByRole: UserRole;
  assignedAdminId?: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  lastMessage?: string;
  attachments?: SupportAttachment[];
}

export interface SupportAttachment {
  id: string;
  ticketId: string;
  type: "photo_before" | "photo_after" | "receipt" | "other";
  urlPlaceholder: string;
  createdAt: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderUserId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface RiskFlag {
  id: string;
  userId: string;
  userRole: UserRole;
  type: RiskFlagType;
  severity: "low" | "medium" | "high";
  notes: string;
  createdAt: string;
}

export interface RiskAction {
  id: string;
  userId: string;
  action: "priority_reduced" | "confirmation_required" | "temp_blocked" | "review_required";
  startAt: string;
  endAt?: string;
  createdAt: string;
}

export interface SLARule {
  id: string;
  responseTimeTargetMin: number;
  onTimeTargetPercent: number;
  cancelRateMaxPercent: number;
}

export interface Company {
  id: string;
  userId: string;
  companyName: string;
  cnpj: string;
  contactName: string;
  contactPhone: string;
  createdAt: string;
}

export interface Quote {
  id: string;
  companyId: string;
  companyName: string;
  details: {
    serviceType: string;
    frequency: string;
    addresses: number;
    estimatedHours: number;
    notes?: string;
  };
  status: QuoteStatus;
  estimatedValue: number;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerUserId: string;
  referrerName: string;
  refereeUserId: string;
  refereeName: string;
  role: UserRole;
  status: ReferralStatus;
  rewardValue: number;
  createdAt: string;
}

export interface ReferralReward {
  id: string;
  userId: string;
  type: "credit" | "bonus";
  value: number;
  status: "pending" | "paid";
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  eventName: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface AdminSettings {
  commissionPercentDefault: number;
  feeFixed: number;
  cancelFreeHours: number;
  cancelPenaltyPercent: number;
  refundPolicyText: string;
}

// ============= DEFAULT SETTINGS =============
export const adminSettings: AdminSettings = {
  commissionPercentDefault: 20,
  feeFixed: 9.90,
  cancelFreeHours: 12,
  cancelPenaltyPercent: 15,
  refundPolicyText: "Reembolso integral para cancelamentos dentro da janela permitida. Após isso, aplica-se multa conforme política."
};

export const slaRules: SLARule = {
  id: "sla1",
  responseTimeTargetMin: 5,
  onTimeTargetPercent: 95,
  cancelRateMaxPercent: 5
};

// ============= CITIES & ZONES =============
export const cities: City[] = [
  { id: "city1", name: "São Paulo", state: "SP" },
  { id: "city2", name: "Curitiba", state: "PR" },
];

export const zones: Zone[] = [
  // São Paulo Zones
  { id: "z1", cityId: "city1", name: "Jardins", centerLat: -23.5634, centerLng: -46.6542, radiusKm: 3, feeExtra: 0, active: true },
  { id: "z2", cityId: "city1", name: "Pinheiros", centerLat: -23.5678, centerLng: -46.6922, radiusKm: 3, feeExtra: 0, active: true },
  { id: "z3", cityId: "city1", name: "Moema", centerLat: -23.6008, centerLng: -46.6658, radiusKm: 2.5, feeExtra: 0, active: true },
  { id: "z4", cityId: "city1", name: "Vila Mariana", centerLat: -23.5892, centerLng: -46.6364, radiusKm: 2.5, feeExtra: 0, active: true },
  { id: "z5", cityId: "city1", name: "Itaim Bibi", centerLat: -23.5856, centerLng: -46.6794, radiusKm: 2, feeExtra: 5, active: true },
  { id: "z6", cityId: "city1", name: "Brooklin", centerLat: -23.6158, centerLng: -46.6922, radiusKm: 3, feeExtra: 5, active: true },
  // Curitiba Zones
  { id: "z7", cityId: "city2", name: "Centro", centerLat: -25.4284, centerLng: -49.2733, radiusKm: 2, feeExtra: 0, active: true },
  { id: "z8", cityId: "city2", name: "Batel", centerLat: -25.4402, centerLng: -49.2890, radiusKm: 2, feeExtra: 0, active: true },
  { id: "z9", cityId: "city2", name: "Água Verde", centerLat: -25.4552, centerLng: -49.2858, radiusKm: 2.5, feeExtra: 0, active: true },
  { id: "z10", cityId: "city2", name: "Champagnat", centerLat: -25.4483, centerLng: -49.2927, radiusKm: 1.5, feeExtra: 5, active: true },
  { id: "z11", cityId: "city2", name: "Ecoville", centerLat: -25.4600, centerLng: -49.3280, radiusKm: 3, feeExtra: 10, active: true },
  { id: "z12", cityId: "city2", name: "Santa Felicidade", centerLat: -25.3914, centerLng: -49.3227, radiusKm: 4, feeExtra: 15, active: true },
];

export const zoneRules: ZoneRule[] = [
  { id: "zr1", zoneId: "z1", minProsOnline: 3, surgeMultiplier: 1.0, active: true },
  { id: "zr2", zoneId: "z2", minProsOnline: 3, surgeMultiplier: 1.0, active: true },
  { id: "zr3", zoneId: "z5", minProsOnline: 2, surgeMultiplier: 1.2, active: true },
  { id: "zr4", zoneId: "z7", minProsOnline: 2, surgeMultiplier: 1.0, active: true },
];

// ============= SERVICES =============
export const services: Service[] = [
  { id: "1", name: "Limpeza Padrão", description: "Limpeza completa de rotina (2-4h)", durationMin: 180, basePrice: 129.90, category: "residential" },
  { id: "2", name: "Limpeza Pesada", description: "Limpeza profunda e detalhada (4-6h)", durationMin: 300, basePrice: 179.90, category: "residential" },
  { id: "3", name: "Pós-Obra", description: "Remoção de resíduos de obra (6-8h)", durationMin: 420, basePrice: 299.90, category: "construction", eliteOnly: true },
  { id: "4", name: "Comercial", description: "Limpeza de escritórios e lojas", durationMin: 240, basePrice: 199.90, category: "commercial", eliteOnly: true },
];

// ============= PLANS =============
export const proPlans: ProPlan[] = [
  { id: "pp1", name: "Free", monthlyPrice: 0, priorityBoost: 0, accessCategories: ["residential"], features: ["Até 5 pedidos/dia", "Suporte básico"], active: true },
  { id: "pp2", name: "PRO", monthlyPrice: 49.90, priorityBoost: 50, accessCategories: ["residential", "construction"], features: ["Pedidos ilimitados", "Prioridade no matching", "Destaque no ranking", "Suporte prioritário"], active: true },
  { id: "pp3", name: "ELITE", monthlyPrice: 99.90, priorityBoost: 100, accessCategories: ["residential", "construction", "commercial"], features: ["Máxima prioridade", "Acesso a comercial", "Selo Elite", "Suporte VIP 24h", "Antecipação de pagamentos"], active: true },
];

export const clientPlans: ClientPlan[] = [
  { id: "cp1", name: "Basic", monthlyPrice: 99.90, cleaningsPerMonth: 2, feeDiscountPercent: 10, priorityBoost: 0, features: ["2 limpezas/mês", "10% off na taxa", "Agendamento flexível"], active: true },
  { id: "cp2", name: "Plus", monthlyPrice: 189.90, cleaningsPerMonth: 4, feeDiscountPercent: 20, priorityBoost: 10, features: ["4 limpezas/mês", "20% off na taxa", "Profissionais preferidas"], active: true },
  { id: "cp3", name: "Premium", monthlyPrice: 349.90, cleaningsPerMonth: 8, feeDiscountPercent: 30, priorityBoost: 25, features: ["8 limpezas/mês", "30% off na taxa", "Prioridade no matching", "Suporte VIP"], active: true },
];

// ============= 30 PROS (Mixed plans) =============
export const pros: Pro[] = [
  // São Paulo PROs
  { id: "1", userId: "up1", name: "Ana Paula Silva", email: "ana@email.com", phone: "(11) 98888-1111", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face", city: "São Paulo", zoneIds: ["z1", "z2", "z3"], radiusKm: 15, verifiedStatus: "approved", plan: "elite", ratingAvg: 4.9, jobsDone: 234, acceptanceRate: 97, priorityScore: 100, status: "active", balance: 3520.80, pixKey: "ana@email.com", isAvailableNow: true, currentLat: -23.5634, currentLng: -46.6542, metrics: { proId: "1", onTimeRate: 98, cancelRate: 1, responseTimeAvg: 2, last30dJobs: 28, last7dCancels: 0, qualityScore: 98, qualityLevel: "A", updatedAt: "2025-01-15" } },
  { id: "2", userId: "up2", name: "Maria Santos", email: "maria@email.com", phone: "(11) 98888-2222", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", city: "São Paulo", zoneIds: ["z1", "z4"], radiusKm: 10, verifiedStatus: "approved", plan: "pro", ratingAvg: 4.8, jobsDone: 156, acceptanceRate: 92, priorityScore: 85, status: "active", balance: 1890.00, isAvailableNow: true, currentLat: -23.5700, currentLng: -46.6500, metrics: { proId: "2", onTimeRate: 94, cancelRate: 3, responseTimeAvg: 4, last30dJobs: 22, last7dCancels: 1, qualityScore: 91, qualityLevel: "A", updatedAt: "2025-01-15" } },
  { id: "3", userId: "up3", name: "Juliana Costa", email: "juliana@email.com", phone: "(11) 98888-3333", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face", city: "São Paulo", zoneIds: ["z2", "z3"], radiusKm: 12, verifiedStatus: "approved", plan: "pro", ratingAvg: 4.7, jobsDone: 98, acceptanceRate: 88, priorityScore: 75, status: "active", balance: 920.00, isAvailableNow: false, metrics: { proId: "3", onTimeRate: 90, cancelRate: 5, responseTimeAvg: 6, last30dJobs: 15, last7dCancels: 1, qualityScore: 82, qualityLevel: "B", updatedAt: "2025-01-15" } },
  { id: "4", userId: "up4", name: "Fernanda Lima", email: "fernanda@email.com", phone: "(11) 98888-4444", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face", city: "São Paulo", zoneIds: ["z5", "z6"], radiusKm: 20, verifiedStatus: "approved", plan: "free", ratingAvg: 4.6, jobsDone: 67, acceptanceRate: 85, priorityScore: 55, status: "active", balance: 480.50, isAvailableNow: true, currentLat: -23.5900, currentLng: -46.6800, metrics: { proId: "4", onTimeRate: 88, cancelRate: 6, responseTimeAvg: 8, last30dJobs: 10, last7dCancels: 1, qualityScore: 78, qualityLevel: "B", updatedAt: "2025-01-15" } },
  { id: "5", userId: "up5", name: "Patrícia Oliveira", email: "patricia@email.com", phone: "(11) 98888-5555", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", city: "São Paulo", zoneIds: ["z1"], radiusKm: 8, verifiedStatus: "pending", plan: "free", ratingAvg: 0, jobsDone: 0, acceptanceRate: 0, priorityScore: 10, status: "active", balance: 0 },
  { id: "6", userId: "up6", name: "Carla Mendes", email: "carla@email.com", phone: "(11) 98888-6666", avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face", city: "São Paulo", zoneIds: ["z3", "z4", "z5"], radiusKm: 15, verifiedStatus: "approved", plan: "elite", ratingAvg: 4.8, jobsDone: 189, acceptanceRate: 94, priorityScore: 95, status: "active", balance: 2150.00, isAvailableNow: true, currentLat: -23.6000, currentLng: -46.6700, metrics: { proId: "6", onTimeRate: 96, cancelRate: 2, responseTimeAvg: 3, last30dJobs: 25, last7dCancels: 0, qualityScore: 95, qualityLevel: "A", updatedAt: "2025-01-15" } },
  { id: "7", userId: "up7", name: "Roberta Souza", email: "roberta@email.com", phone: "(11) 98888-7777", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face", city: "São Paulo", zoneIds: ["z2"], radiusKm: 10, verifiedStatus: "rejected", plan: "free", ratingAvg: 0, jobsDone: 0, acceptanceRate: 0, priorityScore: 0, status: "suspended", balance: 0 },
  { id: "8", userId: "up8", name: "Luciana Ferreira", email: "luciana@email.com", phone: "(11) 98888-8888", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face", city: "São Paulo", zoneIds: ["z4", "z6"], radiusKm: 12, verifiedStatus: "approved", plan: "pro", ratingAvg: 4.5, jobsDone: 78, acceptanceRate: 82, priorityScore: 65, status: "active", balance: 620.00, isAvailableNow: false, metrics: { proId: "8", onTimeRate: 85, cancelRate: 8, responseTimeAvg: 10, last30dJobs: 12, last7dCancels: 2, qualityScore: 72, qualityLevel: "C", updatedAt: "2025-01-15" } },
  { id: "9", userId: "up9", name: "Camila Rodrigues", email: "camila@email.com", phone: "(11) 98888-9999", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face", city: "São Paulo", zoneIds: ["z1", "z2", "z3"], radiusKm: 18, verifiedStatus: "pending", plan: "free", ratingAvg: 0, jobsDone: 0, acceptanceRate: 0, priorityScore: 5, status: "active", balance: 0 },
  { id: "10", userId: "up10", name: "Beatriz Almeida", email: "beatriz@email.com", phone: "(11) 98888-0000", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face", city: "São Paulo", zoneIds: ["z1", "z5"], radiusKm: 10, verifiedStatus: "approved", plan: "pro", ratingAvg: 4.8, jobsDone: 112, acceptanceRate: 94, priorityScore: 82, status: "active", balance: 980.00, isAvailableNow: true, currentLat: -23.5650, currentLng: -46.6580, metrics: { proId: "10", onTimeRate: 93, cancelRate: 4, responseTimeAvg: 5, last30dJobs: 18, last7dCancels: 1, qualityScore: 88, qualityLevel: "A", updatedAt: "2025-01-15" } },
  { id: "11", userId: "up11", name: "Sandra Nunes", email: "sandra@email.com", phone: "(11) 97777-1111", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face", city: "São Paulo", zoneIds: ["z2", "z5", "z6"], radiusKm: 15, verifiedStatus: "approved", plan: "free", ratingAvg: 4.4, jobsDone: 45, acceptanceRate: 80, priorityScore: 50, status: "active", balance: 320.00, isAvailableNow: false, metrics: { proId: "11", onTimeRate: 82, cancelRate: 10, responseTimeAvg: 12, last30dJobs: 8, last7dCancels: 2, qualityScore: 68, qualityLevel: "C", updatedAt: "2025-01-15" } },
  { id: "12", userId: "up12", name: "Vanessa Dias", email: "vanessa@email.com", phone: "(11) 97777-2222", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face", city: "São Paulo", zoneIds: ["z3", "z4"], radiusKm: 10, verifiedStatus: "approved", plan: "pro", ratingAvg: 4.6, jobsDone: 89, acceptanceRate: 87, priorityScore: 70, status: "active", balance: 750.00, isAvailableNow: true, currentLat: -23.5950, currentLng: -46.6600, metrics: { proId: "12", onTimeRate: 89, cancelRate: 6, responseTimeAvg: 7, last30dJobs: 14, last7dCancels: 1, qualityScore: 80, qualityLevel: "B", updatedAt: "2025-01-15" } },
  { id: "13", userId: "up13", name: "Priscila Rocha", email: "priscila@email.com", phone: "(11) 97777-3333", avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face", city: "São Paulo", zoneIds: ["z1", "z3"], radiusKm: 12, verifiedStatus: "approved", plan: "elite", ratingAvg: 4.9, jobsDone: 201, acceptanceRate: 96, priorityScore: 98, status: "active", balance: 2850.00, isAvailableNow: true, currentLat: -23.5680, currentLng: -46.6620, metrics: { proId: "13", onTimeRate: 97, cancelRate: 2, responseTimeAvg: 2, last30dJobs: 26, last7dCancels: 0, qualityScore: 96, qualityLevel: "A", updatedAt: "2025-01-15" } },
  { id: "14", userId: "up14", name: "Tatiana Gomes", email: "tatiana@email.com", phone: "(11) 97777-4444", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face", city: "São Paulo", zoneIds: ["z4", "z5", "z6"], radiusKm: 18, verifiedStatus: "approved", plan: "free", ratingAvg: 4.3, jobsDone: 34, acceptanceRate: 78, priorityScore: 40, status: "active", balance: 180.00, isAvailableNow: false, metrics: { proId: "14", onTimeRate: 80, cancelRate: 12, responseTimeAvg: 15, last30dJobs: 6, last7dCancels: 2, qualityScore: 62, qualityLevel: "D", updatedAt: "2025-01-15" } },
  { id: "15", userId: "up15", name: "Adriana Costa", email: "adriana@email.com", phone: "(11) 97777-5555", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face", city: "São Paulo", zoneIds: ["z2", "z3"], radiusKm: 10, verifiedStatus: "approved", plan: "pro", ratingAvg: 4.7, jobsDone: 123, acceptanceRate: 91, priorityScore: 78, status: "active", balance: 1120.00, isAvailableNow: true, currentLat: -23.5720, currentLng: -46.6850, metrics: { proId: "15", onTimeRate: 92, cancelRate: 4, responseTimeAvg: 5, last30dJobs: 20, last7dCancels: 1, qualityScore: 86, qualityLevel: "A", updatedAt: "2025-01-15" } },
  
  // Curitiba PROs
  { id: "16", userId: "up16", name: "Paula Fernandes", email: "paula.f@email.com", phone: "(41) 98888-1111", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face", city: "Curitiba", zoneIds: ["z7", "z8"], radiusKm: 12, verifiedStatus: "approved", plan: "elite", ratingAvg: 4.9, jobsDone: 178, acceptanceRate: 95, priorityScore: 97, status: "active", balance: 2340.00, isAvailableNow: true, currentLat: -25.4350, currentLng: -49.2800, metrics: { proId: "16", onTimeRate: 97, cancelRate: 2, responseTimeAvg: 3, last30dJobs: 24, last7dCancels: 0, qualityScore: 95, qualityLevel: "A", updatedAt: "2025-01-15" } },
  { id: "17", userId: "up17", name: "Cristina Oliveira", email: "cristina@email.com", phone: "(41) 98888-2222", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face", city: "Curitiba", zoneIds: ["z8", "z9", "z10"], radiusKm: 10, verifiedStatus: "approved", plan: "pro", ratingAvg: 4.7, jobsDone: 134, acceptanceRate: 90, priorityScore: 80, status: "active", balance: 1560.00, isAvailableNow: true, currentLat: -25.4450, currentLng: -49.2880, metrics: { proId: "17", onTimeRate: 91, cancelRate: 5, responseTimeAvg: 6, last30dJobs: 18, last7dCancels: 1, qualityScore: 84, qualityLevel: "B", updatedAt: "2025-01-15" } },
  { id: "18", userId: "up18", name: "Rafaela Santos", email: "rafaela@email.com", phone: "(41) 98888-3333", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face", city: "Curitiba", zoneIds: ["z7", "z9"], radiusKm: 15, verifiedStatus: "approved", plan: "pro", ratingAvg: 4.6, jobsDone: 89, acceptanceRate: 86, priorityScore: 72, status: "active", balance: 890.00, isAvailableNow: false, metrics: { proId: "18", onTimeRate: 88, cancelRate: 7, responseTimeAvg: 8, last30dJobs: 14, last7dCancels: 2, qualityScore: 78, qualityLevel: "B", updatedAt: "2025-01-15" } },
  { id: "19", userId: "up19", name: "Simone Almeida", email: "simone@email.com", phone: "(41) 98888-4444", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face", city: "Curitiba", zoneIds: ["z10", "z11"], radiusKm: 20, verifiedStatus: "approved", plan: "free", ratingAvg: 4.5, jobsDone: 56, acceptanceRate: 83, priorityScore: 58, status: "active", balance: 420.00, isAvailableNow: true, currentLat: -25.4580, currentLng: -49.3100, metrics: { proId: "19", onTimeRate: 85, cancelRate: 9, responseTimeAvg: 10, last30dJobs: 10, last7dCancels: 2, qualityScore: 72, qualityLevel: "C", updatedAt: "2025-01-15" } },
  { id: "20", userId: "up20", name: "Débora Lima", email: "debora@email.com", phone: "(41) 98888-5555", avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face", city: "Curitiba", zoneIds: ["z11", "z12"], radiusKm: 25, verifiedStatus: "approved", plan: "free", ratingAvg: 4.4, jobsDone: 42, acceptanceRate: 80, priorityScore: 48, status: "active", balance: 280.00, isAvailableNow: false, metrics: { proId: "20", onTimeRate: 82, cancelRate: 11, responseTimeAvg: 12, last30dJobs: 8, last7dCancels: 2, qualityScore: 66, qualityLevel: "C", updatedAt: "2025-01-15" } },
  { id: "21", userId: "up21", name: "Elaine Rocha", email: "elaine@email.com", phone: "(41) 97777-1111", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face", city: "Curitiba", zoneIds: ["z7", "z8", "z9"], radiusKm: 12, verifiedStatus: "approved", plan: "elite", ratingAvg: 4.8, jobsDone: 167, acceptanceRate: 93, priorityScore: 92, status: "active", balance: 2100.00, isAvailableNow: true, currentLat: -25.4320, currentLng: -49.2850, metrics: { proId: "21", onTimeRate: 95, cancelRate: 3, responseTimeAvg: 4, last30dJobs: 22, last7dCancels: 1, qualityScore: 92, qualityLevel: "A", updatedAt: "2025-01-15" } },
  { id: "22", userId: "up22", name: "Fabiana Neves", email: "fabiana.n@email.com", phone: "(41) 97777-2222", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face", city: "Curitiba", zoneIds: ["z9", "z10"], radiusKm: 10, verifiedStatus: "approved", plan: "pro", ratingAvg: 4.6, jobsDone: 78, acceptanceRate: 85, priorityScore: 68, status: "active", balance: 650.00, isAvailableNow: true, currentLat: -25.4520, currentLng: -49.2900, metrics: { proId: "22", onTimeRate: 87, cancelRate: 8, responseTimeAvg: 9, last30dJobs: 12, last7dCancels: 2, qualityScore: 76, qualityLevel: "B", updatedAt: "2025-01-15" } },
  { id: "23", userId: "up23", name: "Gisele Martins", email: "gisele@email.com", phone: "(41) 97777-3333", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face", city: "Curitiba", zoneIds: ["z8", "z10", "z11"], radiusKm: 18, verifiedStatus: "approved", plan: "free", ratingAvg: 4.3, jobsDone: 35, acceptanceRate: 77, priorityScore: 42, status: "active", balance: 190.00, isAvailableNow: false, metrics: { proId: "23", onTimeRate: 79, cancelRate: 14, responseTimeAvg: 15, last30dJobs: 6, last7dCancels: 2, qualityScore: 60, qualityLevel: "D", updatedAt: "2025-01-15" } },
  { id: "24", userId: "up24", name: "Helena Dias", email: "helena.d@email.com", phone: "(41) 97777-4444", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face", city: "Curitiba", zoneIds: ["z7", "z12"], radiusKm: 20, verifiedStatus: "pending", plan: "free", ratingAvg: 0, jobsDone: 0, acceptanceRate: 0, priorityScore: 8, status: "active", balance: 0 },
  { id: "25", userId: "up25", name: "Ivone Cardoso", email: "ivone@email.com", phone: "(41) 97777-5555", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face", city: "Curitiba", zoneIds: ["z9", "z11", "z12"], radiusKm: 22, verifiedStatus: "approved", plan: "pro", ratingAvg: 4.5, jobsDone: 67, acceptanceRate: 84, priorityScore: 62, status: "active", balance: 520.00, isAvailableNow: true, currentLat: -25.4650, currentLng: -49.3150, metrics: { proId: "25", onTimeRate: 86, cancelRate: 8, responseTimeAvg: 9, last30dJobs: 11, last7dCancels: 2, qualityScore: 74, qualityLevel: "B", updatedAt: "2025-01-15" } },
  { id: "26", userId: "up26", name: "Joana Pereira", email: "joana@email.com", phone: "(41) 96666-1111", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face", city: "Curitiba", zoneIds: ["z7", "z8"], radiusKm: 10, verifiedStatus: "approved", plan: "pro", ratingAvg: 4.7, jobsDone: 98, acceptanceRate: 89, priorityScore: 75, status: "active", balance: 880.00, isAvailableNow: false, metrics: { proId: "26", onTimeRate: 90, cancelRate: 6, responseTimeAvg: 7, last30dJobs: 16, last7dCancels: 1, qualityScore: 82, qualityLevel: "B", updatedAt: "2025-01-15" } },
  { id: "27", userId: "up27", name: "Karina Souza", email: "karina@email.com", phone: "(41) 96666-2222", avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face", city: "Curitiba", zoneIds: ["z10", "z11"], radiusKm: 15, verifiedStatus: "approved", plan: "free", ratingAvg: 4.2, jobsDone: 28, acceptanceRate: 75, priorityScore: 35, status: "active", balance: 140.00, isAvailableNow: true, currentLat: -25.4550, currentLng: -49.3050, metrics: { proId: "27", onTimeRate: 78, cancelRate: 15, responseTimeAvg: 18, last30dJobs: 5, last7dCancels: 2, qualityScore: 55, qualityLevel: "D", updatedAt: "2025-01-15" } },
  { id: "28", userId: "up28", name: "Larissa Campos", email: "larissa.c@email.com", phone: "(41) 96666-3333", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face", city: "Curitiba", zoneIds: ["z8", "z9", "z10"], radiusKm: 12, verifiedStatus: "approved", plan: "elite", ratingAvg: 4.8, jobsDone: 145, acceptanceRate: 92, priorityScore: 88, status: "active", balance: 1780.00, isAvailableNow: true, currentLat: -25.4420, currentLng: -49.2920, metrics: { proId: "28", onTimeRate: 94, cancelRate: 4, responseTimeAvg: 4, last30dJobs: 20, last7dCancels: 1, qualityScore: 90, qualityLevel: "A", updatedAt: "2025-01-15" } },
  { id: "29", userId: "up29", name: "Mariana Vieira", email: "mariana.v@email.com", phone: "(41) 96666-4444", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face", city: "Curitiba", zoneIds: ["z7", "z9"], radiusKm: 14, verifiedStatus: "pending", plan: "free", ratingAvg: 0, jobsDone: 0, acceptanceRate: 0, priorityScore: 6, status: "active", balance: 0 },
  { id: "30", userId: "up30", name: "Natália Ribeiro", email: "natalia.r@email.com", phone: "(41) 96666-5555", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face", city: "Curitiba", zoneIds: ["z11", "z12"], radiusKm: 20, verifiedStatus: "approved", plan: "free", ratingAvg: 4.4, jobsDone: 52, acceptanceRate: 81, priorityScore: 52, status: "active", balance: 360.00, isAvailableNow: false, metrics: { proId: "30", onTimeRate: 84, cancelRate: 10, responseTimeAvg: 11, last30dJobs: 9, last7dCancels: 2, qualityScore: 70, qualityLevel: "C", updatedAt: "2025-01-15" } },
];

// ============= 80 CLIENTS =============
const clientNames = [
  "João Pedro", "Carolina Martins", "Ricardo Gomes", "Amanda Nascimento", "Bruno Cardoso",
  "Daniela Rocha", "Eduardo Lima", "Fabiana Costa", "Gabriel Santos", "Helena Oliveira",
  "Igor Fernandes", "Júlia Barbosa", "Kleber Souza", "Larissa Pereira", "Marcos Alves",
  "Natália Ribeiro", "Otávio Cunha", "Paula Vieira", "Renato Dias", "Sofia Moreira",
  "Thiago Mendes", "Vanessa Dias", "William Ferreira", "Yasmin Costa", "André Nunes",
  "Bianca Oliveira", "Carlos Eduardo", "Diana Santos", "Evandro Lima", "Fernanda Alves",
  "Gustavo Rocha", "Isabela Martins", "Jefferson Gomes", "Karen Nascimento", "Leonardo Cardoso",
  "Marina Pereira", "Nicolas Souza", "Olívia Fernandes", "Pedro Henrique", "Queila Barbosa",
  "Rafael Cunha", "Sabrina Vieira", "Tiago Dias", "Úrsula Moreira", "Victor Mendes",
  "Wesley Costa", "Ximena Santos", "Yuri Lima", "Zélia Almeida", "Arthur Rocha",
  "Beatriz Santos", "Caio Oliveira", "Débora Martins", "Emanuel Gomes", "Flávia Lima",
  "Guilherme Costa", "Heloísa Alves", "Ícaro Fernandes", "Jéssica Pereira", "Kevin Souza",
  "Lorena Dias", "Murilo Cunha", "Nicole Vieira", "Oswaldo Moreira", "Patrícia Mendes",
  "Quirino Costa", "Rebeca Santos", "Samuel Lima", "Tatiana Almeida", "Ubirajara Rocha",
  "Valéria Oliveira", "Wagner Martins", "Xavier Gomes", "Yolanda Nascimento", "Zacarias Cardoso",
  "Adriano Pereira", "Brenda Souza", "Cláudio Fernandes", "Denise Barbosa"
];

export const clients: User[] = clientNames.map((name, i) => ({
  id: `c${i + 1}`,
  name,
  email: `${name.toLowerCase().split(" ")[0]}${i + 1}@email.com`,
  phone: `(${i < 50 ? "11" : "41"}) 9${String(9990 + i).slice(-4)}-${String(1111 + i).slice(-4)}`,
  role: "client" as UserRole,
  status: i === 7 ? "suspended" : "active" as UserStatus,
  createdAt: new Date(2024, 5 + Math.floor(i / 12), 1 + (i % 28)).toISOString().split("T")[0],
  totalOrders: Math.floor(Math.random() * 20) + 1,
  totalSpent: Math.floor(Math.random() * 3000) + 200,
  riskLevel: i === 7 || i === 12 ? "high" : i === 5 || i === 25 ? "medium" : "low" as "low" | "medium" | "high",
  referralCode: `REF${String(i + 1).padStart(4, "0")}`
}));

// ============= 10 CLIENT SUBSCRIPTIONS =============
export const clientSubscriptions: ClientSubscription[] = [
  { id: "cs1", clientId: "c1", planId: "cp3", status: "active", startAt: "2024-12-01", renewAt: "2025-01-01", creditsTotal: 8, creditsUsed: 3 },
  { id: "cs2", clientId: "c3", planId: "cp2", status: "active", startAt: "2024-12-15", renewAt: "2025-01-15", creditsTotal: 4, creditsUsed: 2 },
  { id: "cs3", clientId: "c5", planId: "cp3", status: "active", startAt: "2025-01-01", renewAt: "2025-02-01", creditsTotal: 8, creditsUsed: 1 },
  { id: "cs4", clientId: "c10", planId: "cp1", status: "active", startAt: "2024-11-20", renewAt: "2024-12-20", creditsTotal: 2, creditsUsed: 2 },
  { id: "cs5", clientId: "c12", planId: "cp2", status: "active", startAt: "2025-01-05", renewAt: "2025-02-05", creditsTotal: 4, creditsUsed: 0 },
  { id: "cs6", clientId: "c15", planId: "cp1", status: "paused", startAt: "2024-10-01", renewAt: "2024-11-01", creditsTotal: 2, creditsUsed: 1 },
  { id: "cs7", clientId: "c20", planId: "cp3", status: "active", startAt: "2024-12-10", renewAt: "2025-01-10", creditsTotal: 8, creditsUsed: 5 },
  { id: "cs8", clientId: "c25", planId: "cp2", status: "active", startAt: "2025-01-02", renewAt: "2025-02-02", creditsTotal: 4, creditsUsed: 1 },
  { id: "cs9", clientId: "c30", planId: "cp1", status: "cancelled", startAt: "2024-09-15", renewAt: "2024-10-15", creditsTotal: 2, creditsUsed: 2 },
  { id: "cs10", clientId: "c35", planId: "cp2", status: "active", startAt: "2024-12-20", renewAt: "2025-01-20", creditsTotal: 4, creditsUsed: 3 },
];

// ============= RECURRING RULES =============
export const recurringRules: RecurringRule[] = [
  { id: "rr1", subscriptionId: "cs1", weekday: 1, time: "09:00", addressId: "a1", serviceId: "1", active: true },
  { id: "rr2", subscriptionId: "cs1", weekday: 4, time: "14:00", addressId: "a1", serviceId: "1", active: true },
  { id: "rr3", subscriptionId: "cs3", weekday: 2, time: "10:00", addressId: "a5", serviceId: "2", active: true },
  { id: "rr4", subscriptionId: "cs5", weekday: 3, time: "08:00", addressId: "a12", serviceId: "1", active: true },
  { id: "rr5", subscriptionId: "cs7", weekday: 5, time: "15:00", addressId: "a20", serviceId: "1", active: true },
];

// ============= 200 ORDERS =============
const orderStatuses: OrderStatus[] = ["confirmed", "en_route", "in_progress", "completed", "rated", "paid_out", "cancelled", "in_review"];
const neighborhoods = ["Jardins", "Pinheiros", "Moema", "Vila Mariana", "Itaim Bibi", "Brooklin", "Centro", "Batel", "Água Verde", "Champagnat", "Ecoville", "Santa Felicidade"];

export const orders: Order[] = Array.from({ length: 200 }, (_, i) => {
  const clientIndex = i % 80;
  const proIndex = i % 30;
  const serviceIndex = i % 4;
  const statusIndex = i % orderStatuses.length;
  const isSP = i < 100;
  const dayOffset = Math.floor(i / 8);
  
  const subtotal = services[serviceIndex].basePrice;
  const discount = i % 5 === 0 ? 20 : i % 7 === 0 ? 30 : 0;
  const fee = 9.90;
  const zoneFee = i % 10 === 0 ? 5 : 0;
  const total = subtotal - discount + fee + zoneFee;
  const commission = total * 0.20;
  
  return {
    id: String(1000 + i + 1),
    clientId: `c${clientIndex + 1}`,
    clientName: clients[clientIndex].name,
    proId: statusIndex > 0 ? String(proIndex + 1) : undefined,
    proName: statusIndex > 0 ? pros[proIndex].name : undefined,
    serviceId: String(serviceIndex + 1),
    serviceName: services[serviceIndex].name,
    addressId: `a${clientIndex + 1}`,
    address: `Rua ${["das Flores", "Paulista", "Augusta", "Oscar Freire", "Consolação", "Brasil"][i % 6]}, ${100 + i}`,
    neighborhood: neighborhoods[i % neighborhoods.length],
    city: isSP ? "São Paulo" : "Curitiba",
    zoneId: isSP ? `z${(i % 6) + 1}` : `z${(i % 6) + 7}`,
    dateTime: new Date(2025, 0, 20 - dayOffset, 8 + (i % 10), 0).toISOString(),
    date: `${String(20 - dayOffset).padStart(2, "0")}/01/2025`,
    time: `${String(8 + (i % 10)).padStart(2, "0")}:00`,
    status: orderStatuses[statusIndex],
    subtotal,
    discount,
    fee,
    zoneFee,
    totalPrice: total,
    commissionPercent: 20,
    commissionValue: commission,
    proEarning: total - commission,
    couponCode: discount > 0 ? (discount === 20 ? "PROMO20" : "DESC30") : undefined,
    isRecurring: i % 12 === 0,
    matchingScore: 70 + (i % 30),
    createdAt: new Date(2025, 0, 18 - dayOffset).toISOString().split("T")[0]
  };
});

// ============= MATCHING LOGS =============
export const matchingLogs: MatchingLog[] = orders.slice(0, 20).map((order, i) => ({
  id: `ml${i + 1}`,
  orderId: order.id,
  candidates: [
    { proId: "1", proName: "Ana Paula Silva", score: 98, distanceKm: 1.2, rating: 4.9, plan: "elite" as ProPlanType, accepted: i === 0 },
    { proId: "2", proName: "Maria Santos", score: 85, distanceKm: 2.5, rating: 4.8, plan: "pro" as ProPlanType, accepted: false },
    { proId: "6", proName: "Carla Mendes", score: 82, distanceKm: 3.1, rating: 4.8, plan: "elite" as ProPlanType, accepted: false },
  ],
  chosenProId: order.proId,
  reason: i === 0 ? "Accepted by first candidate" : "Assigned to top scorer",
  createdAt: order.createdAt
}));

// ============= 20 COUPONS =============
export const coupons: Coupon[] = [
  { id: "coup1", code: "BEMVINDO", type: "fixed", value: 30, expiresAt: "2025-12-31", maxUses: 1000, currentUses: 245, minOrderValue: 100, active: true },
  { id: "coup2", code: "PROMO20", type: "fixed", value: 20, expiresAt: "2025-03-31", maxUses: 500, currentUses: 123, minOrderValue: 80, active: true },
  { id: "coup3", code: "DESC30", type: "fixed", value: 30, expiresAt: "2025-02-28", maxUses: 200, currentUses: 89, minOrderValue: 120, active: true },
  { id: "coup4", code: "NATAL25", type: "percent", value: 25, expiresAt: "2024-12-31", maxUses: 300, currentUses: 300, minOrderValue: 100, active: false },
  { id: "coup5", code: "VERAO15", type: "percent", value: 15, expiresAt: "2025-02-28", maxUses: 400, currentUses: 156, minOrderValue: 80, active: true },
  { id: "coup6", code: "PRIMEIRA50", type: "fixed", value: 50, expiresAt: "2025-12-31", maxUses: 2000, currentUses: 567, minOrderValue: 150, active: true },
  { id: "coup7", code: "ASSINANTE10", type: "percent", value: 10, expiresAt: "2025-06-30", maxUses: 1000, currentUses: 234, minOrderValue: 0, active: true },
  { id: "coup8", code: "ELITE20", type: "percent", value: 20, expiresAt: "2025-04-30", maxUses: 100, currentUses: 45, minOrderValue: 200, active: true },
  { id: "coup9", code: "CURITIBA30", type: "fixed", value: 30, expiresAt: "2025-03-31", maxUses: 200, currentUses: 67, minOrderValue: 100, active: true },
  { id: "coup10", code: "SAOPAULO25", type: "fixed", value: 25, expiresAt: "2025-03-31", maxUses: 300, currentUses: 112, minOrderValue: 100, active: true },
  { id: "coup11", code: "FEVEREIRO20", type: "percent", value: 20, expiresAt: "2025-02-28", maxUses: 500, currentUses: 0, minOrderValue: 80, active: true },
  { id: "coup12", code: "LIMPAPLUS", type: "fixed", value: 40, expiresAt: "2025-05-31", maxUses: 150, currentUses: 34, minOrderValue: 150, active: true },
  { id: "coup13", code: "RECORRENTE15", type: "percent", value: 15, expiresAt: "2025-12-31", maxUses: 800, currentUses: 189, minOrderValue: 0, active: true },
  { id: "coup14", code: "EMPRESA25", type: "percent", value: 25, expiresAt: "2025-06-30", maxUses: 50, currentUses: 12, minOrderValue: 500, active: true },
  { id: "coup15", code: "POSOBRA50", type: "fixed", value: 50, expiresAt: "2025-04-30", maxUses: 100, currentUses: 28, minOrderValue: 250, active: true },
  { id: "coup16", code: "INDICACAO20", type: "fixed", value: 20, expiresAt: "2025-12-31", maxUses: 5000, currentUses: 1234, minOrderValue: 80, active: true },
  { id: "coup17", code: "JANEIRO10", type: "percent", value: 10, expiresAt: "2025-01-31", maxUses: 600, currentUses: 345, minOrderValue: 60, active: true },
  { id: "coup18", code: "COMERCIAL30", type: "percent", value: 30, expiresAt: "2025-07-31", maxUses: 80, currentUses: 15, minOrderValue: 300, active: true },
  { id: "coup19", code: "SEMANA20", type: "fixed", value: 20, expiresAt: "2025-01-20", maxUses: 100, currentUses: 78, minOrderValue: 100, active: true },
  { id: "coup20", code: "FLASH40", type: "fixed", value: 40, expiresAt: "2025-01-18", maxUses: 50, currentUses: 50, minOrderValue: 120, active: false },
];

// ============= 15 SUPPORT TICKETS =============
export const supportTickets: SupportTicket[] = [
  { id: "t1", orderId: "1001", createdByUserId: "c1", createdByName: "João Pedro", createdByRole: "client", subject: "Profissional atrasou 30 minutos", status: "open", priority: "high", createdAt: "2025-01-15T10:30:00", lastMessage: "Ainda aguardando retorno", attachments: [{ id: "att1", ticketId: "t1", type: "other", urlPlaceholder: "/placeholder.svg", createdAt: "2025-01-15T10:30:00" }] },
  { id: "t2", orderId: "1005", createdByUserId: "c5", createdByName: "Bruno Cardoso", createdByRole: "client", subject: "Limpeza não ficou completa", status: "in_progress", priority: "medium", createdAt: "2025-01-14T14:20:00", lastMessage: "Enviando fotos do problema", attachments: [{ id: "att2", ticketId: "t2", type: "photo_after", urlPlaceholder: "/placeholder.svg", createdAt: "2025-01-14T14:25:00" }] },
  { id: "t3", createdByUserId: "up1", createdByName: "Ana Paula Silva", createdByRole: "pro", subject: "Cliente não estava no endereço", status: "resolved", priority: "medium", createdAt: "2025-01-13T09:15:00", lastMessage: "Compensação aplicada" },
  { id: "t4", orderId: "1010", createdByUserId: "c10", createdByName: "Helena Oliveira", createdByRole: "client", subject: "Pedido de reembolso", status: "open", priority: "high", createdAt: "2025-01-12T16:45:00", lastMessage: "Aguardando análise", attachments: [{ id: "att3", ticketId: "t4", type: "photo_before", urlPlaceholder: "/placeholder.svg", createdAt: "2025-01-12T16:50:00" }, { id: "att4", ticketId: "t4", type: "photo_after", urlPlaceholder: "/placeholder.svg", createdAt: "2025-01-12T16:52:00" }] },
  { id: "t5", createdByUserId: "up3", createdByName: "Juliana Costa", createdByRole: "pro", subject: "Problema com saque", status: "in_progress", priority: "high", createdAt: "2025-01-11T11:30:00", lastMessage: "Verificando dados bancários" },
  { id: "t6", orderId: "1015", createdByUserId: "c15", createdByName: "Marcos Alves", createdByRole: "client", subject: "Dúvida sobre agendamento", status: "resolved", priority: "low", createdAt: "2025-01-10T08:20:00", lastMessage: "Resolvido - pedido reagendado" },
  { id: "t7", createdByUserId: "up6", createdByName: "Carla Mendes", createdByRole: "pro", subject: "App não atualiza localização", status: "open", priority: "medium", createdAt: "2025-01-09T15:10:00", lastMessage: "Problema técnico reportado" },
  { id: "t8", orderId: "1020", createdByUserId: "c20", createdByName: "Sofia Moreira", createdByRole: "client", subject: "Cupom não aplicado", status: "resolved", priority: "low", createdAt: "2025-01-08T10:45:00", lastMessage: "Crédito aplicado na conta" },
  { id: "t9", createdByUserId: "up10", createdByName: "Beatriz Almeida", createdByRole: "pro", subject: "Cancelamento indevido", status: "in_progress", priority: "high", createdAt: "2025-01-07T13:25:00", lastMessage: "Analisando histórico" },
  { id: "t10", orderId: "1025", createdByUserId: "c25", createdByName: "André Nunes", createdByRole: "client", subject: "Serviço diferente do contratado", status: "open", priority: "medium", createdAt: "2025-01-06T17:00:00", lastMessage: "Fotos anexadas", attachments: [{ id: "att5", ticketId: "t10", type: "photo_after", urlPlaceholder: "/placeholder.svg", createdAt: "2025-01-06T17:05:00" }] },
  { id: "t11", createdByUserId: "up16", createdByName: "Paula Fernandes", createdByRole: "pro", subject: "Problema no pagamento", status: "resolved", priority: "high", createdAt: "2025-01-05T09:40:00", lastMessage: "Pagamento liberado" },
  { id: "t12", orderId: "1030", createdByUserId: "c30", createdByName: "Sofia Moreira", createdByRole: "client", subject: "Reagendar serviço", status: "resolved", priority: "low", createdAt: "2025-01-04T14:15:00", lastMessage: "Reagendado com sucesso" },
  { id: "t13", createdByUserId: "up21", createdByName: "Elaine Rocha", createdByRole: "pro", subject: "Atualizar área de atendimento", status: "open", priority: "low", createdAt: "2025-01-03T11:50:00", lastMessage: "Aguardando confirmação" },
  { id: "t14", orderId: "1035", createdByUserId: "c35", createdByName: "Marina Pereira", createdByRole: "client", subject: "Problema com produto de limpeza", status: "in_progress", priority: "medium", createdAt: "2025-01-02T16:30:00", lastMessage: "Investigando com profissional" },
  { id: "t15", createdByUserId: "up28", createdByName: "Larissa Campos", createdByRole: "pro", subject: "Dúvida sobre plano ELITE", status: "resolved", priority: "low", createdAt: "2025-01-01T10:00:00", lastMessage: "Esclarecimentos enviados" },
];

export const supportMessages: SupportMessage[] = [
  { id: "sm1", ticketId: "t1", senderUserId: "c1", senderName: "João Pedro", message: "A profissional Ana Paula atrasou mais de 30 minutos e não avisou.", createdAt: "2025-01-15T10:30:00" },
  { id: "sm2", ticketId: "t1", senderUserId: "admin1", senderName: "Suporte LimpaJá", message: "Olá João, pedimos desculpas pelo inconveniente. Estamos entrando em contato com a profissional.", createdAt: "2025-01-15T10:45:00" },
  { id: "sm3", ticketId: "t1", senderUserId: "c1", senderName: "João Pedro", message: "Ainda aguardando retorno", createdAt: "2025-01-15T11:30:00" },
  { id: "sm4", ticketId: "t2", senderUserId: "c5", senderName: "Bruno Cardoso", message: "A limpeza não incluiu os vidros como combinado.", createdAt: "2025-01-14T14:20:00" },
  { id: "sm5", ticketId: "t2", senderUserId: "admin1", senderName: "Suporte LimpaJá", message: "Entendemos. Pode nos enviar fotos para análise?", createdAt: "2025-01-14T14:23:00" },
  { id: "sm6", ticketId: "t2", senderUserId: "c5", senderName: "Bruno Cardoso", message: "Enviando fotos do problema", createdAt: "2025-01-14T14:25:00" },
];

// ============= RISK FLAGS =============
export const riskFlags: RiskFlag[] = [
  { id: "rf1", userId: "c8", userRole: "client", type: "cancellations", severity: "high", notes: "5 cancelamentos em 30 dias", createdAt: "2025-01-10" },
  { id: "rf2", userId: "c8", userRole: "client", type: "complaints", severity: "medium", notes: "3 reclamações sobre não comparecer", createdAt: "2025-01-08" },
  { id: "rf3", userId: "c13", userRole: "client", type: "cancellations", severity: "medium", notes: "3 cancelamentos em 30 dias", createdAt: "2025-01-05" },
  { id: "rf4", userId: "up7", userRole: "pro", type: "no_show", severity: "high", notes: "Não compareceu 2 vezes", createdAt: "2025-01-03" },
  { id: "rf5", userId: "up14", userRole: "pro", type: "late", severity: "medium", notes: "Atrasos frequentes (>30min)", createdAt: "2025-01-01" },
  { id: "rf6", userId: "up23", userRole: "pro", type: "low_rating", severity: "medium", notes: "Rating abaixo de 4.5", createdAt: "2024-12-28" },
  { id: "rf7", userId: "up27", userRole: "pro", type: "refusals", severity: "medium", notes: "Alta taxa de recusas", createdAt: "2024-12-25" },
  { id: "rf8", userId: "c6", userRole: "client", type: "complaints", severity: "low", notes: "2 reclamações menores", createdAt: "2024-12-20" },
];

export const riskActions: RiskAction[] = [
  { id: "ra1", userId: "c8", action: "temp_blocked", startAt: "2025-01-10", endAt: "2025-01-17", createdAt: "2025-01-10" },
  { id: "ra2", userId: "up7", action: "temp_blocked", startAt: "2025-01-03", createdAt: "2025-01-03" },
  { id: "ra3", userId: "up14", action: "priority_reduced", startAt: "2025-01-01", createdAt: "2025-01-01" },
  { id: "ra4", userId: "c13", action: "confirmation_required", startAt: "2025-01-05", createdAt: "2025-01-05" },
];

// ============= COMPANIES & QUOTES =============
export const companies: Company[] = [
  { id: "comp1", userId: "c50", companyName: "Tech Solutions LTDA", cnpj: "12.345.678/0001-90", contactName: "Arthur Rocha", contactPhone: "(11) 98765-4321", createdAt: "2024-12-01" },
  { id: "comp2", userId: "c55", companyName: "Escritório Advocacia Silva", cnpj: "23.456.789/0001-01", contactName: "Guilherme Costa", contactPhone: "(11) 97654-3210", createdAt: "2024-12-10" },
  { id: "comp3", userId: "c60", companyName: "Clínica Saúde Total", cnpj: "34.567.890/0001-12", contactName: "Ícaro Fernandes", contactPhone: "(41) 96543-2109", createdAt: "2024-12-15" },
];

export const quotes: Quote[] = [
  { id: "q1", companyId: "comp1", companyName: "Tech Solutions LTDA", details: { serviceType: "Comercial", frequency: "3x/semana", addresses: 1, estimatedHours: 4, notes: "Escritório open space 200m²" }, status: "active", estimatedValue: 1800, createdAt: "2024-12-05" },
  { id: "q2", companyId: "comp2", companyName: "Escritório Advocacia Silva", details: { serviceType: "Comercial", frequency: "2x/semana", addresses: 2, estimatedHours: 3, notes: "2 salas comerciais" }, status: "approved", estimatedValue: 1200, createdAt: "2024-12-12" },
  { id: "q3", companyId: "comp3", companyName: "Clínica Saúde Total", details: { serviceType: "Comercial", frequency: "Diário", addresses: 1, estimatedHours: 6, notes: "Ambiente hospitalar - limpeza especial" }, status: "pending", estimatedValue: 4500, createdAt: "2024-12-18" },
];

// ============= 30 REFERRALS =============
export const referrals: Referral[] = Array.from({ length: 30 }, (_, i) => ({
  id: `ref${i + 1}`,
  referrerUserId: `c${(i % 40) + 1}`,
  referrerName: clients[(i % 40)].name,
  refereeUserId: `c${40 + (i % 40) + 1}`,
  refereeName: clients[40 + (i % 40)]?.name || "Novo Usuário",
  role: i % 4 === 0 ? "pro" as UserRole : "client" as UserRole,
  status: i < 10 ? "rewarded" : i < 20 ? "qualified" : "pending" as ReferralStatus,
  rewardValue: i % 4 === 0 ? 50 : 20,
  createdAt: new Date(2024, 11, 1 + i).toISOString().split("T")[0]
}));

export const referralRewards: ReferralReward[] = referrals.filter(r => r.status === "rewarded").map((r, i) => ({
  id: `rr${i + 1}`,
  userId: r.referrerUserId,
  type: "credit" as "credit" | "bonus",
  value: r.rewardValue,
  status: "paid" as "pending" | "paid",
  createdAt: r.createdAt
}));

// ============= ANALYTICS EVENTS (sample) =============
export const analyticsEvents: AnalyticsEvent[] = [
  { id: "ev1", userId: "c1", eventName: "page_view", metadata: { page: "/client/home" }, createdAt: "2025-01-15T10:00:00" },
  { id: "ev2", userId: "c1", eventName: "service_selected", metadata: { serviceId: "1" }, createdAt: "2025-01-15T10:02:00" },
  { id: "ev3", userId: "c1", eventName: "checkout_started", metadata: { orderId: "1001" }, createdAt: "2025-01-15T10:05:00" },
  { id: "ev4", userId: "c1", eventName: "payment_completed", metadata: { orderId: "1001", amount: 189.80 }, createdAt: "2025-01-15T10:08:00" },
];

// ============= HELPER FUNCTIONS =============
export function calculateMatchingScore(pro: Pro, order: Order): number {
  let score = 0;
  
  // Distance (mock - random 1-5km)
  const distance = 1 + Math.random() * 4;
  score += Math.max(0, 30 - distance * 5);
  
  // Rating
  score += pro.ratingAvg * 5;
  
  // Jobs done (experience)
  score += Math.min(15, pro.jobsDone / 10);
  
  // Acceptance rate
  score += pro.acceptanceRate / 5;
  
  // Plan boost
  if (pro.plan === "elite") score += 15;
  else if (pro.plan === "pro") score += 8;
  
  // Priority score from admin
  score += pro.priorityScore / 10;
  
  // Quality metrics
  if (pro.metrics) {
    score += pro.metrics.onTimeRate / 10;
    score -= pro.metrics.cancelRate;
    score -= pro.metrics.responseTimeAvg;
  }
  
  return Math.min(100, Math.round(score));
}

export function getMetricsForDashboard() {
  const today = orders.filter(o => o.date === "15/01/2025");
  const thisMonth = orders.filter(o => o.createdAt.startsWith("2025-01"));
  const completed = orders.filter(o => ["completed", "rated", "paid_out"].includes(o.status));
  
  return {
    ordersToday: today.length,
    ordersMonth: thisMonth.length,
    gmv: orders.reduce((sum, o) => sum + o.totalPrice, 0),
    platformRevenue: orders.reduce((sum, o) => sum + o.commissionValue, 0),
    avgTicket: orders.reduce((sum, o) => sum + o.totalPrice, 0) / orders.length,
    cancelRate: (orders.filter(o => o.status === "cancelled").length / orders.length) * 100,
    newPros7d: pros.filter(p => p.verifiedStatus === "pending").length,
    activeSubscriptions: clientSubscriptions.filter(s => s.status === "active").length,
    totalReferrals: referrals.length,
    pendingTickets: supportTickets.filter(t => t.status === "open").length,
  };
}

export function getQualityLevelInfo(level: QualityLevel): { label: string; color: string; description: string } {
  const levels = {
    A: { label: "Excelente", color: "text-success", description: "Máxima prioridade e destaque" },
    B: { label: "Bom", color: "text-primary", description: "Prioridade normal" },
    C: { label: "Regular", color: "text-warning", description: "Melhore sua pontuação" },
    D: { label: "Atenção", color: "text-destructive", description: "Risco de suspensão" },
  };
  return levels[level];
}

// Mock current user/pro for demos
export const mockUser = clients[0];
export const mockPro = pros[0];
