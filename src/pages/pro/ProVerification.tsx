import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { ProPageHeader } from "@/components/ui/ProPageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Upload, CheckCircle2, Loader2, AlertCircle, CreditCard, Camera, Shield, Clock, XCircle, ImageIcon, FileText, Check, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProDocuments } from "@/hooks/useProDocuments";
import { useAuth } from "@/contexts/AuthContext";
import { useVerificationThread } from "@/hooks/useVerificationThread";
import { VerificationThreadDrawer } from "@/components/admin/VerificationThreadDrawer";
import { toast } from "sonner";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

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
  const { user } = useAuth();
  const { thread, messages } = useVerificationThread(user?.id);
  const [chatOpen, setChatOpen] = useState(false);
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
    if (!acceptedTerms) {
      toast.error("Aceite os termos do profissional para continuar");
      return;
    }
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
      <motion.div variants={item} key={doc.id} className="p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
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
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", statusConfig.bg)}>
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
            disabled={isUploading || isCurrentlyUploading || !acceptedTerms}
            title={!acceptedTerms ? "Aceite os termos para enviar documentos" : undefined}
            className={cn(
              "mt-3 w-full py-2.5 rounded-xl border border-dashed",
              "flex items-center justify-center gap-2 font-medium text-sm",
              "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
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
            {!acceptedTerms
              ? "Aceite os termos para enviar"
              : status === "rejected" ? "Reenviar documento" : "Enviar documento"}
          </button>
        )}
      </motion.div>
    );
  };

  const bannerTone = allRequiredApproved
    ? { wrap: "bg-success/10 border-success/25", Icon: CheckCircle2, iconTone: "text-success" }
    : rejectedCount > 0
    ? { wrap: "bg-destructive/10 border-destructive/25", Icon: AlertCircle, iconTone: "text-destructive" }
    : pendingCount > 0
    ? { wrap: "bg-warning/10 border-warning/25", Icon: Clock, iconTone: "text-warning" }
    : { wrap: "bg-primary/5 border-primary/20", Icon: CreditCard, iconTone: "text-primary" };

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      <ProPageHeader title="Verificação" subtitle="Envie seus documentos para começar" />

      <main className="flex-1 overflow-y-auto min-h-0">
        <motion.div variants={container} initial="hidden" animate="show" className="px-5 pb-6 space-y-4">
          {/* Status Banner */}
          <motion.div variants={item} className={cn("p-4 rounded-2xl border shadow-sm", bannerTone.wrap)}>
            <div className="flex items-center gap-3">
              <div className={cn("w-11 h-11 rounded-xl bg-background/60 flex items-center justify-center shrink-0")}>
                <bannerTone.Icon className={cn("w-5 h-5", bannerTone.iconTone)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">
                  {allRequiredApproved
                    ? "Verificação completa!"
                    : rejectedCount > 0
                    ? "Documento(s) rejeitado(s)"
                    : pendingCount > 0
                    ? "Documentos em análise"
                    : "Envie seus documentos"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {allRequiredApproved
                    ? "Todos os obrigatórios aprovados"
                    : rejectedCount > 0
                    ? "Reenvie os rejeitados"
                    : pendingCount > 0
                    ? "Retornaremos em até 48h"
                    : notSentRequired > 0
                    ? `Faltam ${notSentRequired} obrigatório${notSentRequired > 1 ? "s" : ""}`
                    : "Complete sua verificação"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-foreground leading-none">{approvedCount}/{requiredDocs.length}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mt-1">Aprovados</p>
              </div>
            </div>

            <div className="mt-3 h-2 bg-background/60 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(approvedCount / requiredDocs.length) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          {/* Conversa com o suporte de verificação */}
          <motion.div variants={item}>
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="w-full p-4 bg-card rounded-2xl border border-border/60 shadow-sm hover:border-primary/40 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 relative">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  {thread && thread.unread_pro > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                      {thread.unread_pro}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm">Conversa com o suporte</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {messages.length > 0
                      ? messages[messages.length - 1].body
                      : "Tire dúvidas sobre sua verificação."}
                  </p>
                </div>
                <span className="text-xs text-primary font-medium shrink-0">Abrir →</span>
              </div>
            </button>
          </motion.div>

          {/* Terms acceptance */}
          {!allRequiredApproved && (
            <motion.div variants={item} className={cn(
              "p-4 rounded-2xl border shadow-sm transition-colors",
              acceptedTerms ? "bg-success/5 border-success/25" : "bg-card border-border/60"
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                  acceptedTerms ? "bg-success/15" : "bg-primary/10"
                )}>
                  <FileText className={cn("w-5 h-5", acceptedTerms ? "text-success" : "text-primary")} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">Termos do profissional</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Leia e aceite antes de enviar seus documentos.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/terms?tab=pro")}
                    className="text-xs text-primary font-medium hover:underline mt-1.5"
                  >
                    Ler termos completos →
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 mt-3 pt-3 border-t border-border/60 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => handleAcceptTerms(!acceptedTerms)}
                  aria-pressed={acceptedTerms}
                  className={cn(
                    "w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                    acceptedTerms ? "bg-primary border-primary" : "border-input hover:border-primary/50"
                  )}
                >
                  {acceptedTerms && <Check className="w-3 h-3 text-primary-foreground" />}
                </button>
                <span className="text-xs text-foreground leading-relaxed">
                  Li e aceito os <strong>Termos do Profissional</strong>, a{" "}
                  <button type="button" onClick={(e) => { e.preventDefault(); navigate("/privacy"); }} className="text-primary hover:underline">
                    Política de Privacidade
                  </button>{" "}
                  e a{" "}
                  <button type="button" onClick={(e) => { e.preventDefault(); navigate("/terms?tab=cancellation"); }} className="text-primary hover:underline">
                    Política de Cancelamento
                  </button>.
                </span>
              </label>
            </motion.div>
          )}

          {/* Required docs */}
          <motion.section variants={item} className="space-y-2.5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Documentos obrigatórios ({requiredDocs.length})</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Envie fotos nítidas e legíveis para ativar seu perfil.</p>
            </div>
            {requiredDocs.map(renderDocCard)}
          </motion.section>

          {/* Optional docs */}
          {optionalDocs.length > 0 && (
            <motion.section variants={item} className="space-y-2.5">
              <div>
                <h3 className="text-sm font-bold text-foreground">Documentos opcionais</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Aumentam sua credibilidade e prioridade no matching.</p>
              </div>
              {optionalDocs.map(renderDocCard)}
            </motion.section>
          )}

          {/* Tips */}
          <motion.div variants={item} className="p-4 bg-accent rounded-2xl border border-border/60">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground mb-1.5">Requisitos para aprovação</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Fotos <strong className="text-foreground">nítidas, sem reflexos e sem cortes</strong></li>
                  <li>• Documento inteiro e <strong className="text-foreground">todos os dados legíveis</strong></li>
                  <li>• Documento válido e <strong className="text-foreground">não vencido</strong></li>
                  <li>• Selfie com <strong className="text-foreground">rosto e documento visíveis</strong></li>
                  <li>• Resolução mínima <strong className="text-foreground">800px</strong> · <strong className="text-foreground">100KB+</strong> por arquivo</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <BottomNav variant="pro" />

      <VerificationThreadDrawer
        open={chatOpen}
        onOpenChange={setChatOpen}
        proUserId={user?.id}
        proName="Suporte de verificação"
        role="pro"
      />
    </div>
  );
}
