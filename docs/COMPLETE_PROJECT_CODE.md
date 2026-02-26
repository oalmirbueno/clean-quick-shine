# JáLimpo — Documentação Completa com Código-Fonte

> **Versão:** 2.0.0 · **Data:** Fevereiro 2026  
> **Stack:** React 18 · TypeScript · Vite · Tailwind CSS · Supabase · PWA

---

## Índice

1. [Configuração do Projeto](#1-configuração-do-projeto)
2. [Estrutura de Arquivos](#2-estrutura-de-arquivos)
3. [Autenticação e Contexto](#3-autenticação-e-contexto)
4. [Roteamento e Proteção de Rotas](#4-roteamento-e-proteção-de-rotas)
5. [Módulo Cliente — Páginas](#5-módulo-cliente--páginas)
6. [Módulo Profissional — Páginas](#6-módulo-profissional--páginas)
7. [Módulo Administrativo — Páginas](#7-módulo-administrativo--páginas)
8. [Hooks de Dados](#8-hooks-de-dados)
9. [Componentes UI Reutilizáveis](#9-componentes-ui-reutilizáveis)
10. [Design System (CSS + Tailwind)](#10-design-system-css--tailwind)
11. [Configuração Vite + PWA](#11-configuração-vite--pwa)
12. [Banco de Dados — Schema Completo](#12-banco-de-dados--schema-completo)

---

## 1. Configuração do Projeto

### `index.html`

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>Já Limpo App</title>
    <meta name="description" content="Precisa de Limpeza? Baixa o Já Limpo">
    <meta name="theme-color" content="#10b981" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Já Limpo" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/pwa-192x192.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `src/main.tsx`

```tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

---

## 2. Estrutura de Arquivos

```
src/
├── App.tsx                          # Router principal + providers
├── main.tsx                         # Entry point
├── index.css                        # Design tokens + utilidades
├── contexts/
│   └── AuthContext.tsx               # Autenticação + roles
├── components/
│   ├── ProtectedRoute.tsx            # Guarda de rotas por role
│   ├── ThemeProvider.tsx             # Light/dark mode
│   ├── admin/
│   │   └── AdminSidebar.tsx          # Sidebar admin desktop
│   └── ui/
│       ├── BottomNav.tsx             # Nav inferior mobile
│       ├── PrimaryButton.tsx         # Botão principal
│       ├── InputField.tsx            # Campo de input
│       ├── OrderCard.tsx             # Card de pedido
│       ├── ServiceCard.tsx           # Card de serviço
│       ├── ProCard.tsx               # Card de profissional
│       ├── StatusBadge.tsx           # Badge de status
│       ├── QualityBadge.tsx          # Badge SLA (A/B/C/D)
│       ├── MoneyBreakdown.tsx        # Detalhamento de preço
│       ├── CouponInput.tsx           # Input de cupom
│       ├── TimelineStepper.tsx       # Stepper de tracking
│       ├── MetricCard.tsx            # Card de métrica admin
│       ├── MiniChart.tsx             # Mini gráfico de barras
│       ├── Logo.tsx                  # Logo JáLimpo
│       ├── AnimatedCard.tsx          # Wrapper animado
│       ├── AnimatedList.tsx          # Lista animada
│       ├── MapMock.tsx               # Mock de mapa
│       ├── NotificationsDropdown.tsx # Dropdown de notificações
│       ├── InstallPrompt.tsx         # Prompt PWA install
│       ├── UpdatePrompt.tsx          # Prompt PWA update
│       ├── OfflineBanner.tsx         # Banner offline
│       ├── WelcomeTutorial.tsx       # Tutorial inicial
│       ├── AppTutorial.tsx           # Tutorial por módulo
│       ├── AuthLoading.tsx           # Loading de auth
│       ├── PageTransition.tsx        # Wrapper de transição
│       └── ... (shadcn/ui components)
├── hooks/
│   ├── useOrders.ts                  # CRUD pedidos
│   ├── useCreateOrder.ts            # Criar pedido + cupom
│   ├── useServices.ts               # Listar serviços
│   ├── useAddresses.ts              # CRUD endereços
│   ├── useProData.ts                # Dados pro + pedidos
│   ├── useProEarnings.ts            # Ganhos do pro
│   ├── useProMetrics.ts             # Métricas SLA
│   ├── useOrderRealtime.ts          # Realtime via Supabase
│   ├── useUpdateOrderStatus.ts      # Atualizar status
│   ├── useSubmitRating.ts           # Enviar avaliação
│   ├── useCancelOrder.ts            # Cancelar pedido
│   ├── useNotifications.ts          # Notificações
│   ├── useProDocuments.ts           # Documentos do pro
│   ├── useWithdrawals.ts            # Saques
│   └── usePros.ts                   # Profissionais disponíveis
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ForgotPassword.tsx
│   ├── AccessDenied.tsx
│   ├── client/                      # 16 telas cliente
│   ├── pro/                         # 12 telas profissional
│   ├── admin/                       # 17 telas admin
│   ├── company/                     # 2 telas empresa
│   └── dev/                         # Showcase + docs
├── integrations/supabase/
│   ├── client.ts                    # Cliente Supabase (auto-gerado)
│   └── types.ts                     # Types do DB (auto-gerado)
└── lib/
    ├── utils.ts                     # cn() helper
    └── mockData*.ts                 # Dados mock admin
```

---

## 3. Autenticação e Contexto

### `src/contexts/AuthContext.tsx`

```tsx
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  rolesLoaded: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string, role: AppRole) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; roles?: AppRole[] }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const fetchRoles = useCallback(async (userId: string): Promise<AppRole[]> => {
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    return userRoles?.map((r) => r.role) || [];
  }, []);

  const refreshRoles = useCallback(async () => {
    if (!user?.id) return;
    const fetchedRoles = await fetchRoles(user.id);
    setRoles(fetchedRoles);
    setRolesLoaded(true);
  }, [user?.id, fetchRoles]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user && !signingIn) {
          setTimeout(async () => {
            const fetchedRoles = await fetchRoles(session.user.id);
            setRoles(fetchedRoles);
            setRolesLoaded(true);
          }, 0);
        } else if (!session) {
          setRoles([]);
          setRolesLoaded(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const fetchedRoles = await fetchRoles(session.user.id);
        setRoles(fetchedRoles);
        setRolesLoaded(true);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchRoles, signingIn]);

  const signUp = async (
    email: string, password: string, fullName: string, phone: string, role: AppRole
  ): Promise<{ error: AuthError | null }> => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: fullName } },
    });
    if (error) return { error };

    if (data.user) {
      await supabase.from("profiles").update({ phone }).eq("user_id", data.user.id);
      await supabase.from("user_roles").insert({ user_id: data.user.id, role });
      setRoles([role]);
      setRolesLoaded(true);
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    setSigningIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setSigningIn(false); return { error }; }
      if (data.user) {
        const fetchedRoles = await fetchRoles(data.user.id);
        setRoles(fetchedRoles);
        setRolesLoaded(true);
        setLoading(false);
        setSigningIn(false);
        return { error: null, roles: fetchedRoles };
      }
      setSigningIn(false);
      return { error: null };
    } catch (err) { setSigningIn(false); throw err; }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setSession(null); setRoles([]); setRolesLoaded(false);
  };

  const hasRole = (role: AppRole): boolean => roles.includes(role);

  return (
    <AuthContext.Provider value={{ user, session, loading, roles, rolesLoaded, signUp, signIn, signOut, hasRole, refreshRoles }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
```

---

## 4. Roteamento e Proteção de Rotas

### `src/components/ProtectedRoute.tsx`

```tsx
import { ReactNode, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLoading } from "@/components/ui/AuthLoading";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: AppRole;
  redirectTo?: string;
}

export function ProtectedRoute({ children, requiredRole, redirectTo = "/login" }: ProtectedRouteProps) {
  const { user, loading, hasRole, rolesLoaded, roles } = useAuth();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading || (user && !rolesLoaded)) setTimedOut(true);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [loading, user, rolesLoaded]);

  useEffect(() => {
    if (!loading && rolesLoaded) setTimedOut(false);
  }, [loading, rolesLoaded]);

  if (timedOut) return <Navigate to="/login" replace />;
  if (loading || (user && !rolesLoaded)) return <AuthLoading message="Verificando acesso..." />;
  if (!user) return <Navigate to={redirectTo} state={{ from: location }} replace />;
  if (rolesLoaded && roles.length === 0) return <Navigate to="/login" replace />;
  if (requiredRole && !hasRole(requiredRole)) return <Navigate to="/access-denied" state={{ roles }} replace />;

  return <>{children}</>;
}
```

### `src/App.tsx` — Rotas

```tsx
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/components/ThemeProvider";
import { InstallPrompt } from "@/components/ui/InstallPrompt";
import { UpdatePrompt } from "@/components/ui/UpdatePrompt";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { WelcomeTutorial } from "@/components/ui/WelcomeTutorial";

// ... imports de todas as páginas (omitidos por brevidade)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
    },
  },
});

