import { Logo } from "@/components/ui/Logo";
import { FileText, Download, Layers, Users, Settings, Database, Zap, Shield } from "lucide-react";

// 3 Screenshots principais - um por módulo
import clientHomeScreen from "@/assets/screenshots/client-home.png";
import proHomeScreen from "@/assets/screenshots/pro-home.png";
import adminDashboardScreen from "@/assets/screenshots/admin-dashboard.png";

export default function ProjectDocumentation() {
  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="bg-background text-foreground min-h-screen print:bg-white safe-top">
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
      <div className="no-print fixed top-6 right-6 z-50">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>

      {/* Cover Page */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-background to-muted/30">
        <div className="mb-8">
          <Logo size="lg" />
        </div>
        <h1 className="text-6xl font-bold tracking-tight mb-4">JáLimpo</h1>
        <p className="text-xl text-muted-foreground mb-2">Documento de Especificação Técnica</p>
        
        <div className="flex items-center gap-4 mt-12 text-sm text-muted-foreground">
          <span className="px-3 py-1 bg-muted rounded-full">v2.0.0</span>
          <span>Janeiro 2026</span>
        </div>

        <div className="absolute bottom-12 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Role para navegar</span>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="page-break py-20 px-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <FileText className="w-6 h-6 text-primary" />
          <h2 className="text-3xl font-bold">Índice</h2>
        </div>
        
        <nav className="space-y-1">
          <TOCItem number="01" title="Visão Geral" />
          <TOCItem number="02" title="Interfaces Principais" />
          <TOCItem number="03" title="Arquitetura" />
          <TOCItem number="04" title="Módulo Cliente" />
          <TOCItem number="05" title="Módulo Profissional" />
          <TOCItem number="06" title="Módulo Administrativo" />
          <TOCItem number="07" title="Stack Tecnológico" />
        </nav>
      </section>

      {/* 1. Project Overview */}
      <section className="page-break py-20 px-8 max-w-5xl mx-auto">
        <SectionHeader number="01" title="Visão Geral" />
        
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
          Plataforma mobile-first para agendamento de serviços de limpeza, conectando clientes a profissionais qualificados através de matching inteligente.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-muted/50 border border-border">
            <h3 className="font-semibold text-lg mb-3">Objetivo</h3>
            <p className="text-muted-foreground">
              Simplificar a contratação de serviços de limpeza residencial e comercial com qualidade, segurança e conveniência.
            </p>
          </div>
          
          <div className="p-6 rounded-2xl bg-muted/50 border border-border">
            <h3 className="font-semibold text-lg mb-3">Público-Alvo</h3>
            <ul className="space-y-1.5 text-muted-foreground">
              <li>Clientes residenciais e comerciais</li>
              <li>Profissionais de limpeza autônomos</li>
              <li>Empresas com demanda recorrente</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard value="54" label="Telas" />
          <StatCard value="4" label="Módulos" />
          <StatCard value="20+" label="Componentes" />
        </div>
      </section>

      {/* 2. Screenshots - 3 Main Screens */}
      <section className="page-break py-20 px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <SectionHeader number="02" title="Interfaces Principais" />
          <p className="text-muted-foreground mb-12 max-w-2xl">
            Visão geral das interfaces de cada módulo do sistema.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <ScreenshotModule 
              image={clientHomeScreen}
              title="Cliente"
              description="Agendamento de serviços, tracking e histórico"
              screens={11}
              color="primary"
            />
            <ScreenshotModule 
              image={proHomeScreen}
              title="Profissional"
              description="Gestão de agenda, ganhos e métricas SLA"
              screens={10}
              color="primary"
            />
            <ScreenshotModule 
              image={adminDashboardScreen}
              title="Administrativo"
              description="Dashboard, analytics e gestão da plataforma"
              screens={15}
              color="primary"
            />
          </div>
        </div>
      </section>

      {/* 3. System Architecture */}
      <section className="page-break py-20 px-8 max-w-5xl mx-auto">
        <SectionHeader number="03" title="Arquitetura" />
        
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Frontend</h3>
            </div>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>React 18 + TypeScript</li>
              <li>Vite Build Tool</li>
              <li>Tailwind CSS</li>
              <li>Framer Motion</li>
              <li>TanStack Query</li>
            </ul>
          </div>
          
          <div className="p-6 rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Backend</h3>
            </div>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>PostgreSQL Database</li>
              <li>Row Level Security</li>
              <li>Realtime Subscriptions</li>
              <li>Edge Functions</li>
            </ul>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-muted/50 border border-border">
          <h3 className="font-semibold mb-6 text-center">Fluxo de Módulos</h3>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <ModuleChip label="Auth" />
            <span className="text-muted-foreground">→</span>
            <ModuleChip label="Cliente" active />
            <ModuleChip label="Pro" active />
            <ModuleChip label="Admin" active />
            <ModuleChip label="B2B" />
          </div>
        </div>
      </section>

      {/* 4. Client Module */}
      <section className="page-break py-20 px-8 max-w-5xl mx-auto">
        <SectionHeader number="04" title="Módulo Cliente" />
        <p className="text-muted-foreground mb-8">
          Fluxo completo de descoberta, agendamento e gestão de serviços.
        </p>

        <div className="grid gap-2">
          <RouteCard route="/client/home" name="Home" description="Dashboard com serviços e agendamentos" />
          <RouteCard route="/client/service" name="Serviço" description="Seleção e personalização do serviço" />
          <RouteCard route="/client/schedule" name="Agenda" description="Data e horário disponíveis" />
          <RouteCard route="/client/location" name="Endereço" description="Seleção do local" />
          <RouteCard route="/client/matching" name="Matching" description="Busca por profissional" />
          <RouteCard route="/client/offer" name="Oferta" description="Profissional encontrado" />
          <RouteCard route="/client/checkout" name="Checkout" description="Pagamento" />
          <RouteCard route="/client/order-tracking" name="Tracking" description="Acompanhamento real-time" />
          <RouteCard route="/client/rating" name="Avaliação" description="Feedback do serviço" />
          <RouteCard route="/client/orders" name="Pedidos" description="Histórico completo" />
          <RouteCard route="/client/profile" name="Perfil" description="Dados e configurações" />
        </div>
      </section>

      {/* 5. Pro Module */}
      <section className="page-break py-20 px-8 max-w-5xl mx-auto">
        <SectionHeader number="05" title="Módulo Profissional" />
        <p className="text-muted-foreground mb-8">
          Gestão de disponibilidade, serviços e finanças do profissional.
        </p>

        <div className="grid gap-2">
          <RouteCard route="/pro/home" name="Home" description="Dashboard com métricas e pedidos" />
          <RouteCard route="/pro/agenda" name="Agenda" description="Serviços agendados" />
          <RouteCard route="/pro/earnings" name="Ganhos" description="Receitas e histórico" />
          <RouteCard route="/pro/ranking" name="Ranking" description="Métricas SLA" />
          <RouteCard route="/pro/profile" name="Perfil" description="Dados profissionais" />
          <RouteCard route="/pro/verification" name="Verificação" description="Documentos" />
          <RouteCard route="/pro/plan" name="Planos" description="Assinaturas" />
          <RouteCard route="/pro/withdraw" name="Saque" description="Retirada via PIX" />
          <RouteCard route="/pro/availability" name="Disponibilidade" description="Horários de trabalho" />
          <RouteCard route="/pro/support" name="Suporte" description="Central de ajuda" />
        </div>
      </section>

      {/* 6. Admin Module */}
      <section className="page-break py-20 px-8 max-w-5xl mx-auto">
        <SectionHeader number="06" title="Módulo Administrativo" />
        <p className="text-muted-foreground mb-8">
          Painel desktop para gestão completa da plataforma.
        </p>

        <div className="grid md:grid-cols-2 gap-2">
          <RouteCard route="/admin/dashboard" name="Dashboard" description="KPIs e métricas" />
          <RouteCard route="/admin/orders" name="Pedidos" description="Gestão de pedidos" />
          <RouteCard route="/admin/pros" name="Profissionais" description="Cadastros e aprovações" />
          <RouteCard route="/admin/clients" name="Clientes" description="Base de clientes" />
          <RouteCard route="/admin/coupons" name="Cupons" description="Promoções" />
          <RouteCard route="/admin/zones" name="Zonas" description="Áreas de atendimento" />
          <RouteCard route="/admin/analytics" name="Analytics" description="Relatórios" />
          <RouteCard route="/admin/funnel" name="Funil" description="Conversão" />
          <RouteCard route="/admin/cohorts" name="Cohorts" description="Retenção" />
          <RouteCard route="/admin/risk" name="Risco" description="Prevenção" />
          <RouteCard route="/admin/support" name="Suporte" description="Tickets" />
          <RouteCard route="/admin/settings" name="Config" description="Parâmetros" />
        </div>
      </section>

      {/* 7. Technologies */}
      <section className="page-break py-20 px-8 max-w-5xl mx-auto">
        <SectionHeader number="07" title="Stack Tecnológico" />
        
        <div className="grid md:grid-cols-2 gap-4">
          <TechCard 
            icon={<Layers className="w-5 h-5" />}
            title="UI/UX"
            items={["Tailwind CSS", "Shadcn/ui", "Framer Motion", "Lucide Icons", "Recharts"]}
          />
          <TechCard 
            icon={<Zap className="w-5 h-5" />}
            title="Estado"
            items={["TanStack Query", "React Context", "React Hook Form", "Zod"]}
          />
          <TechCard 
            icon={<Database className="w-5 h-5" />}
            title="Backend"
            items={["PostgreSQL", "RLS Policies", "Realtime", "Edge Functions"]}
          />
          <TechCard 
            icon={<Shield className="w-5 h-5" />}
            title="Infra"
            items={["Lovable Cloud", "Vite", "TypeScript", "Git"]}
          />
        </div>

        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            JáLimpo · 2026 · Documento gerado automaticamente
          </p>
        </div>
      </section>
    </div>
  );
}

