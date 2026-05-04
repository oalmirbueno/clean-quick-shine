import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminBottomNav } from "./AdminBottomNav";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="h-full min-h-0 flex bg-background">
      <AdminSidebar />
      <main
        className="lg:ml-64 flex-1 h-full min-h-0 overflow-y-auto overscroll-contain"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "calc(4rem + var(--bottom-nav-safe-area, 0px))",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="p-4 lg:p-6 space-y-5 lg:space-y-6 animate-fade-in lg:!pb-8">
          {children}
        </div>
      </main>
      <AdminBottomNav />
    </div>
  );
}