const App = () => {
  const [tutorialComplete, setTutorialComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const completed = localStorage.getItem("cleanquick_pwa_tutorial_completed") === "true";
    setTutorialComplete(completed);
  }, []);

  if (tutorialComplete === null) return null;

  if (!tutorialComplete) {
    return (
      <ThemeProvider>
        <WelcomeTutorial onComplete={() => setTutorialComplete(true)} />
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OfflineBanner />
            <UpdatePrompt />
            <BrowserRouter>
              <InstallPrompt />
              <Routes>
                {/* Auth */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Client (16 rotas protegidas) */}
                <Route path="/client/home" element={<ProtectedRoute requiredRole="client"><ClientHome /></ProtectedRoute>} />
                <Route path="/client/service" element={<ProtectedRoute requiredRole="client"><ClientService /></ProtectedRoute>} />
                <Route path="/client/schedule" element={<ProtectedRoute requiredRole="client"><ClientSchedule /></ProtectedRoute>} />
                <Route path="/client/matching" element={<ProtectedRoute requiredRole="client"><ClientMatching /></ProtectedRoute>} />
                <Route path="/client/offer" element={<ProtectedRoute requiredRole="client"><ClientOffer /></ProtectedRoute>} />
                <Route path="/client/checkout" element={<ProtectedRoute requiredRole="client"><ClientCheckout /></ProtectedRoute>} />
                <Route path="/client/order-tracking" element={<ProtectedRoute requiredRole="client"><ClientOrderTracking /></ProtectedRoute>} />
                <Route path="/client/rating" element={<ProtectedRoute requiredRole="client"><ClientRating /></ProtectedRoute>} />
                <Route path="/client/orders" element={<ProtectedRoute requiredRole="client"><ClientOrders /></ProtectedRoute>} />
                <Route path="/client/orders/:id" element={<ProtectedRoute requiredRole="client"><ClientOrderDetail /></ProtectedRoute>} />
                <Route path="/client/profile" element={<ProtectedRoute requiredRole="client"><ClientProfile /></ProtectedRoute>} />
                <Route path="/client/support" element={<ProtectedRoute requiredRole="client"><ClientSupport /></ProtectedRoute>} />
                <Route path="/client/cancel/:id" element={<ProtectedRoute requiredRole="client"><ClientCancel /></ProtectedRoute>} />
                <Route path="/client/location" element={<ProtectedRoute requiredRole="client"><ClientLocation /></ProtectedRoute>} />
                <Route path="/client/subscription" element={<ProtectedRoute requiredRole="client"><ClientSubscription /></ProtectedRoute>} />
                <Route path="/client/referral" element={<ProtectedRoute requiredRole="client"><ClientReferral /></ProtectedRoute>} />

                {/* Pro (12 rotas protegidas) */}
                <Route path="/pro/home" element={<ProtectedRoute requiredRole="pro"><ProHome /></ProtectedRoute>} />
                <Route path="/pro/order/:id" element={<ProtectedRoute requiredRole="pro"><ProOrderDetail /></ProtectedRoute>} />
                <Route path="/pro/agenda" element={<ProtectedRoute requiredRole="pro"><ProAgenda /></ProtectedRoute>} />
                <Route path="/pro/earnings" element={<ProtectedRoute requiredRole="pro"><ProEarnings /></ProtectedRoute>} />
                <Route path="/pro/ranking" element={<ProtectedRoute requiredRole="pro"><ProRanking /></ProtectedRoute>} />
                <Route path="/pro/profile" element={<ProtectedRoute requiredRole="pro"><ProProfile /></ProtectedRoute>} />
                <Route path="/pro/verification" element={<ProtectedRoute requiredRole="pro"><ProVerification /></ProtectedRoute>} />
                <Route path="/pro/plan" element={<ProtectedRoute requiredRole="pro"><ProPlan /></ProtectedRoute>} />
                <Route path="/pro/withdraw" element={<ProtectedRoute requiredRole="pro"><ProWithdraw /></ProtectedRoute>} />
                <Route path="/pro/support" element={<ProtectedRoute requiredRole="pro"><ProSupport /></ProtectedRoute>} />
                <Route path="/pro/quality" element={<ProtectedRoute requiredRole="pro"><ProQuality /></ProtectedRoute>} />
                <Route path="/pro/availability" element={<ProtectedRoute requiredRole="pro"><ProAvailability /></ProtectedRoute>} />

                {/* Admin (17 rotas protegidas) */}
                <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute requiredRole="admin"><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/orders/:id" element={<ProtectedRoute requiredRole="admin"><AdminOrderDetail /></ProtectedRoute>} />
                <Route path="/admin/pros" element={<ProtectedRoute requiredRole="admin"><AdminPros /></ProtectedRoute>} />
                <Route path="/admin/pros/:id" element={<ProtectedRoute requiredRole="admin"><AdminProDetail /></ProtectedRoute>} />
                <Route path="/admin/clients" element={<ProtectedRoute requiredRole="admin"><AdminClients /></ProtectedRoute>} />
                <Route path="/admin/coupons" element={<ProtectedRoute requiredRole="admin"><AdminCoupons /></ProtectedRoute>} />
                <Route path="/admin/support" element={<ProtectedRoute requiredRole="admin"><AdminSupport /></ProtectedRoute>} />
                <Route path="/admin/support/:id" element={<ProtectedRoute requiredRole="admin"><AdminSupportDetail /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />
                <Route path="/admin/zones" element={<ProtectedRoute requiredRole="admin"><AdminZones /></ProtectedRoute>} />
                <Route path="/admin/risk" element={<ProtectedRoute requiredRole="admin"><AdminRisk /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />
                <Route path="/admin/funnel" element={<ProtectedRoute requiredRole="admin"><AdminFunnel /></ProtectedRoute>} />
                <Route path="/admin/cohorts" element={<ProtectedRoute requiredRole="admin"><AdminCohorts /></ProtectedRoute>} />
                <Route path="/admin/matching-debug" element={<ProtectedRoute requiredRole="admin"><AdminMatchingDebug /></ProtectedRoute>} />
                <Route path="/admin/quotes" element={<ProtectedRoute requiredRole="admin"><AdminQuotes /></ProtectedRoute>} />
                <Route path="/admin/documents" element={<ProtectedRoute requiredRole="admin"><AdminDocuments /></ProtectedRoute>} />

                {/* Company */}
                <Route path="/company/onboarding" element={<CompanyOnboarding />} />
                <Route path="/company/request-quote" element={<CompanyRequestQuote />} />

                {/* Utility */}
                <Route path="/access-denied" element={<AccessDenied />} />
                <Route path="/install" element={<Install />} />
                <Route path="/settings" element={<AppSettings />} />
                <Route path="/offline" element={<Offline />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
```

---

## 5. Módulo Cliente — Páginas

### `src/pages/Login.tsx`

```tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageTransition } from "@/components/ui/PageTransition";
import { User, Briefcase, ChevronLeft, Shield, Clock, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import heroCleanerImg from "@/assets/hero-cleaner-pro.png";
import { motion } from "framer-motion";

type UserType = "client" | "pro" | null;

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [userType, setUserType] = useState<UserType>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error, roles } = await signIn(email, password);
      if (error) {
        toast.error(error.message === "Invalid login credentials" ? "Email ou senha incorretos" : error.message);
        return;
      }
      toast.success("Login realizado com sucesso!");
      const userRoles = roles || [];
      if (userRoles.includes("admin")) navigate("/admin/dashboard");
      else if (userRoles.includes("client")) navigate("/client/home");
      else if (userRoles.includes("pro")) navigate("/pro/home");
      else if (userType) navigate(userType === "client" ? "/client/home" : "/pro/home");
      else toast.error("Erro ao determinar tipo de conta");
    } catch (err) {
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Tela 1: Seleção de tipo (client/pro)
  // Tela 2: Formulário de login com email + senha
  // Layout: Hero image no desktop, background sutil no mobile
  // Animações: framer-motion em todos os elementos
}
```

### `src/pages/Register.tsx`

```tsx
// Cadastro multi-step:
// Step 1: Nome, telefone, email, senha
// Step 2 (apenas Pro): Cidade, raio, dias/turnos disponíveis
// Criação de user_roles + pro_profiles via Supabase
// Validação: senha min 8 chars, aceite de termos obrigatório
```

### `src/pages/client/ClientHome.tsx`

```tsx
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { BottomNav } from "@/components/ui/BottomNav";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationsDropdown } from "@/components/ui/NotificationsDropdown";
import { AnimatedSection } from "@/components/ui/AnimatedCard";
import { AnimatedList, AnimatedListItem } from "@/components/ui/AnimatedList";
import { AppTutorial, useAppTutorial } from "@/components/ui/AppTutorial";
import { motion } from "framer-motion";
import { Search, Home, Sparkles, HardHat, Building2, Sun, Sunrise, CalendarClock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const serviceCategories = [
  { icon: Home, title: "Residencial", description: "Limpeza de casa" },
  { icon: Sparkles, title: "Pesada", description: "Limpeza profunda" },
  { icon: HardHat, title: "Pós-Obra", description: "Remoção de resíduos" },
  { icon: Building2, title: "Comercial", description: "Escritórios e lojas" },
];

const quickSuggestions = [
  { icon: Sun, label: "Hoje à tarde", time: "14:00" },
  { icon: Sunrise, label: "Amanhã cedo", time: "08:00" },
  { icon: CalendarClock, label: "Recorrente", time: "Semanal" },
];

export default function ClientHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showTutorial, completeTutorial } = useAppTutorial("client");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const userName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Usuário";

  // Layout: Header com logo + avatar, search bar, grid 2x2 de serviços,
  // sugestões rápidas horizontais, banner de próximo agendamento, BottomNav
}
```

### `src/pages/client/ClientService.tsx`

```tsx
// Seleção de serviço com dados reais do Supabase (useServices hook)
// Lista de cards com nome, descrição, duração e preço base
// Seleção única com checkbox visual
// Botão "Continuar" → /client/schedule com serviceId no state
```

### `src/pages/client/ClientSchedule.tsx`

```tsx
// 3 seções: Data (14 dias), Horário (08:00-17:00), Endereço (useAddresses)
// Scroll horizontal para datas
// Opção de adicionar novo endereço
// Botão "Confirmar" → /client/matching com serviceId + date + time + addressId
```

### `src/pages/client/ClientMatching.tsx`

```tsx
// Tela de loading animada com spinner e barra de progresso
// Simula matching por 2.5s e redireciona para /client/offer
// Logo centralizado + mensagem "Procurando profissional..."
```

### `src/pages/client/ClientOffer.tsx`

```tsx
// Exibe ProCard com profissional encontrado (useAvailablePros)
// Dados: nome, avatar, rating, distância, tempo de chegada
// Botão "Confirmar" → /client/checkout com proId
// Fallback: tela "nenhum profissional disponível"
```

### `src/pages/client/ClientCheckout.tsx`

```tsx
// Resumo: serviço, data/hora, endereço, profissional
// Campo de observações (textarea 500 chars)
// CouponInput com validação via useValidateCoupon
// 3 métodos de pagamento: Pix, Cartão, Saldo
// MoneyBreakdown: subtotal, cupom, taxa 10%, total
// useCreateOrder mutation → /client/order-tracking
```

### `src/pages/client/ClientOrderTracking.tsx`

```tsx
// TimelineStepper: Confirmado → A caminho → Em andamento → Concluído → Avaliado
// Realtime via useOrderRealtime (Supabase postgres_changes)
// Info do pro com avatar + chat icon
// Duração estimada + endereço do serviço
// Ações: Suporte, Cancelar (com aviso de taxa)
// Botão "Avaliar" quando status === "completed"
```

### `src/pages/client/ClientRating.tsx`

```tsx
// 5 estrelas interativas com hover state
// Tags de qualidade: Pontualidade, Qualidade, Organização, Educação
// Textarea para comentário (500 chars)
// useSubmitRating mutation → atualiza orders.client_rating + status "rated"
// Tela de "já avaliado" se order.client_rating existe
```

### `src/pages/client/ClientOrders.tsx`

```tsx
// Tabs: Próximos | Concluídos (com contadores)
// Filtro por período: 7 dias, 30 dias, Todos
// Busca por serviço ou endereço
// Infinite scroll via useFlatClientOrders (useInfiniteQuery)
// Realtime via useClientOrdersRealtime
// OrderCard com status, data, preço, endereço
```

### `src/pages/client/ClientProfile.tsx`

```tsx
// Avatar + nome + email
// Menu: Endereços, Pagamento, Configurações, Suporte
// Contagem de endereços no badge
// Botão logout com confirmação visual
```

---

## 6. Módulo Profissional — Páginas

### `src/pages/pro/ProHome.tsx`

```tsx
// Header com avatar, plano badge (Free/Pro/Elite), QualityBadge (A/B/C/D)
// Toggle de disponibilidade com animação pulse
// Mapa mock com raio de atendimento
// Card de saldo com link para /pro/earnings
// Quick actions: SLA, Agenda, Ranking, Planos (grid 4 cols)
// Card SLA: pontualidade, resposta, cancelamentos
// Banner upgrade para Pro/Elite
// Lista de pedidos disponíveis com accept/decline
// useCurrentProData, useAvailableOrdersForPro, useAcceptOrder, useDeclineOrder
```

### `src/pages/pro/ProAgenda.tsx`

```tsx
// Calendário mensal com indicadores de pedidos por dia
// Filtros: período + busca por serviço/endereço/cliente
// Lista de serviços do dia selecionado com status colorido
// Realtime via useProOrdersRealtime
// useFlatProOrders (useInfiniteQuery)
```

### `src/pages/pro/ProEarnings.tsx`

```tsx
// Card de saldo disponível + pendente
// Gráfico de barras semanal (diário)
// Tabs: Semana | Mês com totais
// Histórico de repasses com status (Pago/Disponível/Pendente)
// useProEarnings hook
```

### `src/pages/pro/ProRanking.tsx`

```tsx
// Perfil com avatar, verificação badge, posição no ranking
// Stats: nota média, total serviços, taxa aceitação
// Dicas para subir no ranking
// Barra de progresso para próximo nível
// useProRanking hook
```

### `src/pages/pro/ProProfile.tsx`

```tsx
// Avatar + nome + email + StatusBadge (verificado/pendente)
// Stats: nota, serviços, aceitação
// Saldo disponível com link para saque
// Menu: Dados, Verificação, Plano, Área, Disponibilidade, Saque, Suporte, Config
// Botão logout
```

---

## 7. Módulo Administrativo — Páginas

### `src/pages/admin/AdminDashboard.tsx`

```tsx
// Layout: AdminSidebar (desktop) + conteúdo principal
// 8 MetricCards: pedidos hoje/mês, GMV, comissões, ticket médio, cancelamento, novos pros, clientes
// 2 MiniCharts: pedidos/dia, receita/dia
// Tabela de pedidos recentes (top 5)
// Dados de mockDataV2 (em produção: queries reais)
```

---

## 8. Hooks de Dados

### `src/hooks/useOrders.ts`

```tsx
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PAGE_SIZE = 10;

// useClientOrders: infinite query com join services + addresses + pro profiles
// useFlatClientOrders: helper que flatten todas as pages
// useOrder: single order com serviço, endereço e pro profile
// useProOrders: infinite query para pro com client profiles
// useFlatProOrders: helper flat para pro
```

### `src/hooks/useCreateOrder.ts`

```tsx
// useCreateOrder: mutation completa
// 1. Busca service (base_price, duration)
// 2. Busca address + zone (fee_extra)
// 3. Busca zone_rules (surge_multiplier)
// 4. Valida cupom se fornecido
// 5. Calcula: total = (base + zone_fee) * surge - discount
// 6. Insert em orders
// 7. Insert em coupon_uses + increment uses_count
//
// useValidateCoupon: valida código, datas, max uses, min value, uso único
```

### `src/hooks/useServices.ts`

```tsx
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services").select("*").eq("active", true).order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useService(serviceId: string | null) {
  return useQuery({
    queryKey: ["service", serviceId],
    queryFn: async () => {
      if (!serviceId) return null;
      const { data, error } = await supabase
        .from("services").select("*").eq("id", serviceId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!serviceId,
  });
}
```

### `src/hooks/useAddresses.ts`

```tsx
// useAddresses: lista todos do user (ordenado por default + created_at)
// useAddress: busca por ID
// useCreateAddress: insert com user_id
// useUpdateAddress: update parcial
// useDeleteAddress: delete por ID
// useSetDefaultAddress: unset all defaults + set new default
```

### `src/hooks/useProData.ts`

```tsx
// useCurrentProData: fetch paralelo de profile, pro_profile, metrics, subscription, completed orders
//   → calcula balance (80% do total_price dos completed)
//
// useAvailableOrdersForPro: pedidos sem pro_id, status scheduled/matching
//   → filtra por declined orders, zones, plano elite
//   → refetch a cada 30s
//
// useToggleProAvailability: update pro_profiles.available_now
// useAcceptOrder: update order pro_id + status "confirmed" (WHERE pro_id IS NULL)
// useDeclineOrder: insert em pro_declined_orders
```

---

## 9. Componentes UI Reutilizáveis

### `src/components/ui/PrimaryButton.tsx`

```tsx
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ children, variant = "primary", size = "md", loading, fullWidth, className, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border border-input bg-background text-foreground hover:bg-accent",
      ghost: "text-foreground hover:bg-accent",
      success: "bg-success text-success-foreground shadow-sm hover:bg-success/90",
    };
    const sizes = { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-base", lg: "px-8 py-4 text-lg" };

    return (
      <button ref={ref} disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl font-medium",
          "transition-all duration-200 active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant], sizes[size], fullWidth && "w-full", className
        )} {...props}>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
```

### `src/components/ui/BottomNav.tsx`

```tsx
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, User, Calendar, Wallet } from "lucide-react";

