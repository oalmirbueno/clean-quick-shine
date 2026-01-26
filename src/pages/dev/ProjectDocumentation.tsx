import { Logo } from "@/components/ui/Logo";

// 3 Screenshots principais - um por módulo
import clientHomeScreen from "@/assets/screenshots/client-home.png";
import proHomeScreen from "@/assets/screenshots/pro-home.png";
import adminDashboardScreen from "@/assets/screenshots/admin-dashboard.png";

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
          <TOCItem number="2" title="Principais Telas" page="4" />
          <TOCItem number="3" title="Arquitetura do Sistema" page="5" />
          <TOCItem number="4" title="Módulo Cliente" page="6" />
          <TOCItem number="5" title="Módulo Profissional" page="8" />
          <TOCItem number="6" title="Módulo Administrativo" page="10" />
          <TOCItem number="7" title="Tecnologias" page="12" />
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

      {/* 2. Screenshots - 3 Main Screens */}
      <section className="page-break p-12">
        <SectionHeader number="2" title="Principais Telas do Sistema" />
        <p className="text-gray-700 mb-8">
          Visão geral das interfaces principais de cada módulo do aplicativo.
        </p>
        
        <div className="grid grid-cols-3 gap-6">
          {/* Client Module */}
          <div className="text-center">
            <div className="bg-emerald-50 rounded-2xl p-4 mb-4 border-2 border-emerald-200">
              <img 
                src={clientHomeScreen} 
                alt="Módulo Cliente - Home" 
                className="w-full h-auto rounded-xl shadow-lg mx-auto"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>
            <h3 className="font-bold text-xl text-emerald-700 mb-2">Módulo Cliente</h3>
            <p className="text-gray-600 text-sm">
              Dashboard principal do cliente com serviços disponíveis, 
              agendamentos e acesso rápido às funcionalidades.
            </p>
            <div className="mt-3 text-xs text-gray-400">
              11 telas • Fluxo de booking completo
            </div>
          </div>

          {/* Pro Module */}
          <div className="text-center">
            <div className="bg-purple-50 rounded-2xl p-4 mb-4 border-2 border-purple-200">
              <img 
                src={proHomeScreen} 
                alt="Módulo Profissional - Home" 
                className="w-full h-auto rounded-xl shadow-lg mx-auto"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>
            <h3 className="font-bold text-xl text-purple-700 mb-2">Módulo Profissional</h3>
            <p className="text-gray-600 text-sm">
              Dashboard do profissional com métricas de SLA, 
              ganhos, disponibilidade e pedidos disponíveis.
            </p>
            <div className="mt-3 text-xs text-gray-400">
              10 telas • Gestão de operação
            </div>
          </div>

          {/* Admin Module */}
          <div className="text-center">
            <div className="bg-orange-50 rounded-2xl p-4 mb-4 border-2 border-orange-200">
              <img 
                src={adminDashboardScreen} 
                alt="Módulo Admin - Dashboard" 
                className="w-full h-auto rounded-xl shadow-lg mx-auto"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>
            <h3 className="font-bold text-xl text-orange-700 mb-2">Módulo Admin</h3>
            <p className="text-gray-600 text-sm">
              Painel administrativo desktop com KPIs, 
              gestão de pedidos, usuários e analytics.
            </p>
            <div className="mt-3 text-xs text-gray-400">
              15 telas • Dashboard desktop
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
          📱 Screenshots representativos das interfaces principais do sistema
        </div>
      </section>

      {/* 3. System Architecture */}
      <section className="page-break p-12">
        <SectionHeader number="3" title="Arquitetura do Sistema" />
        
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

      {/* 4. Client Module */}
      <section className="page-break p-12">
        <SectionHeader number="4" title="Módulo Cliente" />
        
        <p className="text-gray-700 mb-6">
          Interface do cliente para descoberta, agendamento e gestão de serviços de limpeza.
        </p>

        <div className="space-y-4">
          <ScreenCard route="/client/home" name="Home" description="Dashboard com serviços disponíveis e próximos agendamentos" />
          <ScreenCard route="/client/service" name="Seleção de Serviço" description="Escolha do tipo de limpeza e personalização" />
          <ScreenCard route="/client/schedule" name="Agendamento" description="Seleção de data e horário disponíveis" />
          <ScreenCard route="/client/location" name="Endereço" description="Seleção ou cadastro de endereço para o serviço" />
          <ScreenCard route="/client/matching" name="Matching" description="Animação de busca por profissional disponível" />
          <ScreenCard route="/client/offer" name="Oferta" description="Visualização do profissional encontrado e detalhes" />
          <ScreenCard route="/client/checkout" name="Checkout" description="Resumo do pedido e pagamento" />
          <ScreenCard route="/client/order-tracking" name="Tracking" description="Acompanhamento em tempo real do serviço" />
          <ScreenCard route="/client/rating" name="Avaliação" description="Avaliação do serviço e profissional" />
          <ScreenCard route="/client/orders" name="Pedidos" description="Histórico de serviços contratados" />
          <ScreenCard route="/client/profile" name="Perfil" description="Dados pessoais e configurações" />
        </div>
      </section>

      {/* 5. Pro Module */}
      <section className="page-break p-12">
        <SectionHeader number="5" title="Módulo Profissional" />
        
        <p className="text-gray-700 mb-6">
          Interface do profissional para gerenciar disponibilidade, aceitar serviços e acompanhar ganhos.
        </p>

        <div className="space-y-4">
          <ScreenCard route="/pro/home" name="Home Pro" description="Dashboard com métricas SLA, ganhos e pedidos disponíveis" />
          <ScreenCard route="/pro/agenda" name="Agenda" description="Calendário com serviços agendados" />
          <ScreenCard route="/pro/earnings" name="Ganhos" description="Histórico de receitas e saldo disponível" />
          <ScreenCard route="/pro/ranking" name="Ranking" description="Métricas de qualidade e comparativo" />
          <ScreenCard route="/pro/profile" name="Perfil" description="Dados profissionais e documentos" />
          <ScreenCard route="/pro/verification" name="Verificação" description="Status de documentos e aprovação" />
          <ScreenCard route="/pro/plan" name="Planos" description="Assinaturas Elite, Pro e Free" />
          <ScreenCard route="/pro/withdraw" name="Saque" description="Solicitação de retirada via PIX" />
          <ScreenCard route="/pro/availability" name="Disponibilidade" description="Configuração de horários de trabalho" />
          <ScreenCard route="/pro/support" name="Suporte" description="Central de ajuda e tickets" />
        </div>
      </section>

      {/* 6. Admin Module */}
      <section className="page-break p-12">
        <SectionHeader number="6" title="Módulo Administrativo" />
        
        <p className="text-gray-700 mb-6">
          Painel desktop para gestão completa da plataforma.
        </p>

        <div className="space-y-4">
          <ScreenCard route="/admin/dashboard" name="Dashboard" description="KPIs, métricas e visão geral da operação" />
          <ScreenCard route="/admin/orders" name="Pedidos" description="Listagem e gestão de todos os pedidos" />
          <ScreenCard route="/admin/pros" name="Profissionais" description="Gestão de cadastros e aprovações" />
          <ScreenCard route="/admin/clients" name="Clientes" description="Base de clientes e histórico" />
          <ScreenCard route="/admin/coupons" name="Cupons" description="Criação e gestão de promoções" />
          <ScreenCard route="/admin/zones" name="Zonas" description="Áreas de atendimento e taxas" />
          <ScreenCard route="/admin/analytics" name="Analytics" description="Relatórios e métricas avançadas" />
          <ScreenCard route="/admin/funnel" name="Funil" description="Análise de conversão" />
          <ScreenCard route="/admin/cohorts" name="Cohorts" description="Análise de retenção" />
          <ScreenCard route="/admin/risk" name="Risco" description="Flags e ações preventivas" />
          <ScreenCard route="/admin/support" name="Suporte" description="Gestão de tickets" />
          <ScreenCard route="/admin/settings" name="Configurações" description="Parâmetros do sistema" />
        </div>
      </section>

      {/* 7. Technologies */}
      <section className="page-break p-12">
        <SectionHeader number="7" title="Tecnologias Utilizadas" />
        
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4 text-emerald-700">🎨 UI/UX</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Tailwind CSS para estilização</li>
              <li>• Shadcn/ui como base de componentes</li>
              <li>• Framer Motion para animações</li>
              <li>• Lucide React para ícones</li>
              <li>• Recharts para gráficos</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4 text-emerald-700">⚙️ Estado & Dados</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• TanStack Query para cache</li>
              <li>• React Context para auth</li>
              <li>• React Hook Form para formulários</li>
              <li>• Zod para validação</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4 text-emerald-700">🗄️ Backend</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• PostgreSQL (Supabase)</li>
              <li>• RLS para segurança</li>
              <li>• Realtime subscriptions</li>
              <li>• Edge Functions (Deno)</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4 text-emerald-700">🚀 Infraestrutura</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Lovable Cloud (hosting)</li>
              <li>• Vite (build tool)</li>
              <li>• TypeScript (type safety)</li>
              <li>• Git (versionamento)</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500">
          <p className="text-lg font-medium">JáLimpo © 2026</p>
          <p className="text-sm mt-2">Documento gerado automaticamente</p>
        </div>
      </section>
    </div>
  );
}

// Helper Components
function TOCItem({ number, title, page }: { number: string; title: string; page: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
      <span className="text-gray-700">
        <span className="font-semibold text-emerald-600 mr-3">{number}.</span>
        {title}
      </span>
      <span className="text-gray-400">{page}</span>
    </div>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-emerald-500">
      <span className="text-emerald-600">{number}.</span> {title}
    </h2>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <div className="text-gray-700">{children}</div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-emerald-50 rounded-xl p-6 text-center">
      <div className="text-4xl font-bold text-emerald-600">{value}</div>
      <div className="text-gray-600 mt-1">{label}</div>
    </div>
  );
}

function ModuleBox({ title, color }: { title: string; color: string }) {
  return (
    <div className={`${color} border-2 rounded-lg px-6 py-3 font-semibold text-gray-700`}>
      {title}
    </div>
  );
}

function ScreenCard({ route, name, description }: { route: string; name: string; description: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
      <code className="bg-gray-200 px-2 py-1 rounded text-sm font-mono text-gray-600 whitespace-nowrap">
        {route}
      </code>
      <div>
        <h4 className="font-semibold text-gray-900">{name}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}
