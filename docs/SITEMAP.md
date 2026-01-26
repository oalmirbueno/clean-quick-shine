# 🗺️ JáLimpo - Sitemap Visual

## Visão Geral da Navegação

```mermaid
graph TD
    subgraph "🚀 Entry Points"
        ROOT["/"] --> ONBOARD["/onboarding"]
        ROOT --> LOGIN["/login"]
    end

    subgraph "🔐 Autenticação"
        ONBOARD --> OB_CLIENT["/onboarding/client"]
        ONBOARD --> OB_PRO["/onboarding/pro"]
        LOGIN --> REGISTER["/register"]
        LOGIN --> FORGOT["/forgot-password"]
        FORGOT --> RESET["/reset-password"]
        REGISTER --> LOGIN
        OB_CLIENT --> REGISTER
        OB_PRO --> REGISTER
    end

    subgraph "👤 Módulo Cliente"
        LOGIN -->|role: client| C_HOME["/client/home"]
        C_HOME --> C_SERVICE["/client/service"]
        C_HOME --> C_ORDERS["/client/orders"]
        C_HOME --> C_PROFILE["/client/profile"]
        
        C_SERVICE --> C_SCHEDULE["/client/schedule"]
        C_SCHEDULE --> C_LOCATION["/client/location"]
        C_LOCATION --> C_MATCHING["/client/matching"]
        C_MATCHING --> C_OFFER["/client/offer"]
        C_OFFER --> C_CHECKOUT["/client/checkout"]
        C_CHECKOUT --> C_TRACKING["/client/order-tracking"]
        C_TRACKING --> C_RATING["/client/rating"]
        C_RATING --> C_HOME
        
        C_ORDERS --> C_ORDER_DETAIL["/client/orders/:id"]
        C_ORDER_DETAIL --> C_CANCEL["/client/cancel/:id"]
        
        C_PROFILE --> C_SUBSCRIPTION["/client/subscription"]
        C_PROFILE --> C_REFERRAL["/client/referral"]
        C_PROFILE --> C_SUPPORT["/client/support"]
    end

    subgraph "💼 Módulo Profissional"
        LOGIN -->|role: pro| P_HOME["/pro/home"]
        P_HOME --> P_AGENDA["/pro/agenda"]
        P_HOME --> P_EARNINGS["/pro/earnings"]
        P_HOME --> P_RANKING["/pro/ranking"]
        P_HOME --> P_PROFILE["/pro/profile"]
        
        P_HOME --> P_ORDER["/pro/order/:id"]
        P_EARNINGS --> P_WITHDRAW["/pro/withdraw"]
        
        P_PROFILE --> P_QUALITY["/pro/quality"]
        P_PROFILE --> P_AVAILABILITY["/pro/availability"]
        P_PROFILE --> P_VERIFICATION["/pro/verification"]
        P_PROFILE --> P_PLAN["/pro/plan"]
        P_PROFILE --> P_SUPPORT["/pro/support"]
    end

    subgraph "🛡️ Módulo Admin"
        A_LOGIN["/admin/login"] --> A_DASH["/admin/dashboard"]
        A_DASH --> A_ORDERS["/admin/orders"]
        A_DASH --> A_PROS["/admin/pros"]
        A_DASH --> A_CLIENTS["/admin/clients"]
        A_DASH --> A_ANALYTICS["/admin/analytics"]
        
        A_ORDERS --> A_ORDER_DETAIL["/admin/orders/:id"]
        A_PROS --> A_PRO_DETAIL["/admin/pros/:id"]
        
        A_DASH --> A_COUPONS["/admin/coupons"]
        A_DASH --> A_ZONES["/admin/zones"]
        A_DASH --> A_SUPPORT["/admin/support"]
        A_DASH --> A_RISK["/admin/risk"]
        A_DASH --> A_FUNNEL["/admin/funnel"]
        A_DASH --> A_COHORTS["/admin/cohorts"]
        A_DASH --> A_MATCHING["/admin/matching-debug"]
        A_DASH --> A_QUOTES["/admin/quotes"]
        A_DASH --> A_SETTINGS["/admin/settings"]
        
        A_SUPPORT --> A_SUPPORT_DETAIL["/admin/support/:id"]
    end

    subgraph "🏢 Módulo Empresa"
        COMP_ONBOARD["/company/onboarding"] --> COMP_QUOTE["/company/request-quote"]
    end

    style ROOT fill:#10b981,color:#fff
    style C_HOME fill:#3b82f6,color:#fff
    style P_HOME fill:#8b5cf6,color:#fff
    style A_DASH fill:#ef4444,color:#fff
    style COMP_ONBOARD fill:#f59e0b,color:#fff
```