const clientItems = [
  { icon: <Home className="w-5 h-5" />, label: "Início", path: "/client/home" },
  { icon: <ClipboardList className="w-5 h-5" />, label: "Pedidos", path: "/client/orders" },
  { icon: <User className="w-5 h-5" />, label: "Perfil", path: "/client/profile" },
];

const proItems = [
  { icon: <Home className="w-5 h-5" />, label: "Início", path: "/pro/home" },
  { icon: <Calendar className="w-5 h-5" />, label: "Agenda", path: "/pro/agenda" },
  { icon: <Wallet className="w-5 h-5" />, label: "Ganhos", path: "/pro/earnings" },
  { icon: <User className="w-5 h-5" />, label: "Perfil", path: "/pro/profile" },
];

export function BottomNav({ variant }: { variant: "client" | "pro" }) {
  const location = useLocation();
  const items = variant === "client" ? clientItems : proItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all",
                isActive ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}>
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### `src/components/ui/OrderCard.tsx`

```tsx
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { Calendar, MapPin, Clock } from "lucide-react";

type OrderStatus = "draft" | "scheduled" | "matching" | "confirmed" | "en_route" | "in_progress" | "completed" | "rated" | "paid_out" | "cancelled" | "in_review";

interface OrderCardProps {
  id: string; service: string; date: string; time: string;
  address: string; status: OrderStatus; price: number; onClick?: () => void;
}

export function OrderCard({ service, date, time, address, status, price, onClick }: OrderCardProps) {
  return (
    <button onClick={onClick}
      className="w-full text-left p-4 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all hover:border-primary/30 active:scale-[0.99]">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-foreground">{service}</h3>
        <StatusBadge status={status} />
      </div>
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /><span>{date}</span></div>
          <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /><span>{time}</span></div>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 shrink-0" /><span className="truncate">{address}</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-lg font-bold text-foreground">R$ {price.toFixed(2).replace(".", ",")}</span>
        <span className="text-xs text-primary font-medium">Ver detalhes →</span>
      </div>
    </button>
  );
}
```

