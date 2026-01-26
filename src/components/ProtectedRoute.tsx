import { ReactNode, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLoading } from "@/components/ui/AuthLoading";
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
  const [timedOut, setTimedOut] = useState(false);

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading || (user && !rolesLoaded)) {
        console.warn("ProtectedRoute: Timeout reached, redirecting to login");
        setTimedOut(true);
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [loading, user, rolesLoaded]);

  // Reset timeout when state changes
  useEffect(() => {
    if (!loading && rolesLoaded) {
      setTimedOut(false);
    }
  }, [loading, rolesLoaded]);

  if (timedOut) {
    return <Navigate to="/login" replace />;
  }

  // Show loading while auth or roles are being fetched
  if (loading || (user && !rolesLoaded)) {
    return <AuthLoading message="Verificando acesso..." />;
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
