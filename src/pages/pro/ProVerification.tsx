import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/ui/BottomNav";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ChevronLeft, FileText, Camera, Home, Upload, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DocItem {
  id: string;
  icon: typeof FileText;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "not_sent";
}

export default function ProVerification() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<DocItem[]>([
    { id: "id_front", icon: FileText, title: "Documento (frente)", description: "RG ou CNH", status: "not_sent" },
    { id: "id_back", icon: FileText, title: "Documento (verso)", description: "RG ou CNH", status: "not_sent" },
    { id: "selfie", icon: Camera, title: "Selfie com documento", description: "Segurando o documento", status: "not_sent" },
    { id: "proof", icon: Home, title: "Comprovante de residência", description: "Conta de luz, água ou internet", status: "not_sent" },
  ]);

  const handleUpload = (docId: string) => {
    setDocs(prev => prev.map(d => 
      d.id === docId ? { ...d, status: "pending" as const } : d
    ));
    toast.success("Documento enviado para análise!");
  };

  const allSent = docs.every(d => d.status !== "not_sent");
  const allApproved = docs.every(d => d.status === "approved");

  return (
    <div className="min-h-screen bg-background pb-20">
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
            : allSent
            ? "bg-warning/10 border-warning/20"
            : "bg-accent border-primary/10"
        )}>
          <div className="flex items-center gap-3">
            {allApproved ? (
              <CheckCircle2 className="w-6 h-6 text-success" />
            ) : (
              <FileText className="w-6 h-6 text-primary" />
            )}
            <div>
              <p className="font-medium text-foreground">
                {allApproved 
                  ? "Verificação aprovada!" 
                  : allSent 
                  ? "Documentos em análise"
                  : "Envie seus documentos"
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {allApproved 
                  ? "Você já pode receber pedidos."
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
          {docs.map((doc) => (
            <div 
              key={doc.id}
              className="p-4 bg-card rounded-xl border border-border card-shadow"
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  doc.status === "approved" ? "bg-success/10" : "bg-secondary"
                )}>
                  <doc.icon className={cn(
                    "w-5 h-5",
                    doc.status === "approved" ? "text-success" : "text-muted-foreground"
                  )} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-foreground">{doc.title}</h3>
                    {doc.status !== "not_sent" && (
                      <StatusBadge status={doc.status} />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{doc.description}</p>
                </div>
              </div>

              {doc.status === "not_sent" && (
                <button
                  onClick={() => handleUpload(doc.id)}
                  className="mt-3 w-full py-2.5 rounded-lg border border-dashed border-primary/30
                    flex items-center justify-center gap-2 text-primary font-medium
                    hover:bg-primary/5 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Enviar documento
                </button>
              )}

              {doc.status === "rejected" && (
                <button
                  onClick={() => handleUpload(doc.id)}
                  className="mt-3 w-full py-2.5 rounded-lg border border-destructive/30
                    flex items-center justify-center gap-2 text-destructive font-medium
                    hover:bg-destructive/5 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Reenviar documento
                </button>
              )}
            </div>
          ))}
        </div>
      </main>

      <BottomNav variant="pro" />
    </div>
  );
}
