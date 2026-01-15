import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockProProfile } from "@/lib/mockData";

const ratingTags = [
  { id: "punctuality", label: "Pontualidade" },
  { id: "quality", label: "Qualidade" },
  { id: "organization", label: "Organização" },
  { id: "politeness", label: "Educação" },
];

export default function ClientRating() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate("/client/orders");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 p-6 flex flex-col items-center animate-fade-in">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-success" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Serviço concluído ✅
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Como foi a sua experiência com {mockProProfile.name}?
        </p>

        {/* Pro Avatar */}
        <img
          src={mockProProfile.avatar}
          alt={mockProProfile.name}
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
            className="w-full px-4 py-3 rounded-xl border border-input bg-background
              text-foreground placeholder:text-muted-foreground resize-none h-24
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              transition-all duration-200"
          />
        </div>
      </main>

      {/* Bottom Action */}
      <div className="p-4 bg-card border-t border-border">
        <PrimaryButton
          fullWidth
          loading={loading}
          disabled={rating === 0}
          onClick={handleSubmit}
        >
          Enviar avaliação e liberar pagamento
        </PrimaryButton>
      </div>
    </div>
  );
}
