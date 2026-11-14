import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    // o servidor entrega a casca do app com status 200: avisa os buscadores para não indexar
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [location.pathname]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-muted overflow-hidden safe-top safe-bottom">
      <div className="text-center p-6">
        <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Página não encontrada</p>
        <a href="/app" className="text-primary underline hover:text-primary/90">
          Voltar ao início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
