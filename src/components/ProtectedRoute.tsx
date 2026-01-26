import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: AppRole;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const { user, loading, hasRole, rolesLoaded, roles } = useAuth();
  const location = useLocation();

  // Show loading while auth or roles are being fetched
  if (loading || (user && !rolesLoaded)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Se roles carregadas mas vazias, redirecionar para login
  if (rolesLoaded && roles.length === 0) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect based on their actual role
    if (roles.includes("admin")) {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (roles.includes("client")) {
      return <Navigate to="/client/home" replace />;
    } else if (roles.includes("pro")) {
      return <Navigate to="/pro/home" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
