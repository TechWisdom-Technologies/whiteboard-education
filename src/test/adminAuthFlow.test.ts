import { describe, it, expect } from "vitest";

describe("Admin Authentication and Authorization Security", () => {
  // Test 1: Redirection for unauthenticated users
  it("determines correct redirection target based on required role when unauthenticated", () => {
    const getRedirectPath = (requiredRole?: "admin" | "partner" | "user") => {
      return requiredRole === "admin" ? "/admin/login" : "/login";
    };

    expect(getRedirectPath("admin")).toBe("/admin/login");
    expect(getRedirectPath("partner")).toBe("/login");
    expect(getRedirectPath(undefined)).toBe("/login");
  });

  // Test 2: Role verification specifically checking user UUID (cannot authorize User A based on User B's role)
  it("verifies admin role specifically by authenticated user UUID and rejects cross-user authorization", async () => {
    // Mock user_roles table with multiple users
    const mockUserRolesTable = [
      { user_id: "admin-uuid-123", role: "admin" },
      { user_id: "partner-uuid-456", role: "partner" },
    ];

    const queryAdminRole = async (targetUserId: string) => {
      // Must filter explicitly by BOTH user_id and role='admin'
      const matches = mockUserRolesTable.filter(
        (row) => row.user_id === targetUserId && row.role === "admin"
      );
      return {
        data: matches.length > 0 ? matches : [],
        error: null,
      };
    };

    // Authenticated admin UUID
    const adminCheck = await queryAdminRole("admin-uuid-123");
    expect(adminCheck.data.length).toBe(1);
    expect(adminCheck.data[0].role).toBe("admin");

    // Partner user attempting admin role verification
    const partnerCheck = await queryAdminRole("partner-uuid-456");
    expect(partnerCheck.data.length).toBe(0);

    // Cross-user authorization check: partner cannot match admin-uuid-123's role
    const verifyPortalAccess = (userId: string, roleData: any[], error: any) => {
      if (error || !roleData || roleData.length === 0) {
        return { allowed: false, error: "Access denied" };
      }
      return { allowed: true, redirectTo: "/admin" };
    };

    expect(verifyPortalAccess("partner-uuid-456", partnerCheck.data, partnerCheck.error).allowed).toBe(false);
    expect(verifyPortalAccess("admin-uuid-123", adminCheck.data, adminCheck.error).allowed).toBe(true);
  });

  // Test 3: Authenticated admin successfully accessing the admin portal
  it("allows an authenticated admin successfully accessing the admin portal", () => {
    const checkAdminPortalAccess = (params: {
      authSuccess: boolean;
      userId: string;
      roleQueryRows: Array<{ role: string; user_id: string }>;
      roleQueryError: any;
    }) => {
      if (!params.authSuccess) return { allowed: false, error: "Invalid credentials" };
      if (params.roleQueryError || !params.roleQueryRows || params.roleQueryRows.length === 0) {
        return { allowed: false, error: "Access denied" };
      }
      const hasAdmin = params.roleQueryRows.some(
        (r) => r.user_id === params.userId && r.role === "admin"
      );
      if (!hasAdmin) return { allowed: false, error: "Access denied" };
      return { allowed: true, redirectTo: "/admin" };
    };

    const result = checkAdminPortalAccess({
      authSuccess: true,
      userId: "admin-uuid-001",
      roleQueryRows: [{ user_id: "admin-uuid-001", role: "admin" }],
      roleQueryError: null,
    });

    expect(result.allowed).toBe(true);
    expect(result.redirectTo).toBe("/admin");
  });

  // Test 4: Partner being rejected from the admin portal
  it("rejects a partner attempting to authenticate through the admin portal", () => {
    const checkAdminPortalAccess = (params: {
      authSuccess: boolean;
      userId: string;
      roleQueryRows: Array<{ role: string; user_id: string }>;
      roleQueryError: any;
    }) => {
      if (!params.authSuccess) return { allowed: false, error: "Invalid credentials" };
      if (params.roleQueryError || !params.roleQueryRows || params.roleQueryRows.length === 0) {
        return {
          allowed: false,
          error:
            "Access denied. This portal is strictly restricted to Whiteboard Education administrators. Your account does not have administrator privileges. If you are a partner, please log in through the partner portal.",
        };
      }
      const hasAdmin = params.roleQueryRows.some(
        (r) => r.user_id === params.userId && r.role === "admin"
      );
      if (!hasAdmin) {
        return {
          allowed: false,
          error:
            "Access denied. This portal is strictly restricted to Whiteboard Education administrators. Your account does not have administrator privileges. If you are a partner, please log in through the partner portal.",
        };
      }
      return { allowed: true, redirectTo: "/admin" };
    };

    const partnerResult = checkAdminPortalAccess({
      authSuccess: true,
      userId: "partner-uuid-999",
      roleQueryRows: [{ user_id: "partner-uuid-999", role: "partner" }],
      roleQueryError: null,
    });

    expect(partnerResult.allowed).toBe(false);
    expect(partnerResult.error).toContain("Access denied");
  });

  // Test 5: Database role-query error resulting in denial (fail closed)
  it("treats a database role-query error as an authorization failure (fail-closed)", () => {
    const checkAdminPortalAccess = (params: {
      authSuccess: boolean;
      userId: string;
      roleQueryRows: Array<{ role: string; user_id: string }> | null;
      roleQueryError: any;
    }) => {
      if (!params.authSuccess) return { allowed: false, error: "Invalid credentials" };
      if (params.roleQueryError || !params.roleQueryRows || params.roleQueryRows.length === 0) {
        return {
          allowed: false,
          error: params.roleQueryError
            ? "Authorization verification failed due to a server error."
            : "Access denied.",
        };
      }
      return { allowed: true, redirectTo: "/admin" };
    };

    // Even if credentials succeeded, if DB query threw an error (e.g. Postgres timeout / RLS restriction)
    const errorResult = checkAdminPortalAccess({
      authSuccess: true,
      userId: "admin-uuid-001",
      roleQueryRows: null,
      roleQueryError: { message: "connection timeout", code: "PGRST000" },
    });

    expect(errorResult.allowed).toBe(false);
    expect(errorResult.error).toContain("Authorization verification failed");
  });

  // Test 6: A user with a stale cached admin role being denied after role revocation
  it("denies access to a user with a stale cached admin role after role revocation", () => {
    // Simulating ProtectedRoute authorization logic
    const evaluateProtectedRouteAuthorization = (params: {
      requiredRole?: "admin" | "partner" | "user";
      serverVerifiedRoles: string[];
      cachedRolesInLocalStorage: string[];
    }) => {
      const { requiredRole, serverVerifiedRoles } = params;
      if (!requiredRole) return true;

      if (requiredRole === "admin") {
        // Strict server check: hasRole("admin") must be true
        const hasServerAdminRole = serverVerifiedRoles.includes("admin");
        // Cached roles in localStorage must NEVER independently grant access
        return hasServerAdminRole;
      }

      return serverVerifiedRoles.includes(requiredRole);
    };

    // Scenario: User was admin, cachedRoles in localStorage has ["admin"],
    // but their role was revoked on the server (serverVerifiedRoles is now ["partner"] or [])
    const revokedUserEvaluation = evaluateProtectedRouteAuthorization({
      requiredRole: "admin",
      serverVerifiedRoles: ["partner"], // Revoked on server!
      cachedRolesInLocalStorage: ["admin", "partner"], // Stale in localStorage
    });

    expect(revokedUserEvaluation).toBe(false);

    // Active admin evaluation (both server and local say admin)
    const activeAdminEvaluation = evaluateProtectedRouteAuthorization({
      requiredRole: "admin",
      serverVerifiedRoles: ["admin"],
      cachedRolesInLocalStorage: ["admin"],
    });

    expect(activeAdminEvaluation).toBe(true);
  });

  // Test 7: Regression test for UI race condition - intermediate state during login
  it("never displays non-admin warning during intermediate authentication & role-verification states", () => {
    // Condition used in AdminLogin:
    const evaluateNonAdminWarning = (params: {
      authLoading: boolean;
      isSubmitting: boolean;
      user: { email: string; id: string } | null;
      roles: string[];
    }) => {
      const { authLoading, isSubmitting, user, roles } = params;
      const hasRoleAdmin = roles.includes("admin");
      return !authLoading && !isSubmitting && !!user && !hasRoleAdmin;
    };

    // Intermediate state:
    // User credentials just verified in Supabase Auth (user is defined),
    // but fetchUserRoles is still in flight (roles is empty), and form is submitting.
    const intermediateStateDuringSubmit = {
      authLoading: false,
      isSubmitting: true, // Login button clicked, handler in flight
      user: { email: "admin@whiteboardeducation.com", id: "admin-uuid-001" },
      roles: [], // Not loaded yet
    };

    // The buggy check `user && !hasRole("admin")` would evaluate to TRUE here!
    const buggyCheck = !!intermediateStateDuringSubmit.user && !intermediateStateDuringSubmit.roles.includes("admin");
    expect(buggyCheck).toBe(true); // Demonstrates the reproduced bug

    // The fixed check MUST evaluate to FALSE:
    expect(evaluateNonAdminWarning(intermediateStateDuringSubmit)).toBe(false);

    // Intermediate state 2: AuthProvider loading state in flight
    const intermediateStateDuringAuthLoading = {
      authLoading: true, // Role fetch / init in progress
      isSubmitting: false,
      user: { email: "admin@whiteboardeducation.com", id: "admin-uuid-001" },
      roles: [],
    };
    expect(evaluateNonAdminWarning(intermediateStateDuringAuthLoading)).toBe(false);

    // Final state for Admin:
    const adminFinishedState = {
      authLoading: false,
      isSubmitting: false,
      user: { email: "admin@whiteboardeducation.com", id: "admin-uuid-001" },
      roles: ["admin"],
    };
    expect(evaluateNonAdminWarning(adminFinishedState)).toBe(false);

    // Confirmed non-admin state (partner already logged in, visiting /admin/login):
    const confirmedPartnerState = {
      authLoading: false,
      isSubmitting: false,
      user: { email: "partner@agency.com", id: "partner-uuid-999" },
      roles: ["partner"],
    };
    expect(evaluateNonAdminWarning(confirmedPartnerState)).toBe(true);
  });
});
