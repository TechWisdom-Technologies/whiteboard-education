import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/ui/loading-screen";

type AppRole = "admin" | "partner" | "user";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, hasRole, partnerStatus } = useAuth();
  const hasCodeParam = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("code");

  if (loading || (hasCodeParam && !user)) {
    return <LoadingScreen fullScreen label="Checking access" sublabel="Verifying your account" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const cachedStatus = user ? (localStorage.getItem(`auth_partner_status_${user.id}`) as any) : null;
  const effectivePartnerStatus = partnerStatus || cachedStatus;
  const cachedRoles: AppRole[] = user ? JSON.parse(localStorage.getItem(`auth_roles_${user.id}`) || "[]") : [];
  const effectiveHasRole = (role: AppRole) => hasRole(role) || cachedRoles.includes(role);

  const isAuthorized =
    !requiredRole ||
    effectiveHasRole(requiredRole) ||
    (requiredRole === "partner" && (effectivePartnerStatus === "pending" || effectivePartnerStatus === "approved"));

  if (!isAuthorized) {
    if (requiredRole === "partner") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background animate-fade-in p-4">
          <div className="text-center space-y-4 max-w-md bg-white border border-gray-100 p-8 rounded-xl shadow-sm">
            <h1 className="text-2xl font-bold text-foreground">Partner Profile Required</h1>
            <p className="text-sm text-muted-foreground">
              Your account is authenticated, but your partner agency profile has not been submitted yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a
                href="/partner/register"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#2F4F97] text-white text-sm font-semibold hover:bg-[#2F4F97]/90 transition-colors"
              >
                Complete Partner Registration →
              </a>
              <a
                href="/"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Go to Homepage
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background animate-fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">You don't have the required "{requiredRole}" role to access this page.</p>
          <a href="/" className="text-secondary underline">Go back home</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
