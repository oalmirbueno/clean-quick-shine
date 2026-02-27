import { useState, useEffect, useCallback } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
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
import { CheckCircle, XCircle, Eye, FileText, User, Clock, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const docTypeNames: Record<string, string> = {
  cpf: "CPF",
  rg: "RG ou CNH",
  selfie: "Selfie com documento",
  comprovante_endereco: "Comprovante de Endereço",
  antecedentes: "Certidão de Antecedentes",
  // Legacy types
  id_front: "RG/CNH (Frente)",
  id_back: "RG/CNH (Verso)",
  proof_residence: "Comprovante de Residência",
  proof: "Comprovante de Residência",
};

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

  // Cache signed URLs to avoid re-fetching
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const [selectedDoc, setSelectedDoc] = useState<AdminDocument | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const filteredDocs = documents.filter((doc) => {
    if (filter === "all") return true;
    return doc.status === filter;
  });

  // Load signed URLs for visible documents
  const loadSignedUrl = useCallback(async (docId: string, filePath: string) => {
    if (signedUrls[docId]) return;
    const url = await getSignedUrl(filePath);
    if (url) {
      setSignedUrls((prev) => ({ ...prev, [docId]: url }));
    }
  }, [signedUrls, getSignedUrl]);

  useEffect(() => {
    filteredDocs.forEach((doc) => {
      if (!signedUrls[doc.id] && doc.file_url) {
        loadSignedUrl(doc.id, doc.file_url);
      }
    });
  }, [filteredDocs, signedUrls, loadSignedUrl]);



  const handleApprove = (doc: AdminDocument) => {
    approveDocument(doc.id);
  };

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

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Documentos</h1>
            <p className="text-muted-foreground">
              {pendingCount} documento{pendingCount !== 1 ? "s" : ""} pendente{pendingCount !== 1 ? "s" : ""} de revisão
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="approved">Aprovados</option>
              <option value="rejected">Rejeitados</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum documento encontrado
            </h3>
            <p className="text-muted-foreground">
              {filter === "pending"
                ? "Não há documentos pendentes de revisão"
                : "Não há documentos nesta categoria"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-card rounded-xl border border-border p-4 hover:border-primary/20 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Document Preview Thumbnail */}
                  <div
                    className="w-20 h-20 rounded-lg bg-secondary overflow-hidden cursor-pointer flex-shrink-0"
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

                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {docTypeNames[doc.doc_type] || doc.doc_type}
                      </h3>
                      <StatusBadge
                        status={doc.status}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {doc.profile?.full_name || "Sem nome"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(doc.created_at), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    {doc.rejection_reason && (
                      <p className="text-sm text-destructive mt-1">
                        Motivo: {doc.rejection_reason}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(doc)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    {doc.status === "pending" && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(doc)}
                          disabled={isApproving}
                          className="bg-success hover:bg-success/90 text-success-foreground"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRejectClick(doc)}
                          disabled={isRejecting}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedDoc && (docTypeNames[selectedDoc.doc_type] || selectedDoc.doc_type)}
              </DialogTitle>
            </DialogHeader>
            {selectedDoc && (
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden bg-secondary">
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
                      {format(new Date(selectedDoc.created_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium capitalize">{selectedDoc.status}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Modal */}
        <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeitar Documento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Informe o motivo da rejeição. O profissional será notificado.
              </p>
              <Textarea
                placeholder="Motivo da rejeição..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
                Cancelar
              </Button>
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
      </main>
    </div>
  );
}
