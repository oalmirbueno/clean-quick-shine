import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ChevronLeft, Upload, CheckCircle2, Loader2, AlertCircle, CreditCard, Camera, Home, Shield, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProDocuments } from "@/hooks/useProDocuments";

interface DocConfig {
  id: string;
  icon: typeof CreditCard;
  title: string;
  description: string;
  accept: string;
  required: boolean;
}

const docConfigs: DocConfig[] = [
  { id: "cpf", icon: CreditCard, title: "CPF", description: "Foto frente do CPF ou CNH", accept: "image/*", required: true },
  { id: "rg", icon: CreditCard, title: "RG ou CNH", description: "Foto frente e verso do documento", accept: "image/*", required: true },
  { id: "selfie", icon: Camera, title: "Selfie com documento", description: "Segurando seu RG ou CNH", accept: "image/*", required: true },
  { id: "comprovante_endereco", icon: Home, title: "Comprovante de endereço", description: "Conta de luz, água ou internet (últimos 3 meses)", accept: "image/*,application/pdf", required: false },
  { id: "antecedentes", icon: Shield, title: "Certidão de antecedentes", description: "Certidão negativa de antecedentes criminais", accept: "image/*,application/pdf", required: false },
];

const requiredDocs = docConfigs.filter(d => d.required);
const optionalDocs = docConfigs.filter(d => !d.required);

export default function ProVerification() {
  const navigate = useNavigate();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const { documents, isLoading, uploadDocument, isUploading, getDocumentStatus } = useProDocuments();
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const handleFileSelect = async (docId: string, file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return;
    setUploadingType(docId);
    uploadDocument({ docType: docId, file }, {
      onSettled: () => setUploadingType(null),
    });
  };

  const handleUploadClick = (docId: string) => {
    fileInputRefs.current[docId]?.click();
  };

  const getStatus = (docId: string): "not_sent" | "pending" | "approved" | "rejected" => {
    const doc = getDocumentStatus(docId);
    if (!doc) return "not_sent";
    return doc.status as "pending" | "approved" | "rejected";
  };

  const allRequiredApproved = requiredDocs.every(d => getStatus(d.id) === "approved");
  const approvedCount = docConfigs.filter(d => getStatus(d.id) === "approved").length;
  const pendingCount = docConfigs.filter(d => getStatus(d.id) === "pending").length;
  const rejectedCount = docConfigs.filter(d => getStatus(d.id) === "rejected").length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderDocCard = (doc: DocConfig) => {
    const status = getStatus(doc.id);
    const docData = getDocumentStatus(doc.id);
    const isCurrentlyUploading = uploadingType === doc.id;

    const statusConfig = {
      not_sent: { bg: "bg-muted", text: "text-muted-foreground", StatusIcon: Upload },
      pending: { bg: "bg-warning/10", text: "text-warning", StatusIcon: Clock },
      approved: { bg: "bg-success/10", text: "text-success", StatusIcon: CheckCircle2 },
      rejected: { bg: "bg-destructive/10", text: "text-destructive", StatusIcon: XCircle },
    }[status];

    return (
      <div key={doc.id} className="p-4 bg-card rounded-xl border border-border card-shadow">
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
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", statusConfig.bg)}>
            <doc.icon className={cn("w-5 h-5", statusConfig.text)} />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground">{doc.title}</h3>
                {doc.required && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">Obrigatório</span>
                )}
              </div>
              {status !== "not_sent" && <StatusBadge status={status} />}
            </div>
            <p className="text-sm text-muted-foreground">{doc.description}</p>

            {docData?.file_name && status !== "rejected" && (
              <p className="text-xs text-primary mt-1 truncate">{docData.file_name}</p>
            )}

            {status === "rejected" && docData?.rejection_reason && (
              <div className="flex items-start gap-1.5 mt-2">
                <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{docData.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>

        {(status === "not_sent" || status === "rejected") && (
          <button
            onClick={() => handleUploadClick(doc.id)}
            disabled={isUploading || isCurrentlyUploading}
            className={cn(
              "mt-3 w-full py-2.5 rounded-lg border border-dashed",
              "flex items-center justify-center gap-2 font-medium text-sm",
              "transition-colors disabled:opacity-50",
              status === "rejected"
                ? "border-destructive/30 text-destructive hover:bg-destructive/5"
                : "border-primary/30 text-primary hover:bg-primary/5"
            )}
          >
            {isCurrentlyUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {status === "rejected" ? "Reenviar documento" : "Enviar documento"}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col safe-top">
      <header className="flex-shrink-0 bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Verificação de documentos</h1>
            <p className="text-sm text-muted-foreground">Envie seus documentos para começar</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-4 animate-fade-in">
        {/* Status Banner */}
        <div className={cn(
          "p-4 rounded-xl border",
          allRequiredApproved
            ? "bg-success/10 border-success/20"
            : rejectedCount > 0
            ? "bg-destructive/10 border-destructive/20"
            : pendingCount > 0
            ? "bg-warning/10 border-warning/20"
            : "bg-accent border-primary/10"
        )}>
          <div className="flex items-center gap-3">
            {allRequiredApproved ? (
              <CheckCircle2 className="w-6 h-6 text-success" />
            ) : rejectedCount > 0 ? (
              <AlertCircle className="w-6 h-6 text-destructive" />
            ) : (
              <CreditCard className="w-6 h-6 text-primary" />
            )}
            <div>
              <p className="font-medium text-foreground">
                {allRequiredApproved
                  ? "Verificação completa!"
                  : rejectedCount > 0
                  ? "Documento(s) rejeitado(s)"
                  : pendingCount > 0
                  ? "Documentos em análise"
                  : "Envie seus documentos"
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {allRequiredApproved
                  ? "Todos os documentos obrigatórios foram aprovados"
                  : rejectedCount > 0
                  ? "Reenvie os documentos rejeitados"
                  : pendingCount > 0
                  ? "Retornaremos em até 48 horas"
                  : "Para receber pedidos, complete sua verificação"
                }
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(approvedCount / docConfigs.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {approvedCount}/{docConfigs.length}
            </span>
          </div>
        </div>

        {/* Required docs */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Documentos obrigatórios</h2>
          {requiredDocs.map(renderDocCard)}
        </div>

        {/* Optional docs */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Documentos opcionais</h2>
          <p className="text-xs text-muted-foreground">Aumentam sua credibilidade e prioridade no matching</p>
          {optionalDocs.map(renderDocCard)}
        </div>

        {/* Tips */}
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
