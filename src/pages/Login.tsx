import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BookOpen, ArrowLeft, LogIn, UserPlus, Clock, XCircle, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [regStatus, setRegStatus] = useState<{ status: string; admin_notes: string } | null>(null);

  // After login attempt, check partner registration status
  const checkPartnerRegistration = async (userEmail: string) => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/partner_registrations?select=status,admin_notes&email=eq.${encodeURIComponent(userEmail)}&order=created_at.desc&limit=1`,
        { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
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
      // Check if this is a partner with pending/rejected registration
      const reg = await checkPartnerRegistration(email);
      if (reg && (reg.status === "pending" || reg.status === "rejected")) {
        setRegStatus(reg);
      } else {
        toast({ title: "Login failed", description: result.error, variant: "destructive" });
      }
    } else {
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

  return (
    <div className="relative h-screen overflow-hidden" style={{ backgroundColor: "#f0f2f5" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-40" style={{ backgroundColor: "#fef1da" }} />
        <div className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full opacity-30" style={{ backgroundColor: "#ffa300" }} />
      </div>

      <div className="relative h-full container mx-auto px-4 py-4 md:py-6 flex items-center">
        <div className="mx-auto grid h-full max-h-[900px] w-full max-w-5xl grid-cols-1 lg:grid-cols-2 overflow-hidden bg-white animate-fade-in" style={{ border: "1px solid #cacdd4", borderRadius: "5px" }}>
          <div className="hidden lg:block relative">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=1600&fit=crop"
              alt="Students on campus"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181d29]/35 to-transparent" />
          </div>

          <div className="p-5 sm:p-7 md:p-8 overflow-hidden">
            <div className="space-y-2 mb-4">
              <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> Back to site
              </Link>

              <div className="flex items-center gap-3 mt-3">
                <div className="h-11 w-11 bg-[#181d29] rounded-md flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-[#ffa300]" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xl font-extrabold text-[#181d29]" style={{ fontFamily: "'Poppins', sans-serif" }}>Whiteboard</span>
                  <span className="text-[14px] font-bold text-[#ffa300] uppercase block" style={{ fontFamily: "'Poppins', sans-serif", textAlign: 'justify', textAlignLast: 'justify' as any }}>Education</span>
                </div>
              </div>
            </div>

            {/* Partner registration status alerts */}
            {regStatus?.status === "pending" && (
              <Alert className="border-warning/50 bg-warning/10 mb-4">
                <Clock className="h-4 w-4 text-warning" />
                <AlertTitle className="text-warning">Registration Pending</AlertTitle>
                <AlertDescription className="text-sm">
                  Your partner registration is being reviewed by our team. You'll receive an email once it's approved. Please check back later.
                </AlertDescription>
              </Alert>
            )}
            {regStatus?.status === "rejected" && (
              <Alert variant="destructive" className="mb-4">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Registration Rejected</AlertTitle>
                <AlertDescription className="text-sm">
                  Unfortunately, your partner registration was not approved.
                  {regStatus.admin_notes && (
                    <span className="block mt-1 font-medium">Reason: {regStatus.admin_notes}</span>
                  )}
                  <span className="block mt-1">Please contact support or re-apply at the <Link to="/partner" className="underline font-medium">partner page</Link>.</span>
                </AlertDescription>
              </Alert>
            )}

            <Card className="border-border">
              <CardContent className="pt-6">
                <Tabs defaultValue="login">
                  <TabsList className="grid w-full grid-cols-2 mb-4" style={{ backgroundColor: "#fef1da" }}>
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label>Email</Label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1.5 h-11" />
                      </div>
                      <div>
                        <Label>Password</Label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="mt-1.5 h-11" />
                      </div>
                      <Button type="submit" className="w-full h-11 font-bold" style={{ backgroundColor: "#ffa300", color: "#181d29", borderRadius: "5px" }} disabled={loading}>
                        <LogIn className="h-4 w-4 mr-2" />
                        {loading ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div>
                        <Label>Display Name</Label>
                        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="mt-1.5 h-11" />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1.5 h-11" />
                      </div>
                      <div>
                        <Label>Password</Label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} className="mt-1.5 h-11" />
                      </div>
                      <Button type="submit" className="w-full h-11 font-bold" style={{ backgroundColor: "#ffa300", color: "#181d29", borderRadius: "5px" }} disabled={loading}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        {loading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
