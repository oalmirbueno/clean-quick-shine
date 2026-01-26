import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  rolesLoaded: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string, role: AppRole) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; roles?: AppRole[] }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  const fetchRoles = useCallback(async (userId: string): Promise<AppRole[]> => {
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    
    return userRoles?.map((r) => r.role) || [];
  }, []);

  const refreshRoles = useCallback(async () => {
    if (!user?.id) return;
    const fetchedRoles = await fetchRoles(user.id);
    setRoles(fetchedRoles);
    setRolesLoaded(true);
  }, [user?.id, fetchRoles]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer role fetching to avoid blocking
          const fetchedRoles = await fetchRoles(session.user.id);
          setRoles(fetchedRoles);
          setRolesLoaded(true);
        } else {
          setRoles([]);
          setRolesLoaded(false);
        }
        
        setLoading(false);
      }
    );

    // THEN get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const fetchedRoles = await fetchRoles(session.user.id);
        setRoles(fetchedRoles);
        setRolesLoaded(true);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchRoles]);

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    phone: string,
    role: AppRole
  ): Promise<{ error: AuthError | null }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) return { error };

    // Update profile with phone and add role
    if (data.user) {
      // Update profile
      await supabase
        .from("profiles")
        .update({ phone })
        .eq("user_id", data.user.id);

      // Add user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: data.user.id, role });

      if (roleError) {
        console.error("Error inserting role:", roleError);
      }

      // Update local state immediately
      setRoles([role]);
      setRolesLoaded(true);
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null; roles?: AppRole[] }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) return { error };

    // Fetch roles immediately after sign in
    if (data.user) {
      const fetchedRoles = await fetchRoles(data.user.id);
      setRoles(fetchedRoles);
      setRolesLoaded(true);
      return { error: null, roles: fetchedRoles };
    }
    
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
    setRolesLoaded(false);
  };

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        roles,
        rolesLoaded,
        signUp,
        signIn,
        signOut,
        hasRole,
        refreshRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
