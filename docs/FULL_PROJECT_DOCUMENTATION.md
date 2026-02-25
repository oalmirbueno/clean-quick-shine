# 📋 JáLimpo — Documentação Completa do Projeto

> Documentação técnica completa com todos os códigos-fonte, estrutura de arquivos, banco de dados, hooks, componentes e páginas do aplicativo JáLimpo.

**Versão:** 1.0.0  
**Data:** Fevereiro 2026  
**Stack:** React + TypeScript + Vite + Tailwind CSS + Supabase (Lovable Cloud)

---

## 📁 Índice

1. [Estrutura de Arquivos](#1-estrutura-de-arquivos)
2. [Configuração do Projeto](#2-configuração-do-projeto)
3. [Design System (CSS + Tailwind)](#3-design-system)
4. [Ponto de Entrada e Roteamento](#4-ponto-de-entrada-e-roteamento)
5. [Contextos](#5-contextos)
6. [Componentes Base](#6-componentes-base)
7. [Hooks Customizados](#7-hooks-customizados)
8. [Páginas — Autenticação](#8-páginas-autenticação)
9. [Páginas — Cliente](#9-páginas-cliente)
10. [Páginas — Profissional (Pro)](#10-páginas-profissional)
11. [Páginas — Admin](#11-páginas-admin)
12. [Banco de Dados (Schema)](#12-banco-de-dados)
13. [Políticas RLS](#13-políticas-rls)
14. [Funções do Banco](#14-funções-do-banco)
15. [PWA e Service Worker](#15-pwa)
16. [Utilitários](#16-utilitários)

---

## 1. Estrutura de Arquivos

```
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   ├── robots.txt
│   └── pwa-*.png (ícones PWA)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   ├── vite-env.d.ts
│   ├── assets/
│   │   ├── hero-cleaner-*.png
│   │   ├── logo-full.png
│   │   ├── logo-icon.png
│   │   └── screenshots/ (capturas de tela)
│   ├── components/
│   │   ├── NavLink.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── ThemeProvider.tsx
│   │   ├── admin/
│   │   │   └── AdminSidebar.tsx
│   │   ├── skeletons/
│   │   │   ├── HomeSkeleton.tsx
│   │   │   ├── OrderCardSkeleton.tsx
│   │   │   ├── ProfileSkeleton.tsx
│   │   │   └── index.ts
│   │   └── ui/ (50+ componentes)
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useAddresses.ts
│   │   ├── useCancelOrder.ts
│   │   ├── useCreateOrder.ts
│   │   ├── useNetworkStatus.ts
│   │   ├── useNotifications.ts
│   │   ├── useOrderRealtime.ts
│   │   ├── useOrders.ts
│   │   ├── useProData.ts
│   │   ├── useProDocuments.ts
│   │   ├── useProEarnings.ts
│   │   ├── useProMetrics.ts
│   │   ├── usePros.ts
│   │   ├── useServices.ts
│   │   ├── useSubmitRating.ts
│   │   ├── useUpdateOrderStatus.ts
│   │   └── useWithdrawals.ts
│   ├── integrations/supabase/
│   │   ├── client.ts
│   │   └── types.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── mockData.ts
│   │   ├── mockDataV2.ts
│   │   └── mockDataV3.ts
│   ├── pages/
│   │   ├── AccessDenied.tsx
│   │   ├── AppSettings.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── Index.tsx (Splash)
│   │   ├── Install.tsx
│   │   ├── Login.tsx
│   │   ├── NotFound.tsx
│   │   ├── Offline.tsx
│   │   ├── Onboarding.tsx
│   │   ├── OnboardingClient.tsx
│   │   ├── OnboardingPro.tsx
│   │   ├── Register.tsx
│   │   ├── ResetPassword.tsx
│   │   ├── client/ (16 telas)
│   │   ├── pro/ (12 telas)
│   │   ├── admin/ (17 telas)
│   │   ├── company/ (2 telas)
│   │   └── dev/ (2 telas)
│   └── test/
│       ├── setup.ts
│       ├── example.test.ts
│       └── AccessDenied.test.tsx
└── supabase/
    └── config.toml
```

---

## 2. Configuração do Projeto

### index.html

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

### vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.ico", "robots.txt", "pwa-*.png"],
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,woff,ttf}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/, /^\/supabase/, /^\/__/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-stylesheets", expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: { cacheName: "google-fonts-webfonts", expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 }, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: "CacheFirst",
            options: { cacheName: "images-cache", expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 } },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: "NetworkFirst",
            options: { cacheName: "supabase-api-cache", expiration: { maxEntries: 50, maxAgeSeconds: 300 }, networkTimeoutSeconds: 10, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/auth\/.*/i,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: { include: ["react", "react-dom"] },
}));
```

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
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
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "scale-in": { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
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

## 3. Design System

### src/index.css

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
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
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
    --shadow-sm: 0 1px 3px 0 hsl(222 47% 11% / 0.1), 0 1px 2px -1px hsl(222 47% 11% / 0.1);
    --shadow-md: 0 4px 6px -1px hsl(222 47% 11% / 0.1), 0 2px 4px -2px hsl(222 47% 11% / 0.1);
    --shadow-lg: 0 10px 15px -3px hsl(222 47% 11% / 0.1), 0 4px 6px -4px hsl(222 47% 11% / 0.1);
    --shadow-card: var(--shadow-sm);
    --shadow-card-hover: var(--shadow-md);
    --shadow-button: 0 1px 2px 0 hsl(221 83% 53% / 0.2);
  }

  .dark {
    --background: 222 47% 6%;
    --foreground: 210 40% 98%;
    --card: 222 47% 8%;
    --card-foreground: 210 40% 98%;
    --popover: 222 47% 8%;
    --popover-foreground: 210 40% 98%;
    --primary: 221 83% 58%;
    --primary-foreground: 0 0% 100%;
    --secondary: 222 47% 12%;
    --secondary-foreground: 210 40% 90%;
    --muted: 222 47% 12%;
    --muted-foreground: 215 20% 55%;
    --accent: 221 83% 15%;
    --accent-foreground: 221 83% 75%;
    --destructive: 0 62% 50%;
    --destructive-foreground: 0 0% 100%;
    --success: 142 71% 45%;
    --success-foreground: 0 0% 100%;
    --warning: 38 92% 50%;
    --warning-foreground: 0 0% 100%;
    --border: 222 47% 15%;
    --input: 222 47% 15%;
    --ring: 221 83% 58%;
    --shadow-card: 0 1px 3px 0 hsl(0 0% 0% / 0.3);
    --shadow-card-hover: 0 4px 6px -1px hsl(0 0% 0% / 0.3);
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground font-sans antialiased;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
  *:focus-visible {
    @apply outline-none ring-2 ring-primary ring-offset-2 ring-offset-background;
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
  .safe-x {
    padding-left: max(0.5rem, env(safe-area-inset-left));
    padding-right: max(0.5rem, env(safe-area-inset-right));
  }
  .safe-y {
    padding-top: max(0.5rem, env(safe-area-inset-top));
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }
  .safe-all {
    padding-top: max(0.5rem, env(safe-area-inset-top));
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
    padding-left: max(0.5rem, env(safe-area-inset-left));
    padding-right: max(0.5rem, env(safe-area-inset-right));
  }
  .animate-pulse-soft { animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  .transition-smooth { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
}

html, body { overscroll-behavior: none; }

@media (display-mode: standalone) {
  body { -webkit-user-select: none; user-select: none; }
  input, textarea, [contenteditable] { -webkit-user-select: auto; user-select: auto; }
}
```

---

## 4. Ponto de Entrada e Roteamento

### src/main.tsx

```typescript
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

### src/App.tsx

```typescript
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

// ... imports de todas as páginas (ver arquivo original)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 minutos
      gcTime: 1000 * 60 * 30,          // 30 minutos
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
                {/* Splash & Auth */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/onboarding/client" element={<OnboardingClient />} />
                <Route path="/onboarding/pro" element={<OnboardingPro />} />

                {/* Client Routes (16 rotas protegidas) */}
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

                {/* Pro Routes (12 rotas protegidas) */}
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

                {/* Admin Routes (17 rotas protegidas) */}
                <Route path="/admin/login" element={<Navigate to="/login" replace />} />
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

                {/* Company Routes */}
                <Route path="/company/onboarding" element={<CompanyOnboarding />} />
                <Route path="/company/request-quote" element={<CompanyRequestQuote />} />

                {/* Dev / Utilitários */}
                <Route path="/dev/components" element={<ComponentShowcase />} />
                <Route path="/dev/documentation" element={<ProjectDocumentation />} />
                <Route path="/install" element={<Install />} />
                <Route path="/settings" element={<AppSettings />} />
                <Route path="/offline" element={<Offline />} />
                <Route path="/access-denied" element={<AccessDenied />} />
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

## 5. Contextos

### src/contexts/AuthContext.tsx

```typescript
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

  const signUp = async (email: string, password: string, fullName: string, phone: string, role: AppRole) => {
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

  const hasRole = (role: AppRole) => roles.includes(role);

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

## 6. Componentes Base

### src/components/ProtectedRoute.tsx

```typescript
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

### src/components/ThemeProvider.tsx

```typescript
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

export function ThemeProvider({ children, ...props }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false} {...props}>
      {children}
    </NextThemesProvider>
  );
}
```

### src/components/ui/Logo.tsx

```typescript
import { cn } from "@/lib/utils";
import logoIcon from "@/assets/logo-icon.png";
import logoFull from "@/assets/logo-full.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  iconOnly?: boolean;
}

const sizes = {
  sm: { icon: "w-8 h-8", full: "h-8" },
  md: { icon: "w-10 h-10", full: "h-10" },
  lg: { icon: "w-14 h-14", full: "h-14" },
  xl: { icon: "w-24 h-24", full: "h-28" },
  "2xl": { icon: "w-32 h-32", full: "h-36" },
};

export function Logo({ size = "md", className, iconOnly = false }: LogoProps) {
  const { icon, full } = sizes[size];
  if (iconOnly) return <img src={logoIcon} alt="JáLimpo" className={cn(icon, className)} />;
  return <img src={logoFull} alt="JáLimpo - Chamou, tá limpo" className={cn(full, "w-auto", className)} />;
}
```

### src/components/ui/PrimaryButton.tsx

```typescript
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
      outline: "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
      ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
      success: "bg-success text-success-foreground shadow-sm hover:bg-success/90",
    };
    const sizes = { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-base", lg: "px-8 py-4 text-lg" };

    return (
      <button
        ref={ref} disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl font-medium",
          "transition-all duration-200 active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          variants[variant], sizes[size], fullWidth && "w-full", className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
PrimaryButton.displayName = "PrimaryButton";
```

### src/components/ui/InputField.tsx

```typescript
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, icon, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-foreground">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
        <input
          ref={ref}
          className={cn(
            "w-full py-3 rounded-lg border border-input bg-background",
            "text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "transition-all duration-200",
            icon ? "pl-10 pr-4" : "px-4",
            error && "border-destructive focus:ring-destructive/20 focus:border-destructive",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
);
InputField.displayName = "InputField";
```

### src/components/ui/BottomNav.tsx

```typescript
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

### src/components/ui/PageTransition.tsx

```typescript
import { motion, type Easing } from "framer-motion";
import { ReactNode } from "react";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants}
      transition={{ type: "tween", ease: "anticipate" as Easing, duration: 0.3 }} className={className}>
      {children}
    </motion.div>
  );
}
```

### src/components/ui/AuthLoading.tsx

```typescript
import { cn } from "@/lib/utils";
import logoIcon from "@/assets/logo-icon.png";

export function AuthLoading({ message = "Carregando...", className }: { message?: string; className?: string }) {
  return (
    <div className={cn("min-h-screen bg-background flex flex-col items-center justify-center p-6", className)}>
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '1.5s' }} />
          <div className="absolute inset-[-8px] rounded-full bg-primary/10 animate-pulse" style={{ animationDuration: '2s' }} />
          <div className="relative w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center animate-bounce" style={{ animationDuration: '1s' }}>
            <img src={logoIcon} alt="JáLimpo" className="w-12 h-12" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-medium text-foreground">{message}</p>
          <div className="flex gap-1.5">
            {[0, 150, 300].map((delay) => (
              <span key={delay} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${delay}ms`, animationDuration: '0.6s' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### src/components/ui/ServiceCard.tsx

```typescript
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export function ServiceCard({ icon: Icon, title, description, onClick, className }: {
  icon: LucideIcon; title: string; description?: string; onClick?: () => void; className?: string;
}) {
  return (
    <button onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-5 bg-card rounded-2xl border border-border",
        "shadow-sm hover:shadow-md transition-all duration-200",
        "hover:border-primary/30 hover:bg-accent/50 active:scale-[0.98]",
        "min-h-[110px] w-full text-center group", className
      )}>
      <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <span className="text-sm font-semibold text-foreground">{title}</span>
      {description && <span className="text-xs text-muted-foreground mt-0.5">{description}</span>}
    </button>
  );
}
```

### src/components/ui/OrderCard.tsx

```typescript
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { Calendar, MapPin, Clock } from "lucide-react";

type OrderStatus = "draft" | "scheduled" | "matching" | "confirmed" | "en_route" | "in_progress" | "completed" | "rated" | "paid_out" | "cancelled" | "in_review";

export function OrderCard({ service, date, time, address, status, price, onClick, className }: {
  id: string; service: string; date: string; time: string; address: string; status: OrderStatus; price: number; onClick?: () => void; className?: string;
}) {
  return (
    <button onClick={onClick}
      className={cn("w-full text-left p-4 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/30 active:scale-[0.99]", className)}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-foreground">{service}</h3>
        <StatusBadge status={status} />
      </div>
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /><span>{date}</span></div>
          <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /><span>{time}</span></div>
        </div>
        <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 shrink-0" /><span className="truncate">{address}</span></div>
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

## 7. Hooks Customizados

### src/hooks/useOrders.ts

```typescript
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

export type Order = Tables<"orders">;
export interface OrderWithDetails extends Order {
  service?: { name: string; icon: string | null } | null;
  address?: { label: string; street: string; number: string; neighborhood: string; city: string; state: string } | null;
  pro_profile?: { full_name: string | null; avatar_url: string | null } | null;
}

const PAGE_SIZE = 10;

export function useClientOrders() {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: ["client_orders", user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user?.id) return { orders: [], nextPage: null };
      const from = pageParam * PAGE_SIZE;
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*, service:services(name, icon), address:addresses(label, street, number, neighborhood, city, state)")
        .eq("client_id", user.id)
        .order("scheduled_date", { ascending: false })
        .order("scheduled_time", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      if (!orders?.length) return { orders: [], nextPage: null };
      const proIds = [...new Set(orders.filter(o => o.pro_id).map(o => o.pro_id!))];
      let proProfiles: any[] = [];
      if (proIds.length > 0) {
        const { data } = await supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", proIds);
        proProfiles = data || [];
      }
      const mappedOrders = orders.map(order => ({
        ...order,
        pro_profile: order.pro_id ? proProfiles.find(p => p.user_id === order.pro_id) || null : null,
      })) as OrderWithDetails[];
      return { orders: mappedOrders, nextPage: orders.length === PAGE_SIZE ? pageParam + 1 : null };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!user?.id,
  });
}

export function useFlatClientOrders() {
  const query = useClientOrders();
  const orders = query.data?.pages.flatMap(p => p.orders) ?? [];
  return { ...query, orders };
}

export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data: order, error } = await supabase
        .from("orders")
        .select("*, service:services(id, name, icon, description, duration_hours, base_price), address:addresses(*)")
        .eq("id", orderId).maybeSingle();
      if (error) throw error;
      if (!order) return null;
      let proProfile = null;
      if (order.pro_id) {
        const [profileRes, proProRes] = await Promise.all([
          supabase.from("profiles").select("user_id, full_name, avatar_url, phone").eq("user_id", order.pro_id).maybeSingle(),
          supabase.from("pro_profiles").select("rating, jobs_done, verified").eq("user_id", order.pro_id).maybeSingle(),
        ]);
        proProfile = { ...profileRes.data, ...proProRes.data };
      }
      return { ...order, pro_profile: proProfile };
    },
    enabled: !!orderId,
  });
}

export function useProOrders() {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: ["pro_orders", user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user?.id) return { orders: [], nextPage: null };
      const from = pageParam * PAGE_SIZE;
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*, service:services(id, name, icon), address:addresses(id, label, street, number, neighborhood, city, state)")
        .eq("pro_id", user.id)
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      if (!orders?.length) return { orders: [], nextPage: null };
      const clientIds = [...new Set(orders.map(o => o.client_id))];
      const { data: clientProfiles } = await supabase.from("profiles").select("user_id, full_name, avatar_url, phone").in("user_id", clientIds);
      const mappedOrders = orders.map(order => ({
        ...order,
        client_profile: clientProfiles?.find(p => p.user_id === order.client_id) || null,
      }));
      return { orders: mappedOrders, nextPage: orders.length === PAGE_SIZE ? pageParam + 1 : null };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!user?.id,
  });
}

export function useFlatProOrders() {
  const query = useProOrders();
  const orders = query.data?.pages.flatMap(p => p.orders) ?? [];
  return { ...query, orders };
}
```

### src/hooks/useCreateOrder.ts

```typescript
// Hook completo para criação de pedidos com:
// - Busca de serviço e endereço
// - Cálculo de taxa de zona e surge pricing
// - Validação e aplicação de cupons
// - Cálculo do preço total
// - Criação do pedido no banco
// - Registro de uso do cupom
// Veja código completo no arquivo fonte (182 linhas)
```

### src/hooks/useServices.ts

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Service = Tables<"services">;

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("active", true).order("name");
      if (error) throw error;
      return data as Service[];
    },
  });
}

export function useService(serviceId: string | null) {
  return useQuery({
    queryKey: ["service", serviceId],
    queryFn: async () => {
      if (!serviceId) return null;
      const { data, error } = await supabase.from("services").select("*").eq("id", serviceId).maybeSingle();
      if (error) throw error;
      return data as Service | null;
    },
    enabled: !!serviceId,
  });
}
```

### src/hooks/useAddresses.ts

```typescript
// Hook completo com: useAddresses, useAddress, useCreateAddress,
// useUpdateAddress, useDeleteAddress, useSetDefaultAddress
// Todas as operações CRUD para endereços do usuário autenticado
// Veja código completo no arquivo fonte (141 linhas)
```

### src/hooks/useNotifications.ts

```typescript
// Hook com realtime subscription para notificações do usuário
// Inclui: useNotifications (query + realtime), markAsRead, markAllAsRead
// Canal: notifications-{userId} com listener INSERT
// Veja código completo no arquivo fonte (102 linhas)
```

### src/hooks/useOrderRealtime.ts

```typescript
// Hooks de realtime para pedidos:
// - useOrderRealtime(orderId) — atualização de status individual
// - useClientOrdersRealtime(userId) — updates de pedidos do cliente
// - useProOrdersRealtime(userId) — updates para o profissional
// - useGlobalProNotifications(userId, isPro) — notificações globais
// Veja código completo no arquivo fonte (252 linhas)
```

### src/hooks/useProData.ts

```typescript
// Hooks do profissional:
// - useCurrentProData() — dados completos (perfil, métricas, plano, saldo)
// - useAvailableOrdersForPro() — pedidos disponíveis com refetch a cada 30s
// - useToggleProAvailability() — toggle disponibilidade
// - useAcceptOrder() / useDeclineOrder() — aceitar/recusar pedidos
// Veja código completo no arquivo fonte (283 linhas)
```

### src/hooks/useProEarnings.ts

```typescript
// Hook de ganhos do profissional:
// - Cálculo de saldo disponível e pendente
// - Dados semanais para gráfico de barras
// - Comparação semana atual vs anterior
// - Lista de transações recentes
// Comissão: 80% do valor total do pedido
// Veja código completo no arquivo fonte (175 linhas)
```

### src/hooks/useUpdateOrderStatus.ts

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type OrderStatus = Database["public"]["Enums"]["order_status"];

export function useUpdateOrderStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (status === "completed") updateData.completed_at = new Date().toISOString();
      const { error } = await supabase.from("orders").update(updateData).eq("id", orderId).eq("pro_id", user.id);
      if (error) throw new Error("Erro ao atualizar status do pedido");
      return { orderId, status };
    },
    onSuccess: (data) => {
      const msgs: Record<string, string> = { en_route: "A caminho!", in_progress: "Serviço iniciado!", completed: "Serviço concluído!" };
      toast.success(msgs[data.status] || "Status atualizado!");
      queryClient.invalidateQueries({ queryKey: ["order", data.orderId] });
      queryClient.invalidateQueries({ queryKey: ["pro_orders"] });
      queryClient.invalidateQueries({ queryKey: ["client_orders"] });
    },
  });
}
```

### src/hooks/useSubmitRating.ts

```typescript
// Hook para avaliação do cliente:
// - Validação do pedido (pertence ao cliente, está completo, não avaliado)
// - Salva rating + review + tags de destaque
// - Atualiza média de rating do profissional
// - Atualiza status do pedido para "rated"
// Veja código completo no arquivo fonte (115 linhas)
```

### src/hooks/useCancelOrder.ts

```typescript
// Hook para cancelamento de pedidos:
// - Validação de status cancelável
// - Cálculo de multa (30% após 24h)
// - Política de reembolso
// Veja código completo no arquivo fonte (85 linhas)
```

### src/hooks/useWithdrawals.ts

```typescript
// Hooks de saque do profissional:
// - useProBalance() — saldo disponível vs pendente
// - useProWithdrawals() — histórico de saques
// - useRequestWithdrawal() — solicitar saque via Pix
// Veja código completo no arquivo fonte (154 linhas)
```

### src/hooks/useProMetrics.ts

```typescript
// Hooks de métricas SLA:
// - useProMetrics() — métricas individuais
// - useSlaRules() — regras SLA ativas
// - calculateQualityLevel() — cálculo do nível A/B/C/D
// - useProRanking() — ranking entre profissionais
// Veja código completo no arquivo fonte (144 linhas)
```

### src/hooks/usePros.ts

```typescript
// Hooks de profissionais:
// - useAvailablePros(zoneId) — pros disponíveis por zona
// - useProProfile(userId) — perfil individual
// - useProWithProfile(proUserId) — perfil + dados pessoais
// - useAllPros() — todos os pros (admin)
// Veja código completo no arquivo fonte (114 linhas)
```

---

## 8. Páginas — Autenticação

### src/pages/Index.tsx (Splash Screen)

```typescript
// Splash animado com logo (framer-motion)
// Redirect automático após 1s:
// - Sessão ativa → rota baseada na role (admin/pro/client)
// - Sem sessão → /onboarding
```

### src/pages/Onboarding.tsx

```typescript
// Tela de boas-vindas com:
// - Logo grande animada
// - Trust badges (Verificado, 4.9, Rápido)
// - Botão "Quero contratar" → /onboarding/client
// - Botão "Quero trabalhar" → /onboarding/pro
// - Link "Fazer login" → /login
// - Hero image no desktop (55% da tela)
```

### src/pages/Login.tsx

```typescript
// Fluxo em 2 etapas:
// 1. Seleção de tipo (Cliente/Diarista) com cards animados
// 2. Formulário (email + senha)
// - Redirect baseado em roles após login
// - Hero image responsiva (desktop/mobile)
// - Link "Esqueceu a senha?" e "Cadastre-se"
```

### src/pages/Register.tsx

```typescript
// Cadastro com seleção de tipo:
// - Cliente: Nome, Telefone, Email, Senha + Termos
// - Pro: Step 1 (dados pessoais) → Step 2 (cidade, raio, dias, turnos)
// - Criação automática de pro_profile para diaristas
// - Validação de senha mínima 8 caracteres
```

### src/pages/ForgotPassword.tsx

```typescript
// Recuperação de senha:
// - Input de email com validação
// - Envio via supabase.auth.resetPasswordForEmail()
// - Tela de confirmação com ícone CheckCircle
```

### src/pages/ResetPassword.tsx

```typescript
// Redefinição de senha:
// - Validação de sessão do link de reset
// - Campos de nova senha e confirmação com toggle de visibilidade
// - Mínimo 6 caracteres
// - Sign out automático após redefinição
```

### src/pages/AccessDenied.tsx

```typescript
// Página 403 com animações framer-motion:
// - Ícone ShieldX animado
// - Título "Acesso Negado"
// - Botão "Ir para minha área" (baseado nas roles do usuário)
// - Botão "Sair da conta"
```

### src/pages/NotFound.tsx

```typescript
// Página 404 simples:
// - Título "404" + "Página não encontrada"
// - Link para voltar ao início
// - Log de erro no console
```

---

## 9. Páginas — Cliente

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/client/home` | ClientHome.tsx | Dashboard com serviços, busca, sugestões |
| `/client/service` | ClientService.tsx | Detalhes do serviço selecionado |
| `/client/schedule` | ClientSchedule.tsx | Agendamento (data + horário) |
| `/client/location` | ClientLocation.tsx | Gerenciamento de endereços |
| `/client/matching` | ClientMatching.tsx | Busca de profissional |
| `/client/offer` | ClientOffer.tsx | Oferta do profissional |
| `/client/checkout` | ClientCheckout.tsx | Resumo + pagamento + cupom |
| `/client/order-tracking` | ClientOrderTracking.tsx | Tracking realtime |
| `/client/rating` | ClientRating.tsx | Avaliação pós-serviço |
| `/client/orders` | ClientOrders.tsx | Lista de pedidos (próximos/concluídos) |
| `/client/orders/:id` | ClientOrderDetail.tsx | Detalhes do pedido |
| `/client/cancel/:id` | ClientCancel.tsx | Cancelamento com política |
| `/client/profile` | ClientProfile.tsx | Perfil + configurações |
| `/client/support` | ClientSupport.tsx | Suporte ao cliente |
| `/client/subscription` | ClientSubscription.tsx | Planos de assinatura |
| `/client/referral` | ClientReferral.tsx | Programa de indicação |

---

## 10. Páginas — Profissional

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/pro/home` | ProHome.tsx | Dashboard com toggle disponibilidade, saldo, SLA |
| `/pro/order/:id` | ProOrderDetail.tsx | Detalhes do pedido atribuído |
| `/pro/agenda` | ProAgenda.tsx | Calendário de agendamentos |
| `/pro/earnings` | ProEarnings.tsx | Ganhos (gráfico semanal + histórico) |
| `/pro/ranking` | ProRanking.tsx | Posição no ranking |
| `/pro/profile` | ProProfile.tsx | Perfil profissional |
| `/pro/verification` | ProVerification.tsx | Upload de documentos |
| `/pro/plan` | ProPlan.tsx | Planos Free/Pro/Elite |
| `/pro/withdraw` | ProWithdraw.tsx | Solicitação de saque Pix |
| `/pro/support` | ProSupport.tsx | Suporte ao profissional |
| `/pro/quality` | ProQuality.tsx | Métricas SLA detalhadas |
| `/pro/availability` | ProAvailability.tsx | Configuração de disponibilidade |

---

## 11. Páginas — Admin

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/admin/dashboard` | AdminDashboard.tsx | Métricas, gráficos, pedidos recentes |
| `/admin/orders` | AdminOrders.tsx | Tabela com filtros |
| `/admin/orders/:id` | AdminOrderDetail.tsx | Detalhes completos |
| `/admin/pros` | AdminPros.tsx | Lista de profissionais |
| `/admin/pros/:id` | AdminProDetail.tsx | Perfil detalhado do pro |
| `/admin/clients` | AdminClients.tsx | Lista de clientes |
| `/admin/coupons` | AdminCoupons.tsx | Gerenciamento de cupons |
| `/admin/support` | AdminSupport.tsx | Tickets de suporte |
| `/admin/support/:id` | AdminSupportDetail.tsx | Chat do ticket |
| `/admin/settings` | AdminSettings.tsx | Configurações do sistema |
| `/admin/zones` | AdminZones.tsx | Zonas de atendimento |
| `/admin/risk` | AdminRisk.tsx | Flags de risco |
| `/admin/analytics` | AdminAnalytics.tsx | Analytics avançado |
| `/admin/funnel` | AdminFunnel.tsx | Funil de conversão |
| `/admin/cohorts` | AdminCohorts.tsx | Análise de coortes |
| `/admin/matching-debug` | AdminMatchingDebug.tsx | Debug de matching |
| `/admin/quotes` | AdminQuotes.tsx | Orçamentos empresariais |
| `/admin/documents` | AdminDocuments.tsx | Documentos dos pros |

---

## 12. Banco de Dados

### Tabelas Principais

| Tabela | Descrição | Colunas Chave |
|--------|-----------|---------------|
| `profiles` | Dados do usuário | user_id, full_name, phone, avatar_url, cpf |
| `user_roles` | Papéis do usuário | user_id, role (admin/client/pro/company) |
| `services` | Tipos de serviço | name, base_price, duration_hours, icon |
| `addresses` | Endereços | user_id, label, street, city, zone_id, lat/lng |
| `orders` | Pedidos | client_id, pro_id, service_id, address_id, status, total_price |
| `pro_profiles` | Perfil profissional | user_id, rating, jobs_done, verified, available_now |
| `pro_metrics` | Métricas SLA | on_time_rate, cancel_rate, quality_level |
| `pro_plans` | Planos Pro | type (free/pro/elite), monthly_price, features |
| `client_plans` | Planos Cliente | type (basic/plus/premium), cleanings_per_month |
| `payments` | Pagamentos | order_id, amount, method, status |
| `withdrawals` | Saques | user_id, amount, encrypted_pix_key, status |
| `notifications` | Notificações | user_id, title, message, type, read |
| `coupons` | Cupons | code, discount_type, discount_value, active |
| `support_tickets` | Tickets | user_id, subject, status, priority |
| `zones` | Zonas | name, city_id, center_lat/lng, radius_km, fee_extra |
| `referrals` | Indicações | referrer_id, code, status, reward_value |

### Enums

```sql
-- Roles
CREATE TYPE app_role AS ENUM ('admin', 'client', 'pro', 'company');

-- Status de pedidos
CREATE TYPE order_status AS ENUM (
  'draft', 'scheduled', 'matching', 'confirmed', 'en_route',
  'in_progress', 'completed', 'rated', 'paid_out', 'cancelled', 'in_review'
);

-- Planos
CREATE TYPE pro_plan_type AS ENUM ('free', 'pro', 'elite');
CREATE TYPE client_plan_type AS ENUM ('basic', 'plus', 'premium');

-- Qualidade
CREATE TYPE quality_level AS ENUM ('A', 'B', 'C', 'D');

-- Outros
CREATE TYPE referral_status AS ENUM ('pending', 'completed', 'expired', 'cancelled');
CREATE TYPE risk_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled', 'expired');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
```

---

## 13. Políticas RLS

### Padrão de Segurança

Todas as tabelas possuem RLS habilitado. O padrão utilizado:

```sql
-- Função helper (SECURITY DEFINER para evitar recursão)
CREATE FUNCTION has_role(_user_id uuid, _role app_role) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE FUNCTION is_admin(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT has_role(_user_id, 'admin')
$$;
```

### Exemplos de Políticas

```sql
-- Orders
CREATE POLICY "Clients can view their own orders" ON orders FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Pros can view assigned orders" ON orders FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (is_admin(auth.uid()));

-- Profiles (cross-user access para pedidos)
CREATE POLICY "Clients can view pro profiles for their orders" ON profiles FOR SELECT
  USING (user_id IN (SELECT orders.pro_id FROM orders WHERE orders.client_id = auth.uid() AND orders.pro_id IS NOT NULL));

CREATE POLICY "Pros can view client profiles for active orders" ON profiles FOR SELECT
  USING (user_id IN (SELECT orders.client_id FROM orders WHERE orders.pro_id = auth.uid()
    AND orders.status = ANY(ARRAY['in_progress', 'completed', 'rated'])));
```

---

## 14. Funções do Banco

```sql
-- Trigger para criar perfil automaticamente no signup
CREATE FUNCTION handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

-- Trigger para atualizar updated_at
CREATE FUNCTION update_updated_at_column() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Criptografia de campos sensíveis (Pix, banco)
CREATE FUNCTION encrypt_field(plain_text text) RETURNS text ...;
CREATE FUNCTION decrypt_field(encrypted_text text) RETURNS text ...;

-- Trigger para encriptar dados de saque automaticamente
CREATE FUNCTION encrypt_withdrawal_data() RETURNS trigger ...;

-- Notificações automáticas em mudanças de status de pedidos
CREATE FUNCTION create_order_notification() RETURNS trigger ...;
```

---

## 15. PWA

### Manifest (public/manifest.json)

```json
{
  "name": "Já Limpo",
  "short_name": "JáLimpo",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#10b981",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/pwa-72x72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/pwa-96x96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/pwa-128x128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/pwa-144x144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/pwa-152x152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/pwa-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/pwa-384x384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/pwa-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Estratégia de Cache (Workbox)

| Recurso | Estratégia | TTL |
|---------|-----------|-----|
| Google Fonts CSS | StaleWhileRevalidate | 1 ano |
| Google Fonts WOFF | CacheFirst | 1 ano |
| Imagens (png/jpg/svg) | CacheFirst | 30 dias |
| API Supabase REST | NetworkFirst (10s timeout) | 5 minutos |
| Auth Supabase | NetworkOnly | — |

---

## 16. Utilitários

### src/lib/utils.ts

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Dependências Principais

| Pacote | Versão | Uso |
|--------|--------|-----|
| react | ^18.3.1 | UI Framework |
| react-router-dom | ^6.30.1 | Roteamento SPA |
| @tanstack/react-query | ^5.83.0 | Data fetching + cache |
| @supabase/supabase-js | ^2.91.1 | Backend (Lovable Cloud) |
| framer-motion | ^12.29.2 | Animações |
| lucide-react | ^0.462.0 | Ícones |
| tailwindcss-animate | ^1.0.7 | Animações CSS |
| sonner | ^1.7.4 | Toast notifications |
| date-fns | ^3.6.0 | Manipulação de datas |
| recharts | ^2.15.4 | Gráficos |
| vite-plugin-pwa | ^1.2.0 | Service Worker / PWA |
| zod | ^3.25.76 | Validação de schemas |

---

## Fluxos Principais

### Booking (Cliente)
```
Home → Service → Schedule → Location → Matching → Offer → Checkout → Tracking → Rating
```

### Trabalho (Pro)
```
Home (toggle ON) → Pedido disponível → Accept → Order Detail → Start → Complete → Earnings
```

### Gestão (Admin)
```
Dashboard → Orders/Pros/Clients → Detail → Actions (approve/reject/edit)
```

---

*Documentação gerada automaticamente — JáLimpo v1.0.0 — Fevereiro 2026*
