# 📱 JáLimpo - Documentação Visual das Telas

> Documentação completa de todas as telas do aplicativo, incluindo componentes, fluxos e integrações.

---

## 🎨 Design System

### Cores Principais
| Token | Uso |
|-------|-----|
| `primary` | Ações principais, CTAs, links |
| `secondary` | Backgrounds secundários |
| `accent` | Destaques sutis |
| `success` | Confirmações, ganhos |
| `warning` | Alertas, planos Elite |
| `destructive` | Erros, cancelamentos |
| `muted-foreground` | Texto secundário |

### Componentes Base
- **Logo** - `src/components/ui/Logo.tsx`
- **PrimaryButton** - `src/components/ui/PrimaryButton.tsx`
- **InputField** - `src/components/ui/InputField.tsx`
- **BottomNav** - `src/components/ui/BottomNav.tsx`
- **PageTransition** - `src/components/ui/PageTransition.tsx`
- **AuthLoading** - `src/components/ui/AuthLoading.tsx`

---

## 🔓 Módulo de Autenticação

### 1. Splash / Onboarding
**Rota:** `/onboarding`
**Arquivo:** `src/pages/Onboarding.tsx`

| Componente | Descrição |
|------------|-----------|
| Logo (full) | Logo completa centralizada |
| Botão "Quero contratar" | Navega para onboarding cliente |
| Botão "Quero trabalhar" | Navega para onboarding pro |
| Link "Entrar" | Navega para login |

**Fluxo:** Splash → Seleção de perfil → Login/Cadastro

---

### 2. Login
**Rota:** `/login`
**Arquivo:** `src/pages/Login.tsx`

#### Tela 1 - Seleção de Tipo
| Componente | Descrição |
|------------|-----------|
| Logo (lg) | Logo grande centralizada |
| Card "Sou Cliente" | Ícone User + descrição |
| Card "Sou Diarista" | Ícone Briefcase + descrição |
| Link "Cadastre-se" | Navega para registro |

#### Tela 2 - Formulário
| Componente | Descrição |
|------------|-----------|
| InputField Email | Campo de email |
| InputField Senha | Campo de senha |
| Link "Esqueceu a senha?" | Navega para recuperação |
| PrimaryButton "Entrar" | Submete login |
| Link "Cadastre-se" | Navega para registro |

**Integrações:** 
- `useAuth()` - AuthContext
- `supabase.auth.signInWithPassword()`
- Toast notifications (sonner)

---

### 3. Cadastro
**Rota:** `/register`
**Arquivo:** `src/pages/Register.tsx`

| Componente | Descrição |
|------------|-----------|
| Seleção Cliente/Pro | Cards de escolha |
| InputField Nome | Nome completo |
| InputField Email | Email |
| InputField Telefone | Telefone |
| InputField Senha | Senha |
| PrimaryButton | Criar conta |

**Integrações:**
- `useAuth().signUp()`
- Inserção em `profiles` e `user_roles`

---

### 4. Recuperação de Senha
**Rota:** `/forgot-password`
**Arquivo:** `src/pages/ForgotPassword.tsx`

| Componente | Descrição |
|------------|-----------|
| Logo | Logo média |
| Título + descrição | Instruções |
| InputField Email | Campo com ícone Mail |
| PrimaryButton | Enviar link |
| Link "Fazer login" | Volta ao login |

**Estados:**
- `sent: false` - Formulário
- `sent: true` - Confirmação com CheckCircle

**Integrações:**
- `supabase.auth.resetPasswordForEmail()`

---

### 5. Redefinir Senha
**Rota:** `/reset-password`
**Arquivo:** `src/pages/ResetPassword.tsx`

| Componente | Descrição |
|------------|-----------|
| InputField Nova Senha | Com toggle de visibilidade |
| InputField Confirmar | Com toggle de visibilidade |
| PrimaryButton | Redefinir |

**Integrações:**
- `supabase.auth.updateUser()`

---

## 👤 Módulo Cliente

### 6. Client Home
**Rota:** `/client/home`
**Arquivo:** `src/pages/client/ClientHome.tsx`

| Seção | Componentes |
|-------|-------------|
| **Header** | Logo (iconOnly), Avatar com inicial |
| **Busca** | Input com ícone Search |
| **Serviços** | Grid 2x2 de ServiceCard |
| **Sugestões** | Scroll horizontal de chips |
| **Banner** | Card de próximo agendamento |
| **Nav** | BottomNav variant="client" |

**ServiceCard Options:**
- Residencial (Home icon)
- Pesada (Sparkles icon)
- Pós-Obra (HardHat icon)
- Comercial (Building2 icon)

