import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background safe-top">
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <Logo size="sm" iconOnly />
          <h1 className="text-lg font-semibold text-foreground">Política de Privacidade</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6 text-foreground">
        <p className="text-sm text-muted-foreground">Última atualização: 30 de março de 2026</p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Dados Coletados</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Coletamos nome, e-mail, telefone, CPF (para profissionais), endereço e dados de localização para a prestação do serviço. Dados de pagamento são processados por parceiros seguros e não ficam armazenados na plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. Uso dos Dados</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Seus dados são utilizados para: criação e manutenção da conta, agendamento de serviços, processamento de pagamentos, comunicação sobre pedidos e melhorias na plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3. Compartilhamento</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Compartilhamos dados apenas com: a profissional designada para o serviço (nome e endereço), processadores de pagamento e autoridades quando exigido por lei.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">4. Segurança</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Utilizamos criptografia para proteger dados sensíveis como chaves Pix e informações bancárias. Documentos de verificação são armazenados com acesso restrito e URLs temporárias.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">5. Seus Direitos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo suporte no aplicativo, conforme a Lei Geral de Proteção de Dados (LGPD).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. Contato</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato pelo suporte dentro do aplicativo.
          </p>
        </section>
      </main>
    </div>
  );
}
