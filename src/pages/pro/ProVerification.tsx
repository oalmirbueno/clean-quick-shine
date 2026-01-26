import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ChevronLeft, FileText, Camera, Home, Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProDocuments } from "@/hooks/useProDocuments";

interface DocConfig {
  id: string;
  icon: typeof FileText;
  title: string;
  description: string;
  accept: string;
}

const docConfigs: DocConfig[] = [
  { id: "id_front", icon: FileText, title: "Documento (frente)", description: "RG ou CNH", accept: "image/*" },
  { id: "id_back", icon: FileText, title: "Documento (verso)", description: "RG ou CNH", accept: "image/*" },
  { id: "selfie", icon: Camera, title: "Selfie com documento", description: "Segurando o documento", accept: "image/*" },
  { id: "proof", icon: Home, title: "Comprovante de residência", description: "Conta de luz, água ou internet", accept: "image/*,application/pdf" },
];

export default function ProVerification() {
  const navigate = useNavigate();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const { documents, isLoading, uploadDocument, isUploading, getDocumentStatus } = useProDocuments();

  const handleFileSelect = async (docId: string, file: File) => {
    if (!file) return;
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return;
    }

    uploadDocument({ docType: docId, file });
  };

  const handleUploadClick = (docId: string) => {
    fileInputRefs.current[docId]?.click();
  };

  const getStatus = (docId: string): "not_sent" | "pending" | "approved" | "rejected" => {
    const doc = getDocumentStatus(docId);
    if (!doc) return "not_sent";
    return doc.status as "pending" | "approved" | "rejected";
  };

  const allSent = docConfigs.every(d => getStatus(d.id) !== "not_sent");
  const allApproved = docConfigs.every(d => getStatus(d.id) === "approved");
  const hasRejected = docConfigs.some(d => getStatus(d.id) === "rejected");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 safe-top">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Verificação</h1>
            <p className="text-sm text-muted-foreground">Envie seus documentos</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 animate-fade-in">
        {/* Status Banner */}
        <div className={cn(
          "p-4 rounded-xl border",
          allApproved 
            ? "bg-success/10 border-success/20"
            : hasRejected
            ? "bg-destructive/10 border-destructive/20"
            : allSent
            ? "bg-warning/10 border-warning/20"
            : "bg-accent border-primary/10"
        )}>
          <div className="flex items-center gap-3">
            {allApproved ? (
              <CheckCircle2 className="w-6 h-6 text-success" />
            ) : hasRejected ? (
              <AlertCircle className="w-6 h-6 text-destructive" />
            ) : (
              <FileText className="w-6 h-6 text-primary" />
            )}
            <div>
              <p className="font-medium text-foreground">
                {allApproved 
                  ? "Verificação aprovada!" 
                  : hasRejected
                  ? "Documento(s) rejeitado(s)"
                  : allSent 
                  ? "Documentos em análise"
                  : "Envie seus documentos"
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {allApproved 
                  ? "Você já pode receber pedidos."
                  : hasRejected
                  ? "Reenvie os documentos rejeitados."
                  : allSent
                  ? "Retornaremos em até 48 horas."
                  : "Para receber pedidos, complete sua verificação."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-3">
          {docConfigs.map((doc) => {
            const status = getStatus(doc.id);
            const docData = getDocumentStatus(doc.id);

            return (
              <div 
                key={doc.id}
                className="p-4 bg-card rounded-xl border border-border card-shadow"
              >
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={(el) => (fileInputRefs.current[doc.id] = el)}
                  accept={doc.accept}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(doc.id, file);
                    e.target.value = "";
                  }}
                  className="hidden"
                />

                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    status === "approved" ? "bg-success/10" : 
                    status === "rejected" ? "bg-destructive/10" : "bg-secondary"
                  )}>
                    <doc.icon className={cn(
                      "w-5 h-5",
                      status === "approved" ? "text-success" : 
                      status === "rejected" ? "text-destructive" : "text-muted-foreground"
                    )} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-foreground">{doc.title}</h3>
                      {status !== "not_sent" && (
                        <StatusBadge status={status} />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                    
                    {/* Show file name if uploaded */}
                    {docData?.file_name && status !== "rejected" && (
                      <p className="text-xs text-primary mt-1 truncate">
                        {docData.file_name}
                      </p>
                    )}

                    {/* Show rejection reason */}
                    {status === "rejected" && docData?.rejection_reason && (
                      <p className="text-xs text-destructive mt-1">
                        Motivo: {docData.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>

                {(status === "not_sent" || status === "rejected") && (
                  <button
                    onClick={() => handleUploadClick(doc.id)}
                    disabled={isUploading}
                    className={cn(
                      "mt-3 w-full py-2.5 rounded-lg border border-dashed",
                      "flex items-center justify-center gap-2 font-medium",
                      "transition-colors disabled:opacity-50",
                      status === "rejected"
                        ? "border-destructive/30 text-destructive hover:bg-destructive/5"
                        : "border-primary/30 text-primary hover:bg-primary/5"
                    )}
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {status === "rejected" ? "Reenviar documento" : "Enviar documento"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Info Card */}
        <div className="p-4 bg-muted/50 rounded-xl">
          <h4 className="font-medium text-foreground mb-2">Dicas para aprovação</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Fotos nítidas e sem reflexos</li>
            <li>• Documento válido e não vencido</li>
            <li>• Comprovante com menos de 3 meses</li>
            <li>• Selfie com rosto visível e documento legível</li>
          </ul>
        </div>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
