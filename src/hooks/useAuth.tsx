import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "admin" | "partner" | "user";
type PartnerStatus = "pending" | "approved" | "rejected" | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  partnerStatus: PartnerStatus;
  refreshPartnerStatus: (userId?: string, token?: string) => Promise<void>;
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
  partnerStatus: null,
  refreshPartnerStatus: async () => {},
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

async function fetchPartnerStatus(userId: string, accessToken?: string): Promise<PartnerStatus> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/partner_registrations?select=status&user_id=eq.${userId}&limit=1`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${accessToken || SUPABASE_KEY}`,
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) return data[0].status as PartnerStatus;
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState<PartnerStatus>(null);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // 1. If arriving from an email redirect with a PKCE code, exchange it for a session first
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          const code = url.searchParams.get("code");
          if (code) {
            try {
              const { data: exData, error: exErr } = await supabase.auth.exchangeCodeForSession(code);
              if (!exErr && exData?.session) {
                url.searchParams.delete("code");
                window.history.replaceState({}, document.title, url.pathname + (url.search || ""));
              }
            } catch (pkceErr) {
              console.warn("Notice during PKCE code exchange:", pkceErr);
            }
          }
        }

        const { data: { session: sess } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (sess?.user) {
          // Validate with server to detect if user was deleted or revoked in Supabase
          const { data: validUserData, error: userValidateErr } = await supabase.auth.getUser();
          if (userValidateErr || !validUserData?.user) {
            // User no longer exists in Supabase backend (e.g. wiped via Dashboard)
            localStorage.removeItem(`auth_roles_${sess.user.id}`);
            localStorage.removeItem(`auth_partner_status_${sess.user.id}`);
            await supabase.auth.signOut().catch(() => {});
            if (!mounted) return;
            setSession(null);
            setRoles([]);
            setPartnerStatus(null);
            return;
          }

          // Pre-populate with cached roles & partner status for instant flicker-free access
          const cached = localStorage.getItem(`auth_roles_${sess.user.id}`);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setRoles(parsed);
              }
            } catch (_) {}
          }
          const cachedStatus = localStorage.getItem(`auth_partner_status_${sess.user.id}`) as PartnerStatus;
          if (cachedStatus) {
            setPartnerStatus(cachedStatus);
          }
          setSession(sess);

          // Await fresh roles & partner status from DB before ending loading
          const r = await fetchUserRoles(sess.user.id, sess.access_token);
          const ps = await fetchPartnerStatus(sess.user.id, sess.access_token);

          // If user has a partner registration, ensure they have the partner role in frontend state
          if (ps && !r.includes("partner")) {
            r.push("partner");
          }

          // If account is not admin and has no partner registration, it is an orphaned account
          if (!r.includes("admin") && !ps) {
            localStorage.removeItem(`auth_roles_${sess.user.id}`);
            localStorage.removeItem(`auth_partner_status_${sess.user.id}`);
            await supabase.auth.signOut().catch(() => {});
            if (!mounted) return;
            setSession(null);
            setRoles([]);
            setPartnerStatus(null);
            return;
          }

          if (!mounted) return;
          setRoles(r);
          setPartnerStatus(ps);
          localStorage.setItem(`auth_roles_${sess.user.id}`, JSON.stringify(r));
          if (ps) {
            localStorage.setItem(`auth_partner_status_${sess.user.id}`, ps);
          } else {
            localStorage.removeItem(`auth_partner_status_${sess.user.id}`);
          }
        } else {
          setRoles([]);
          setPartnerStatus(null);
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
        const ps = await fetchPartnerStatus(sess.user.id, sess.access_token);

        if (ps && !r.includes("partner")) {
          r.push("partner");
        }

        // Orphan check: non-admin users without partner profile must be logged out
        if (!r.includes("admin") && !ps) {
          localStorage.removeItem(`auth_roles_${sess.user.id}`);
          localStorage.removeItem(`auth_partner_status_${sess.user.id}`);
          await supabase.auth.signOut().catch(() => {});
          if (!mounted) return;
          setSession(null);
          setRoles([]);
          setPartnerStatus(null);
          return;
        }

        if (!mounted) return;
        setRoles(r);
        setPartnerStatus(ps);
        localStorage.setItem(`auth_roles_${sess.user.id}`, JSON.stringify(r));
        if (ps) {
          localStorage.setItem(`auth_partner_status_${sess.user.id}`, ps);
        } else {
          localStorage.removeItem(`auth_partner_status_${sess.user.id}`);
        }
      } else {
        if (!mounted) return;
        setRoles([]);
        setSession(null);
        setPartnerStatus(null);
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
    const ps = await fetchPartnerStatus(data.user.id, data.session?.access_token);

    if (ps && !r.includes("partner")) {
      r.push("partner");
    }

    // If account has neither admin access nor an active partner registration, do not allow orphaned login
    if (!r.includes("admin") && !ps) {
      await supabase.auth.signOut();
      localStorage.removeItem(`auth_roles_${data.user.id}`);
      localStorage.removeItem(`auth_partner_status_${data.user.id}`);
      return {
        success: false,
        error: "Your partner registration is no longer active or has been removed. Please apply for partnership again."
      };
    }

    setRoles(r);
    setPartnerStatus(ps);
    localStorage.setItem(`auth_roles_${data.user.id}`, JSON.stringify(r));
    if (ps) {
      localStorage.setItem(`auth_partner_status_${data.user.id}`, ps);
    }

    const redirectTo = r.includes("admin") ? "/admin" : (r.includes("partner") || ps) ? "/partner-dashboard" : "/";
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
      localStorage.removeItem(`auth_partner_status_${session.user.id}`);
    }
    await supabase.auth.signOut();
    setSession(null);
    setRoles([]);
    setPartnerStatus(null);
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

  const refreshPartnerStatus = useCallback(async (explicitUserId?: string, explicitToken?: string) => {
    const uid = explicitUserId || session?.user?.id;
    const tok = explicitToken || session?.access_token;
    if (uid) {
      const ps = await fetchPartnerStatus(uid, tok);
      const r = await fetchUserRoles(uid, tok);
      if (ps && !r.includes("partner")) {
        r.push("partner");
      }
      setPartnerStatus(ps);
      setRoles(r);
      if (ps) localStorage.setItem(`auth_partner_status_${uid}`, ps);
      localStorage.setItem(`auth_roles_${uid}`, JSON.stringify(r));
    }
  }, [session?.user?.id, session?.access_token]);

  const hasRole = useCallback((role: AppRole) => roles.includes(role), [roles]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        roles,
        loading,
        hasRole,
        partnerStatus,
        refreshPartnerStatus,
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