**Integrações:**
- `useQuery` para profile
- Navegação para `/client/service`

---

### 7. Client Orders
**Rota:** `/client/orders`
**Arquivo:** `src/pages/client/ClientOrders.tsx`

| Seção | Componentes |
|-------|-------------|
| **Header** | Título + indicador "Ao vivo" |
| **Tabs** | Próximos / Concluídos |
| **Lista** | OrderCard para cada pedido |
| **Empty State** | Ícone + CTA |
| **Nav** | BottomNav |

**OrderCard Props:**
- id, service, date, time
- address, status, price
- onClick handler

**Integrações:**
- `useClientOrders()` hook
- `useClientOrdersRealtime()` realtime
- Status filtering

---

### 8. Client Profile
**Rota:** `/client/profile`
**Arquivo:** `src/pages/client/ClientProfile.tsx`

| Seção | Componentes |
|-------|-------------|
| **Header** | Avatar grande + nome + email |
| **Menu** | Lista de opções com ChevronRight |
| **Logout** | Botão destrutivo |
| **Versão** | v1.0.0 |

**Menu Items:**
- Endereços salvos → `/client/location`
- Formas de pagamento
- Preferências
- Ajuda e suporte → `/client/support`

---

## 💼 Módulo Profissional (Pro)

### 9. Pro Home
**Rota:** `/pro/home`
**Arquivo:** `src/pages/pro/ProHome.tsx`

| Seção | Componentes |
|-------|-------------|
| **Header** | Logo, Badge plano, Bell, Avatar |
| **Greeting** | "Olá, [nome]" + QualityBadge |
| **Disponibilidade** | Toggle ON/OFF com Radio icon |
| **Mapa** | MapMock (toggle) |
| **Saldo** | Card primário com valor |
| **Ações Rápidas** | Grid 4x1 (SLA, Agenda, Ranking, Planos) |
| **Qualidade SLA** | Métricas em 3 colunas |
| **Upgrade Banner** | Pro/Elite CTA |
| **Pedidos** | Lista de OrderCards disponíveis |
| **Nav** | BottomNav variant="pro" |

**Estados de Disponibilidade:**
- `available_now: true` → Verde, pulsando
- `available_now: false` → Cinza, offline

**Badges de Plano:**
- `free` → Sem badge
- `pro` → Badge azul "PRO"
- `elite` → Badge dourado "ELITE"

**Integrações:**
- `useCurrentProData()` hook
- `useAvailableOrdersForPro()` hook
- `useToggleProAvailability()` mutation
- `useAcceptOrder()` / `useDeclineOrder()`

---

### 10. Pro Earnings
**Rota:** `/pro/earnings`
**Arquivo:** `src/pages/pro/ProEarnings.tsx`

| Seção | Componentes |
|-------|-------------|
| **Saldo** | Card primário + botão saque |
| **Período** | Tabs Semana/Mês |
| **Gráfico** | Barras por dia da semana |
| **Histórico** | Lista de transações |
| **Nav** | BottomNav |

**Transaction Item:**
- Ícone Calendar
- Nome do serviço + data
- Valor + status (Pago/Disponível/Pendente)

**Integrações:**
- `useProEarnings()` hook

---

### 11. Pro Quality (SLA)
**Rota:** `/pro/quality`
**Arquivo:** `src/pages/pro/ProQuality.tsx`

| Métrica | Descrição |
|---------|-----------|
| Pontualidade | % de chegadas no horário |
| Tempo Resposta | Média em minutos |
| Cancelamentos | % de cancelamentos |
| Nível Qualidade | A/B/C/D badge |

---

## 🛡️ Módulo Admin

### 12. Admin Dashboard
**Rota:** `/admin/dashboard`
**Arquivo:** `src/pages/admin/AdminDashboard.tsx`

| Seção | Componentes |
|-------|-------------|
| **Sidebar** | AdminSidebar (desktop) |
| **Metrics Row 1** | 4x MetricCard |
| **Metrics Row 2** | 4x MetricCard |
| **Charts** | 2x MiniChart (Pedidos/Receita) |
| **Pedidos Recentes** | Lista simples |

**MetricCards:**
- Pedidos hoje (+ trend)
- Pedidos no mês
- GMV Total
- Receita (Comissões)
- Ticket Médio
- Taxa Cancelamento
- Novas Diaristas (7d)
- Clientes Ativos

---

### 13. Admin Orders
**Rota:** `/admin/orders`
**Arquivo:** `src/pages/admin/AdminOrders.tsx`

