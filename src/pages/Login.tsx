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
    "w-full h-11 px-4 text-sm border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#ffa300] focus:ring-1 focus:ring-[#ffa300] transition-colors";

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
    <div className="fixed inset-0 flex" style={{ background: "#0c0f16" }}>

      {/* ══════════════════════════════ LEFT PANEL ══════════════════════════════ */}
      <div className="relative hidden lg:flex flex-col w-1/2 h-full overflow-hidden">

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(#ffa300 1px, transparent 1px), linear-gradient(90deg, #ffa300 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Bottom radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 110%, rgba(255,163,0,0.13) 0%, transparent 65%)",
          }}
        />

        {/* Top amber accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffa300] to-transparent" />

        {/* Right divider */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#ffa300]/25 to-transparent" />

        {/* Content - full height flex column spread */}
        <div
          className="relative z-10 flex flex-col justify-between h-full px-14 py-12"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(10px)",
            transition: "opacity 0.45s ease, transform 0.45s ease",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/LOGO-ON-DARK-BG.png" alt="Whiteboard Education" className="h-10 w-auto object-contain" />
          </div>

          {/* Middle hero */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[#ffa300] text-[10px] font-bold tracking-[0.3em] uppercase">Access Portal</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <h1
              className="font-black leading-none text-white"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "clamp(44px, 5vw, 64px)",
                letterSpacing: "-2px",
              }}
            >
              Admin
            </h1>
            <h1
              className="font-black leading-none mb-6"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "clamp(44px, 5vw, 64px)",
                letterSpacing: "-2px",
                WebkitTextStroke: "1.5px #ffa300",
                color: "transparent",
              }}
            >
              Panel.
            </h1>

            <p className="text-white/30 text-xs leading-relaxed mb-7">
              Restricted access. Authorized personnel only.
            </p>

            {/* Role list */}
            <div className="flex flex-col gap-3">
              {[
                { icon: ShieldCheck, label: "Super Admin", desc: "Full system access" },
                { icon: Layers, label: "Partner Agent", desc: "Student management" },
                { icon: Award, label: "B2B Partners", desc: "Agency portal access" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3 group">
                  <div className="h-8 w-8 border border-white/10 bg-white/[0.04] flex items-center justify-center flex-shrink-0 group-hover:border-[#ffa300]/30 transition-colors">
                    <Icon className="h-3.5 w-3.5 text-[#ffa300]" />
                  </div>
                  <div>
                    <div className="text-white/60 text-xs font-semibold">{label}</div>
                    <div className="text-white/25 text-[10px]">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom strip */}
          <div className="flex items-center justify-between">
            <p className="text-white/15 text-[10px]">© {new Date().getFullYear()} Whiteboard Education</p>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-1 bg-[#ffa300]"
                  style={{ width: i === 0 ? 20 : i === 1 ? 10 : 5, opacity: 1 - i * 0.3 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════ RIGHT PANEL ══════════════════════════════ */}
      <div
        className="w-full lg:w-1/2 h-full flex flex-col bg-[#f7f8fa] overflow-hidden"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateX(10px)",
          transition: "opacity 0.45s ease 0.08s, transform 0.45s ease 0.08s",
        }}
      >
        {/* Top accent line (right panel) */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#ffa300]/40 via-[#ffa300] to-[#ffa300]/40 flex-shrink-0" />

        {/* Header bar */}
        <div className="flex items-center justify-between px-10 py-3 border-b border-gray-200 flex-shrink-0 bg-white">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <img src="/LOGO-ON-LIGHT-BG.png" alt="Whiteboard Education" className="h-8 w-auto object-contain" />
          </div>
          {/* Desktop label */}
          <span className="hidden lg:block text-xs font-bold text-gray-300 tracking-widest uppercase">
            Whiteboard Education
          </span>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to site
          </Link>
        </div>

        {/* Form section - centered, takes all remaining height */}
        <div className="flex-1 flex flex-col justify-center min-h-0 px-10 py-4">
          <div className="w-full max-w-sm mx-auto">

            {/* Heading */}
            <div className="mb-6">
              <h2 className="font-extrabold text-[#0c0f16] text-2xl mb-0.5" style={{ fontFamily: "Poppins, sans-serif" }}>
                Welcome back
              </h2>
              <p className="text-xs text-gray-400">
                Sign in to your portal account
              </p>
            </div>

            {/* Alerts */}
            {regStatus?.status === "pending" && (
              <Alert className="border-amber-300 bg-amber-50 mb-4 py-2.5 px-3" style={{ borderRadius: 0 }}>
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <AlertTitle className="text-amber-700 text-xs font-semibold">Registration Pending</AlertTitle>
                <AlertDescription className="text-[11px] text-amber-600">
                  Your partner registration is under review. You'll be notified via email.
                </AlertDescription>
              </Alert>
            )}
            {regStatus?.status === "rejected" && (
              <Alert variant="destructive" className="mb-4 py-2.5 px-3" style={{ borderRadius: 0 }}>
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
                <form onSubmit={handleLogin} className="space-y-2">
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
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 text-sm font-bold flex items-center justify-center gap-2 transition-all duration-150 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "#ffa300", color: "#0c0f16" }}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <><LogIn className="h-4 w-4" /> Sign In</>
                    )}
                  </button>
                </form>

                {/* Forgot password link */}
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => { setFpStep("enter_email"); setFpEmail(email); }}
                    className="text-[11px] font-semibold text-[#ffa300] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            )}

            {/* ─── Forgot Password Flow ─── */}
            {fpStep === "enter_email" && (
              <div className="space-y-4">
                <div className="mb-2">
                  <h3 className="font-bold text-[#0c0f16] text-lg" style={{ fontFamily: "Poppins, sans-serif" }}>Reset Password</h3>
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
                    className="flex-1 h-10 text-sm font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110"
                    style={{ background: "#ffa300", color: "#0c0f16" }}
                  >
                    <KeyRound className="h-4 w-4" /> Send Code
                  </button>
                  <button onClick={resetFpFlow} className="h-10 px-4 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {fpStep === "sending" && (
              <div className="flex items-center gap-3 py-8 justify-center text-sm text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin text-[#ffa300]" /> Sending code...
              </div>
            )}

            {fpStep === "code_sent" && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100" style={{ borderRadius: 0 }}>
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
                    className="flex-1 h-10 text-sm font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
                    style={{ background: "#0c0f16", color: "#fff" }}
                  >
                    <ArrowRight className="h-4 w-4" /> Verify Code
                  </button>
                  <button onClick={resetFpFlow} className="h-10 px-4 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {fpStep === "verifying" && (
              <div className="flex items-center gap-3 py-8 justify-center text-sm text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin text-[#ffa300]" /> Verifying...
              </div>
            )}

            {fpStep === "verified" && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-100" style={{ borderRadius: 0 }}>
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
                    className="flex-1 h-10 text-sm font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110"
                    style={{ background: "#ffa300", color: "#0c0f16" }}
                  >
                    Update Password
                  </button>
                  <button onClick={resetFpFlow} className="h-10 px-4 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {fpStep === "updating" && (
              <div className="flex items-center gap-3 py-8 justify-center text-sm text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin text-[#ffa300]" /> Updating password...
              </div>
            )}

            {fpStep === "done" && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-100" style={{ borderRadius: 0 }}>
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-green-700 font-medium">Password updated successfully! You can now sign in with your new password.</p>
                </div>
                <button
                  onClick={resetFpFlow}
                  className="w-full h-10 text-sm font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110"
                  style={{ background: "#ffa300", color: "#0c0f16" }}
                >
                  <LogIn className="h-4 w-4" /> Back to Sign In
                </button>
              </div>
            )}

            {/* Divider + partner link */}
            {fpStep === "idle" && (
            <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Joining as a partner agency?</span>
              <Link to="/partner" className="text-[11px] font-semibold text-[#ffa300] hover:underline">
                Apply here →
              </Link>
            </div>
            )}
          </div>
        </div>

        {/* Bottom info bar - fills remaining space visually */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-10 py-3">
          <div className="flex items-center gap-6">
            {[
              { label: "Universities", value: "50+" },
              { label: "Courses", value: "200+" },
              { label: "Students Enrolled", value: "10K+" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[#0c0f16]">{value}</span>
                <span className="text-[11px] text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
