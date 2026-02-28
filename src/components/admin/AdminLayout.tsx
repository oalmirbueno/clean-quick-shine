import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 pt-14 lg:pt-0 min-h-screen overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-6 animate-fade-in pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
