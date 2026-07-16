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
        toast({ title: "Login failed", description: result.error, variant: "destructive" });
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
      
      toast({ title: "Welcome back!" });
      navigate(result.redirectTo || "/");
    }
  };


  const inputCls =
    "w-full h-12 px-4 text-sm bg-gray-50 border border-transparent text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#2F4F97]/30 focus:ring-4 focus:ring-[#2F4F97]/10 transition-all duration-300 rounded-2xl";

  // ─── Forgot Password Handlers ───
  const handleFpSendCode = async () => {
    if (!fpEmail) { toast({ title: "Please enter your email.", variant: "destructive" }); return; }
    setFpStep("sending");
    const result = await resetPassword(fpEmail);
    if (result.success) {
      setFpStep("code_sent");
    } else {
      toast({ title: "Error", description: result.error || "Failed to send code.", variant: "destructive" });
      setFpStep("enter_email");
    }
  };

  const handleFpVerify = async () => {
    if (fpOtp.length < 6) { toast({ title: "Enter the 6-digit code.", variant: "destructive" }); return; }
    setFpStep("verifying");
    const result = await verifyResetOtp(fpEmail, fpOtp);
    if (result.success) {
      setFpStep("verified");
    } else {
      toast({ title: "Invalid code", description: result.error || "Please try again.", variant: "destructive" });
      setFpStep("code_sent");
    }
  };

  const handleFpUpdatePw = async () => {
    if (fpNewPw.length < 6) { toast({ title: "Password must be at least 6 characters.", variant: "destructive" }); return; }
    if (fpNewPw !== fpConfirmPw) { toast({ title: "Passwords do not match.", variant: "destructive" }); return; }
    setFpStep("updating");
    const result = await updatePassword(fpNewPw);
    if (result.success) {
      setFpStep("done");
      // Sign out from the recovery session so they can log in fresh
      await signOut();
    } else {
      toast({ title: "Error", description: result.error || "Failed to update password.", variant: "destructive" });
      setFpStep("verified");
    }
  };

  const resetFpFlow = () => {
    setFpStep("idle"); setFpEmail(""); setFpOtp(""); setFpNewPw(""); setFpConfirmPw("");
  };

  return (
    <div className="fixed inset-0 flex bg-[#F8FAFC]">

      {/* ══════════════════════════════ LEFT PANEL ══════════════════════════════ */}
      <div className="relative hidden lg:flex flex-col w-1/2 h-full overflow-hidden bg-gradient-to-br from-[#EEF4FF] to-[#F8FAFC] border-r border-[#2F4F97]/10">

        {/* Decorative organic background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[#2F4F97]/5 blur-[100px]" />
          <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-[#2F4F97]/10 blur-[120px]" />
        </div>

        {/* Content - full height flex column spread */}
        <div
          className="relative z-10 flex flex-col justify-between h-full px-10 py-8 lg:px-14 lg:py-10"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(10px)",
            transition: "opacity 0.45s ease, transform 0.45s ease",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/">
              <img src="/logo.png" alt="Whiteboard Education" className="h-8 w-auto object-contain hover:opacity-80 transition-opacity" />
            </Link>
          </div>

          {/* Middle hero */}
          <div className="max-w-md">

            <h1 className="font-black text-[#1E293B] text-3xl xl:text-4xl tracking-tight leading-[1.1] mb-4">
              Manage Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F4F97] to-[#1c2f5a]">
                Admin Panel.
              </span>
            </h1>

            <p className="text-[#64748B] text-[13px] leading-relaxed mb-6 max-w-sm">
              Authorized personnel portal for managing student applications, university partnerships, and platform configurations.
            </p>

            {/* Role list */}
            <div className="flex flex-col gap-3">
              {[
                { icon: ShieldCheck, label: "Super Admin", desc: "Full system and platform access" },
                { icon: Layers, label: "Partner Agent", desc: "Student application management" },
                { icon: Award, label: "B2B Partners", desc: "Agency portal and analytics" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3 bg-white/40 p-2.5 rounded-2xl border border-white/60 shadow-sm backdrop-blur-sm">
                  <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-[#2F4F97]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[#1E293B] text-[13px] font-bold">{label}</div>
                    <div className="text-[#64748B] text-[11px] mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom strip */}
          <div className="flex items-center justify-between">
            <p className="text-[#64748B] text-[11px] font-medium">© {new Date().getFullYear()} Whiteboard Education</p>
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full bg-[#2F4F97]"
                  style={{ width: i === 0 ? 24 : i === 1 ? 12 : 6, opacity: 1 - i * 0.3 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════ RIGHT PANEL ══════════════════════════════ */}
      <div
        className="w-full lg:w-1/2 h-full flex flex-col bg-white overflow-hidden"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateX(10px)",
          transition: "opacity 0.45s ease 0.08s, transform 0.45s ease 0.08s",
        }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-8 py-6 flex-shrink-0 bg-white">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <img src="/logo.png" alt="Whiteboard Education" className="h-8 w-auto object-contain" />
          </div>
          {/* Desktop spacer to keep Close button aligned to the right */}
          <div className="hidden lg:block"></div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#EEF4FF] text-[#2F4F97] hover:bg-[#2F4F97] hover:text-white transition-colors duration-300 shadow-sm"
            aria-label="Close"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form section - centered, takes all remaining height */}
        <div className="flex-1 flex flex-col justify-center min-h-0 px-10 py-4">
          <div className="w-full max-w-sm mx-auto">

            {/* Heading */}
            <div className="mb-8">
              <h2 className="font-medium tracking-tight text-[#0c0f16] text-2xl">
                Sign in to your portal account
              </h2>
            </div>

            {/* Alerts */}
            {regStatus?.status === "pending" && (
              <Alert className="border-amber-300 bg-amber-50 mb-4 py-2.5 px-3 rounded-2xl">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <AlertTitle className="text-amber-700 text-xs font-semibold">Registration Pending</AlertTitle>
                <AlertDescription className="text-[11px] text-amber-600">
                  Your partner registration is under review. You'll be notified via email.
                </AlertDescription>
              </Alert>
            )}
            {regStatus?.status === "rejected" && (
              <Alert variant="destructive" className="mb-4 py-2.5 px-3 rounded-2xl">
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
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className={inputCls}
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  <div className="flex flex-col gap-2 mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 text-sm font-bold flex items-center justify-center gap-2 rounded-2xl transition-all duration-300 hover:shadow-[0_8px_20px_-6px_rgba(47,79,151,0.5)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
                      style={{ background: "#2F4F97", color: "#ffffff" }}
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

                    <div className="text-center my-1">
                      <button
                        type="button"
                        onClick={() => { setFpStep("enter_email"); setFpEmail(email); }}
                        className="text-[12px] font-semibold text-[#2F4F97] hover:text-[#1c2f5a] hover:underline transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    
                    <div className="flex items-center w-full my-1">
                      <div className="flex-1 h-px bg-gray-100"></div>
                      <span className="text-[10px] text-gray-400 font-bold px-3 uppercase tracking-widest">OR</span>
                      <div className="flex-1 h-px bg-gray-100"></div>
                    </div>
                    
                    <Link
                      to="/partner/register"
                      className="w-full h-12 text-[13px] font-bold flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-100 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98]"
                    >
                      Register as a partner
                    </Link>
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
                <input
                  type="email"
                  value={fpEmail}
                  onChange={(e) => setFpEmail(e.target.value)}
                  placeholder="Your login email"
                  className={inputCls}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleFpSendCode}
                    className="flex-1 h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110"
                    style={{ background: "#2F4F97", color: "#0c0f16" }}
                  >
                    <KeyRound className="h-4 w-4" /> Send Code
                  </button>
                  <button onClick={resetFpFlow} className="h-12 px-4 rounded-2xl text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
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
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-2xl">
                  <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-blue-700">A 6-digit code was sent to <span className="font-bold">{fpEmail}</span>. Check your inbox and spam folder.</p>
                </div>
                <input
                  value={fpOtp}
                  onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className={inputCls + " tracking-[0.3em] text-center font-bold text-lg"}
                  maxLength={6}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleFpVerify}
                    disabled={fpOtp.length < 6}
                    className="flex-1 h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
                    style={{ background: "#0c0f16", color: "#fff" }}
                  >
                    <ArrowRight className="h-4 w-4" /> Verify Code
                  </button>
                  <button onClick={resetFpFlow} className="h-12 px-4 rounded-2xl text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
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
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-2xl">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-green-700 font-medium">Code verified! Set your new password below.</p>
                </div>
                <input
                  type="password"
                  value={fpNewPw}
                  onChange={(e) => setFpNewPw(e.target.value)}
                  placeholder="New password (min. 6 chars)"
                  className={inputCls}
                />
                <input
                  type="password"
                  value={fpConfirmPw}
                  onChange={(e) => setFpConfirmPw(e.target.value)}
                  placeholder="Confirm new password"
                  className={inputCls}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleFpUpdatePw}
                    className="flex-1 h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110"
                    style={{ background: "#2F4F97", color: "#0c0f16" }}
                  >
                    Update Password
                  </button>
                  <button onClick={resetFpFlow} className="h-12 px-4 rounded-2xl text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
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
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-2xl">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-green-700 font-medium">Password updated successfully! You can now sign in with your new password.</p>
                </div>
                <button
                  onClick={resetFpFlow}
                  className="w-full h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110"
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
