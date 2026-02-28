import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <main className="lg:ml-64 lg:pt-0 flex-1 min-h-screen overflow-y-auto admin-main-mobile">
        <div className="p-4 lg:p-6 space-y-6 animate-fade-in pb-8">
          {children}
        </div>
      </main>
      <style>{`
        @media (max-width: 1023px) {
          .admin-main-mobile {
            padding-top: calc(4.5rem + env(safe-area-inset-top, 12px));
          }
        }
      `}</style>
    </div>
  );
}
