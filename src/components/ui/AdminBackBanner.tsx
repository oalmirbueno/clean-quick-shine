import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export function AdminBackBanner() {
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  if (!hasRole("admin")) return null;

  return (
    <button
      onClick={() => navigate("/admin/dashboard")}
      className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 bg-primary text-primary-foreground text-xs font-semibold py-1.5"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <ShieldCheck className="w-3.5 h-3.5" />
      Voltar ao Painel Admin
    </button>
  );
}
