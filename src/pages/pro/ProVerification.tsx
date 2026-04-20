import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ChevronLeft, Upload, CheckCircle2, Loader2, AlertCircle, CreditCard, Camera, Shield, Clock, XCircle, ImageIcon, FileText, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProDocuments } from "@/hooks/useProDocuments";
import { toast } from "sonner";

interface DocConfig {
  id: string;
  icon: typeof CreditCard;
  title: string;
  description: string;
  accept: string;
  required: boolean;
  qualityTip: string;
}

const docConfigs: DocConfig[] = [
  {
    id: "id_front",
    icon: CreditCard,
    title: "RG ou CNH (Frente)",
    description: "Foto nítida da frente do documento",
    accept: "image/*",
    required: true,
    qualityTip: "Documento inteiro visível, sem cortes, reflexos ou sombras",
  },
  {
    id: "id_back",
    icon: CreditCard,
    title: "RG ou CNH (Verso)",
    description: "Foto nítida do verso do documento",
    accept: "image/*",
    required: true,
    qualityTip: "Todos os dados legíveis, sem desfoque",
  },
  {
    id: "selfie",
    icon: Camera,
    title: "Selfie com documento",
    description: "Selfie segurando seu RG ou CNH ao lado do rosto",
    accept: "image/*",
    required: true,
    qualityTip: "Rosto e documento visíveis e legíveis na mesma foto",
  },
  {
    id: "proof_residence",
    icon: Shield,
    title: "Comprovante de residência",
    description: "Conta de luz, água ou internet (últimos 3 meses)",
    accept: "image/*,application/pdf",
    required: false,
    qualityTip: "Nome e endereço legíveis",
  },
];

const requiredDocs = docConfigs.filter(d => d.required);
const optionalDocs = docConfigs.filter(d => !d.required);

const MIN_FILE_SIZE = 100 * 1024; // 100KB minimum
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB max
const MIN_IMAGE_DIMENSION = 800; // px

function validateImageQuality(file: File): Promise<{ valid: boolean; reason?: string }> {
  return new Promise((resolve) => {
    if (file.type.startsWith("application/pdf")) {
      resolve({ valid: true });
      return;
    }

    if (file.size < MIN_FILE_SIZE) {
      resolve({ valid: false, reason: "Arquivo muito pequeno. Envie uma foto com melhor qualidade (mínimo 100KB)." });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      resolve({ valid: false, reason: "Arquivo muito grande. Máximo permitido: 10MB." });
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width < MIN_IMAGE_DIMENSION && img.height < MIN_IMAGE_DIMENSION) {
        resolve({
          valid: false,
          reason: `Imagem com resolução muito baixa (${img.width}x${img.height}). Mínimo recomendado: ${MIN_IMAGE_DIMENSION}px no maior lado.`,
        });
      } else {
        resolve({ valid: true });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false, reason: "Não foi possível ler a imagem. Tente outro arquivo." });
    };
    img.src = url;
  });
}

export default function ProVerification() {
  const navigate = useNavigate();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const { documents, isLoading, uploadDocument, isUploading, getDocumentStatus } = useProDocuments();
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(() => {
    return localStorage.getItem("pro_terms_accepted") === "true";
  });

  const handleAcceptTerms = (next: boolean) => {
    setAcceptedTerms(next);
    if (next) localStorage.setItem("pro_terms_accepted", "true");
    else localStorage.removeItem("pro_terms_accepted");
  };

  const handleFileSelect = async (docId: string, file: File) => {
    if (!file) return;

    if (!acceptedTerms) {
      toast.error("Aceite os termos do profissional para enviar documentos");
      return;
    }

    const validation = await validateImageQuality(file);
    if (!validation.valid) {
      toast.error(validation.reason || "Documento inválido");
      return;
    }

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
  const allRequiredSent = requiredDocs.every(d => getStatus(d.id) !== "not_sent");
  const approvedCount = docConfigs.filter(d => getStatus(d.id) === "approved").length;
  const pendingCount = docConfigs.filter(d => getStatus(d.id) === "pending").length;
  const rejectedCount = docConfigs.filter(d => getStatus(d.id) === "rejected").length;
  const notSentRequired = requiredDocs.filter(d => getStatus(d.id) === "not_sent").length;

  if (isLoading) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
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
          capture={doc.id === "selfie" ? "user" : undefined}
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
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-semibold">Obrigatório</span>
                )}
              </div>
              {status !== "not_sent" && <StatusBadge status={status} />}
            </div>
            <p className="text-sm text-muted-foreground">{doc.description}</p>

            {/* Quality tip */}
            <div className="flex items-start gap-1.5 mt-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-primary/80">{doc.qualityTip}</p>
            </div>

            {docData?.file_name && status !== "rejected" && (
              <p className="text-xs text-muted-foreground mt-1 truncate">📎 {docData.file_name}</p>
            )}

            {status === "rejected" && docData?.rejection_reason && (
              <div className="flex items-start gap-1.5 mt-2 p-2 bg-destructive/5 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-destructive font-medium">{docData.rejection_reason}</p>
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
    <div className="h-full bg-background flex flex-col safe-top">
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

      <main className="flex-1 overflow-y-auto p-4 space-y-4 animate-fade-in">
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
                  : notSentRequired > 0
                  ? `Faltam ${notSentRequired} documento${notSentRequired > 1 ? "s" : ""} obrigatório${notSentRequired > 1 ? "s" : ""}`
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
                style={{ width: `${(approvedCount / requiredDocs.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {approvedCount}/{requiredDocs.length}
            </span>
          </div>
        </div>

        {/* Required docs */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Documentos obrigatórios ({requiredDocs.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Todos os documentos abaixo são obrigatórios para ativar seu perfil. Envie fotos nítidas e legíveis.
          </p>
          {requiredDocs.map(renderDocCard)}
        </div>

        {/* Optional docs */}
        {optionalDocs.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Documentos opcionais</h2>
            <p className="text-xs text-muted-foreground">Aumentam sua credibilidade e prioridade no matching</p>
            {optionalDocs.map(renderDocCard)}
          </div>
        )}

        {/* Tips */}
        <div className="p-4 bg-muted/50 rounded-xl">
          <h4 className="font-medium text-foreground mb-2">⚠️ Requisitos para aprovação</h4>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>• Fotos <strong className="text-foreground">nítidas, sem reflexos e sem cortes</strong></li>
            <li>• Documento inteiro visível e <strong className="text-foreground">todos os dados legíveis</strong></li>
            <li>• Documento válido e <strong className="text-foreground">não vencido</strong></li>
            <li>• Selfie com <strong className="text-foreground">rosto e documento claramente visíveis</strong></li>
            <li>• Resolução mínima: <strong className="text-foreground">800px</strong> no maior lado</li>
            <li>• Tamanho mínimo: <strong className="text-foreground">100KB</strong> por arquivo</li>
          </ul>
        </div>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
