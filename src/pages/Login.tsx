import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  LogIn,
  UserPlus,
  Clock,
  XCircle,
  GraduationCap,
  Eye,
  EyeOff,
  ShieldCheck,
  Layers,
  Award,
  ArrowRight,
  Loader2,
  CheckCircle2,
  KeyRound,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signOut, resetPassword, verifyResetOtp, updatePassword } = useAuth();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [regStatus, setRegStatus] = useState<{ status: string; admin_notes: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Forgot password state
  type FpStep = "idle" | "enter_email" | "sending" | "code_sent" | "verifying" | "verified" | "updating" | "done";
  const [fpStep, setFpStep] = useState<FpStep>("idle");
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPw, setFpNewPw] = useState("");
  const [fpConfirmPw, setFpConfirmPw] = useState("");
  const [loginError, setLoginError] = useState("");
  const [fpError, setFpError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const checkPartnerRegistration = async (userEmail: string) => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/partner_registrations?select=status,admin_notes&email=eq.${encodeURIComponent(userEmail)}&order=created_at.desc&limit=1`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) return data[0];
      }
    } catch { /* ignore */ }
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRegStatus(null);
    const result = await signIn(email, password);
    setLoading(false);
    
    if (!result.success) {
      const reg = await checkPartnerRegistration(email);
      if (reg && (reg.status === "pending" || reg.status === "rejected")) {
        setRegStatus(reg);
      } else {
        setLoginError(result.error || "Invalid email or password");
      }
    } else {
      // Login successful, but if they are supposed to be a partner and lack the role, check registration.
      if (result.redirectTo === "/") {
        const reg = await checkPartnerRegistration(email);
        if (reg && (reg.status === "pending" || reg.status === "rejected")) {
          setRegStatus(reg);
          // Sign them back out since they shouldn't have access yet
          await signOut();
          return;
        }
      }
      
      navigate(result.redirectTo || "/");
    }
  };


  const inputCls =
    "w-full h-14 px-5 text-base bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:ring-0 focus:border-transparent focus:bg-[#2F4F97] focus:text-white focus:placeholder:text-white/60 focus:caret-white transition-all duration-200 rounded-lg";

  // ─── Forgot Password Handlers ───
  const handleFpSendCode = async () => {
    if (!fpEmail) { setFpError("Please enter your email."); return; }
    setFpError("");
    setFpStep("sending");
    const result = await resetPassword(fpEmail);
    if (result.success) {
      setFpStep("code_sent");
    } else {
      setFpError(result.error || "Failed to send code.");
      setFpStep("enter_email");
    }
  };

  const handleFpVerify = async () => {
    if (fpOtp.length < 6) { setFpError("Enter the 6-digit code."); return; }
    setFpError("");
    setFpStep("verifying");
    const result = await verifyResetOtp(fpEmail, fpOtp);
    if (result.success) {
      setFpStep("verified");
    } else {
      setFpError(result.error || "Please try again.");
      setFpStep("code_sent");
    }
  };

  const handleFpUpdatePw = async () => {
    if (fpNewPw.length < 6) { setFpError("Password must be at least 6 characters."); return; }
    if (fpNewPw !== fpConfirmPw) { setFpError("Passwords do not match."); return; }
    setFpError("");
    setFpStep("updating");
    const result = await updatePassword(fpNewPw);
    if (result.success) {
      setFpStep("done");
      // Sign out from the recovery session so they can log in fresh
      await signOut();
    } else {
      setFpError(result.error || "Failed to update password.");
      setFpStep("verified");
    }
  };

  const resetFpFlow = () => {
    setFpStep("idle"); setFpEmail(""); setFpOtp(""); setFpNewPw(""); setFpConfirmPw(""); setFpError(""); setLoginError("");
  };

  return (
    <div className="fixed inset-0 flex bg-gradient-to-br from-white via-[#2F4F97]/5 to-[#2F4F97]/10">

      {/* ══════════════════════════════ RIGHT PANEL ══════════════════════════════ */}
      <div
        className="w-full h-full flex flex-col bg-transparent overflow-hidden items-center justify-center relative p-4 lg:p-8"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateX(10px)",
          transition: "opacity 0.45s ease 0.08s, transform 0.45s ease 0.08s",
        }}
      >
        {/* Header bar */}
        <div className="absolute top-0 left-0 w-full flex items-center justify-end px-8 py-6 flex-shrink-0 bg-transparent z-50">
          <Link
            to="/"
            className="inline-flex items-center justify-center h-10 w-10 rounded-full border-2 border-transparent bg-[#2F4F97] text-white hover:bg-white hover:text-[#2F4F97] hover:border-[#2F4F97] transition-colors duration-200"
            aria-label="Close"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </Link>
        </div>

        {/* Form section */}
        <div className="flex-1 flex flex-col justify-center min-h-0 py-4 z-10 w-full">
          <div className="w-full max-w-md px-8 py-10 bg-white rounded-xl mx-auto text-left relative">
            {/* Heading */}
            <div className="mb-8 text-center">
              <h2 className="font-semibold tracking-tight text-[#0c0f16] text-3xl mb-2">
                Sign In
              </h2>
              <p className="text-[#64748B] text-sm font-medium">Access your dashboard with valid credentials</p>
            </div>

            {/* Alerts */}
            {regStatus?.status === "pending" && (
              <Alert className="border-amber-300 bg-amber-50 mb-4 py-2.5 px-3 rounded-lg">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <AlertTitle className="text-amber-700 text-xs font-semibold">Registration Pending</AlertTitle>
                <AlertDescription className="text-[11px] text-amber-600">
                  Your partner registration is under review. You'll be notified via email.
                </AlertDescription>
              </Alert>
            )}
            {regStatus?.status === "rejected" && (
              <Alert variant="destructive" className="mb-4 py-2.5 px-3 rounded-lg">
                <XCircle className="h-3.5 w-3.5" />
                <AlertTitle className="text-xs font-semibold">Registration Rejected</AlertTitle>
                <AlertDescription className="text-[11px]">
                  {regStatus.admin_notes && <span className="block">Reason: {regStatus.admin_notes}</span>}
                  <Link to="/partner" className="underline font-medium">Re-apply →</Link>
                </AlertDescription>
              </Alert>
            )}

            {/* Login form */}
            {fpStep === "idle" && (
              <>
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setLoginError(""); }}
                      placeholder="Email address"
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setLoginError(""); }}
                        placeholder="Password"
                        required
                        className={inputCls + " pr-10"}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {loginError && <p className="text-red-500 text-[11px] mt-1.5 ml-1">{loginError}</p>}
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex items-center gap-4 mt-6">
                      <button
                        type="button"
                        onClick={() => { setFpStep("enter_email"); setFpEmail(email); }}
                        className="flex-1 h-14 rounded-lg text-base font-bold flex items-center justify-center border-2 border-[#2F4F97] text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white transition-colors duration-200"
                      >
                        Forgot password
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 h-14 rounded-lg text-base font-bold flex items-center justify-center gap-2 border-2 border-transparent bg-[#2F4F97] text-white hover:bg-white hover:text-[#2F4F97] hover:border-[#2F4F97] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                            </svg>
                            Wait...
                          </>
                        ) : (
                          <><LogIn className="h-4 w-4" /> Sign In</>
                        )}
                      </button>
                    </div>
                    
                    <div className="mt-8 text-center">
                      <p className="text-sm font-medium text-gray-500 mb-4">
                        Don't have an account? Become a verified partner today
                      </p>
                      <Link
                        to="/partner/register"
                        className="w-full h-14 text-base font-bold flex items-center justify-center gap-2 rounded-lg border-2 border-[#2F4F97] bg-white text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white transition-colors duration-200"
                      >
                        Register as a partner
                      </Link>
                    </div>
                  </div>
                </form>


              </>
            )}

            {/* ─── Forgot Password Flow ─── */}
            {fpStep === "enter_email" && (
              <div className="space-y-4">
                <div className="mb-2">
                  <h3 className="font-bold text-[#0c0f16] text-lg">Reset Password</h3>
                  <p className="text-xs text-gray-400">Enter the email associated with your account.</p>
                </div>
                <div>
                  <input
                    type="email"
                    value={fpEmail}
                    onChange={(e) => { setFpEmail(e.target.value); setFpError(""); }}
                    placeholder="Your login email"
                    className={inputCls}
                  />
                  {fpError && <p className="text-red-500 text-[11px] mt-1.5 ml-1">{fpError}</p>}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleFpSendCode}
                    className="flex-1 h-14 rounded-lg text-base font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110"
                    style={{ background: "#2F4F97", color: "#0c0f16" }}
                  >
                    <KeyRound className="h-4 w-4" /> Send Code
                  </button>
                  <button onClick={resetFpFlow} className="h-14 px-4 rounded-lg text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {fpStep === "sending" && (
              <div className="flex items-center gap-3 py-8 justify-center text-sm text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin text-[#2F4F97]" /> Sending code...
              </div>
            )}

            {fpStep === "code_sent" && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-blue-700">A 6-digit code was sent to <span className="font-bold">{fpEmail}</span>. Check your inbox and spam folder.</p>
                </div>
                <div>
                  <input
                    value={fpOtp}
                    onChange={(e) => { setFpOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setFpError(""); }}
                    placeholder="Enter 6-digit code"
                    className={inputCls + " tracking-[0.3em] text-center font-bold text-lg"}
                    maxLength={6}
                  />
                  {fpError && <p className="text-red-500 text-[11px] mt-1.5 ml-1 text-center">{fpError}</p>}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleFpVerify}
                    disabled={fpOtp.length < 6}
                    className="flex-1 h-14 rounded-lg text-base font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
                    style={{ background: "#0c0f16", color: "#fff" }}
                  >
                    <ArrowRight className="h-4 w-4" /> Verify Code
                  </button>
                  <button onClick={resetFpFlow} className="h-14 px-4 rounded-lg text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {fpStep === "verifying" && (
              <div className="flex items-center gap-3 py-8 justify-center text-sm text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin text-[#2F4F97]" /> Verifying...
              </div>
            )}

            {fpStep === "verified" && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-green-700 font-medium">Code verified! Set your new password below.</p>
                </div>
                <div>
                  <input
                    type="password"
                    value={fpNewPw}
                    onChange={(e) => { setFpNewPw(e.target.value); setFpError(""); }}
                    placeholder="New password (min. 6 chars)"
                    className={inputCls}
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={fpConfirmPw}
                    onChange={(e) => { setFpConfirmPw(e.target.value); setFpError(""); }}
                    placeholder="Confirm new password"
                    className={inputCls}
                  />
                  {fpError && <p className="text-red-500 text-[11px] mt-1.5 ml-1">{fpError}</p>}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleFpUpdatePw}
                    className="flex-1 h-14 rounded-lg text-base font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110"
                    style={{ background: "#2F4F97", color: "#0c0f16" }}
                  >
                    Update Password
                  </button>
                  <button onClick={resetFpFlow} className="h-14 px-4 rounded-lg text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {fpStep === "updating" && (
              <div className="flex items-center gap-3 py-8 justify-center text-sm text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin text-[#2F4F97]" /> Updating password...
              </div>
            )}

            {fpStep === "done" && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-green-700 font-medium">Password updated successfully! You can now sign in with your new password.</p>
                </div>
                <button
                  onClick={resetFpFlow}
                  className="w-full h-14 rounded-lg text-base font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110"
                  style={{ background: "#2F4F97", color: "#0c0f16" }}
                >
                  <LogIn className="h-4 w-4" /> Back to Sign In
                </button>
              </div>
            )}


          </div>
        </div>

      </div>
    </div>
  );
}
