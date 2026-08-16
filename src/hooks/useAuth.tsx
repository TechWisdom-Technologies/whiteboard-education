import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "admin" | "partner" | "user";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyResetOtp: (email: string, token: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  isRecoverySession: boolean;
  clearRecovery: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  roles: [],
  loading: true,
  hasRole: () => false,
  signOut: async () => {},
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  resetPassword: async () => ({ success: false }),
  verifyResetOtp: async () => ({ success: false }),
  updatePassword: async () => ({ success: false }),
  isRecoverySession: false,
  clearRecovery: () => {},
});

export const useAuth = () => useContext(AuthContext);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function fetchUserRoles(userId: string, accessToken?: string): Promise<AppRole[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/user_roles?select=role&user_id=eq.${userId}`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${accessToken || SUPABASE_KEY}`,
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map((r: any) => r.role as AppRole);
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecoverySession, setIsRecoverySession] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session: sess } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (sess?.user) {
          // Pre-populate with cached roles for instant flicker-free access
          const cached = localStorage.getItem(`auth_roles_${sess.user.id}`);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setRoles(parsed);
              }
            } catch (_) {}
          }
          setSession(sess);

          // Await fresh roles from DB before ending loading
          const r = await fetchUserRoles(sess.user.id, sess.access_token);
          if (!mounted) return;
          setRoles(r);
          localStorage.setItem(`auth_roles_${sess.user.id}`, JSON.stringify(r));
        } else {
          setRoles([]);
          setSession(null);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoverySession(true);
      }

      if (sess?.user) {
        setSession(sess);
        const r = await fetchUserRoles(sess.user.id, sess.access_token);
        if (!mounted) return;
        setRoles(r);
        localStorage.setItem(`auth_roles_${sess.user.id}`, JSON.stringify(r));
      } else {
        if (!mounted) return;
        setRoles([]);
        setSession(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    const r = await fetchUserRoles(data.user.id, data.session?.access_token);
    setRoles(r);
    localStorage.setItem(`auth_roles_${data.user.id}`, JSON.stringify(r));
    const redirectTo = r.includes("admin") ? "/admin" : r.includes("partner") ? "/partner-dashboard" : "/";
    return { success: true, redirectTo };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split("@")[0] },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const signOut = useCallback(async () => {
    if (session?.user) {
      localStorage.removeItem(`auth_roles_${session.user.id}`);
    }
    await supabase.auth.signOut();
    setSession(null);
    setRoles([]);
  }, [session?.user]);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const verifyResetOtp = useCallback(async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const clearRecovery = useCallback(() => {
    setIsRecoverySession(false);
  }, []);

  const hasRole = useCallback((role: AppRole) => roles.includes(role), [roles]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        roles,
        loading,
        hasRole,
        signOut,
        signIn,
        signUp,
        resetPassword,
        verifyResetOtp,
        updatePassword,
        isRecoverySession,
        clearRecovery,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
