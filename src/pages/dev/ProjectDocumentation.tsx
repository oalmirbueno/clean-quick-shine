import { Logo } from "@/components/ui/Logo";

// Screenshot imports
import splashScreen from "@/assets/screenshots/splash.png";
import clientHomeScreen from "@/assets/screenshots/client-home.png";
import proHomeScreen from "@/assets/screenshots/pro-home.png";
import adminDashboardScreen from "@/assets/screenshots/admin-dashboard.png";
import loginScreen from "@/assets/screenshots/login.png";
import orderTrackingScreen from "@/assets/screenshots/order-tracking.png";
export default function ProjectDocumentation() {
  return (
    <div className="bg-white text-gray-900 min-h-screen print:bg-white">
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @page { margin: 1cm; size: A4; }
      `}</style>

      {/* Download Button */}
      <div className="no-print fixed top-4 right-4 z-50">
        <button
          onClick={() => window.print()}
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:opacity-90 transition"
        >
          📄 Baixar PDF (Ctrl+P)
        </button>
      </div>

      {/* Cover Page */}
      <section className="h-screen flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-emerald-50 to-teal-100 print:bg-gradient-to-br print:from-emerald-50 print:to-teal-100">
        <Logo size="lg" />
        <h1 className="text-5xl font-bold text-gray-900 mt-8 mb-4">JáLimpo</h1>
        <p className="text-2xl text-gray-600 mb-8">Documento de Especificação do Projeto</p>
        
        <div className="mt-12 text-gray-500">
          <p className="text-lg">Versão 2.0.0</p>
          <p className="text-lg">Janeiro 2026</p>
        </div>

        <div className="absolute bottom-12 text-gray-400 text-sm">
          <p>Documento para Aprovação</p>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="page-break p-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-emerald-500">
          Índice
        </h2>
        <nav className="space-y-3 text-lg">
          <TOCItem number="1" title="Visão Geral do Projeto" page="3" />
          <TOCItem number="2" title="Arquitetura do Sistema" page="4" />
          <TOCItem number="3" title="Módulo de Autenticação" page="5" />
          <TOCItem number="4" title="Módulo Cliente" page="6" />
          <TOCItem number="5" title="Módulo Profissional (Pro)" page="10" />
          <TOCItem number="6" title="Módulo Administrativo" page="14" />
          <TOCItem number="7" title="Módulo Empresa (B2B)" page="18" />
          <TOCItem number="8" title="Fluxos de Usuário" page="19" />
          <TOCItem number="9" title="Design System" page="20" />
          <TOCItem number="10" title="Tecnologias Utilizadas" page="21" />
        </nav>
      </section>

      {/* 1. Project Overview */}
      <section className="page-break p-12">
        <SectionHeader number="1" title="Visão Geral do Projeto" />
        
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700 mb-6">
            O <strong>JáLimpo</strong> é uma plataforma mobile-first para agendamento de serviços de limpeza, 
            conectando clientes a profissionais qualificados através de um sistema inteligente de matching.
          </p>

          <div className="grid grid-cols-2 gap-8 mt-8">
            <InfoCard title="🎯 Objetivo">
              Simplificar a contratação de serviços de limpeza residencial e comercial, 
              garantindo qualidade, segurança e conveniência para todos os usuários.
            </InfoCard>
            
            <InfoCard title="👥 Usuários-Alvo">
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Clientes residenciais e comerciais</li>
                <li>Profissionais de limpeza autônomos</li>
                <li>Empresas que necessitam de serviços recorrentes</li>
                <li>Administradores da plataforma</li>
              </ul>
            </InfoCard>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8">
            <StatCard value="54" label="Telas do App" />
            <StatCard value="4" label="Módulos Principais" />
            <StatCard value="20+" label="Componentes UI" />
          </div>
        </div>
      </section>

      {/* Screenshots Gallery */}
      <section className="page-break p-12">
        <SectionHeader number="1.1" title="Galeria de Telas" />
        
        <p className="text-gray-700 mb-8">
          Visão geral das principais interfaces do aplicativo nos três módulos: Cliente, Profissional e Administrativo.
        </p>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <ScreenshotCard 
            image={splashScreen} 
            title="Tela Inicial" 
            description="Splash screen com opções de login e cadastro"
          />
          <ScreenshotCard 
            image={loginScreen} 
            title="Login" 
            description="Autenticação de usuários"
          />
          <ScreenshotCard 
            image={clientHomeScreen} 
            title="Home Cliente" 
            description="Dashboard principal do cliente"
          />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <ScreenshotCard 
            image={proHomeScreen} 
            title="Home Pro" 
            description="Dashboard do profissional"
          />
          <ScreenshotCard 
            image={orderTrackingScreen} 
            title="Tracking" 
            description="Acompanhamento em tempo real"
          />
          <div className="flex items-center justify-center">
            <img 
              src={adminDashboardScreen} 
              alt="Admin Dashboard" 
              className="w-full rounded-xl shadow-lg border border-gray-200"
            />
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm mt-4">
          <p>* Mockups representativos do design final do aplicativo</p>
        </div>
      </section>

      {/* 2. System Architecture */}
      <section className="page-break p-12">
        <SectionHeader number="2" title="Arquitetura do Sistema" />
        
        <div className="bg-gray-50 rounded-xl p-8 mb-8">
          <h3 className="font-bold text-xl mb-4">Stack Tecnológico</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-emerald-700 mb-2">Frontend</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• React 18 + TypeScript</li>
                <li>• Vite (Build Tool)</li>
                <li>• Tailwind CSS</li>
                <li>• Framer Motion (Animações)</li>
                <li>• React Router DOM</li>
                <li>• TanStack Query (Data Fetching)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-emerald-700 mb-2">Backend (Lovable Cloud)</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Supabase (Database + Auth)</li>
                <li>• PostgreSQL</li>
                <li>• Row Level Security (RLS)</li>
                <li>• Realtime Subscriptions</li>
                <li>• Edge Functions</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-8">
          <h3 className="font-bold text-xl mb-4">Diagrama de Módulos</h3>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <ModuleBox title="Auth" color="bg-blue-100 border-blue-300" />
            <span className="text-2xl">→</span>
            <ModuleBox title="Cliente" color="bg-emerald-100 border-emerald-300" />
            <ModuleBox title="Pro" color="bg-purple-100 border-purple-300" />
            <ModuleBox title="Admin" color="bg-orange-100 border-orange-300" />
            <ModuleBox title="B2B" color="bg-pink-100 border-pink-300" />
          </div>
        </div>
      </section>

      {/* 3. Authentication Module */}
      <section className="page-break p-12">
        <SectionHeader number="3" title="Módulo de Autenticação" />
        
        <p className="text-gray-700 mb-6">
          Sistema de autenticação completo com suporte a múltiplos papéis de usuário.
        </p>

        <div className="space-y-6">
          <ScreenCard
            route="/"
            name="Splash / Landing"
            description="Tela inicial do app com logo animado e botões para Login/Cadastro"
            components={["Logo", "PrimaryButton", "Animação Framer Motion"]}
          />
          
          <ScreenCard
            route="/login"
            name="Login"
            description="Formulário de autenticação com email e senha, link para recuperação de senha"
            components={["InputField", "PrimaryButton", "Logo"]}
          />
          
          <ScreenCard
            route="/register"
            name="Cadastro"
            description="Formulário de registro com nome, email, telefone, senha e seleção de perfil (Cliente/Pro)"
            components={["InputField", "PrimaryButton", "Radio buttons"]}
          />
          
          <ScreenCard
            route="/forgot-password"
            name="Esqueci a Senha"
            description="Formulário para solicitar email de recuperação de senha"
            components={["InputField", "PrimaryButton"]}
          />
          
          <ScreenCard
            route="/reset-password"
            name="Redefinir Senha"
            description="Formulário para criar nova senha após clicar no link do email"
            components={["InputField", "PrimaryButton"]}
          />
          
          <ScreenCard
            route="/onboarding"
            name="Onboarding - Seleção"
            description="Tela para escolher tipo de perfil: Cliente ou Profissional"
            components={["Cards de seleção", "Ilustrações"]}
          />
          
          <ScreenCard
            route="/onboarding/client"
            name="Onboarding Cliente"
            description="Fluxo de configuração inicial para clientes (endereço padrão)"
            components={["Steps", "InputField", "MapMock"]}
          />
          
          <ScreenCard
            route="/onboarding/pro"
            name="Onboarding Profissional"
            description="Fluxo de configuração para profissionais (documentos, área de atuação)"
            components={["Steps", "File Upload", "Zone Selection"]}
          />
        </div>
      </section>

      {/* 4. Client Module */}
      <section className="page-break p-12">
        <SectionHeader number="4" title="Módulo Cliente" />
        
        <p className="text-gray-700 mb-6">
          Interface completa para clientes agendarem e gerenciarem serviços de limpeza.
          <strong> Total: 17 telas.</strong>
        </p>

        <div className="space-y-6">
          <ScreenCard
            route="/client/home"
            name="Home do Cliente"
            description="Dashboard principal com atalhos para serviços, próximo agendamento e histórico recente"
            components={["ServiceCard", "OrderCard", "BottomNav"]}
            features={["Grid de serviços", "Pedido ativo em destaque", "Acesso rápido ao histórico"]}
          />
          
          <ScreenCard
            route="/client/service"
            name="Seleção de Serviço"
            description="Grid de tipos de serviço disponíveis com ícones e preços base"
            components={["ServiceCard", "Header com back"]}
            features={["Residencial", "Limpeza Pesada", "Pós-Obra", "Comercial"]}
          />
          
          <ScreenCard
            route="/client/schedule"
            name="Agendamento"
            description="Calendário para seleção de data e grade horária disponível"
            components={["Calendar", "TimeSlots", "PrimaryButton"]}
          />
          
          <ScreenCard
            route="/client/location"
            name="Endereço"
            description="Seleção ou cadastro de endereço para o serviço"
            components={["AddressCard", "MapMock", "InputField"]}
          />
          
          <ScreenCard
            route="/client/matching"
            name="Matching"
            description="Tela de busca por profissional disponível com animação de loading"
            components={["Animação de busca", "Progress indicator"]}
          />
        </div>
      </section>

      {/* Client Module - Page 2 */}
      <section className="page-break p-12">
        <h3 className="text-xl font-bold text-gray-700 mb-6">Módulo Cliente (continuação)</h3>

        <div className="space-y-6">
          <ScreenCard
            route="/client/offer"
            name="Oferta"
            description="Apresentação do profissional encontrado com foto, avaliação e preço final"
            components={["ProCard", "MoneyBreakdown", "PrimaryButton"]}
            features={["Dados do profissional", "Breakdown de preço", "Aceitar/Recusar"]}
          />
          
          <ScreenCard
            route="/client/checkout"
            name="Checkout"
            description="Resumo do pedido com opção de cupom e seleção de método de pagamento"
            components={["CouponInput", "MoneyBreakdown", "PaymentMethods"]}
          />
          
          <ScreenCard
            route="/client/order-tracking"
            name="Acompanhamento"
            description="Tracking em tempo real do pedido com timeline de status"
            components={["TimelineStepper", "MapMock", "ProCard"]}
            features={["Status em tempo real", "Chat com Pro", "Localização"]}
          />
          
          <ScreenCard
            route="/client/rating"
            name="Avaliação"
            description="Formulário de avaliação do serviço com estrelas e comentário"
            components={["StarRating", "Textarea", "PrimaryButton"]}
          />
          
          <ScreenCard
            route="/client/orders"
            name="Meus Pedidos"
            description="Histórico de pedidos organizados por status (Ativos, Concluídos, Cancelados)"
            components={["Tabs", "OrderCard", "StatusBadge"]}
          />
          
          <ScreenCard
            route="/client/orders/:id"
            name="Detalhe do Pedido"
            description="Informações completas de um pedido específico"
            components={["TimelineStepper", "MoneyBreakdown", "ActionButtons"]}
          />
          
          <ScreenCard
            route="/client/profile"
            name="Perfil"
            description="Dados do usuário, endereços salvos, configurações e logout"
            components={["Avatar", "MenuItems", "Switch"]}
          />
          
          <ScreenCard
            route="/client/subscription"
            name="Assinatura"
            description="Planos de assinatura disponíveis para clientes recorrentes"
            components={["PlanCard", "SubscriptionCard"]}
          />
        </div>
      </section>

      {/* Client Module - Page 3 */}
      <section className="page-break p-12">
        <h3 className="text-xl font-bold text-gray-700 mb-6">Módulo Cliente (continuação)</h3>

        <div className="space-y-6">
          <ScreenCard
            route="/client/support"
            name="Suporte"
            description="Central de ajuda com FAQs e abertura de tickets"
            components={["Accordion", "TicketCard", "InputField"]}
          />
          
          <ScreenCard
            route="/client/cancel/:id"
            name="Cancelamento"
            description="Fluxo de cancelamento com seleção de motivo"
            components={["RadioGroup", "ConfirmModal"]}
          />
          
          <ScreenCard
            route="/client/referral"
            name="Indicação"
            description="Programa de indicação com código compartilhável e histórico"
            components={["ReferralCard", "ShareButtons"]}
          />
        </div>
      </section>

      {/* 5. Pro Module */}
      <section className="page-break p-12">
        <SectionHeader number="5" title="Módulo Profissional (Pro)" />
        
        <p className="text-gray-700 mb-6">
          Interface para profissionais gerenciarem sua operação na plataforma.
          <strong> Total: 12 telas.</strong>
        </p>

        <div className="space-y-6">
          <ScreenCard
            route="/pro/home"
            name="Home do Pro"
            description="Dashboard com toggle de disponibilidade, próximos serviços e métricas rápidas"
            components={["Switch (disponibilidade)", "OrderCard", "MetricCard", "BottomNav"]}
            features={["Online/Offline toggle", "Próximo serviço", "Ganhos do dia"]}
          />
          
          <ScreenCard
            route="/pro/order/:id"
            name="Detalhe do Serviço"
            description="Informações do serviço com dados do cliente, endereço e ações"
            components={["TimelineStepper", "MapMock", "ActionButtons"]}
            features={["Iniciar serviço", "Marcar concluído", "Chat com cliente"]}
          />
          
          <ScreenCard
            route="/pro/agenda"
            name="Agenda"
            description="Calendário com serviços agendados e visão semanal/mensal"
            components={["Calendar", "OrderCard", "Tabs"]}
          />
          
          <ScreenCard
            route="/pro/earnings"
            name="Ganhos"
            description="Dashboard financeiro com gráficos de receita e histórico de pagamentos"
            components={["MiniChart", "MoneyBreakdown", "MetricCard"]}
            features={["Gráfico de ganhos", "Filtro por período", "Detalhamento"]}
          />
          
          <ScreenCard
            route="/pro/ranking"
            name="Ranking"
            description="Posição do profissional no ranking e critérios de avaliação"
            components={["QualityBadge", "Progress", "MetricCard"]}
          />
        </div>
      </section>

      {/* Pro Module - Page 2 */}
      <section className="page-break p-12">
        <h3 className="text-xl font-bold text-gray-700 mb-6">Módulo Profissional (continuação)</h3>

        <div className="space-y-6">
          <ScreenCard
            route="/pro/profile"
            name="Perfil do Pro"
            description="Dados pessoais, documentos, área de atuação e configurações"
            components={["Avatar", "MenuItems", "StatusBadge (verificação)"]}
          />
          
          <ScreenCard
            route="/pro/verification"
            name="Verificação"
            description="Status de verificação de documentos e identidade"
            components={["CheckList", "FileUpload", "StatusBadge"]}
            features={["Upload de documentos", "Status de aprovação", "Prazo de análise"]}
          />
          
          <ScreenCard
            route="/pro/plan"
            name="Planos Pro"
            description="Planos de assinatura para profissionais (Free, Pro, Elite)"
            components={["PlanCard", "FeatureList", "PrimaryButton"]}
          />
          
          <ScreenCard
            route="/pro/withdraw"
            name="Saque"
            description="Solicitação de saque do saldo disponível"
            components={["InputField", "BankInfo", "ConfirmModal"]}
            features={["Saldo disponível", "Histórico de saques", "Dados bancários"]}
          />
          
          <ScreenCard
            route="/pro/quality"
            name="Qualidade"
            description="Métricas de SLA e indicadores de performance"
            components={["QualityBadge", "MetricCard", "Progress"]}
            features={["Taxa de aceitação", "Pontualidade", "Avaliação média"]}
          />
          
          <ScreenCard
            route="/pro/availability"
            name="Disponibilidade"
            description="Configuração de horários e dias disponíveis para trabalho"
            components={["WeekdaySelector", "TimeRangePicker"]}
          />
          
          <ScreenCard
            route="/pro/support"
            name="Suporte Pro"
            description="Central de ajuda específica para profissionais"
            components={["Accordion", "TicketCard"]}
          />
        </div>
      </section>

      {/* 6. Admin Module */}
      <section className="page-break p-12">
        <SectionHeader number="6" title="Módulo Administrativo" />
        
        <p className="text-gray-700 mb-6">
          Painel de controle para gestão da plataforma.
          <strong> Total: 15 telas.</strong>
        </p>

        <div className="space-y-6">
          <ScreenCard
            route="/admin/login"
            name="Login Admin"
            description="Autenticação separada para administradores"
            components={["InputField", "PrimaryButton", "Logo"]}
          />
          
          <ScreenCard
            route="/admin/dashboard"
            name="Dashboard"
            description="Visão geral com KPIs principais, gráficos e alertas"
            components={["MetricCard", "MiniChart", "AdminSidebar"]}
            features={["GMV", "Pedidos ativos", "Novos usuários", "Taxa de conversão"]}
          />
          
          <ScreenCard
            route="/admin/orders"
            name="Gestão de Pedidos"
            description="Lista de todos os pedidos com filtros e ações em massa"
            components={["AdminTable", "StatusBadge", "Filters"]}
          />
          
          <ScreenCard
            route="/admin/orders/:id"
            name="Detalhe do Pedido"
            description="Visão completa do pedido com histórico e ações administrativas"
            components={["TimelineStepper", "AdminActions", "AuditLog"]}
          />
          
          <ScreenCard
            route="/admin/pros"
            name="Gestão de Profissionais"
            description="Lista de profissionais com status de verificação e métricas"
            components={["AdminTable", "QualityBadge", "StatusBadge"]}
          />
        </div>
      </section>

      {/* Admin Module - Page 2 */}
      <section className="page-break p-12">
        <h3 className="text-xl font-bold text-gray-700 mb-6">Módulo Administrativo (continuação)</h3>

        <div className="space-y-6">
          <ScreenCard
            route="/admin/pros/:id"
            name="Detalhe do Pro"
            description="Perfil completo do profissional com histórico e ações"
            components={["ProProfile", "MetricCard", "OrderHistory"]}
          />
          
          <ScreenCard
            route="/admin/clients"
            name="Gestão de Clientes"
            description="Lista de clientes com histórico de pedidos e valor"
            components={["AdminTable", "Filters", "Export"]}
          />
          
          <ScreenCard
            route="/admin/coupons"
            name="Cupons"
            description="Criação e gestão de cupons de desconto"
            components={["AdminTable", "Modal de criação", "StatusBadge"]}
          />
          
          <ScreenCard
            route="/admin/support"
            name="Tickets de Suporte"
            description="Central de atendimento com todos os tickets"
            components={["TicketCard", "Filters", "PriorityBadge"]}
          />
          
          <ScreenCard
            route="/admin/support/:id"
            name="Detalhe do Ticket"
            description="Conversa do ticket com ações de resolução"
            components={["MessageThread", "ActionButtons"]}
          />
          
          <ScreenCard
            route="/admin/zones"
            name="Zonas de Atendimento"
            description="Configuração de zonas geográficas e taxas"
            components={["ZoneCard", "MapMock", "RuleEditor"]}
          />
          
          <ScreenCard
            route="/admin/analytics"
            name="Analytics"
            description="Relatórios e gráficos detalhados de performance"
            components={["Charts (Recharts)", "DateRangePicker", "Export"]}
          />
          
          <ScreenCard
            route="/admin/funnel"
            name="Funil de Conversão"
            description="Análise do funil de aquisição de clientes"
            components={["FunnelChart", "ConversionRates"]}
          />
          
          <ScreenCard
            route="/admin/risk"
            name="Gestão de Risco"
            description="Flags de risco e ações preventivas"
            components={["RiskFlags", "UserActions", "AlertBadge"]}
          />
          
          <ScreenCard
            route="/admin/settings"
            name="Configurações"
            description="Configurações gerais da plataforma"
            components={["Form", "Switch", "Tabs"]}
          />
        </div>
      </section>

      {/* 7. Company Module */}
      <section className="page-break p-12">
        <SectionHeader number="7" title="Módulo Empresa (B2B)" />
        
        <p className="text-gray-700 mb-6">
          Interface para empresas solicitarem orçamentos e contratos recorrentes.
          <strong> Total: 2 telas.</strong>
        </p>

        <div className="space-y-6">
          <ScreenCard
            route="/company/onboarding"
            name="Onboarding Empresa"
            description="Cadastro de empresa com CNPJ, contato e necessidades"
            components={["InputField (CNPJ)", "Steps", "PrimaryButton"]}
          />
          
          <ScreenCard
            route="/company/request-quote"
            name="Solicitar Orçamento"
            description="Formulário detalhado para solicitação de orçamento B2B"
            components={["Form", "ServiceSelector", "FrequencySelector"]}
            features={["Tipo de serviço", "Frequência", "Área em m²", "Especificidades"]}
          />
        </div>
      </section>

      {/* 8. User Flows */}
      <section className="page-break p-12">
        <SectionHeader number="8" title="Fluxos de Usuário" />

        <div className="space-y-8">
          <FlowDiagram
            title="🛒 Jornada de Compra (Cliente)"
            steps={[
              "Home",
              "Serviço",
              "Agenda",
              "Endereço",
              "Matching",
              "Oferta",
              "Checkout",
              "Tracking",
              "Avaliação"
            ]}
          />

          <FlowDiagram
            title="👷 Jornada do Profissional"
            steps={[
              "Cadastro",
              "Onboarding",
              "Verificação",
              "Aprovação",
              "Ficar Online",
              "Receber Pedido",
              "Executar",
              "Concluir",
              "Receber"
            ]}
          />

          <FlowDiagram
            title="🔐 Fluxo de Autenticação"
            steps={[
              "Splash",
              "Login/Cadastro",
              "Verificar Email",
              "Onboarding",
              "Home (por role)"
            ]}
          />
        </div>
      </section>

      {/* 9. Design System */}
      <section className="page-break p-12">
        <SectionHeader number="9" title="Design System" />

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4">🎨 Cores Principais</h3>
            <div className="space-y-3">
              <ColorSwatch name="Primary (Emerald)" color="#10b981" />
              <ColorSwatch name="Secondary" color="#f3f4f6" />
              <ColorSwatch name="Success" color="#22c55e" />
              <ColorSwatch name="Warning" color="#f59e0b" />
              <ColorSwatch name="Destructive" color="#ef4444" />
              <ColorSwatch name="Background" color="#fafafa" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4">🔤 Tipografia</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Font Family</p>
                <p className="font-semibold">Inter, system-ui, sans-serif</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Headings</p>
                <p className="text-2xl font-bold">Bold (700)</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Body</p>
                <p className="text-base">Regular (400)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4">🧩 Componentes Principais</h3>
          <div className="grid grid-cols-3 gap-4">
            <ComponentItem name="Logo" desc="Marca do app" />
            <ComponentItem name="PrimaryButton" desc="Ação principal" />
            <ComponentItem name="InputField" desc="Campos de formulário" />
            <ComponentItem name="ServiceCard" desc="Seleção de serviço" />
            <ComponentItem name="OrderCard" desc="Card de pedido" />
            <ComponentItem name="StatusBadge" desc="Status visual" />
            <ComponentItem name="BottomNav" desc="Navegação mobile" />
            <ComponentItem name="MetricCard" desc="KPIs e métricas" />
            <ComponentItem name="TimelineStepper" desc="Progresso de pedido" />
          </div>
        </div>
      </section>

      {/* 10. Technologies */}
      <section className="page-break p-12">
        <SectionHeader number="10" title="Tecnologias Utilizadas" />

        <div className="grid grid-cols-2 gap-8">
          <TechCategory
            title="Frontend"
            items={[
              { name: "React 18", desc: "Biblioteca de UI" },
              { name: "TypeScript", desc: "Tipagem estática" },
              { name: "Vite", desc: "Build tool rápido" },
              { name: "Tailwind CSS", desc: "Utility-first CSS" },
              { name: "Framer Motion", desc: "Animações fluidas" },
              { name: "React Router", desc: "Roteamento SPA" },
              { name: "TanStack Query", desc: "Server state management" },
              { name: "Recharts", desc: "Gráficos e visualizações" },
            ]}
          />

          <TechCategory
            title="Backend & Infraestrutura"
            items={[
              { name: "Lovable Cloud", desc: "Plataforma integrada" },
              { name: "PostgreSQL", desc: "Banco de dados relacional" },
              { name: "Supabase Auth", desc: "Autenticação" },
              { name: "Row Level Security", desc: "Segurança por linha" },
              { name: "Realtime", desc: "Atualizações em tempo real" },
              { name: "Edge Functions", desc: "Serverless functions" },
            ]}
          />
        </div>

        <div className="mt-8 bg-emerald-50 rounded-xl p-6 border border-emerald-200">
          <h3 className="font-bold text-lg mb-2 text-emerald-800">✅ Recursos Implementados</h3>
          <ul className="grid grid-cols-2 gap-2 text-gray-700">
            <li>• Autenticação multi-role</li>
            <li>• Sistema de matching inteligente</li>
            <li>• Tracking em tempo real</li>
            <li>• Dashboard administrativo</li>
            <li>• Sistema de avaliação</li>
            <li>• Gestão de cupons</li>
            <li>• Zonas de atendimento</li>
            <li>• Métricas de qualidade (SLA)</li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <section className="p-12 bg-gray-100 text-center">
        <Logo size="sm" />
        <p className="text-gray-600 mt-4">
          Documento gerado em {new Date().toLocaleDateString('pt-BR')}
        </p>
        <p className="text-gray-400 text-sm mt-2">
          JáLimpo © 2026 - Todos os direitos reservados
        </p>
      </section>
    </div>
  );
}

// Helper Components
function TOCItem({ number, title, page }: { number: string; title: string; page: string }) {
  return (
    <div className="flex items-center">
      <span className="font-mono text-gray-400 w-8">{number}.</span>
      <span className="flex-1">{title}</span>
      <span className="text-gray-400 border-b border-dotted border-gray-300 flex-1 mx-4" />
      <span className="text-gray-400">{page}</span>
    </div>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-8">
      <span className="text-emerald-600 font-mono text-sm">Seção {number}</span>
      <h2 className="text-3xl font-bold text-gray-900 pb-4 border-b-2 border-emerald-500">
        {title}
      </h2>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <div className="text-gray-700">{children}</div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-emerald-50 rounded-xl p-6 text-center border border-emerald-200">
      <p className="text-4xl font-bold text-emerald-700">{value}</p>
      <p className="text-gray-600 mt-1">{label}</p>
    </div>
  );
}

function ModuleBox({ title, color }: { title: string; color: string }) {
  return (
    <div className={`px-6 py-4 rounded-lg border-2 font-semibold ${color}`}>
      {title}
    </div>
  );
}

function ScreenshotCard({ image, title, description }: { image: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="bg-gray-100 rounded-xl p-2 mb-2">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-auto rounded-lg shadow-md"
          style={{ maxHeight: '300px', objectFit: 'contain' }}
        />
      </div>
      <h4 className="font-semibold text-gray-900">{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

function ScreenCard({
  route, 
  name, 
  description, 
  components, 
  features 
}: { 
  route: string; 
  name: string; 
  description: string; 
  components: string[];
  features?: string[];
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-lg text-gray-900">{name}</h4>
        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{route}</code>
      </div>
      <p className="text-gray-700 mb-3">{description}</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {components.map((comp) => (
          <span key={comp} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
            {comp}
          </span>
        ))}
      </div>
      {features && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">Funcionalidades: {features.join(" • ")}</p>
        </div>
      )}
    </div>
  );
}

function FlowDiagram({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="font-bold text-lg mb-4">{title}</h3>
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center">
            <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-medium text-sm">
              {step}
            </div>
            {i < steps.length - 1 && (
              <span className="text-gray-400 mx-1">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ColorSwatch({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div 
        className="w-8 h-8 rounded-lg border border-gray-200" 
        style={{ backgroundColor: color }} 
      />
      <span className="text-sm">{name}</span>
      <code className="text-xs text-gray-400">{color}</code>
    </div>
  );
}

function ComponentItem({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200">
      <p className="font-mono text-sm font-semibold text-emerald-700">{name}</p>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  );
}

function TechCategory({ title, items }: { title: string; items: { name: string; desc: string }[] }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="font-bold text-lg mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.name} className="flex justify-between items-center">
            <span className="font-medium">{item.name}</span>
            <span className="text-gray-500 text-sm">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
