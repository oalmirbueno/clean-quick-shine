import { useState, useEffect, useCallback, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminDocuments, AdminDocument } from "@/hooks/useAdminDocuments";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, XCircle, Eye, FileText, User, Clock, Filter, ChevronDown, ChevronRight, Phone, ShieldCheck, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const docTypeNames: Record<string, string> = {
  cpf: "CPF",
  rg: "RG ou CNH",
  selfie: "Selfie com documento",
  comprovante_endereco: "Comprovante de Endereço",
  antecedentes: "Certidão de Antecedentes",
  id_front: "RG/CNH (Frente)",
  id_back: "RG/CNH (Verso)",
  proof_residence: "Comprovante de Residência",
  proof: "Comprovante de Residência",
};

const REQUIRED_DOC_TYPES = ["id_front", "id_back", "selfie"];

interface UserGroup {
  userId: string;
  name: string;
  phone: string | null;
  documents: AdminDocument[];
  allApproved: boolean;
  hasPending: boolean;
  hasRejected: boolean;
  requiredApprovedCount: number;
  requiredTotal: number;
}

export default function AdminDocuments() {
  const {
    documents,
    isLoading,
    approveDocument,
    rejectDocument,
    isApproving,
    isRejecting,
    pendingCount,
    getSignedUrl,
  } = useAdminDocuments();

  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [selectedDoc, setSelectedDoc] = useState<AdminDocument | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  // Group documents by user
  const userGroups: UserGroup[] = useMemo(() => {
    const groupMap = new Map<string, AdminDocument[]>();
    documents.forEach((doc) => {
      const existing = groupMap.get(doc.user_id) || [];
      existing.push(doc);
      groupMap.set(doc.user_id, existing);
    });

    const groups: UserGroup[] = [];
    groupMap.forEach((docs, userId) => {
      const firstDoc = docs[0];

      // Sort: by doc_type order, then newest first within same type
      const sortedDocs = docs.sort((a, b) => {
        const order = ["id_front", "id_back", "selfie", "proof_residence", "comprovante_endereco", "antecedentes"];
        const typeOrder = order.indexOf(a.doc_type) - order.indexOf(b.doc_type);
        if (typeOrder !== 0) return typeOrder;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      // For verification check, only consider the latest of each required type
      const latestByType = new Map<string, AdminDocument>();
      sortedDocs.forEach(d => {
        if (!latestByType.has(d.doc_type)) latestByType.set(d.doc_type, d);
      });
      const latestRequired = REQUIRED_DOC_TYPES.map(t => latestByType.get(t)).filter(Boolean);
      const requiredApproved = latestRequired.filter(d => d!.status === "approved").length;

      groups.push({
        userId,
        name: firstDoc.profile?.full_name || "Sem nome",
        phone: firstDoc.profile?.phone || null,
        documents: sortedDocs,
        allApproved: latestRequired.length >= REQUIRED_DOC_TYPES.length && requiredApproved >= REQUIRED_DOC_TYPES.length,
        hasPending: sortedDocs.some(d => d.status === "pending"),
        hasRejected: docs.some(d => d.status === "rejected"),
        requiredApprovedCount: requiredApproved,
        requiredTotal: REQUIRED_DOC_TYPES.length,
      });
    });

    // Sort: pending first, then rejected, then approved
    return groups.sort((a, b) => {
      if (a.hasPending && !b.hasPending) return -1;
      if (!a.hasPending && b.hasPending) return 1;
      if (a.hasRejected && !b.hasRejected) return -1;
      return 0;
    });
  }, [documents]);

  // Filter groups
  const filteredGroups = useMemo(() => {
    if (filter === "all") return userGroups;
    return userGroups.filter((g) => {
      if (filter === "pending") return g.hasPending;
      if (filter === "approved") return g.allApproved;
      if (filter === "rejected") return g.hasRejected;
      return true;
    });
  }, [userGroups, filter]);

  // Auto-expand users with pending docs
  useEffect(() => {
    const pendingUserIds = userGroups
      .filter(g => g.hasPending)
      .map(g => g.userId);
    setExpandedUsers(new Set(pendingUserIds));
  }, [userGroups]);

  const loadSignedUrl = useCallback(async (docId: string, filePath: string) => {
    if (signedUrls[docId]) return;
    const url = await getSignedUrl(filePath);
    if (url) {
      setSignedUrls((prev) => ({ ...prev, [docId]: url }));
    }
  }, [signedUrls, getSignedUrl]);

  // Load signed URLs for expanded users
  useEffect(() => {
    filteredGroups.forEach((group) => {
      if (expandedUsers.has(group.userId)) {
        group.documents.forEach((doc) => {
          if (!signedUrls[doc.id] && doc.file_url) {
            loadSignedUrl(doc.id, doc.file_url);
          }
        });
      }
    });
  }, [filteredGroups, expandedUsers, signedUrls, loadSignedUrl]);

  const toggleUser = (userId: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleApprove = (doc: AdminDocument) => approveDocument(doc.id);

  const handleRejectClick = (doc: AdminDocument) => {
    setSelectedDoc(doc);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedDoc && rejectReason.trim()) {
      rejectDocument({ documentId: selectedDoc.id, reason: rejectReason });
      setRejectModalOpen(false);
      setSelectedDoc(null);
    }
  };

  const handlePreview = (doc: AdminDocument) => {
    setSelectedDoc(doc);
    setPreviewOpen(true);
  };

  const pendingUsersCount = userGroups.filter(g => g.hasPending).length;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documentos</h1>
          <p className="text-muted-foreground">
            {pendingUsersCount} diarista{pendingUsersCount !== 1 ? "s" : ""} com documentos pendentes
            {pendingCount > 0 && <span className="text-primary font-medium"> · {pendingCount} doc{pendingCount !== 1 ? "s" : ""}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">Todas ({userGroups.length})</option>
            <option value="pending">Pendentes ({userGroups.filter(g => g.hasPending).length})</option>
            <option value="approved">Aprovadas ({userGroups.filter(g => g.allApproved).length})</option>
            <option value="rejected">Rejeitadas ({userGroups.filter(g => g.hasRejected).length})</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhuma diarista encontrada
          </h3>
          <p className="text-muted-foreground">
            {filter === "pending"
              ? "Não há documentos pendentes de revisão"
              : "Não há diaristas nesta categoria"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGroups.map((group) => {
            const isExpanded = expandedUsers.has(group.userId);
            return (
              <div
                key={group.userId}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                {/* User header - collapsible */}
                <button
                  onClick={() => toggleUser(group.userId)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{group.name}</h3>
                      {group.allApproved ? (
                        <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" />
                      ) : group.hasRejected ? (
                        <ShieldAlert className="w-4 h-4 text-destructive flex-shrink-0" />
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {group.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {group.phone}
                        </span>
                      )}
                      <span>
                        {group.requiredApprovedCount}/{group.requiredTotal} obrigatórios aprovados
                      </span>
                      <span>· {group.documents.length} doc{group.documents.length !== 1 ? "s" : ""} enviado{group.documents.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {group.hasPending && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-warning/10 text-warning">Pendente</span>
                    )}
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </button>

                {/* Documents list */}
                {isExpanded && (
                  <div className="border-t border-border divide-y divide-border">
                    {/* Missing required docs warning */}
                    {(() => {
                      const sentTypes = group.documents.map(d => d.doc_type);
                      const missing = REQUIRED_DOC_TYPES.filter(t => !sentTypes.includes(t));
                      if (missing.length === 0) return null;
                      return (
                        <div className="px-4 py-3 bg-destructive/5">
                          <p className="text-xs text-destructive font-medium">
                            ⚠️ Documentos obrigatórios não enviados: {missing.map(t => docTypeNames[t] || t).join(", ")}
                          </p>
                        </div>
                      );
                    })()}

                    {group.documents.map((doc, idx) => {
                      // Check if this is an older version (not the first of its type)
                      const firstOfType = group.documents.findIndex(d => d.doc_type === doc.doc_type);
                      const isOlderVersion = idx !== firstOfType;

                      return (
                      <div key={doc.id} className={cn(
                        "flex items-center gap-3 p-3 px-4 hover:bg-secondary/20 transition-colors",
                        isOlderVersion && "opacity-60 bg-muted/30"
                      )}>
                        <div
                          className="w-16 h-16 rounded-lg bg-muted overflow-hidden cursor-pointer flex-shrink-0 border border-border"
                          onClick={() => handlePreview(doc)}
                        >
                          <img
                            src={signedUrls[doc.id] || "/placeholder.svg"}
                            alt={docTypeNames[doc.doc_type]}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium text-sm text-foreground">
                              {docTypeNames[doc.doc_type] || doc.doc_type}
                            </span>
                            {isOlderVersion && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">Versão anterior</span>
                            )}
                            {!isOlderVersion && REQUIRED_DOC_TYPES.includes(doc.doc_type) && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-semibold">Obrig.</span>
                            )}
                            <StatusBadge status={doc.status} />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {format(new Date(doc.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            {doc.file_name && <span className="truncate max-w-[120px]">· {doc.file_name}</span>}
                          </div>
                          {doc.rejection_reason && (
                            <p className="text-xs text-destructive mt-0.5">Motivo: {doc.rejection_reason}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Button variant="ghost" size="sm" onClick={() => handlePreview(doc)} className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {doc.status === "pending" && !isOlderVersion && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApprove(doc)}
                                disabled={isApproving}
                                className="h-8 bg-success hover:bg-success/90 text-success-foreground"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />Aprovar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRejectClick(doc)}
                                disabled={isRejecting}
                                className="h-8"
                              >
                                <XCircle className="w-4 h-4 mr-1" />Rejeitar
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDoc && (docTypeNames[selectedDoc.doc_type] || selectedDoc.doc_type)}
            </DialogTitle>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden bg-muted">
                <img
                  src={signedUrls[selectedDoc.id] || "/placeholder.svg"}
                  alt="Documento"
                  className="w-full max-h-[60vh] object-contain"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Profissional:</span>
                  <p className="font-medium">{selectedDoc.profile?.full_name || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Telefone:</span>
                  <p className="font-medium">{selectedDoc.profile?.phone || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Enviado em:</span>
                  <p className="font-medium">
                    {format(new Date(selectedDoc.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <StatusBadge status={selectedDoc.status} />
                </div>
              </div>
              {selectedDoc.status === "pending" && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button
                    className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() => { handleApprove(selectedDoc); setPreviewOpen(false); }}
                    disabled={isApproving}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />Aprovar documento
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => { setPreviewOpen(false); handleRejectClick(selectedDoc); }}
                    disabled={isRejecting}
                  >
                    <XCircle className="w-4 h-4 mr-2" />Rejeitar documento
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Informe o motivo da rejeição. A diarista será notificada e poderá reenviar.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Documento ilegível ou borrado",
                "Foto cortada, documento incompleto",
                "Documento vencido",
                "Selfie não mostra rosto e documento juntos",
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setRejectReason(reason)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                  {reason}
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Motivo da rejeição..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectReason.trim() || isRejecting}
            >
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