---

## 10. Design System (CSS + Tailwind)

### `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@layer base {
  :root {
    --background: 0 0% 99%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --primary: 221 83% 53%;
    --primary-foreground: 0 0% 100%;
    --secondary: 220 14% 96%;
    --secondary-foreground: 222 47% 20%;
    --muted: 220 14% 96%;
    --muted-foreground: 220 9% 46%;
    --accent: 221 83% 96%;
    --accent-foreground: 221 83% 45%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --success: 142 71% 45%;
    --success-foreground: 0 0% 100%;
    --warning: 38 92% 50%;
    --warning-foreground: 0 0% 100%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 221 83% 53%;
    --radius: 0.625rem;
    --shadow-xs: 0 1px 2px 0 hsl(222 47% 11% / 0.05);
    --shadow-sm: 0 1px 3px 0 hsl(222 47% 11% / 0.1);
    --shadow-md: 0 4px 6px -1px hsl(222 47% 11% / 0.1);
    --shadow-card: var(--shadow-sm);
    --shadow-card-hover: var(--shadow-md);
    --shadow-button: 0 1px 2px 0 hsl(221 83% 53% / 0.2);
  }

  .dark {
    --background: 222 47% 6%;
    --foreground: 210 40% 98%;
    --card: 222 47% 8%;
    --primary: 221 83% 58%;
    --secondary: 222 47% 12%;
    --muted: 222 47% 12%;
    --muted-foreground: 215 20% 55%;
    --accent: 221 83% 15%;
    --border: 222 47% 15%;
    --input: 222 47% 15%;
    --ring: 221 83% 58%;
  }
}

