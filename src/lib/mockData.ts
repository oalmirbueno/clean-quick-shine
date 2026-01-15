// Mock data for LimpaJá

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "client" | "pro";
}

export interface Pro {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  city: string;
  radiusKm: number;
  verified: boolean;
  ratingAvg: number;
  jobsDone: number;
  acceptanceRate: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  basePrice: number;
}

export interface Order {
  id: string;
  clientId: string;
  proId?: string;
  serviceId: string;
  serviceName: string;
  addressId: string;
  address: string;
  dateTime: string;
  date: string;
  time: string;
  status: "draft" | "scheduled" | "matching" | "confirmed" | "in_progress" | "completed" | "rated";
  totalPrice: number;
  proEarning: number;
}

export const mockUser: User = {
  id: "1",
  name: "Maria",
  email: "maria@email.com",
  phone: "(11) 99999-9999",
  role: "client",
};

export const mockPro: User = {
  id: "2",
  name: "Ana Paula",
  email: "ana@email.com",
  phone: "(11) 98888-8888",
  role: "pro",
};

export const mockProProfile: Pro = {
  id: "1",
  userId: "2",
  name: "Ana Paula",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  city: "São Paulo",
  radiusKm: 15,
  verified: true,
  ratingAvg: 4.9,
  jobsDone: 128,
  acceptanceRate: 95,
};

export const services: Service[] = [
  {
    id: "1",
    name: "Limpeza Padrão",
    description: "Limpeza completa de rotina (2-4h)",
    durationMin: 180,
    basePrice: 129.90,
  },
  {
    id: "2",
    name: "Limpeza Pesada",
    description: "Limpeza profunda e detalhada (4-6h)",
    durationMin: 300,
    basePrice: 179.90,
  },
  {
    id: "3",
    name: "Pós-Obra",
    description: "Remoção de resíduos de obra (6-8h)",
    durationMin: 420,
    basePrice: 299.90,
  },
  {
    id: "4",
    name: "Comercial",
    description: "Limpeza de escritórios e lojas",
    durationMin: 240,
    basePrice: 199.90,
  },
];

export const mockOrders: Order[] = [
  {
    id: "1",
    clientId: "1",
    proId: "1",
    serviceId: "2",
    serviceName: "Limpeza Pesada",
    addressId: "1",
    address: "Rua das Flores, 123 - Jardim Paulista",
    dateTime: "2025-01-20T14:00:00",
    date: "20/01/2025",
    time: "14:00",
    status: "confirmed",
    totalPrice: 179.90,
    proEarning: 143.92,
  },
  {
    id: "2",
    clientId: "1",
    proId: "1",
    serviceId: "1",
    serviceName: "Limpeza Padrão",
    addressId: "1",
    address: "Rua das Flores, 123 - Jardim Paulista",
    dateTime: "2025-01-15T10:00:00",
    date: "15/01/2025",
    time: "10:00",
    status: "completed",
    totalPrice: 129.90,
    proEarning: 103.92,
  },
  {
    id: "3",
    clientId: "1",
    proId: "1",
    serviceId: "1",
    serviceName: "Limpeza Padrão",
    addressId: "1",
    address: "Av. Brasil, 456 - Centro",
    dateTime: "2025-01-10T08:00:00",
    date: "10/01/2025",
    time: "08:00",
    status: "rated",
    totalPrice: 129.90,
    proEarning: 103.92,
  },
];

export const mockProOrders: Order[] = [
  {
    id: "4",
    clientId: "3",
    serviceId: "1",
    serviceName: "Limpeza Padrão",
    addressId: "2",
    address: "Rua Augusta, 789 - Consolação",
    dateTime: "2025-01-16T09:00:00",
    date: "16/01/2025",
    time: "09:00",
    status: "scheduled",
    totalPrice: 129.90,
    proEarning: 103.92,
  },
  {
    id: "5",
    clientId: "4",
    serviceId: "2",
    serviceName: "Limpeza Pesada",
    addressId: "3",
    address: "Alameda Santos, 321 - Cerqueira César",
    dateTime: "2025-01-16T14:00:00",
    date: "16/01/2025",
    time: "14:00",
    status: "scheduled",
    totalPrice: 179.90,
    proEarning: 143.92,
  },
];

export const timeSlots = ["08:00", "10:00", "13:00", "15:00", "17:00"];

export const mockAddresses = [
  {
    id: "1",
    label: "Casa",
    street: "Rua das Flores",
    number: "123",
    city: "São Paulo",
    state: "SP",
    zip: "01234-567",
  },
  {
    id: "2",
    label: "Trabalho",
    street: "Av. Paulista",
    number: "1000",
    city: "São Paulo",
    state: "SP",
    zip: "01310-100",
  },
];
