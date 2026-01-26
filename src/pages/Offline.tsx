import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { motion } from "framer-motion";

export default function Offline() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        <Logo size="lg" className="mb-8" />
        
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <WifiOff className="w-10 h-10 text-muted-foreground" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Você está offline
        </h1>
        
        <p className="text-muted-foreground mb-8">
          Parece que você perdeu a conexão com a internet. 
          Verifique sua conexão e tente novamente.
        </p>
        
        <Button onClick={handleRetry} size="lg" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </Button>
        
        <p className="text-xs text-muted-foreground mt-6">
          Algumas funcionalidades podem estar disponíveis offline
        </p>
      </motion.div>
    </div>
  );
}
