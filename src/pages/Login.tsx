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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, signOut } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [regStatus, setRegStatus] = useState<{ status: string; admin_notes: string } | null>(null);
  const [mounted, setMounted] = useState(false);

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signUp(email, password, displayName);
    setLoading(false);
    if (!result.success) {
      toast({ title: "Sign up failed", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent you a confirmation link to verify your account." });
    }
  };

  const inputCls =
    "w-full h-11 px-4 text-sm border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#ffa300] focus:ring-1 focus:ring-[#ffa300] transition-colors";

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

        {/* Content — full height flex column spread */}
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
            <div
              className="h-10 w-10 bg-[#ffa300] flex items-center justify-center flex-shrink-0"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%)" }}
            >
              <GraduationCap className="h-5 w-5 text-[#0c0f16]" />
            </div>
            <div className="leading-none">
              <div className="text-white font-extrabold text-sm tracking-widest" style={{ fontFamily: "Poppins, sans-serif" }}>
                WHITEBOARD
              </div>
              <div className="text-[#ffa300] text-[9px] font-semibold tracking-[0.3em] uppercase mt-0.5">
                Education
              </div>
            </div>
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
            <div className="h-7 w-7 bg-[#0c0f16] flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-[#ffa300]" />
            </div>
            <span className="font-extrabold text-[#0c0f16] text-xs tracking-widest" style={{ fontFamily: "Poppins, sans-serif" }}>
              WHITEBOARD EDUCATION
            </span>
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

        {/* Form section — centered, takes all remaining height */}
        <div className="flex-1 flex flex-col justify-center min-h-0 px-10 py-4">
          <div className="w-full max-w-sm mx-auto">

            {/* Heading */}
            <div className="mb-4">
              <h2 className="font-extrabold text-[#0c0f16] text-2xl mb-0.5" style={{ fontFamily: "Poppins, sans-serif" }}>
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-xs text-gray-400">
                {mode === "login" ? "Sign in to your portal account" : "Register for portal access"}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex border border-gray-200 mb-3 bg-white">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setRegStatus(null); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-150"
                  style={{
                    background: mode === m ? "#0c0f16" : "transparent",
                    color: mode === m ? "#ffa300" : "#9ca3af",
                  }}
                >
                  {m === "login" ? <LogIn className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
                  {m === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
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
            {mode === "login" && (
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
            )}

            {/* Signup form */}
            {mode === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-2">
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Full name"
                  className={inputCls}
                />
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
                    placeholder="Password (min. 6 characters)"
                    required
                    minLength={6}
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
                      Creating account...
                    </>
                  ) : (
                    <><UserPlus className="h-4 w-4" /> Create Account</>
                  )}
                </button>
                <p className="text-center text-[10px] text-gray-400 mt-2">
                  By signing up you agree to our{" "}
                  <Link to="/" className="underline hover:text-[#ffa300]">Terms</Link> &{" "}
                  <Link to="/" className="underline hover:text-[#ffa300]">Privacy Policy</Link>
                </p>
                <div className="mt-4 p-2 bg-blue-50 border border-blue-100 rounded-sm text-center">
                  <p className="text-[10px] text-blue-800 font-medium">
                    Note: This creates a standard student account. <br />
                    To register as a partner agency, please use the <Link to="/partner" className="underline font-bold">Partner Application Form</Link>.
                  </p>
                </div>
              </form>
            )}

            {/* Divider + partner link */}
            <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Joining as a partner agency?</span>
              <Link to="/partner" className="text-[11px] font-semibold text-[#ffa300] hover:underline">
                Apply here →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom info bar — fills remaining space visually */}
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
