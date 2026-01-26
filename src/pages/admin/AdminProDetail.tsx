import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ChevronLeft, Star, MapPin, Phone, Mail, FileText, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { pros, orders, proDocuments } from "@/lib/mockDataV2";
import { toast } from "sonner";

export default function AdminProDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const pro = pros.find(p => p.id === id);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  if (!pro) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Profissional não encontrada</p>
      </div>
    );
  }

  const proOrders = orders.filter(o => o.proId === pro.id).slice(0, 5);
  const docs = proDocuments.filter(d => d.proId === pro.id);

  const handleApprove = () => {
    toast.success("Profissional aprovada com sucesso!");
  };

  const handleReject = () => {
    toast.error("Profissional rejeitada");
  };

  const handleSuspend = () => {
    setShowSuspendModal(false);
    toast.warning("Profissional suspensa");
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{pro.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={pro.verifiedStatus} />
                <StatusBadge status={pro.plan} />
                <StatusBadge status={pro.status} />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-card rounded-xl border border-border p-4 card-shadow">
                <div className="flex flex-col items-center text-center mb-4">
                  <img 
                    src={pro.avatar} 
                    alt={pro.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 mb-3"
                  />
                  <h2 className="font-semibold text-foreground">{pro.name}</h2>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span>{pro.ratingAvg.toFixed(1)}</span>
                    <span className="text-muted-foreground">({pro.jobsDone} serviços)</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{pro.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{pro.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{pro.city} • {pro.radiusKm}km</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-card rounded-xl border border-border p-4 card-shadow">
                <h3 className="font-semibold text-foreground mb-3">Estatísticas</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{pro.jobsDone}</p>
                    <p className="text-xs text-muted-foreground">Serviços</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{pro.acceptanceRate}%</p>
                    <p className="text-xs text-muted-foreground">Aceitação</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{pro.priorityScore}</p>
                    <p className="text-xs text-muted-foreground">Prioridade</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">
                      R$ {pro.balance.toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Saldo</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-card rounded-xl border border-border p-4 card-shadow space-y-2">
                <h3 className="font-semibold text-foreground mb-3">Ações</h3>
                
                {pro.verifiedStatus === "pending" && (
                  <>
                    <PrimaryButton fullWidth onClick={handleApprove}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Aprovar verificação
                    </PrimaryButton>
                    <PrimaryButton fullWidth variant="outline" onClick={handleReject}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reprovar
                    </PrimaryButton>
                  </>
                )}

                {pro.status === "active" && (
                  <PrimaryButton 
                    fullWidth 
                    variant="outline"
                    onClick={() => setShowSuspendModal(true)}
                    className="text-destructive border-destructive/20 hover:bg-destructive/10"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Suspender
                  </PrimaryButton>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Documents */}
              <div className="bg-card rounded-xl border border-border p-4 card-shadow">
                <h3 className="font-semibold text-foreground mb-4">Documentos</h3>
                
                {docs.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nenhum documento enviado</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {docs.map((doc) => (
                      <div 
                        key={doc.id}
                        className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
                      >
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground capitalize">
                            {doc.docType.replace("_", " ")}
                          </p>
                          <StatusBadge status={doc.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Orders */}
              <div className="bg-card rounded-xl border border-border p-4 card-shadow">
                <h3 className="font-semibold text-foreground mb-4">Pedidos recentes</h3>
                
                {proOrders.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nenhum pedido realizado</p>
                ) : (
                  <div className="space-y-3">
                    {proOrders.map((order) => (
                      <div 
                        key={order.id}
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-foreground">#{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.serviceName}</p>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={order.status} />
                          <p className="text-sm text-muted-foreground mt-1">{order.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onConfirm={handleSuspend}
        title="Suspender profissional"
        description={`Tem certeza que deseja suspender ${pro.name}? Ela não receberá mais pedidos até ser reativada.`}
        confirmText="Suspender"
        variant="danger"
      />
    </div>
  );
}
