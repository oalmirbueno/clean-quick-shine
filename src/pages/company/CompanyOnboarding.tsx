import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Building2, Phone, Mail, User, FileText, ChevronLeft, CheckCircle } from "lucide-react";

export default function CompanyOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    cnpj: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  });

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStep(3);
    setLoading(false);
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-6 animate-fade-in">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Cadastro realizado!</h1>
        <p className="text-muted-foreground mb-8">
          Sua empresa foi cadastrada com sucesso. Agora você pode solicitar um orçamento.
        </p>
        <PrimaryButton onClick={() => navigate("/company/request-quote")} fullWidth>
          Solicitar orçamento
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
            className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <Logo size="sm" iconOnly />
        </div>
      </header>

      <main className="p-6 animate-fade-in">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
        </div>

        {step === 1 && (
          <>
            <div className="mb-8">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Cadastre sua empresa
              </h1>
              <p className="text-muted-foreground">
                Ofereça limpeza profissional para seus colaboradores e instalações.
              </p>
            </div>

            <div className="space-y-4">
              <InputField
                label="Nome da empresa"
                placeholder="Empresa XYZ Ltda"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                icon={<Building2 className="w-5 h-5 text-muted-foreground" />}
              />
              <InputField
                label="CNPJ"
                placeholder="00.000.000/0001-00"
                value={formData.cnpj}
                onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                icon={<FileText className="w-5 h-5 text-muted-foreground" />}
              />
            </div>

            <div className="mt-8">
              <PrimaryButton 
                fullWidth 
                onClick={() => setStep(2)}
                disabled={!formData.companyName || !formData.cnpj}
              >
                Continuar
              </PrimaryButton>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-8">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Contato responsável
              </h1>
              <p className="text-muted-foreground">
                Quem será o ponto de contato para os serviços?
              </p>
            </div>

            <div className="space-y-4">
              <InputField
                label="Nome do responsável"
                placeholder="João Silva"
                value={formData.contactName}
                onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                icon={<User className="w-5 h-5 text-muted-foreground" />}
              />
              <InputField
                label="Telefone"
                placeholder="(11) 99999-9999"
                value={formData.contactPhone}
                onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                icon={<Phone className="w-5 h-5 text-muted-foreground" />}
              />
              <InputField
                label="E-mail corporativo"
                placeholder="contato@empresa.com"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                icon={<Mail className="w-5 h-5 text-muted-foreground" />}
              />
            </div>

            <div className="mt-8">
              <PrimaryButton 
                fullWidth 
                loading={loading}
                onClick={handleSubmit}
                disabled={!formData.contactName || !formData.contactPhone || !formData.contactEmail}
              >
                Finalizar cadastro
              </PrimaryButton>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
