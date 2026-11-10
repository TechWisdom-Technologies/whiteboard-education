import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ShieldCheck,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  KeyRound,
  AlertTriangle,
  LogOut,
} from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, hasRole, loading: authLoading, signIn, signOut, resetPassword, verifyResetOtp, updatePassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Forgot password states
  type FpStep = "idle" | "enter_email" | "sending" | "code_sent" | "verifying" | "verified" | "updating" | "done";
  const [fpStep, setFpStep] = useState<FpStep>("idle");
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPw, setFpNewPw] = useState("");
  const [fpConfirmPw, setFpConfirmPw] = useState("");
  const [fpError, setFpError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Auto-redirect if already logged in as admin
  useEffect(() => {
    if (!authLoading && !isSubmitting && user && hasRole("admin")) {
      navigate("/admin", { replace: true });
    }
  }, [user, hasRole, navigate, authLoading, isSubmitting]);

  // Capture URL error descriptions if any
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const errorDesc = hashParams.get("error_description");
        if (errorDesc) {
          setLoginError(decodeURIComponent(errorDesc.replace(/\+/g, " ")));
        }
      }
      const searchParams = new URLSearchParams(window.location.search);
      const searchError = searchParams.get("error_description");
      if (searchError) {
        setLoginError(decodeURIComponent(searchError.replace(/\+/g, " ")));
      }
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsSubmitting(true);
    setLoginError("");

    try {
      // 1. Authenticate with Supabase Auth via existing useAuth context
      const result = await signIn(email.trim(), password);

      if (!result.success) {
        setLoginError(result.error || "Invalid administrator credentials.");
        setIsSubmitting(false);
        return;
      }

      // 2. Identify the authenticated user specifically by UUID
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      const authenticatedUser = authData?.user;

      if (authErr || !authenticatedUser?.id) {
        await signOut();
        setLoginError("Authentication failed: Unable to verify administrator identity.");
        setIsSubmitting(false);
        return;
      }

      // 3. Strict Admin Role Verification:
      // Must explicitly filter by BOTH user_id === authenticatedUser.id AND role === 'admin'.
      // Any database query error must fail closed (treat as authorization failure).
      const { data: roleRows, error: roleErr } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authenticatedUser.id)
        .eq("role", "admin");

      // Requirement 2: Ensure a database query error is always treated as authorization failure.
      // Requirement 3: Ensure role verification cannot accidentally authorize one user based on another user's role.
      if (roleErr || !roleRows || roleRows.length === 0) {
        // Immediately terminate session on non-admin or query error
        await signOut();
        setLoginError(
          roleErr
            ? "Authorization verification failed due to a server error. Please try again or contact system support."
            : "Access denied. This portal is strictly restricted to Whiteboard Education administrators. Your account does not have administrator privileges. If you are a partner, please log in through the partner portal."
        );
        setIsSubmitting(false);
        return;
      }

      // 4. Authorized admin -> navigate to /admin
      navigate("/admin", { replace: true });
    } catch (err: any) {
      await signOut().catch(() => {});
      setLoginError(err?.message || "An unexpected error occurred during administrator authentication.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Forgot Password Handlers ───
  const handleFpSendCode = async () => {
    if (!fpEmail.trim()) {
      setFpError("Please enter your administrator email.");
      return;
    }
    setFpError("");
    setFpStep("sending");
    const result = await resetPassword(fpEmail.trim());
    if (result.success) {
      setFpStep("code_sent");
    } else {
      setFpError(result.error || "Failed to send reset code.");
      setFpStep("enter_email");
    }
  };

  const handleFpVerify = async () => {
    if (fpOtp.trim().length < 6) {
      setFpError("Please enter the complete verification code.");
      return;
    }
    setFpError("");
    setFpStep("verifying");
    const result = await verifyResetOtp(fpEmail.trim(), fpOtp.trim());
    if (result.success) {
      setFpStep("verified");
    } else {
      setFpError(result.error || "Verification code is invalid or has expired.");
      setFpStep("code_sent");
    }
  };

  const handleFpUpdatePw = async () => {
    if (fpNewPw.length < 6) {
      setFpError("Password must be at least 6 characters.");
      return;
    }
    if (fpNewPw !== fpConfirmPw) {
      setFpError("Passwords do not match.");
      return;
    }
    setFpError("");
    setFpStep("updating");
    const result = await updatePassword(fpNewPw);
    if (result.success) {
      setFpStep("done");
      await signOut();
    } else {
      setFpError(result.error || "Failed to update password.");
      setFpStep("verified");
    }
  };

  const resetFpFlow = () => {
    setFpStep("idle");
    setFpEmail("");
    setFpOtp("");
    setFpNewPw("");
    setFpConfirmPw("");
    setFpError("");
    setLoginError("");
  };

  const inputCls =
    "w-full h-12 px-4 text-sm bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-lg outline-none transition-all duration-200 focus:border-[#2F4F97] focus:ring-2 focus:ring-[#2F4F97]/20";

  const showNonAdminWarning = !authLoading && !isSubmitting && !!user && !hasRole("admin");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2F4F97] mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-900">Verifying authorization</h2>
          <p className="text-xs text-gray-500 mt-1">Please wait while we check your credentials...</p>
        </div>
      </div>
    );
  }

  if (!isSubmitting && user && hasRole("admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2F4F97] mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-900">Redirecting to Administrator Console</h2>
          <p className="text-xs text-gray-500 mt-1">Access confirmed. Launching dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 p-4 sm:p-6">
      {/* Main Content Card */}
      <div
        className="w-full max-w-md mx-auto"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateY(12px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-7 sm:p-9 relative">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-block mb-4">
              <img src="/logo.png" alt="Whiteboard Education" className="h-8 md:h-9 w-auto mx-auto object-contain" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Administrator Login</h1>
          </div>

          {/* If already signed in as a non-admin account */}
          {showNonAdminWarning && (
            <Alert className="border-amber-200 bg-amber-50 mb-5 text-left">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-xs font-semibold text-amber-800">
                Non-Admin Account Detected
              </AlertTitle>
              <AlertDescription className="text-xs text-amber-700 mt-1 space-y-2">
                <p>
                  You are currently signed in as <span className="font-medium text-amber-900">{user?.email}</span>, which does not have administrator privileges.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
                  >
                    <LogOut className="h-3 w-3" /> Sign Out
                  </button>
                  <Link
                    to="/partner-dashboard"
                    className="text-xs font-semibold text-[#2F4F97] hover:underline"
                  >
                    Go to Partner Dashboard →
                  </Link>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {loginError && (
            <Alert variant="destructive" className="mb-5 text-left border-red-200 bg-red-50 text-red-900">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              <AlertTitle className="text-xs font-semibold">Authentication Error</AlertTitle>
              <AlertDescription className="text-xs mt-0.5 leading-relaxed">
                <span>{loginError}</span>
                {loginError.includes("partner portal") && (
                  <span className="block mt-1.5">
                    <Link to="/login" className="font-semibold underline hover:text-red-950 inline-flex items-center gap-1">
                      Go to Partner Portal →
                    </Link>
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Form Step: Idle (Sign In) */}
          {fpStep === "idle" && (
            <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
              <div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setLoginError("");
                    }}
                    placeholder="Email address"
                    required
                    autoComplete="email"
                    className={inputCls}
                  />
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLoginError("");
                    }}
                    placeholder="Password"
                    required
                    autoComplete="current-password"
                    className={inputCls + " pr-10"}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFpStep("enter_email");
                      setFpEmail(email);
                    }}
                    className="text-xs font-medium text-[#2F4F97] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || authLoading}
                  className="w-full h-12 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border-2 border-transparent bg-[#2F4F97] text-white hover:bg-[#253f7a] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ─── Password Recovery Flow ─── */}
          {fpStep === "enter_email" && (
            <div className="space-y-4 text-left">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Reset Admin Password</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Enter your registered administrator email to receive a recovery code.
                </p>
              </div>
              <div>
                <input
                  type="email"
                  value={fpEmail}
                  onChange={(e) => {
                    setFpEmail(e.target.value);
                    setFpError("");
                  }}
                  placeholder="admin@whiteboardeducation.com"
                  className={inputCls}
                />
                {fpError && <p className="text-red-500 text-xs mt-1.5">{fpError}</p>}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleFpSendCode}
                  className="flex-1 h-11 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 bg-[#2F4F97] text-white hover:bg-[#253f7a] transition-colors"
                >
                  <KeyRound className="h-3.5 w-3.5" /> Send Reset Code
                </button>
                <button
                  type="button"
                  onClick={resetFpFlow}
                  className="h-11 px-4 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {fpStep === "sending" && (
            <div className="flex flex-col items-center justify-center py-8 text-xs text-gray-500 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#2F4F97]" />
              <span>Sending administrator verification code...</span>
            </div>
          )}

          {fpStep === "code_sent" && (
            <div className="space-y-4 text-left">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                <p>
                  A verification code has been dispatched to <span className="font-bold">{fpEmail}</span>. Please verify your inbox and spam folder.
                </p>
              </div>
              <div>
                <input
                  value={fpOtp}
                  onChange={(e) => {
                    setFpOtp(e.target.value.replace(/\D/g, "").slice(0, 8));
                    setFpError("");
                  }}
                  placeholder="Enter 6-digit code"
                  className={inputCls + " tracking-[0.25em] text-center font-bold text-base"}
                  maxLength={8}
                />
                {fpError && <p className="text-red-500 text-xs mt-1.5 text-center">{fpError}</p>}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleFpVerify}
                  disabled={fpOtp.trim().length < 6}
                  className="flex-1 h-11 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 bg-[#2F4F97] text-white hover:bg-[#253f7a] transition-colors disabled:opacity-50"
                >
                  <ArrowRight className="h-3.5 w-3.5" /> Verify Code
                </button>
                <button
                  type="button"
                  onClick={resetFpFlow}
                  className="h-11 px-4 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {fpStep === "verifying" && (
            <div className="flex flex-col items-center justify-center py-8 text-xs text-gray-500 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#2F4F97]" />
              <span>Verifying reset code...</span>
            </div>
          )}

          {fpStep === "verified" && (
            <div className="space-y-3.5 text-left">
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-xs text-green-800 font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <span>Code verified. Please set your new secure password.</span>
              </div>
              <div>
                <input
                  type="password"
                  value={fpNewPw}
                  onChange={(e) => {
                    setFpNewPw(e.target.value);
                    setFpError("");
                  }}
                  placeholder="New password (min. 6 characters)"
                  className={inputCls}
                />
              </div>
              <div>
                <input
                  type="password"
                  value={fpConfirmPw}
                  onChange={(e) => {
                    setFpConfirmPw(e.target.value);
                    setFpError("");
                  }}
                  placeholder="Confirm new password"
                  className={inputCls}
                />
                {fpError && <p className="text-red-500 text-xs mt-1.5">{fpError}</p>}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleFpUpdatePw}
                  className="flex-1 h-11 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 bg-[#2F4F97] text-white hover:bg-[#253f7a] transition-colors"
                >
                  Update Admin Password
                </button>
                <button
                  type="button"
                  onClick={resetFpFlow}
                  className="h-11 px-4 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {fpStep === "updating" && (
            <div className="flex flex-col items-center justify-center py-8 text-xs text-gray-500 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#2F4F97]" />
              <span>Updating password...</span>
            </div>
          )}

          {fpStep === "done" && (
            <div className="space-y-4 text-left">
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-xs text-green-800 font-medium flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <span>Password updated successfully! You can now sign in with your new credentials.</span>
              </div>
              <button
                type="button"
                onClick={resetFpFlow}
                className="w-full h-11 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 bg-[#2F4F97] text-white hover:bg-[#253f7a] transition-colors"
              >
                Return to Administrator Sign In
              </button>
            </div>
          )}

          {/* Footer divider and links */}
          <div className="mt-8 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Looking for partner agency login?{" "}
              <Link to="/login" className="font-semibold text-[#2F4F97] hover:underline">
                Partner Portal →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
