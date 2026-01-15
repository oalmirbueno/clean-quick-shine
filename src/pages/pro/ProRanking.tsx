import { useNavigate } from "react-router-dom";
import { ChevronLeft, Star, CheckCircle2, TrendingUp, Award } from "lucide-react";
import { mockProProfile } from "@/lib/mockData";

const stats = [
  { label: "Nota média", value: mockProProfile.ratingAvg.toFixed(1), icon: Star, color: "text-warning" },
  { label: "Total serviços", value: mockProProfile.jobsDone.toString(), icon: Award, color: "text-primary" },
  { label: "Taxa de aceitação", value: `${mockProProfile.acceptanceRate}%`, icon: TrendingUp, color: "text-success" },
];

const tips = [
  "Responda rapidamente aos pedidos para aumentar sua taxa de aceitação",
  "Seja pontual - chegue no horário combinado",
  "Mantenha uma comunicação clara com os clientes",
  "Preste um serviço de qualidade para ganhar boas avaliações",
];

export default function ProRanking() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            Meu ranking
          </h1>
        </div>
      </header>

      <main className="p-4 space-y-6 animate-fade-in">
        {/* Profile Card */}
        <div className="bg-card rounded-xl border border-border p-6 text-center card-shadow">
          <div className="relative inline-block mb-4">
            <img
              src={mockProProfile.avatar}
              alt={mockProProfile.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
            />
            {mockProProfile.verified && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-success rounded-full flex items-center justify-center border-2 border-background">
                <CheckCircle2 className="w-5 h-5 text-success-foreground" />
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-bold text-foreground">{mockProProfile.name}</h2>
          
          {mockProProfile.verified && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-success/10 rounded-full mt-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">Profissional verificada</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className="bg-card rounded-xl border border-border p-4 text-center card-shadow"
            >
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Ranking Info */}
        <div className="bg-accent rounded-xl p-4 border border-primary/10">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Como subir no ranking
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Profissionais com ranking alto recebem mais pedidos e aparecem primeiro para os clientes.
          </p>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-primary font-medium">{index + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Progress to Next Level */}
        <div className="bg-card rounded-xl border border-border p-4 card-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-foreground">Próximo nível</span>
            <span className="text-sm text-muted-foreground">87%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: "87%" }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Complete mais 13 serviços para alcançar o nível Ouro ⭐
          </p>
        </div>
      </main>
    </div>
  );
}