| Componente | Descrição |
|------------|-----------|
| Filtros | Status, período, busca |
| AdminTable | Tabela com todas as colunas |
| StatusBadge | Badge colorido por status |
| Ações | Ver detalhes |

---

### 14. Admin Pros
**Rota:** `/admin/pros`
**Arquivo:** `src/pages/admin/AdminPros.tsx`

| Coluna | Dados |
|--------|-------|
| Nome | Avatar + nome |
| Rating | Estrelas |
| Jobs | Quantidade concluídos |
| Status | Verificado/Pendente |
| Plano | Free/Pro/Elite |
| Ações | Ver perfil |

---

## 🧩 Componentes Reutilizáveis

### Cards
| Componente | Uso |
|------------|-----|
| `ServiceCard` | Seleção de serviço (Home) |
| `OrderCard` | Item de pedido |
| `PlanCard` | Plano de assinatura |
| `MetricCard` | Métrica do dashboard |
| `TicketCard` | Ticket de suporte |
| `ZoneCard` | Zona de atendimento |

### Badges
| Componente | Uso |
|------------|-----|
| `StatusBadge` | Status de pedido |
| `QualityBadge` | Nível A/B/C/D |
| Badge de Plano | PRO/ELITE inline |

### Navegação
| Componente | Uso |
|------------|-----|
| `BottomNav` | Navegação mobile (client/pro) |
| `AdminSidebar` | Menu lateral admin |
| `NavLink` | Link com active state |

### Formulários
| Componente | Uso |
|------------|-----|
| `InputField` | Input com label |
| `CouponInput` | Campo de cupom |
| `Select` | Dropdown (shadcn) |
| `Checkbox` | Toggle item |

### Feedback
| Componente | Uso |
|------------|-----|
| `AuthLoading` | Loading com logo animada |
| `ConfirmModal` | Modal de confirmação |
| `Toast` | Notificações (sonner) |

### Visualização
| Componente | Uso |
|------------|-----|
| `MiniChart` | Gráfico de barras simples |
| `MapMock` | Mapa placeholder |
| `TimelineStepper` | Timeline de status |
| `MoneyBreakdown` | Detalhamento de valores |

---

## 🔄 Fluxos Principais

### Fluxo de Booking (Cliente)
```
Home → Service → Schedule → Location → Matching → Offer → Checkout → Tracking → Rating
```

### Fluxo de Trabalho (Pro)
```
Home (toggle ON) → Pedido disponível → Accept → Order Detail → Start → Complete → Earnings
```

### Fluxo de Gestão (Admin)
```
Dashboard → Orders/Pros/Clients → Detail → Actions (approve/reject/edit)
```

---

## 📊 Integrações com Supabase

### Tabelas Principais
- `profiles` - Dados do usuário
- `user_roles` - Papéis (client/pro/admin)
- `orders` - Pedidos
- `services` - Tipos de serviço
- `addresses` - Endereços
- `pro_profiles` - Perfil do profissional
- `pro_metrics` - Métricas SLA
- `pro_plans` / `client_plans` - Planos de assinatura

### Hooks Personalizados
| Hook | Função |
|------|--------|
| `useAuth()` | Contexto de autenticação |
| `useOrders()` | CRUD de pedidos |
| `useClientOrders()` | Pedidos do cliente |
| `useProData()` | Dados do profissional |
| `useProEarnings()` | Ganhos do pro |
| `useProMetrics()` | Métricas SLA |
| `useServices()` | Lista de serviços |
| `useAddresses()` | Endereços do usuário |

### Realtime
- `useClientOrdersRealtime()` - Updates de pedidos
- `useOrderRealtime()` - Status individual

---

## 📱 Responsividade

### Breakpoints
- **Mobile:** < 768px (default)
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

### Layout por Dispositivo

| Página | Mobile | Desktop |
|--------|--------|---------|
| Client/Pro | BottomNav | BottomNav |
| Admin | Header hamburger | Sidebar fixa |

---

## 🎬 Animações

### PageTransition
- `fade-in` + `slide-up` na entrada
- `fade-out` + `slide-down` na saída
- Duração: 300ms

### AuthLoading
- Logo com `bounce` 1s
- Ring `ping` 1.5s
- Ring `pulse` 2s
- Dots `bounce` 0.6s escalonado

### Interações
- Cards: `hover:scale-[0.98]` no click
- Buttons: `hover:opacity-90`
- Shadows: `card-shadow` → `card-shadow-hover`

---

*Documentação gerada automaticamente - JáLimpo v1.0.0*
