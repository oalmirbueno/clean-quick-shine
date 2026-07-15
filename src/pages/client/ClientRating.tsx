import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Star, Check, Loader2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrder } from "@/hooks/useOrders";
import { useSubmitRating } from "@/hooks/useSubmitRating";

const ratingLabels: Record<number, { title: string; sub: string }> = {
  1: { title: "Muito ruim", sub: "Sentimos muito pela experiência." },
  2: { title: "Ruim", sub: "Vamos trabalhar para melhorar." },
  3: { title: "Regular", sub: "Podemos fazer melhor da próxima vez." },
  4: { title: "Muito bom", sub: "Que bom que gostou!" },
  5: { title: "Excelente!", sub: "Isso faz toda a diferença." },
};


const ratingTags = [
  { id: "punctuality", label: "Pontualidade" },
  { id: "quality", label: "Qualidade" },
  { id: "organization", label: "Organização" },
  { id: "politeness", label: "Educação" },
];

export default function ClientRating() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId as string | null;

  const { data: order, isLoading: orderLoading } = useOrder(orderId);
  const submitRating = useSubmitRating();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!orderId || rating === 0) return;

    submitRating.mutate(
      {
        orderId,
        rating,
        review: comment.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      },
      {
        onSuccess: () => {
          navigate("/client/orders");
        },
      }
    );
  };

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/client/orders")}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              Pedido não encontrado
            </h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground">Não foi possível carregar o pedido para avaliação.</p>
        </main>
      </div>
    );
  }

  // Check if already rated
  if (order.client_rating) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/client/orders")}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              Avaliação
            </h1>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-success" />
          </div>
          <p className="text-foreground font-medium mb-2">Este pedido já foi avaliado</p>
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-6 h-6",
                  order.client_rating! >= star
                    ? "fill-warning text-warning"
                    : "text-border"
                )}
              />
            ))}
          </div>
          <PrimaryButton onClick={() => navigate("/client/orders")}>
            Ver meus pedidos
          </PrimaryButton>
        </main>
      </div>
    );
  }

  const proAvatar = order.pro_profile?.avatar_url || 
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.pro_id}`;
  const proName = order.pro_profile?.full_name || "Profissional";

  const activeRating = hoverRating || rating;
  const feedback = activeRating > 0 ? ratingLabels[activeRating] : null;

  return (
    <div className="h-full bg-background flex flex-col safe-top">
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="size-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-semibold text-foreground">Avaliar serviço</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 animate-fade-in">
        {/* Hero */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4">
            <img
              src={proAvatar}
              alt={proName}
              className="size-24 rounded-full object-cover ring-4 ring-primary/15"
            />
            <div className="absolute -bottom-1 -right-1 size-8 bg-primary rounded-full flex items-center justify-center ring-4 ring-background">
              <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground leading-tight">
            Como foi com {proName.split(" ")[0]}?
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
            Sua nota ajuda outros clientes a escolherem os melhores profissionais.
          </p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-1.5 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              whileTap={{ scale: 0.85 }}
              animate={rating === star ? { scale: [1, 1.25, 1] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
              className="p-1"
              aria-label={`${star} estrelas`}
            >
              <Star
                className={cn(
                  "w-11 h-11 transition-colors",
                  activeRating >= star
                    ? "fill-warning text-warning"
                    : "text-border"
                )}
              />
            </motion.button>
          ))}
        </div>

        <div className="h-6 mb-6 flex items-center justify-center">
          {feedback && (
            <motion.div
              key={activeRating}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="text-sm font-semibold text-foreground">{feedback.title}</p>
              <p className="text-xs text-muted-foreground">{feedback.sub}</p>
            </motion.div>
          )}
        </div>

        {/* Tags + comment */}
        {rating > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <p className="text-sm font-medium text-foreground mb-3">
              O que se destacou?
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {ratingTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 active:scale-95",
                    selectedTags.includes(tag.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border/60 hover:border-primary/40"
                  )}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium text-foreground mb-2">
              Comentário <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <textarea
              placeholder="Conte um pouco mais sobre a experiência..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              className="w-full px-4 py-3 rounded-2xl border border-border/60 bg-card
                text-foreground placeholder:text-muted-foreground resize-none h-28 text-sm
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                transition-all duration-200"
            />
            <p className="text-xs text-muted-foreground text-right mt-1">
              {comment.length}/500
            </p>
          </motion.div>
        )}
      </main>

      {/* Bottom Action */}
      <div className="p-4 bg-card/95 backdrop-blur-md border-t border-border/60 safe-bottom">
        <PrimaryButton
          fullWidth
          loading={submitRating.isPending}
          disabled={rating === 0}
          onClick={handleSubmit}
        >
          {rating === 0 ? "Escolha uma nota" : "Enviar avaliação"}
        </PrimaryButton>
      </div>
    </div>
  );
}
