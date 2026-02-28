import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-background safe-top overflow-hidden">
      <AdminSidebar />
      <main className="lg:ml-64 pt-14 lg:pt-0 flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