@layer components {
  .card-shadow { box-shadow: var(--shadow-card); }
  .card-shadow-hover { box-shadow: var(--shadow-card-hover); }
  .button-shadow { box-shadow: var(--shadow-button); }
  .glass { backdrop-filter: blur(12px); background: hsl(var(--card) / 0.8); }
}

@layer utilities {
  .safe-top { padding-top: max(0.5rem, env(safe-area-inset-top)); }
  .safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0); }
}
```

### `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        success: { DEFAULT: "hsl(var(--success))", foreground: "hsl(var(--success-foreground))" },
        warning: { DEFAULT: "hsl(var(--warning))", foreground: "hsl(var(--warning-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

---

## 11. Configuração Vite + PWA

### `vite.config.ts`

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: { host: "::", port: 8080, hmr: { overlay: false } },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "prompt",
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          { urlPattern: /^https:\/\/fonts\.googleapis\.com/, handler: "StaleWhileRevalidate", options: { cacheName: "google-fonts-stylesheets" } },
          { urlPattern: /^https:\/\/fonts\.gstatic\.com/, handler: "CacheFirst", options: { cacheName: "google-fonts-webfonts" } },
          { urlPattern: /\.(?:png|jpg|svg|gif|webp)$/i, handler: "CacheFirst", options: { cacheName: "images-cache" } },
          { urlPattern: /^https:\/\/.*\.supabase\.co\/rest/, handler: "NetworkFirst", options: { cacheName: "supabase-api-cache", networkTimeoutSeconds: 10 } },
          { urlPattern: /^https:\/\/.*\.supabase\.co\/auth/, handler: "NetworkOnly" },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
}));
```

---

## 12. Banco de Dados — Schema Completo

### Enums

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'client', 'pro', 'company');
CREATE TYPE public.order_status AS ENUM ('draft', 'scheduled', 'matching', 'confirmed', 'en_route', 'in_progress', 'completed', 'rated', 'paid_out', 'cancelled', 'in_review');
CREATE TYPE public.client_plan_type AS ENUM ('basic', 'plus', 'premium');
CREATE TYPE public.pro_plan_type AS ENUM ('free', 'pro', 'elite');
CREATE TYPE public.quality_level AS ENUM ('A', 'B', 'C', 'D');
CREATE TYPE public.subscription_status AS ENUM ('active', 'paused', 'cancelled', 'expired');
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.referral_status AS ENUM ('pending', 'completed', 'expired', 'cancelled');
CREATE TYPE public.risk_severity AS ENUM ('low', 'medium', 'high', 'critical');
```

