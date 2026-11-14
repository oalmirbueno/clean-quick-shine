import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./AdminSidebar";
import { AdminBottomNav } from "./AdminBottomNav";

interface AdminLayoutProps {
  children: ReactNode;
  /**
   * No computador a página não rola inteira: título e filtros ficam parados e
   * só a área marcada com a classe `admin-rolagem` rola. No celular segue a
   * rolagem normal da página.
   */
  fixo?: boolean;
}

export function AdminLayout({ children, fixo }: AdminLayoutProps) {
  return (
    <div className="h-full min-h-0 overflow-hidden flex bg-background">
      <AdminSidebar />
      <main
        className={cn("app-scroll-container lg:ml-64 flex-1 h-full min-h-0", fixo && "admin-fixo")}
        style={{
          paddingTop: "var(--safe-area-inset-top, env(safe-area-inset-top, 0px))",
          paddingBottom: "var(--bottom-nav-height, 56px)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className={cn("p-4 lg:p-6 space-y-5 lg:space-y-6 animate-fade-in", fixo ? "admin-fixo-conteudo" : "lg:!pb-8")}>
          {children}
        </div>
      </main>
      <AdminBottomNav />
    </div>
  );
}
