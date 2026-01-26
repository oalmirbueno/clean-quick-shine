import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

interface AnimatedListItemProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

export function AnimatedList({ children, className }: AnimatedListProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedListItem({ children, className }: AnimatedListItemProps) {
  return (
    <motion.div
      variants={itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