### Tabelas Principais

```sql
-- Perfis de usuário
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  cpf TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Roles (tabela separada - segurança)
CREATE TABLE user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Serviços disponíveis
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  base_price NUMERIC NOT NULL,
  duration_hours NUMERIC NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Endereços
CREATE TABLE addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  lat NUMERIC,
  lng NUMERIC,
  zone_id UUID REFERENCES zones(id),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pedidos
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  pro_id UUID,
  service_id UUID NOT NULL REFERENCES services(id),
  address_id UUID NOT NULL REFERENCES addresses(id),
  status order_status DEFAULT 'draft',
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_hours NUMERIC NOT NULL,
  base_price NUMERIC NOT NULL,
  zone_fee NUMERIC DEFAULT 0,
  surge_multiplier NUMERIC DEFAULT 1.0,
  discount NUMERIC DEFAULT 0,
  total_price NUMERIC NOT NULL,
  notes TEXT,
  client_rating INTEGER,
  client_review TEXT,
  pro_rating INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Perfis de profissional
CREATE TABLE pro_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rating NUMERIC DEFAULT 5.0,
  jobs_done INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  available_now BOOLEAN DEFAULT false,
  current_lat NUMERIC,
  current_lng NUMERIC,
  radius_km NUMERIC DEFAULT 10.0,
  bio TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Métricas SLA do profissional
CREATE TABLE pro_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  on_time_rate NUMERIC DEFAULT 100.0,
  cancel_rate NUMERIC DEFAULT 0.0,
  acceptance_rate NUMERIC DEFAULT 100.0,
  response_time_avg INTEGER DEFAULT 0,
  last_30d_jobs INTEGER DEFAULT 0,
  last_7d_cancels INTEGER DEFAULT 0,
  quality_level quality_level DEFAULT 'A',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Planos Profissional
CREATE TABLE pro_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type pro_plan_type NOT NULL,
  monthly_price NUMERIC NOT NULL,
  priority_boost INTEGER DEFAULT 0,
  access_categories JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Assinaturas Pro
CREATE TABLE pro_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES pro_plans(id),
  status subscription_status DEFAULT 'active',
  start_at TIMESTAMPTZ DEFAULT now(),
  renew_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Zonas de atendimento
CREATE TABLE cities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID NOT NULL REFERENCES cities(id),
  name TEXT NOT NULL,
  center_lat NUMERIC,
  center_lng NUMERIC,
  radius_km NUMERIC DEFAULT 5.0,
  fee_extra NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE zone_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID NOT NULL REFERENCES zones(id) UNIQUE,
  min_pros_online INTEGER DEFAULT 3,
  surge_multiplier NUMERIC DEFAULT 1.0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cupons
CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL,
  discount_value NUMERIC NOT NULL,
  min_order_value NUMERIC DEFAULT 0,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE coupon_uses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES coupons(id),
  user_id UUID NOT NULL,
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pagamentos e Saques
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  external_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  encrypted_pix_key TEXT,
  encrypted_bank_info TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Suporte
CREATE TABLE support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id UUID REFERENCES orders(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  status ticket_status DEFAULT 'open',
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE support_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id),
  user_id UUID,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notificações
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Referral
CREATE TABLE referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referee_id UUID,
  code TEXT NOT NULL,
  role app_role NOT NULL,
  status referral_status DEFAULT 'pending',
  reward_value NUMERIC DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Risk
CREATE TABLE risk_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  role app_role NOT NULL,
  severity risk_severity DEFAULT 'low',
  notes TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Eventos de analytics
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Matching logs
CREATE TABLE matching_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  candidates JSONB NOT NULL,
  chosen_pro_id UUID,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Funções de Segurança

```sql
-- Verificar role do usuário (SECURITY DEFINER evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;
```

### RLS Policies (Exemplos)

```sql
-- Orders: clientes veem só os próprios, pros veem os atribuídos, admins veem tudo
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own orders" ON orders FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can update their own orders" ON orders FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Pros can view assigned orders" ON orders FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "Pros can update assigned orders" ON orders FOR UPDATE USING (auth.uid() = pro_id);
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (is_admin(auth.uid()));

-- Profiles: próprio user + admin + cross-user via orders
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin(auth.uid()));
```

---

## Dependências do Projeto

| Pacote | Versão | Uso |
|--------|--------|-----|
| react | ^18.3.1 | Framework UI |
| react-router-dom | ^6.30.1 | Roteamento SPA |
| @tanstack/react-query | ^5.83.0 | Data fetching + cache |
| @supabase/supabase-js | ^2.91.1 | Cliente Supabase |
| tailwindcss-animate | ^1.0.7 | Animações Tailwind |
| framer-motion | ^12.29.2 | Animações React |
| lucide-react | ^0.462.0 | Ícones |
| sonner | ^1.7.4 | Toast notifications |
| recharts | ^2.15.4 | Gráficos admin |
| react-hook-form | ^7.61.1 | Formulários |
| zod | ^3.25.76 | Validação |
| date-fns | ^3.6.0 | Manipulação de datas |
| vite-plugin-pwa | ^1.2.0 | PWA + Service Worker |
| class-variance-authority | ^0.7.1 | Variants de componentes |
| next-themes | ^0.3.0 | Dark mode |

---

> **Documento gerado automaticamente** · JáLimpo v2.0.0 · Fevereiro 2026
