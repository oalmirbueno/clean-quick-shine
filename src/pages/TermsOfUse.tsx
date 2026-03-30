import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function TermsOfUse() {
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
          <h1 className="text-lg font-semibold text-foreground">Termos de Uso</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6 text-foreground">
        <p className="text-sm text-muted-foreground">Última atualização: 30 de março de 2026</p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Aceitação dos Termos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ao utilizar o aplicativo Já Limpo, você concorda com estes Termos de Uso. Se não concordar, não utilize o serviço.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. Descrição do Serviço</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O Já Limpo é uma plataforma que conecta clientes a profissionais de limpeza (diaristas). Atuamos como intermediários, facilitando o agendamento, pagamento e comunicação entre as partes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3. Cadastro</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para utilizar o serviço, é necessário criar uma conta com informações verdadeiras e atualizadas. Você é responsável por manter a segurança da sua senha e conta.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">4. Pagamentos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Os pagamentos são processados por meio de parceiros de pagamento. O valor do serviço é definido pela plataforma com base no tipo de limpeza, duração e localidade. A profissional recebe 80% do valor após a avaliação do cliente.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">5. Cancelamentos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cancelamentos podem ser realizados conforme a política vigente. Cancelamentos frequentes podem resultar em restrições na conta.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. Responsabilidades</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O Já Limpo não é empregador das profissionais. A relação entre cliente e diarista é de prestação de serviço autônomo. A plataforma não se responsabiliza por danos materiais durante a execução do serviço, mas oferece canais de suporte para mediação.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">7. Contato</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para dúvidas sobre estes termos, entre em contato pelo suporte dentro do aplicativo.
          </p>
        </section>
      </main>
    </div>
  );
}
