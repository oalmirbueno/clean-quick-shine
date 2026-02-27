import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logoIcon from "@/assets/logo-icon.png";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const navigate = useNavigate();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 800);

    const navigateTimer = setTimeout(async () => {
      // Check for active session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch roles to determine destination
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);
        
        const roles = userRoles?.map(r => r.role) || [];
        
        if (roles.includes("admin")) {
          navigate("/admin/dashboard", { replace: true });
        } else if (roles.includes("pro")) {
          navigate("/pro/home", { replace: true });
        } else if (roles.includes("client")) {
          navigate("/client/home", { replace: true });
        } else {
          navigate("/onboarding", { replace: true });
        }
      } else {
        navigate("/onboarding", { replace: true });
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 bg-background flex items-center justify-center"
        >
          <motion.img
            src={logoIcon}
            alt="Já Limpo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.4, 0, 0.2, 1]
            }}
            className="w-32 h-32"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
