import { useState } from "react";
import { 
  Home, Sparkles, HardHat, Building2, Calendar, MapPin, 
  Star, Clock, CheckCircle, AlertCircle, XCircle, 
  TrendingUp, Users, DollarSign, Package
} from "lucide-react";

// UI Components
import { Logo } from "@/components/ui/Logo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { InputField } from "@/components/ui/InputField";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { OrderCard } from "@/components/ui/OrderCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { QualityBadge } from "@/components/ui/QualityBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { PlanCard } from "@/components/ui/PlanCard";
import { TicketCard } from "@/components/ui/TicketCard";
import { ZoneCard } from "@/components/ui/ZoneCard";
import { BottomNav } from "@/components/ui/BottomNav";
import { TimelineStepper } from "@/components/ui/TimelineStepper";
import { MoneyBreakdown } from "@/components/ui/MoneyBreakdown";
import { CouponInput } from "@/components/ui/CouponInput";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { AuthLoading } from "@/components/ui/AuthLoading";
import { MapMock } from "@/components/ui/MapMock";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ComponentShowcase() {
  const [activeTab, setActiveTab] = useState("branding");
  const [showModal, setShowModal] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const categories = [
    { id: "branding", label: "Branding" },
    { id: "buttons", label: "Buttons" },
    { id: "inputs", label: "Inputs" },
    { id: "cards", label: "Cards" },
    { id: "badges", label: "Badges" },
    { id: "navigation", label: "Navigation" },
    { id: "feedback", label: "Feedback" },
    { id: "data", label: "Data Display" },
  ];

  // Mock data for ZoneCard
  const mockZone = {
    id: "zone-1",
    name: "Zona Sul",
    cityId: "city-1",
    radiusKm: 10,
    centerLat: -23.5,
    centerLng: -46.6,
    feeExtra: 15,
    active: true,
  };

  const mockZoneRule = {
    id: "rule-1",
    zoneId: "zone-1",
    surgeMultiplier: 1.5,
    minProsOnline: 5,
    active: true,
  };

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <h1 className="text-lg font-bold text-foreground">Component Showcase</h1>
              <p className="text-xs text-muted-foreground">Design System & UI Library</p>
            </div>
          </div>
          <Badge variant="outline">v1.0.0</Badge>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-max mb-6">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="px-4">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          {/* Branding */}
          <TabsContent value="branding" className="space-y-6">
            <ComponentSection title="Logo" description="Variantes da logo do app">
              <div className="flex flex-wrap items-center gap-8">
                <div className="text-center">
                  <Logo size="lg" />
                  <p className="text-xs text-muted-foreground mt-2">Large</p>
                </div>
                <div className="text-center">
                  <Logo size="md" />
                  <p className="text-xs text-muted-foreground mt-2">Medium</p>
                </div>
                <div className="text-center">
                  <Logo size="sm" />
                  <p className="text-xs text-muted-foreground mt-2">Small</p>
                </div>
                <div className="text-center">
                  <Logo size="sm" iconOnly />
                  <p className="text-xs text-muted-foreground mt-2">Icon Only</p>
                </div>
              </div>
            </ComponentSection>

            <ComponentSection title="Colors" description="Paleta de cores do design system">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { name: "Primary", class: "bg-primary" },
                  { name: "Secondary", class: "bg-secondary" },
                  { name: "Accent", class: "bg-accent" },
                  { name: "Muted", class: "bg-muted" },
                  { name: "Success", class: "bg-success" },
                  { name: "Warning", class: "bg-warning" },
                  { name: "Destructive", class: "bg-destructive" },
                  { name: "Background", class: "bg-background border" },
                  { name: "Card", class: "bg-card border" },
                  { name: "Foreground", class: "bg-foreground" },
                ].map((color) => (
                  <div key={color.name} className="text-center">
                    <div className={`w-full h-16 rounded-lg ${color.class}`} />
                    <p className="text-xs text-muted-foreground mt-1">{color.name}</p>
                  </div>
                ))}
              </div>
            </ComponentSection>
          </TabsContent>

          {/* Buttons */}
          <TabsContent value="buttons" className="space-y-6">
            <ComponentSection title="Primary Button" description="Botão principal com loading state">
              <div className="flex flex-wrap gap-4">
                <PrimaryButton>Default</PrimaryButton>
                <PrimaryButton loading>Loading</PrimaryButton>
                <PrimaryButton disabled>Disabled</PrimaryButton>
              </div>
            </ComponentSection>

            <ComponentSection title="Shadcn Buttons" description="Variantes do botão base">
              <div className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
            </ComponentSection>

            <ComponentSection title="Button Sizes" description="Tamanhos disponíveis">
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon"><Star className="w-4 h-4" /></Button>
              </div>
            </ComponentSection>
          </TabsContent>

          {/* Inputs */}
          <TabsContent value="inputs" className="space-y-6">
            <ComponentSection title="Input Field" description="Campo de entrada customizado">
              <div className="max-w-md space-y-4">
                <InputField label="Email" placeholder="seu@email.com" type="email" />
                <InputField label="Senha" placeholder="••••••••" type="password" />
                <InputField label="Com erro" placeholder="Texto" error="Campo obrigatório" />
              </div>
            </ComponentSection>

            <ComponentSection title="Coupon Input" description="Campo para código de cupom">
              <div className="max-w-md">
                <CouponInput 
                  onApply={async (code) => {
                    await new Promise(r => setTimeout(r, 1000));
                    return { success: code === "DESCONTO10", message: "Cupom inválido" };
                  }} 
                />
              </div>
            </ComponentSection>

            <ComponentSection title="Switches & Checkboxes" description="Controles de toggle">
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-2">
                  <Switch />
                  <span className="text-sm">Switch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox />
                  <span className="text-sm">Checkbox</span>
                </div>
              </div>
            </ComponentSection>
          </TabsContent>

          {/* Cards */}
          <TabsContent value="cards" className="space-y-6">
            <ComponentSection title="Service Card" description="Card de seleção de serviço">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
                <ServiceCard icon={Home} title="Residencial" onClick={() => {}} />
                <ServiceCard icon={Sparkles} title="Pesada" onClick={() => {}} />
                <ServiceCard icon={HardHat} title="Pós-Obra" onClick={() => {}} />
                <ServiceCard icon={Building2} title="Comercial" onClick={() => {}} />
              </div>
            </ComponentSection>

            <ComponentSection title="Order Card" description="Card de pedido">
              <div className="max-w-md">
                <OrderCard
                  id="ORD-001"
                  service="Limpeza Residencial"
                  date="28 Jan 2026"
                  time="09:00"
                  address="Rua das Flores, 123"
                  status="confirmed"
                  price={180}
                  onClick={() => {}}
                />
              </div>
            </ComponentSection>

            <ComponentSection title="Metric Card" description="Card de métrica para dashboards">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Pedidos Hoje"
                  value="24"
                  icon={Package}
                  trend={12}
                  trendLabel="vs ontem"
                />
                <MetricCard
                  title="Receita"
                  value={4320}
                  icon={DollarSign}
                  format="currency"
                  trend={8}
                />
                <MetricCard
                  title="Clientes Ativos"
                  value="1.234"
                  icon={Users}
                  trend={5}
                />
                <MetricCard
                  title="Taxa Cancelamento"
                  value={2.3}
                  icon={TrendingUp}
                  format="percent"
                  trend={-0.5}
                />
              </div>
            </ComponentSection>

            <ComponentSection title="Plan Card" description="Card de plano/assinatura">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
                <PlanCard
                  name="Free"
                  price={0}
                  features={["Até 5 pedidos/mês", "Suporte básico"]}
                  current={false}
                  onSelect={() => {}}
                />
                <PlanCard
                  name="PRO"
                  price={49.90}
                  features={["Pedidos ilimitados", "Prioridade no matching", "Suporte prioritário"]}
                  current={true}
                  popular
                  onSelect={() => {}}
                />
                <PlanCard
                  name="ELITE"
                  price={99.90}
                  features={["Tudo do Pro", "Destaque no app", "Account manager"]}
                  current={false}
                  onSelect={() => {}}
                />
              </div>
            </ComponentSection>

            <ComponentSection title="Ticket Card" description="Card de ticket de suporte">
              <div className="max-w-md">
                <TicketCard
                  id="TKT-001"
                  subject="Problema com pagamento"
                  createdBy="João Silva"
                  status="open"
                  priority="high"
                  createdAt="2026-01-28T10:00:00Z"
                  lastMessage="Ainda não consegui resolver..."
                  onClick={() => {}}
                />
              </div>
            </ComponentSection>

            <ComponentSection title="Zone Card" description="Card de zona de atendimento">
              <div className="max-w-md">
                <ZoneCard
                  zone={mockZone}
                  rule={mockZoneRule}
                  prosOnline={8}
                  onClick={() => {}}
                />
              </div>
            </ComponentSection>
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges" className="space-y-6">
            <ComponentSection title="Status Badge" description="Badges de status de pedido">
              <div className="flex flex-wrap gap-3">
                <StatusBadge status="draft" />
                <StatusBadge status="scheduled" />
                <StatusBadge status="matching" />
                <StatusBadge status="confirmed" />
                <StatusBadge status="en_route" />
                <StatusBadge status="in_progress" />
                <StatusBadge status="completed" />
                <StatusBadge status="cancelled" />
              </div>
            </ComponentSection>

            <ComponentSection title="Quality Badge" description="Níveis de qualidade SLA">
              <div className="flex flex-wrap gap-4">
                <QualityBadge level="A" />
                <QualityBadge level="B" />
                <QualityBadge level="C" />
                <QualityBadge level="D" />
              </div>
            </ComponentSection>

            <ComponentSection title="Shadcn Badges" description="Variantes do badge base">
              <div className="flex flex-wrap gap-3">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </ComponentSection>

            <ComponentSection title="Plan Badges" description="Badges de plano do profissional">
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-primary text-primary-foreground">PRO</Badge>
                <Badge className="bg-warning text-warning-foreground">ELITE</Badge>
              </div>
            </ComponentSection>
          </TabsContent>

          {/* Navigation */}
          <TabsContent value="navigation" className="space-y-6">
            <ComponentSection title="Bottom Nav - Client" description="Navegação inferior para clientes">
              <div className="relative h-24 bg-muted rounded-lg overflow-hidden max-w-md flex flex-col justify-end">
                <BottomNav variant="client" />
              </div>
            </ComponentSection>

            <ComponentSection title="Bottom Nav - Pro" description="Navegação inferior para profissionais">
              <div className="relative h-24 bg-muted rounded-lg overflow-hidden max-w-md flex flex-col justify-end">
                <BottomNav variant="pro" />
              </div>
            </ComponentSection>

            <ComponentSection title="Timeline Stepper" description="Stepper para status do pedido">
              <div className="max-w-md">
                <TimelineStepper
                  steps={[
                    { id: "1", label: "Agendado", time: "09:00" },
                    { id: "2", label: "Confirmado", time: "09:15" },
                    { id: "3", label: "A caminho", time: "09:30" },
                    { id: "4", label: "Em andamento" },
                    { id: "5", label: "Concluído" },
                  ]}
                  currentStep={2}
                />
              </div>
            </ComponentSection>
          </TabsContent>

          {/* Feedback */}
          <TabsContent value="feedback" className="space-y-6">
            <ComponentSection title="Auth Loading" description="Tela de carregamento com logo">
              <div className="flex gap-4">
                <Button onClick={() => setShowLoading(true)}>Ver Loading</Button>
              </div>
              {showLoading && (
                <div className="fixed inset-0 z-50" onClick={() => setShowLoading(false)}>
                  <AuthLoading />
                </div>
              )}
            </ComponentSection>

            <ComponentSection title="Confirm Modal" description="Modal de confirmação">
              <div className="flex gap-4">
                <Button onClick={() => setShowModal(true)}>Abrir Modal</Button>
              </div>
              <ConfirmModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Confirmar ação?"
                description="Esta ação não pode ser desfeita."
                confirmText="Confirmar"
                onConfirm={() => setShowModal(false)}
                variant="danger"
              />
            </ComponentSection>

            <ComponentSection title="Progress" description="Barra de progresso">
              <div className="max-w-md space-y-4">
                <Progress value={25} />
                <Progress value={50} />
                <Progress value={75} />
                <Progress value={100} />
              </div>
            </ComponentSection>
          </TabsContent>

          {/* Data Display */}
          <TabsContent value="data" className="space-y-6">
            <ComponentSection title="Money Breakdown" description="Detalhamento de valores">
              <div className="max-w-md">
                <MoneyBreakdown
                  items={[
                    { label: "Limpeza Residencial", value: 150 },
                    { label: "Taxa de deslocamento", value: 20 },
                    { label: "Desconto cupom", value: -15, highlight: true },
                  ]}
                  total={155}
                />
              </div>
            </ComponentSection>

            <ComponentSection title="Map Mock" description="Placeholder de mapa">
              <div className="max-w-md h-48">
                <MapMock />
              </div>
            </ComponentSection>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper component for sections
function ComponentSection({ 
  title, 
  description, 
  children 
}: { 
  title: string; 
  description: string; 
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
