import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logoIcon from "@/assets/logo-icon.png";
import { supabase } from "@/integrations/supabase/client";
import { MobilePwaGate } from "@/components/MobilePwaGate";
import Onboarding from "./Onboarding";

/**
 * Root route ("/"):
 * - Resolves auth/role and either redirects authenticated users to their
 *   home, or renders Onboarding inline for logged-out visitors.
 * - Renders Onboarding directly (no client-side redirect to /onboarding)
 *   to eliminate the LCP soft-redirect penalty.
 */
export default function Index() {
  const navigate = useNavigate();
  const [resolving, setResolving] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session?.user) {
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        if (cancelled) return;

        const roles = userRoles?.map(r => r.role) || [];

        if (roles.includes("admin")) {
          navigate("/admin/dashboard", { replace: true });
          return;
        }
        if (roles.includes("pro")) {
          navigate("/pro/home", { replace: true });
          return;
        }
        if (roles.includes("client")) {
          navigate("/client/home", { replace: true });
          return;
        }
      }

      // Logged-out (or no role): render Onboarding inline.
      setResolving(false);
    })();

    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <>
      <AnimatePresence>
        {resolving && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 bg-background flex items-center justify-center"
          >
            <motion.img
              src={logoIcon}
              alt="Já Limpo"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="w-32 h-32"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!resolving && (
        <MobilePwaGate>
          <Onboarding />
        </MobilePwaGate>
      )}
    </>
  );
}
