import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logoIcon from "@/assets/logo-icon.png";

export default function Index() {
  const navigate = useNavigate();
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Quick brand vignette - 800ms
    const timer = setTimeout(() => {
      setShow(false);
    }, 800);

    const navigateTimer = setTimeout(() => {
      navigate("/onboarding", { replace: true });
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
            className="w-20 h-20"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