## Fluxo de Booking (Cliente)

```mermaid
flowchart LR
    A[🏠 Home] --> B[📋 Serviço]
    B --> C[📅 Agendamento]
    C --> D[📍 Localização]
    D --> E[🔄 Matching]
    E --> F[💰 Oferta]
    F --> G[💳 Checkout]
    G --> H[📦 Tracking]
    H --> I[⭐ Avaliação]
    I --> A

    style A fill:#3b82f6,color:#fff
    style G fill:#10b981,color:#fff
    style I fill:#f59e0b,color:#fff
```

## Fluxo de Trabalho (Profissional)

```mermaid
flowchart LR
    A[🏠 Home] --> B{Disponível?}
    B -->|Sim| C[📱 Pedido Recebido]
    B -->|Não| A
    C --> D{Aceitar?}
    D -->|Sim| E[📋 Detalhes]
    D -->|Não| A
    E --> F[🚗 A Caminho]
    F --> G[🧹 Em Andamento]
    G --> H[✅ Concluído]
    H --> I[💰 Ganhos]
    I --> A

    style A fill:#8b5cf6,color:#fff
    style H fill:#10b981,color:#fff
    style I fill:#f59e0b,color:#fff
```

## Fluxo Admin

```mermaid
flowchart TD
    A[📊 Dashboard] --> B[📦 Pedidos]
    A --> C[👥 Profissionais]
    A --> D[👤 Clientes]
    A --> E[📈 Analytics]
    
    B --> B1[Detalhe Pedido]
    B1 --> B2[Ações: Cancelar/Reembolsar]
    
    C --> C1[Detalhe Pro]
    C1 --> C2[Ações: Verificar/Suspender]
    
    E --> E1[Funil]
    E --> E2[Cohorts]
    E --> E3[Matching Debug]

    style A fill:#ef4444,color:#fff
```

## Hierarquia de Componentes

```mermaid
graph TD
    subgraph "Layout Components"
        APP[App.tsx] --> PROVIDERS[Providers]
        PROVIDERS --> ROUTER[BrowserRouter]
        ROUTER --> ROUTES[Routes]
    end

    subgraph "Navigation"
        ROUTES --> BOTTOM_NAV[BottomNav]
        ROUTES --> ADMIN_SIDEBAR[AdminSidebar]
    end

    subgraph "Shared UI"
        UI_LOGO[Logo]
        UI_BTN[PrimaryButton]
        UI_INPUT[InputField]
        UI_CARD[Card variants]
        UI_BADGE[StatusBadge]
    end

    subgraph "Feature Components"
        ORDER_CARD[OrderCard]
        SERVICE_CARD[ServiceCard]
        METRIC_CARD[MetricCard]
        PLAN_CARD[PlanCard]
    end

    BOTTOM_NAV --> UI_LOGO
    ORDER_CARD --> UI_BADGE
    SERVICE_CARD --> UI_CARD

    style APP fill:#3b82f6,color:#fff
    style UI_LOGO fill:#10b981,color:#fff
```

## Estados de Pedido

```mermaid
stateDiagram-v2
    [*] --> draft: Criado
    draft --> scheduled: Agendado
    scheduled --> matching: Buscando Pro
    matching --> confirmed: Pro Aceito
    confirmed --> en_route: Pro a Caminho
    en_route --> in_progress: Iniciado
    in_progress --> completed: Finalizado
    completed --> rated: Avaliado
    rated --> paid_out: Pago
    paid_out --> [*]
    
    matching --> cancelled: Sem Pro
    confirmed --> cancelled: Cancelado
    in_progress --> in_review: Disputa
    in_review --> completed: Resolvido
```

## Níveis de Acesso

```mermaid
pie title Distribuição de Rotas por Módulo
    "Cliente" : 17
    "Profissional" : 12
    "Admin" : 15
    "Auth" : 8
    "Empresa" : 2
```

---

*Documentação gerada automaticamente - JáLimpo v1.0.0*
