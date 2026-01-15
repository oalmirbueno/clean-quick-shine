// Mock data V2 for LimpaJá - Complete marketplace data

export type UserRole = "client" | "pro" | "admin";
export type UserStatus = "active" | "suspended" | "blocked";
export type ProVerifiedStatus = "pending" | "approved" | "rejected";
export type ProPlan = "free" | "pro";
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
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  number: string;
  city: string;
  state: string;
  zip: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  basePrice: number;
  category: string;
}

export interface Pro {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  city: string;
  radiusKm: number;
  verifiedStatus: ProVerifiedStatus;
  plan: ProPlan;
  ratingAvg: number;
  jobsDone: number;
  acceptanceRate: number;
  priorityScore: number;
  status: ProStatus;
  balance: number;
  pixKey?: string;
}

export interface ProDocument {
  id: string;
  proId: string;
  docType: "id_front" | "id_back" | "selfie" | "proof";
  status: DocStatus;
  createdAt: string;
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
  city: string;
  dateTime: string;
  date: string;
  time: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  fee: number;
  totalPrice: number;
  commissionPercent: number;
  commissionValue: number;
  proEarning: number;
  couponCode?: string;
  createdAt: string;
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
  assignedAdminId?: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  lastMessage?: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderUserId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface AdminSettings {
  commissionPercentDefault: number;
  feeFixed: number;
  cancelFreeHours: number;
  cancelPenaltyPercent: number;
  refundPolicyText: string;
}

// Default Admin Settings
export const adminSettings: AdminSettings = {
  commissionPercentDefault: 20,
  feeFixed: 9.90,
  cancelFreeHours: 12,
  cancelPenaltyPercent: 15,
  refundPolicyText: "Reembolso integral para cancelamentos dentro da janela permitida. Após isso, aplica-se multa conforme política."
};

// Services
export const services: Service[] = [
  { id: "1", name: "Limpeza Padrão", description: "Limpeza completa de rotina (2-4h)", durationMin: 180, basePrice: 129.90, category: "residential" },
  { id: "2", name: "Limpeza Pesada", description: "Limpeza profunda e detalhada (4-6h)", durationMin: 300, basePrice: 179.90, category: "residential" },
  { id: "3", name: "Pós-Obra", description: "Remoção de resíduos de obra (6-8h)", durationMin: 420, basePrice: 299.90, category: "construction" },
  { id: "4", name: "Comercial", description: "Limpeza de escritórios e lojas", durationMin: 240, basePrice: 199.90, category: "commercial" },
];

// 10 Diaristas
export const pros: Pro[] = [
  { id: "1", userId: "u1", name: "Ana Paula Silva", email: "ana@email.com", phone: "(11) 98888-1111", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face", city: "São Paulo", radiusKm: 15, verifiedStatus: "approved", plan: "pro", ratingAvg: 4.9, jobsDone: 128, acceptanceRate: 95, priorityScore: 100, status: "active", balance: 1520.80, pixKey: "ana@email.com" },
  { id: "2", userId: "u2", name: "Maria Santos", email: "maria@email.com", phone: "(11) 98888-2222", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", city: "São Paulo", radiusKm: 10, verifiedStatus: "approved", plan: "pro", ratingAvg: 4.8, jobsDone: 95, acceptanceRate: 92, priorityScore: 90, status: "active", balance: 890.00 },
  { id: "3", userId: "u3", name: "Juliana Costa", email: "juliana@email.com", phone: "(11) 98888-3333", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face", city: "São Paulo", radiusKm: 12, verifiedStatus: "approved", plan: "free", ratingAvg: 4.7, jobsDone: 67, acceptanceRate: 88, priorityScore: 70, status: "active", balance: 320.00 },
  { id: "4", userId: "u4", name: "Fernanda Lima", email: "fernanda@email.com", phone: "(11) 98888-4444", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face", city: "Guarulhos", radiusKm: 20, verifiedStatus: "approved", plan: "free", ratingAvg: 4.6, jobsDone: 45, acceptanceRate: 85, priorityScore: 60, status: "active", balance: 180.50 },
  { id: "5", userId: "u5", name: "Patrícia Oliveira", email: "patricia@email.com", phone: "(11) 98888-5555", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", city: "São Paulo", radiusKm: 8, verifiedStatus: "pending", plan: "free", ratingAvg: 0, jobsDone: 0, acceptanceRate: 0, priorityScore: 10, status: "active", balance: 0 },
  { id: "6", userId: "u6", name: "Carla Mendes", email: "carla@email.com", phone: "(11) 98888-6666", avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face", city: "Osasco", radiusKm: 15, verifiedStatus: "approved", plan: "pro", ratingAvg: 4.5, jobsDone: 52, acceptanceRate: 90, priorityScore: 75, status: "active", balance: 450.00 },
  { id: "7", userId: "u7", name: "Roberta Souza", email: "roberta@email.com", phone: "(11) 98888-7777", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face", city: "São Paulo", radiusKm: 10, verifiedStatus: "rejected", plan: "free", ratingAvg: 0, jobsDone: 0, acceptanceRate: 0, priorityScore: 0, status: "suspended", balance: 0 },
  { id: "8", userId: "u8", name: "Luciana Ferreira", email: "luciana@email.com", phone: "(11) 98888-8888", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face", city: "Santo André", radiusKm: 12, verifiedStatus: "approved", plan: "free", ratingAvg: 4.4, jobsDone: 38, acceptanceRate: 82, priorityScore: 55, status: "active", balance: 220.00 },
  { id: "9", userId: "u9", name: "Camila Rodrigues", email: "camila@email.com", phone: "(11) 98888-9999", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face", city: "São Paulo", radiusKm: 18, verifiedStatus: "pending", plan: "free", ratingAvg: 0, jobsDone: 0, acceptanceRate: 0, priorityScore: 5, status: "active", balance: 0 },
  { id: "10", userId: "u10", name: "Beatriz Almeida", email: "beatriz@email.com", phone: "(11) 98888-0000", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face", city: "São Paulo", radiusKm: 10, verifiedStatus: "approved", plan: "pro", ratingAvg: 4.8, jobsDone: 73, acceptanceRate: 94, priorityScore: 85, status: "active", balance: 680.00 },
];

// 20 Clients
export const clients: User[] = [
  { id: "c1", name: "João Pedro", email: "joao@email.com", phone: "(11) 99999-1111", role: "client", status: "active", createdAt: "2024-06-15", totalOrders: 8, totalSpent: 1280.00, riskLevel: "low" },
  { id: "c2", name: "Carolina Martins", email: "carolina@email.com", phone: "(11) 99999-2222", role: "client", status: "active", createdAt: "2024-07-20", totalOrders: 5, totalSpent: 850.00, riskLevel: "low" },
  { id: "c3", name: "Ricardo Gomes", email: "ricardo@email.com", phone: "(11) 99999-3333", role: "client", status: "active", createdAt: "2024-08-10", totalOrders: 12, totalSpent: 2100.00, riskLevel: "low" },
  { id: "c4", name: "Amanda Nascimento", email: "amanda@email.com", phone: "(11) 99999-4444", role: "client", status: "active", createdAt: "2024-09-05", totalOrders: 3, totalSpent: 420.00, riskLevel: "low" },
  { id: "c5", name: "Bruno Cardoso", email: "bruno@email.com", phone: "(11) 99999-5555", role: "client", status: "active", createdAt: "2024-09-18", totalOrders: 15, totalSpent: 2850.00, riskLevel: "low" },
  { id: "c6", name: "Daniela Rocha", email: "daniela@email.com", phone: "(11) 99999-6666", role: "client", status: "active", createdAt: "2024-10-01", totalOrders: 2, totalSpent: 280.00, riskLevel: "medium" },
  { id: "c7", name: "Eduardo Lima", email: "eduardo@email.com", phone: "(11) 99999-7777", role: "client", status: "active", createdAt: "2024-10-15", totalOrders: 6, totalSpent: 980.00, riskLevel: "low" },
  { id: "c8", name: "Fabiana Costa", email: "fabiana@email.com", phone: "(11) 99999-8888", role: "client", status: "suspended", createdAt: "2024-10-20", totalOrders: 1, totalSpent: 0, riskLevel: "high" },
  { id: "c9", name: "Gabriel Santos", email: "gabriel@email.com", phone: "(11) 99999-9999", role: "client", status: "active", createdAt: "2024-11-01", totalOrders: 4, totalSpent: 580.00, riskLevel: "low" },
  { id: "c10", name: "Helena Oliveira", email: "helena@email.com", phone: "(11) 99990-1111", role: "client", status: "active", createdAt: "2024-11-10", totalOrders: 7, totalSpent: 1150.00, riskLevel: "low" },
  { id: "c11", name: "Igor Fernandes", email: "igor@email.com", phone: "(11) 99990-2222", role: "client", status: "active", createdAt: "2024-11-15", totalOrders: 9, totalSpent: 1420.00, riskLevel: "low" },
  { id: "c12", name: "Júlia Barbosa", email: "julia@email.com", phone: "(11) 99990-3333", role: "client", status: "active", createdAt: "2024-11-20", totalOrders: 11, totalSpent: 1890.00, riskLevel: "low" },
  { id: "c13", name: "Kleber Souza", email: "kleber@email.com", phone: "(11) 99990-4444", role: "client", status: "active", createdAt: "2024-12-01", totalOrders: 2, totalSpent: 320.00, riskLevel: "medium" },
  { id: "c14", name: "Larissa Pereira", email: "larissa@email.com", phone: "(11) 99990-5555", role: "client", status: "active", createdAt: "2024-12-05", totalOrders: 6, totalSpent: 920.00, riskLevel: "low" },
  { id: "c15", name: "Marcos Alves", email: "marcos@email.com", phone: "(11) 99990-6666", role: "client", status: "active", createdAt: "2024-12-10", totalOrders: 3, totalSpent: 480.00, riskLevel: "low" },
  { id: "c16", name: "Natália Ribeiro", email: "natalia@email.com", phone: "(11) 99990-7777", role: "client", status: "active", createdAt: "2024-12-15", totalOrders: 1, totalSpent: 180.00, riskLevel: "low" },
  { id: "c17", name: "Otávio Cunha", email: "otavio@email.com", phone: "(11) 99990-8888", role: "client", status: "active", createdAt: "2024-12-20", totalOrders: 4, totalSpent: 620.00, riskLevel: "low" },
  { id: "c18", name: "Paula Vieira", email: "paula@email.com", phone: "(11) 99990-9999", role: "client", status: "active", createdAt: "2025-01-02", totalOrders: 2, totalSpent: 350.00, riskLevel: "low" },
  { id: "c19", name: "Renato Dias", email: "renato@email.com", phone: "(11) 99991-1111", role: "client", status: "active", createdAt: "2025-01-05", totalOrders: 5, totalSpent: 780.00, riskLevel: "low" },
  { id: "c20", name: "Sofia Moreira", email: "sofia@email.com", phone: "(11) 99991-2222", role: "client", status: "active", createdAt: "2025-01-10", totalOrders: 3, totalSpent: 450.00, riskLevel: "low" },
];

// 30 Orders
export const orders: Order[] = [
  { id: "1001", clientId: "c1", clientName: "João Pedro", proId: "1", proName: "Ana Paula Silva", serviceId: "2", serviceName: "Limpeza Pesada", addressId: "a1", address: "Rua das Flores, 123", city: "São Paulo", dateTime: "2025-01-20T14:00:00", date: "20/01/2025", time: "14:00", status: "confirmed", subtotal: 179.90, discount: 0, fee: 9.90, totalPrice: 189.80, commissionPercent: 20, commissionValue: 35.98, proEarning: 143.92, createdAt: "2025-01-15" },
  { id: "1002", clientId: "c2", clientName: "Carolina Martins", proId: "2", proName: "Maria Santos", serviceId: "1", serviceName: "Limpeza Padrão", addressId: "a2", address: "Av. Paulista, 1000", city: "São Paulo", dateTime: "2025-01-19T10:00:00", date: "19/01/2025", time: "10:00", status: "en_route", subtotal: 129.90, discount: 0, fee: 9.90, totalPrice: 139.80, commissionPercent: 20, commissionValue: 25.98, proEarning: 103.92, createdAt: "2025-01-14" },
  { id: "1003", clientId: "c3", clientName: "Ricardo Gomes", proId: "1", proName: "Ana Paula Silva", serviceId: "1", serviceName: "Limpeza Padrão", addressId: "a3", address: "Rua Augusta, 500", city: "São Paulo", dateTime: "2025-01-18T08:00:00", date: "18/01/2025", time: "08:00", status: "in_progress", subtotal: 129.90, discount: 20.00, fee: 9.90, totalPrice: 119.80, commissionPercent: 20, commissionValue: 21.98, proEarning: 87.92, couponCode: "PROMO20", createdAt: "2025-01-13" },
  { id: "1004", clientId: "c4", clientName: "Amanda Nascimento", proId: "3", proName: "Juliana Costa", serviceId: "2", serviceName: "Limpeza Pesada", addressId: "a4", address: "Alameda Santos, 200", city: "São Paulo", dateTime: "2025-01-17T14:00:00", date: "17/01/2025", time: "14:00", status: "completed", subtotal: 179.90, discount: 0, fee: 9.90, totalPrice: 189.80, commissionPercent: 20, commissionValue: 35.98, proEarning: 143.92, createdAt: "2025-01-12" },
  { id: "1005", clientId: "c5", clientName: "Bruno Cardoso", proId: "1", proName: "Ana Paula Silva", serviceId: "3", serviceName: "Pós-Obra", addressId: "a5", address: "Rua Oscar Freire, 300", city: "São Paulo", dateTime: "2025-01-16T09:00:00", date: "16/01/2025", time: "09:00", status: "rated", subtotal: 299.90, discount: 0, fee: 9.90, totalPrice: 309.80, commissionPercent: 20, commissionValue: 59.98, proEarning: 239.92, createdAt: "2025-01-11" },
  { id: "1006", clientId: "c6", clientName: "Daniela Rocha", proId: "4", proName: "Fernanda Lima", serviceId: "1", serviceName: "Limpeza Padrão", addressId: "a6", address: "Av. Brasil, 1500", city: "Guarulhos", dateTime: "2025-01-15T11:00:00", date: "15/01/2025", time: "11:00", status: "paid_out", subtotal: 129.90, discount: 0, fee: 9.90, totalPrice: 139.80, commissionPercent: 20, commissionValue: 25.98, proEarning: 103.92, createdAt: "2025-01-10" },
  { id: "1007", clientId: "c7", clientName: "Eduardo Lima", proId: "2", proName: "Maria Santos", serviceId: "2", serviceName: "Limpeza Pesada", addressId: "a7", address: "Rua Consolação, 800", city: "São Paulo", dateTime: "2025-01-14T15:00:00", date: "14/01/2025", time: "15:00", status: "paid_out", subtotal: 179.90, discount: 30.00, fee: 9.90, totalPrice: 159.80, commissionPercent: 20, commissionValue: 29.98, proEarning: 119.92, couponCode: "DESC30", createdAt: "2025-01-09" },
  { id: "1008", clientId: "c8", clientName: "Fabiana Costa", serviceId: "1", serviceName: "Limpeza Padrão", addressId: "a8", address: "Av. Faria Lima, 2000", city: "São Paulo", dateTime: "2025-01-13T10:00:00", date: "13/01/2025", time: "10:00", status: "cancelled", subtotal: 129.90, discount: 0, fee: 9.90, totalPrice: 139.80, commissionPercent: 20, commissionValue: 0, proEarning: 0, createdAt: "2025-01-08" },
  { id: "1009", clientId: "c9", clientName: "Gabriel Santos", proId: "6", proName: "Carla Mendes", serviceId: "1", serviceName: "Limpeza Padrão", addressId: "a9", address: "Rua Teodoro Sampaio, 400", city: "São Paulo", dateTime: "2025-01-12T13:00:00", date: "12/01/2025", time: "13:00", status: "paid_out", subtotal: 129.90, discount: 0, fee: 9.90, totalPrice: 139.80, commissionPercent: 20, commissionValue: 25.98, proEarning: 103.92, createdAt: "2025-01-07" },
  { id: "1010", clientId: "c10", clientName: "Helena Oliveira", proId: "1", proName: "Ana Paula Silva", serviceId: "4", serviceName: "Comercial", addressId: "a10", address: "Av. Berrini, 1200", city: "São Paulo", dateTime: "2025-01-11T08:00:00", date: "11/01/2025", time: "08:00", status: "in_review", subtotal: 199.90, discount: 0, fee: 9.90, totalPrice: 209.80, commissionPercent: 20, commissionValue: 39.98, proEarning: 159.92, createdAt: "2025-01-06" },
  { id: "1011", clientId: "c11", clientName: "Igor Fernandes", proId: "3", proName: "Juliana Costa", serviceId: "1", serviceName: "Limpeza Padrão", addressId: "a11", address: "Rua Pamplona, 600", city: "São Paulo", dateTime: "2025-01-10T10:00:00", date: "10/01/2025", time: "10:00", status: "paid_out", subtotal: 129.90, discount: 0, fee: 9.90, totalPrice: 139.80, commissionPercent: 20, commissionValue: 25.98, proEarning: 103.92, createdAt: "2025-01-05" },
  { id: "1012", clientId: "c12", clientName: "Júlia Barbosa", proId: "10", proName: "Beatriz Almeida", serviceId: "2", serviceName: "Limpeza Pesada", addressId: "a12", address: "Av. Rebouças, 1800", city: "São Paulo", dateTime: "2025-01-09T14:00:00", date: "09/01/2025", time: "14:00", status: "paid_out", subtotal: 179.90, discount: 0, fee: 9.90, totalPrice: 189.80, commissionPercent: 20, commissionValue: 35.98, proEarning: 143.92, createdAt: "2025-01-04" },
  { id: "1013", clientId: "c13", clientName: "Kleber Souza", proId: "2", proName: "Maria Santos", serviceId: "1", serviceName: "Limpeza Padrão", addressId: "a13", address: "Rua Haddock Lobo, 300", city: "São Paulo", dateTime: "2025-01-08T09:00:00", date: "08/01/2025", time: "09:00", status: "paid_out", subtotal: 129.90, discount: 0, fee: 9.90, totalPrice: 139.80, commissionPercent: 20, commissionValue: 25.98, proEarning: 103.92, createdAt: "2025-01-03" },
  { id: "1014", clientId: "c14", clientName: "Larissa Pereira", proId: "8", proName: "Luciana Ferreira", serviceId: "1", serviceName: "Limpeza Padrão", addressId: "a14", address: "Av. Industrial, 500", city: "Santo André", dateTime: "2025-01-07T11:00:00", date: "07/01/2025", time: "11:00", status: "paid_out", subtotal: 129.90, discount: 15.00, fee: 9.90, totalPrice: 124.80, commissionPercent: 20, commissionValue: 22.98, proEarning: 91.92, couponCode: "BEMVINDO15", createdAt: "2025-01-02" },
  { id: "1015", clientId: "c15", clientName: "Marcos Alves", proId: "1", proName: "Ana Paula Silva", serviceId: "2", serviceName: "Limpeza Pesada", addressId: "a15", address: "Rua da Mooca, 700", city: "São Paulo", dateTime: "2025-01-06T15:00:00", date: "06/01/2025", time: "15:00", status: "paid_out", subtotal: 179.90, discount: 0, fee: 9.90, totalPrice: 189.80, commissionPercent: 20, commissionValue: 35.98, proEarning: 143.92, createdAt: "2025-01-01" },
  { id: "1016", clientId: "c1", clientName: "João Pedro", proId: "6", proName: "Carla Mendes", serviceId: "1", serviceName: "Limpeza Padrão", addressId: "a1", address: "Rua das Flores, 123", city: "São Paulo", dateTime: "2025-01-21T10:00:00", date: "21/01/2025", time: "10:00", status: "scheduled", subtotal: 129.90, discount: 0, fee: 9.90, totalPrice: 139.80, commissionPercent: 20, commissionValue: 25.98, proEarning: 103.92, createdAt: "2025-01-15" },
  { id: "1017", clientId: "c2", clientName: "Carolina Martins", proId: "10", proName: "Beatriz Almeida", serviceId: "3", serviceName: "Pós-Obra", addressId: "a2", address: "Av. Paulista, 1000", city: "São Paulo", dateTime: "2025-01-22T08:00:00", date: "22/01/2025", time: "08:00", status: "scheduled", subtotal: 299.90, discount: 0, fee: 9.90, totalPrice: 309.80, commissionPercent: 20, commissionValue: 59.98, proEarning: 239.92, createdAt: "2025-01-15" },
  { id: "1018", clientId: "c3", clientName: "Ricardo Gomes", serviceId: "1", serviceName: "Limpeza Padrão", addressId: "a3", address: "Rua Augusta, 500", city: "São Paulo", dateTime: "2025-01-23T14:00:00", date: "23/01/2025", time: "14:00", status: "matching", subtotal: 129.90, discount: 0, fee: 9.90, totalPrice: 139.80, commissionPercent: 20, commissionValue: 25.98, proEarning: 103.92, createdAt: "2025-01-15" },
  { id: "1019", clientId: "c5", clientName: "Bruno Cardoso", proId: "3", proName: "Juliana Costa", serviceId: "4", serviceName: "Comercial", addressId: "a5", address: "Rua Oscar Freire, 300", city: "São Paulo", dateTime: "2025-01-05T10:00:00", date: "05/01/2025", time: "10:00", status: "paid_out", subtotal: 199.90, discount: 0, fee: 9.90, totalPrice: 209.80, commissionPercent: 20, commissionValue: 39.98, proEarning: 159.92, createdAt: "2024-12-30" },
  { id: "1020", clientId: "c7", clientName: "Eduardo Lima", proId: "4", proName: "Fernanda Lima", serviceId: "1", serviceName: "Limpeza Padrão", addressId: "a7", address: "Rua Consolação, 800", city: "São Paulo", dateTime: "2025-01-04T09:00:00", date: "04/01/2025", time: "09:00", status: "paid_out", subtotal: 129.90, discount: 0, fee: 9.90, totalPrice: 139.80, commissionPercent: 20, commissionValue: 25.98, proEarning: 103.92, createdAt: "2024-12-29" },
  { id: "1021", clientId: "c9", clientName: "Gabriel Santos", proId: "1", proName: "Ana Paula Silva", serviceId: "2", serviceName: "Limpeza Pesada", addressId: "a9", address: "Rua Teodoro Sampaio, 400", city: "São Paulo", dateTime: "2025-01-03T11:00:00", date: "03/01/2025", time: "11:00", status: "paid_out", subtotal: 179.90, discount: 0, fee: 9.90, totalPrice: 189.80, commissionPercent: 20, commissionValue: 35.98, proEarning: 143.92, createdAt: "2024-12-28" },
  { id: "1022", clientId: "c11", clientName: "Igor Fernandes", proId: "2", proName: "Maria Santos", serviceId: "1", serviceName: "Limpeza Padrão", addressId: "a11", address: "Rua Pamplona, 600", city: "São Paulo", dateTime: "2025-01-02T14:00:00", date: "02/01/2025", time: "14:00", status: "paid_out", subtotal: 129.90, discount: 0, fee: 9.90, totalPrice: 139.80, commissionPercent: 20, commissionValue: 25.98, proEarning: 103.92, createdAt: "2024-12-27" },
  { id: "1023", clientId: "c12", clientName: "Júlia Barbosa", proId: "6", proName: "Carla Mendes", serviceId: "1", serviceName: "Limpeza Padrão", addressId: "a12", address: "Av. Rebouças, 1800", city: "São Paulo", dateTime: "2024-12-28T10:00:00", date: "28/12/2024", time: "10:00", status: "paid_out", subtotal: 129.90, discount: 0, fee: 9.90, totalPrice: 139.80, commissionPercent: 20, commissionValue: 25.98, proEarning: 103.92, createdAt: "2024-12-23" },
  { id: "1024", clientId: "c14", clientName: "Larissa Pereira", proId: "10", proName: "Beatriz Almeida", serviceId: "2", serviceName: "Limpeza Pesada", addressId: "a14", address: "Av. Industrial, 500", city: "Santo André", dateTime: "2024-12-27T08:00:00", date: "27/12/2024", time: "08:00", status: "paid_out", subtotal: 179.90, discount: 0, fee: 9.90, totalPrice: 189.80, commissionPercent: 20, commissionValue: 35.98, proEarning: 143.92, createdAt: "2024-12-22" },
  { id: "1025", clientId: "c16", clientName: "Natália Ribeiro", proId: "3", proName: "Juliana Costa", serviceId: "1", serviceName: "Limpeza Padrão", addressId: "a16", address: "Rua Vergueiro, 1000", city: "São Paulo", dateTime: "2024-12-26T13:00:00", date: "26/12/2024", time: "13:00", status: "paid_out", subtotal: 129.90, discount: 0, fee: 9.90, totalPrice: 139.80, commissionPercent: 20, commissionValue: 25.98, proEarning: 103.92, createdAt: "2024-12-21" },
  { id: "1026", clientId: "c17", clientName: "Otávio Cunha", proId: "1", proName: "Ana Paula Silva", serviceId: "3", serviceName: "Pós-Obra", addressId: "a17", address: "Rua Domingos de Morais, 500", city: "São Paulo", dateTime: "2024-12-20T09:00:00", date: "20/12/2024", time: "09:00", status: "paid_out", subtotal: 299.90, discount: 50.00, fee: 9.90, totalPrice: 259.80, commissionPercent: 20, commissionValue: 49.98, proEarning: 199.92, couponCode: "NATAL50", createdAt: "2024-12-15" },
  { id: "1027", clientId: "c18", clientName: "Paula Vieira", proId: "8", proName: "Luciana Ferreira", serviceId: "1", serviceName: "Limpeza Padrão", addressId: "a18", address: "Av. Jabaquara, 800", city: "São Paulo", dateTime: "2024-12-18T11:00:00", date: "18/12/2024", time: "11:00", status: "paid_out", subtotal: 129.90, discount: 0, fee: 9.90, totalPrice: 139.80, commissionPercent: 20, commissionValue: 25.98, proEarning: 103.92, createdAt: "2024-12-13" },
  { id: "1028", clientId: "c19", clientName: "Renato Dias", proId: "2", proName: "Maria Santos", serviceId: "2", serviceName: "Limpeza Pesada", addressId: "a19", address: "Rua Cardeal Arcoverde, 200", city: "São Paulo", dateTime: "2024-12-15T14:00:00", date: "15/12/2024", time: "14:00", status: "paid_out", subtotal: 179.90, discount: 0, fee: 9.90, totalPrice: 189.80, commissionPercent: 20, commissionValue: 35.98, proEarning: 143.92, createdAt: "2024-12-10" },
  { id: "1029", clientId: "c20", clientName: "Sofia Moreira", proId: "4", proName: "Fernanda Lima", serviceId: "1", serviceName: "Limpeza Padrão", addressId: "a20", address: "Av. São João, 1500", city: "São Paulo", dateTime: "2024-12-12T10:00:00", date: "12/12/2024", time: "10:00", status: "paid_out", subtotal: 129.90, discount: 0, fee: 9.90, totalPrice: 139.80, commissionPercent: 20, commissionValue: 25.98, proEarning: 103.92, createdAt: "2024-12-07" },
  { id: "1030", clientId: "c1", clientName: "João Pedro", proId: "10", proName: "Beatriz Almeida", serviceId: "4", serviceName: "Comercial", addressId: "a1", address: "Rua das Flores, 123", city: "São Paulo", dateTime: "2024-12-10T08:00:00", date: "10/12/2024", time: "08:00", status: "paid_out", subtotal: 199.90, discount: 0, fee: 9.90, totalPrice: 209.80, commissionPercent: 20, commissionValue: 39.98, proEarning: 159.92, createdAt: "2024-12-05" },
];

// Coupons
export const coupons: Coupon[] = [
  { id: "cup1", code: "PROMO20", type: "fixed", value: 20, expiresAt: "2025-02-28", maxUses: 100, currentUses: 45, minOrderValue: 100, active: true },
  { id: "cup2", code: "DESC30", type: "fixed", value: 30, expiresAt: "2025-01-31", maxUses: 50, currentUses: 32, minOrderValue: 150, active: true },
  { id: "cup3", code: "BEMVINDO15", type: "percent", value: 15, expiresAt: "2025-12-31", maxUses: 1000, currentUses: 128, minOrderValue: 80, active: true },
  { id: "cup4", code: "NATAL50", type: "fixed", value: 50, expiresAt: "2024-12-31", maxUses: 200, currentUses: 200, minOrderValue: 200, active: false },
  { id: "cup5", code: "VIP10", type: "percent", value: 10, expiresAt: "2025-06-30", maxUses: 500, currentUses: 0, minOrderValue: 50, active: true },
];

// Support Tickets
export const supportTickets: SupportTicket[] = [
  { id: "t1", orderId: "1010", createdByUserId: "c10", createdByName: "Helena Oliveira", subject: "Serviço não realizado corretamente", status: "open", priority: "high", createdAt: "2025-01-11T10:00:00", lastMessage: "A diarista não limpou o banheiro conforme combinado." },
  { id: "t2", orderId: "1008", createdByUserId: "c8", createdByName: "Fabiana Costa", subject: "Quero reembolso do cancelamento", status: "in_progress", priority: "medium", createdAt: "2025-01-13T14:00:00", lastMessage: "Tive uma emergência e precisei cancelar." },
  { id: "t3", createdByUserId: "u5", createdByName: "Patrícia Oliveira", subject: "Minha verificação está demorando", status: "open", priority: "low", createdAt: "2025-01-14T09:00:00", lastMessage: "Enviei os documentos há 3 dias." },
  { id: "t4", orderId: "1003", createdByUserId: "c3", createdByName: "Ricardo Gomes", subject: "Profissional atrasou 30 minutos", status: "resolved", priority: "low", createdAt: "2025-01-18T12:00:00", lastMessage: "Entendido, obrigado pelo esclarecimento." },
  { id: "t5", createdByUserId: "u9", createdByName: "Camila Rodrigues", subject: "Dúvida sobre plano PRO", status: "open", priority: "low", createdAt: "2025-01-15T16:00:00", lastMessage: "Quais são os benefícios do plano PRO?" },
];

// Support Messages
export const supportMessages: SupportMessage[] = [
  { id: "m1", ticketId: "t1", senderUserId: "c10", senderName: "Helena Oliveira", message: "A diarista não limpou o banheiro conforme combinado. Gostaria de solicitar um reembolso parcial.", createdAt: "2025-01-11T10:00:00" },
  { id: "m2", ticketId: "t2", senderUserId: "c8", senderName: "Fabiana Costa", message: "Tive uma emergência familiar e precisei cancelar o serviço. Podem me ajudar com o reembolso?", createdAt: "2025-01-13T14:00:00" },
  { id: "m3", ticketId: "t2", senderUserId: "admin1", senderName: "Suporte LimpaJá", message: "Olá Fabiana, estamos analisando seu caso. Retornaremos em breve.", createdAt: "2025-01-13T15:30:00" },
  { id: "m4", ticketId: "t3", senderUserId: "u5", senderName: "Patrícia Oliveira", message: "Enviei meus documentos há 3 dias e ainda não tive retorno sobre a verificação.", createdAt: "2025-01-14T09:00:00" },
  { id: "m5", ticketId: "t4", senderUserId: "c3", senderName: "Ricardo Gomes", message: "A profissional chegou 30 minutos atrasada hoje.", createdAt: "2025-01-18T12:00:00" },
  { id: "m6", ticketId: "t4", senderUserId: "admin1", senderName: "Suporte LimpaJá", message: "Pedimos desculpas pelo ocorrido. Vamos registrar essa ocorrência no perfil da profissional.", createdAt: "2025-01-18T13:00:00" },
  { id: "m7", ticketId: "t4", senderUserId: "c3", senderName: "Ricardo Gomes", message: "Entendido, obrigado pelo esclarecimento.", createdAt: "2025-01-18T14:00:00" },
];

// Pro Documents
export const proDocuments: ProDocument[] = [
  { id: "d1", proId: "5", docType: "id_front", status: "pending", createdAt: "2025-01-12" },
  { id: "d2", proId: "5", docType: "id_back", status: "pending", createdAt: "2025-01-12" },
  { id: "d3", proId: "5", docType: "selfie", status: "pending", createdAt: "2025-01-12" },
  { id: "d4", proId: "9", docType: "id_front", status: "pending", createdAt: "2025-01-13" },
  { id: "d5", proId: "9", docType: "selfie", status: "pending", createdAt: "2025-01-13" },
];

// Withdrawals
export const withdrawals: Withdrawal[] = [
  { id: "w1", proId: "1", proName: "Ana Paula Silva", amount: 500.00, pixKey: "ana@email.com", status: "paid", createdAt: "2025-01-10" },
  { id: "w2", proId: "2", proName: "Maria Santos", amount: 300.00, pixKey: "maria@email.com", status: "approved", createdAt: "2025-01-14" },
  { id: "w3", proId: "6", proName: "Carla Mendes", amount: 200.00, pixKey: "carla@email.com", status: "requested", createdAt: "2025-01-15" },
];

// Addresses
export const addresses: Address[] = [
  { id: "a1", userId: "c1", label: "Casa", street: "Rua das Flores", number: "123", city: "São Paulo", state: "SP", zip: "01234-567" },
  { id: "a2", userId: "c2", label: "Trabalho", street: "Av. Paulista", number: "1000", city: "São Paulo", state: "SP", zip: "01310-100" },
];

// Time slots
export const timeSlots = ["08:00", "10:00", "13:00", "15:00", "17:00"];

// Helper functions
export function calculateOrderValues(subtotal: number, coupon?: Coupon, settings = adminSettings) {
  let discount = 0;
  if (coupon && coupon.active) {
    if (coupon.type === "percent") {
      discount = subtotal * (coupon.value / 100);
    } else {
      discount = coupon.value;
    }
  }
  
  const afterDiscount = subtotal - discount;
  const fee = settings.feeFixed;
  const totalPrice = afterDiscount + fee;
  const commissionPercent = settings.commissionPercentDefault;
  const commissionValue = afterDiscount * (commissionPercent / 100);
  const proEarning = afterDiscount - commissionValue;
  
  return {
    subtotal,
    discount,
    fee,
    totalPrice,
    commissionPercent,
    commissionValue,
    proEarning
  };
}

export function getMetrics() {
  const today = new Date().toISOString().split('T')[0];
  const ordersToday = orders.filter(o => o.createdAt === today).length;
  const ordersMonth = orders.filter(o => o.createdAt.startsWith("2025-01")).length;
  const totalGMV = orders.reduce((acc, o) => acc + o.totalPrice, 0);
  const totalCommission = orders.reduce((acc, o) => acc + o.commissionValue, 0);
  const avgTicket = totalGMV / orders.length;
  const cancelledOrders = orders.filter(o => o.status === "cancelled").length;
  const cancelRate = (cancelledOrders / orders.length) * 100;
  const newPros7Days = pros.filter(p => {
    const created = new Date("2025-01-10");
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return created >= sevenDaysAgo;
  }).length;

  return {
    ordersToday: 5,
    ordersMonth,
    totalGMV,
    totalCommission,
    avgTicket,
    cancelRate,
    newPros7Days: 3
  };
}
