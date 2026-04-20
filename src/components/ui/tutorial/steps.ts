import {
  Calendar, Star, MapPin, Search, Wallet, Trophy,
  Sparkles, Shield, Bell, CreditCard, ThumbsUp, Power,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface TutorialStep {
  icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
  /** Bullets práticos — máximo 3 */
  tips?: string[];
}

export const clientSteps: TutorialStep[] = [
  {
    icon: Sparkles,
    badge: "Bem-vindo",
    title: "Limpeza profissional, sem complicação",
    description:
      "Em poucos toques você agenda uma profissional verificada e acompanha tudo em tempo real.",
    tips: [
      "Profissionais verificadas com documento",
      "Pagamento protegido pelo app",
      "Suporte humano sempre que precisar",
    ],
  },
  {
    icon: Search,
    badge: "Passo 1",
    title: "Escolha o serviço",
    description:
      "Na tela inicial, toque no tipo de limpeza que precisa: residencial, comercial, pós-obra ou emergência.",
    tips: [
      "Veja preço e duração antes de seguir",
      "Cada serviço tem profissionais especializadas",
    ],
  },
  {
    icon: MapPin,
    badge: "Passo 2",
    title: "Informe o endereço",
    description:
      "Adicione onde quer o serviço. Salve seus endereços favoritos para agendar mais rápido depois.",
    tips: [
      "Endereço exato evita atrasos",
      "Salve casa, trabalho e outros locais",
    ],
  },
  {
    icon: Calendar,
    badge: "Passo 3",
    title: "Escolha data e horário",
    description:
      "Selecione o melhor dia e horário. Pode ser hoje mesmo ou planejar para a semana.",
    tips: ["Horários disponíveis em verde", "Confirmação imediata"],
  },
  {
    icon: CreditCard,
    badge: "Passo 4",
    title: "Pague com segurança",
    description:
      "Pague via PIX direto no app. O valor só é liberado para a profissional após o serviço concluído.",
    tips: ["PIX confirmado em segundos", "Cupom de desconto no checkout"],
  },
  {
    icon: Bell,
    badge: "Acompanhe",
    title: "Tudo em tempo real",
    description:
      "Receba notificações quando a profissional confirmar, sair, chegar e iniciar o serviço.",
    tips: ["Atualizações automáticas", "Chat direto se precisar falar"],
  },
  {
    icon: Star,
    badge: "Finalize",
    title: "Avalie e ajude a comunidade",
    description:
      "Ao final, dê uma nota e comentário. Sua avaliação mantém o padrão de qualidade do Já Limpo.",
    tips: ["Ajuda outras pessoas a escolher", "Você pode favoritar profissionais"],
  },
];

export const proSteps: TutorialStep[] = [
  {
    icon: Sparkles,
    badge: "Bem-vinda",
    title: "Trabalhe com liberdade no Já Limpo",
    description:
      "Você define quando trabalhar, em quais zonas e recebe direto no PIX. Sem mensalidade obrigatória.",
    tips: [
      "Você fica com 80% de cada serviço",
      "Saque a partir de R$ 10,00",
      "Suporte dedicado para diaristas",
    ],
  },
  {
    icon: Shield,
    badge: "Passo 1",
    title: "Envie seus documentos",
    description:
      "Para começar a receber pedidos, envie RG/CNH (frente e verso) e uma selfie. A análise leva poucas horas.",
    tips: ["Foto nítida e sem reflexo", "Documento dentro da validade"],
  },
  {
    icon: MapPin,
    badge: "Passo 2",
    title: "Defina suas zonas",
    description:
      "Escolha em quais bairros e cidades você quer atender. Você só recebe pedidos dessas regiões.",
    tips: ["Quanto mais zonas, mais pedidos", "Pode editar quando quiser"],
  },
  {
    icon: Power,
    badge: "Passo 3",
    title: "Ative quando estiver disponível",
    description:
      "Toque em 'Disponível' na tela inicial. Os pedidos aparecem automaticamente para aceitar ou recusar.",
    tips: ["Aceite rápido = mais pedidos", "Desative quando não puder atender"],
  },
  {
    icon: ThumbsUp,
    badge: "Passo 4",
    title: "Capriche no atendimento",
    description:
      "Chegue no horário, capriche na limpeza e seja gentil. Boas avaliações sobem você no ranking.",
    tips: ["Pontualidade conta muito", "Comunicação clara evita problemas"],
  },
  {
    icon: Wallet,
    badge: "Receba",
    title: "Saque seu dinheiro pelo PIX",
    description:
      "Após cada serviço avaliado, 80% vai para seu saldo. Saque na hora pelo PIX, sem taxa.",
    tips: ["Disponível assim que o cliente avalia", "Cadastre seu PIX no perfil"],
  },
  {
    icon: Trophy,
    badge: "Cresça",
    title: "Suba no ranking e ganhe mais",
    description:
      "Mantenha boas notas, baixo cancelamento e pontualidade. Quanto melhor seu nível, mais pedidos premium.",
    tips: ["Níveis A, B, C e D", "Plano ELITE prioriza pedidos"],
  },
];
