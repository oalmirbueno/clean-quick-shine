import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative inline-flex items-center justify-center p-2 bg-transparent border-0 shadow-none focus:outline-none focus-visible:ring-0"
      aria-label="Alternar tema"
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === "dark" ? 180 : 0,
          scale: theme === "dark" ? 0.9 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {theme === "dark" ? (
          <Moon className="w-5 h-5 text-foreground" strokeWidth={1.8} />
        ) : (
          <Sun className="w-5 h-5 text-foreground" strokeWidth={1.8} />
        )}
      </motion.div>
    </motion.button>
  );
}
