import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Shield, Star, Clock } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: ReactNode;
  /** Show back button at top of form column. */
  onBack?: () => void;
  /** Eyebrow text above title. */
  eyebrow?: ReactNode;
  /** Main heading inside the form column. */
  title?: ReactNode;
  /** Supporting subtitle below the heading. */
  subtitle?: ReactNode;
  /** Optional tagline shown on the marketing column (desktop only). */
  marketingTitle?: string;
  marketingSubtitle?: string;
  /** Show the trust strip (Verificado · 4.9 · Rápido). */
  showTrust?: boolean;
  /** Hide the marketing column entirely (e.g. ResetPassword). */
  hideMarketing?: boolean;
  className?: string;
}

/**
 * Premium split-layout shell shared by every auth screen.
 * Mobile: single centered column.
 * Desktop (lg+): brand + benefits on the left, form on the right.
 */
export function AuthLayout({
  children,
  onBack,
  eyebrow,
  title,
  subtitle,
  marketingTitle = "Chamou, tá limpo.",
  marketingSubtitle = "Diaristas verificadas, pagamento protegido e padrão profissional em poucos toques.",
  showTrust = true,
  hideMarketing = false,
  className,
}: AuthLayoutProps) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <div
      className="h-full bg-background flex overflow-hidden"
      style={{
        paddingTop: "max(env(safe-area-inset-top, 0px), 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* ====== Marketing column (desktop only) ====== */}
      {!hideMarketing && (
        <aside className="hidden lg:flex relative w-[44%] xl:w-[48%] flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent">
          {/* Decorative blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-32 -right-20 w-80 h-80 rounded-full bg-success/15 blur-3xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <Logo size="lg" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative z-10 max-w-md"
          >
            <h2 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight tracking-tight">
              {marketingTitle}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {marketingSubtitle}
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { icon: Shield, label: "Verificado", hint: "Diaristas avaliadas" },
                { icon: Star, label: "4.9", hint: "Avaliação média" },
                { icon: Clock, label: "Rápido", hint: "Em poucos toques" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-4"
                >
                  <item.icon className="w-5 h-5 text-primary mb-2" />
                  <div className="text-sm font-semibold text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{item.hint}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative z-10 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Já Limpo
          </div>
        </aside>
      )}

      {/* ====== Form column ====== */}
      <main
        className={cn(
          "relative flex-1 flex flex-col overflow-hidden",
          hideMarketing && "items-center"
        )}
      >
        {/* Mobile background accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute -top-32 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 w-64 h-64 rounded-full bg-success/8 blur-3xl" />
        </div>

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-4 shrink-0">
          {onBack ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              aria-label="Voltar"
              className="w-10 h-10 rounded-xl bg-card border border-border/60 flex items-center justify-center hover:bg-muted transition-colors shadow-xs"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </motion.button>
          ) : (
            <div className="w-10 h-10" aria-hidden />
          )}
          <div className="lg:hidden">
            <Logo size="sm" iconOnly />
          </div>
          <div className="w-10 h-10" aria-hidden />
        </div>

        {/* Centered content */}
        <div className="relative z-10 flex-1 overflow-y-auto">
          <div className="min-h-full flex flex-col items-center justify-center px-6 py-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={cn("w-full max-w-sm", className)}
            >
              {(eyebrow || title || subtitle) && (
                <div className="mb-7 text-center lg:text-left">
                  {eyebrow && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
                      {eyebrow}
                    </div>
                  )}
                  {title && (
                    <h1 className="text-[28px] leading-tight font-bold text-foreground tracking-tight">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="mt-1.5 text-[15px] text-muted-foreground">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
              {children}

              {showTrust && (
                <div className="mt-8 flex items-center justify-center gap-5 lg:hidden">
                  {[
                    { icon: Shield, label: "Verificado" },
                    { icon: Star, label: "4.9", fill: true },
                    { icon: Clock, label: "Rápido" },
                  ].map((b) => (
                    <div
                      key={b.label}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <b.icon
                        className={cn(
                          "w-3.5 h-3.5 text-primary",
                          b.fill && "text-warning fill-warning"
                        )}
                      />
                      <span>{b.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