// Helper Components
function TOCItem({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border/50 group hover:bg-muted/50 px-4 -mx-4 rounded-lg transition-colors">
      <span className="text-xs font-mono text-muted-foreground">{number}</span>
      <span className="font-medium">{title}</span>
    </div>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4 mb-8">
      <span className="text-xs font-mono text-primary">{number}</span>
      <h2 className="text-3xl font-bold">{title}</h2>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
      <div className="text-4xl font-bold text-primary">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function ScreenshotModule({ 
  image, 
  title, 
  description, 
  screens,
}: { 
  image: string; 
  title: string; 
  description: string; 
  screens: number;
  color: string;
}) {
  return (
    <div className="group">
      <div className="bg-background rounded-2xl p-3 border border-border shadow-sm group-hover:shadow-lg transition-shadow">
        <img 
          src={image} 
          alt={`Módulo ${title}`} 
          className="w-full h-auto rounded-xl"
          style={{ maxHeight: '380px', objectFit: 'contain' }}
        />
      </div>
      <div className="mt-4 px-1">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        <span className="text-xs text-muted-foreground mt-2 inline-block">
          {screens} telas
        </span>
      </div>
    </div>
  );
}

function ModuleChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <span className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
      active 
        ? 'bg-primary text-primary-foreground border-primary' 
        : 'bg-muted text-muted-foreground border-border'
    }`}>
      {label}
    </span>
  );
}

function RouteCard({ route, name, description }: { route: string; name: string; description: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
      <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded shrink-0">
        {route}
      </code>
      <div className="flex-1 min-w-0">
        <span className="font-medium">{name}</span>
        <span className="text-muted-foreground mx-2">·</span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </div>
    </div>
  );
}

function TechCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="p-6 rounded-2xl border border-border">
      <div className="flex items-center gap-2 mb-4 text-primary">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
