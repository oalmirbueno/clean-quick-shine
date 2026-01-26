import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Star, Check, Loader2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrder } from "@/hooks/useOrders";
import { useSubmitRating } from "@/hooks/useSubmitRating";

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

  return (
    <div className="fixed inset-0 bg-background flex flex-col safe-top">
      <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center animate-fade-in">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-success" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Serviço concluído
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Como foi a sua experiência com {proName}?
        </p>

        {/* Pro Avatar */}
        <img
          src={proAvatar}
          alt={proName}
          className="w-20 h-20 rounded-full object-cover border-4 border-primary/20 mb-6"
        />

        {/* Star Rating */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "w-10 h-10 transition-colors",
                  (hoverRating || rating) >= star
                    ? "fill-warning text-warning"
                    : "text-border"
                )}
              />
            </button>
          ))}
        </div>

        {/* Rating Tags */}
        <div className="w-full max-w-sm">
          <p className="text-sm font-medium text-foreground mb-3 text-center">
            O que você mais gostou?
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {ratingTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  selectedTags.includes(tag.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Comment */}
          <textarea
            placeholder="Deixe um comentário (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl border border-input bg-background
              text-foreground placeholder:text-muted-foreground resize-none h-24
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              transition-all duration-200"
          />
          <p className="text-xs text-muted-foreground text-right mt-1">
            {comment.length}/500
          </p>
        </div>
      </main>

      {/* Bottom Action */}
      <div className="p-4 bg-card border-t border-border">
        <PrimaryButton
          fullWidth
          loading={submitRating.isPending}
          disabled={rating === 0}
          onClick={handleSubmit}
        >
          Enviar avaliação e liberar pagamento
        </PrimaryButton>
      </div>
    </div>
  );
}
