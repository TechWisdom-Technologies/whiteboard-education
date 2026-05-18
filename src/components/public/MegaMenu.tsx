import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  GraduationCap, Menu, ChevronDown, LogOut, LayoutDashboard, ShieldCheck, Phone,
  Calculator, RefreshCw, Sparkles, ChevronRight, MapPin, Home, GitCompare,
  BookOpen, FileText, Building2, Languages, PenTool, User, Wrench, Zap,
  Handshake, LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LeadCaptureModal } from "@/components/public/LeadCaptureModal";

const cityLinks = [
  { label: "Kuala Lumpur", to: "/destinations/malaysia/kuala-lumpur" },
  { label: "Cyberjaya", to: "/destinations/malaysia/cyberjaya" },
  { label: "Penang", to: "/destinations/malaysia/penang" },
];

const resourceToolsLinks = [
  { label: "Blog", to: "/blog", icon: PenTool, bgImage: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&q=80" },
  { label: "AI Eligibility Test", to: "/eligibility", icon: Sparkles, bgImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80" },
  { label: "Compare Universities", to: "/compare", icon: GitCompare, bgImage: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=500&q=80" },
  { label: "Housing", to: "/housing", icon: Home, bgImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&q=80" },
];

export function MegaMenu({ disableSticky = false }: { disableSticky?: boolean } = {}) {
  const { user, hasRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [leadOpen, setLeadOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const pathname = location.pathname;

  const isRouteActive = (route: string) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(`${route}/`);
  };

  const toolsRoots = [
    "/blog",
    "/eligibility",
    "/compare",
    "/tools",
    "/housing",
  ];

  const destinationsActive = isRouteActive("/destinations");
  const toolsActive = toolsRoots.some((route) => isRouteActive(route));

  const handleLogout = () => {
    signOut();
    navigate("/");
    toast({ title: "Signed out successfully" });
  };

  useEffect(() => {
    const loadAvatar = async () => {
      if (!user) {
        setAvatarUrl("");
        return;
      }

      const directAvatar = (user.user_metadata?.avatar_url as string | undefined) || "";
      if (directAvatar) {
        setAvatarUrl(directAvatar);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .single();

      setAvatarUrl(data?.avatar_url || "");
    };

    loadAvatar();
  }, [user?.id]);

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <header className={`${disableSticky ? 'relative' : 'sticky top-0'} z-50 w-full shadow-sm`}>
      {/* Top Utility Bar */}
      <div className="bg-[#181d29] text-white py-2 border-b border-white/5">
        <div className="container mx-auto flex justify-end gap-6 px-4 lg:px-6">
          <Link 
            to="/partner" 
            className={cn(
              "text-[12px] font-semibold hover:text-[#ffa300] transition-colors flex items-center gap-1.5 tracking-wide",
              isRouteActive("/partner") && "text-[#ffa300]"
            )}
          >
            <Handshake className="h-3 w-3" /> APPLY FOR PARTNERSHIP
          </Link>
          {!user ? (
            <Link 
              to="/login" 
              className={cn(
                "text-[12px] font-semibold hover:text-[#ffa300] transition-colors flex items-center gap-1.5 tracking-wide",
                isRouteActive("/login") && "text-[#ffa300]"
              )}
            >
              <LogIn className="h-3 w-3" /> PARTNER LOGIN
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">Logged in as {user.email}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-6">
          {/* Brand - Left */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="h-10 w-10 bg-[#181d29] rounded-sm flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-[#ffa300]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[17px] font-extrabold tracking-tight text-[#181d29]" style={{ fontFamily: "'Poppins', sans-serif" }}>Whiteboard</span>
              <span className="text-[13px] font-bold text-[#ffa300] uppercase block" style={{ fontFamily: "'Poppins', sans-serif", textAlign: 'justify', textAlignLast: 'justify' as any }}>Education</span>
            </div>
          </Link>

          {/* Desktop Nav - Right Aligned */}
          <div className="hidden lg:flex items-center gap-1">
            <nav className="flex items-center gap-1 mr-2">
              <NavItem to="/" icon={Home}>Home</NavItem>
              <NavItem to="/universities" icon={GraduationCap}>Universities</NavItem>
              <NavItem to="/courses" icon={BookOpen}>Courses</NavItem>
              <NavItem to="/language-centers" icon={Languages}>Language</NavItem>

              {/* Resources & Tools Dropdown */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-10 text-sm font-medium text-[#515768] hover:text-[#ffa300] hover:bg-transparent gap-1.5 px-3 transition-colors",
                      toolsActive && "text-[#ffa300]",
                    )}
                  >
                    <BookOpen className="h-3.5 w-3.5" /> Resources
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={20} className="w-[520px] p-5 shadow-xl border-[#e8e8e8] border-t-[3px] border-t-[#ffa300] rounded-t-none">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 pb-3 mb-2 text-center">
                    Resources
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {resourceToolsLinks.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="relative aspect-square rounded-sm overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
                      >
                        <img 
                          src={item.bgImage} 
                          alt={item.label} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#181d29]/95 via-[#181d29]/60 to-[#181d29]/20" />
                        <div className="absolute inset-0 p-2 flex flex-col items-center justify-center text-center">
                          <item.icon className="h-6 w-6 text-[#ffa300] mb-1.5" />
                          <span className="text-[11px] font-bold text-white leading-tight">{item.label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <NavItem to="/contact" icon={Phone}>Contact</NavItem>
            </nav>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-sm p-0 hover:ring-2 hover:ring-[#ffa300]/30 transition-all">
                    <Avatar className="h-10 w-10 border-2 border-[#ffa300]/30">
                      <AvatarImage src={avatarUrl} alt={user?.email || "User avatar"} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {hasRole("admin") ? "Administrator" : hasRole("partner") ? "Partner" : "Student"}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  {hasRole("admin") && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                        <ShieldCheck className="h-4 w-4" /> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {hasRole("partner") && (
                    <DropdownMenuItem asChild>
                      <Link to="/partner-dashboard" className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" /> Partner Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Hamburger - now visible on mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden hover:bg-muted ml-auto">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
              <SheetContent side="right" className="w-[320px] p-0 border-l border-border">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="p-5 border-b border-[#cacdd4] flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5">
                      <div className="h-8 w-8 bg-[#181d29] rounded-sm flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-[#ffa300]" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-extrabold text-[#181d29]" style={{ fontFamily: "'Poppins', sans-serif" }}>Whiteboard</span>
                        <span className="text-[10px] font-bold text-[#ffa300] uppercase block" style={{ fontFamily: "'Poppins', sans-serif", textAlign: 'justify', textAlignLast: 'justify' as any }}>Education</span>
                      </div>
                    </Link>
                  </div>

                  {/* Mobile User Card */}
                  {user && (
                    <div className="px-5 py-4 bg-[#fef1da]/30 border-b border-[#cacdd4]">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-[#ffa300]/30">
                          <AvatarImage src={avatarUrl} alt={user?.email || "User avatar"} />
                          <AvatarFallback className="bg-[#181d29] text-white font-bold">{userInitial}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {hasRole("admin") ? "Administrator" : hasRole("partner") ? "Partner" : "Student"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile Nav */}
                  <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    <MobileNavLink to="/" icon={Home}>Home</MobileNavLink>
                    <MobileNavLink to="/universities" icon={GraduationCap}>Universities</MobileNavLink>
                    <MobileNavLink to="/courses" icon={BookOpen}>Courses</MobileNavLink>
                    <MobileNavLink to="/language-centers" icon={Languages}>Language Centers</MobileNavLink>

                    <Collapsible>
                      <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium text-foreground hover:bg-[#fef1da]/50 rounded-sm transition-colors">
                        <span className="flex items-center gap-2.5">
                          <Sparkles className="h-4 w-4 text-muted-foreground" /> Resources & Tools
                        </span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-4 space-y-0.5 mt-0.5">
                        {resourceToolsLinks.map((item) => (
                          <MobileNavLink key={item.to} to={item.to} icon={item.icon}>{item.label}</MobileNavLink>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>

                    <div className="h-px bg-border my-2" />
                    <MobileNavLink to="/contact" icon={Phone}>Contact Us</MobileNavLink>
                    <MobileNavLink to="/partner">Partnership</MobileNavLink>
                  </nav>

                  {/* Mobile Auth Footer */}
                  <div className="p-4 border-t border-border bg-muted/20 space-y-2">
                    {!user && (
                      <>
                        <SheetClose asChild>
                          <Link to="/login" className="block">
                            <Button variant="outline" className="w-full font-medium rounded-sm border-[#181d29] text-[#181d29]">Log In</Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button
                            className="w-full bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90 font-semibold rounded-sm border border-[#ffa300]"
                            onClick={() => setLeadOpen(true)}
                          >
                            <Phone className="h-4 w-4 mr-1.5" /> Free Consultation
                          </Button>
                        </SheetClose>
                      </>
                    )}
                    {hasRole("admin") && (
                      <SheetClose asChild>
                        <Link to="/admin" className="block">
                          <Button variant="outline" className="w-full gap-1.5 font-medium"><ShieldCheck className="h-4 w-4" /> Admin Panel</Button>
                        </Link>
                      </SheetClose>
                    )}
                    {hasRole("partner") && (
                      <SheetClose asChild>
                        <Link to="/partner-dashboard" className="block">
                          <Button variant="outline" className="w-full gap-1.5 font-medium"><LayoutDashboard className="h-4 w-4" /> Dashboard</Button>
                        </Link>
                      </SheetClose>
                    )}
                    {user && (
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full gap-1.5 text-destructive hover:text-destructive font-medium" onClick={handleLogout}>
                          <LogOut className="h-4 w-4" /> Sign Out
                        </Button>
                      </SheetClose>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

      {/* Bottom accent line - thinner */}
      <div className="h-[2px] w-full bg-[#ffa300]" />

      <LeadCaptureModal
        open={leadOpen}
        onOpenChange={setLeadOpen}
        source="mega_menu_free_consult"
      />
    </header>
  );
}

function NavItem({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon?: React.ElementType }) {
  const location = useLocation();
  const pathname = location.pathname;
  const isActive = to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Link to={to}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-10 text-sm font-medium text-[#515768] hover:text-[#ffa300] hover:bg-transparent gap-1.5 px-3 transition-colors",
          isActive && "text-[#ffa300]",
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {children}
      </Button>
    </Link>
  );
}

function MobileNavLink({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon?: React.ElementType }) {
  const location = useLocation();
  const pathname = location.pathname;
  const isActive = to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <SheetClose asChild>
      <Link
        to={to}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-[#fef1da]/50 rounded-sm transition-colors",
          isActive && "text-[#ffa300] bg-[#fef1da]/50 border-l-2 border-[#ffa300]",
        )}
      >
        {Icon && <Icon className={cn("h-4 w-4 text-muted-foreground", isActive && "text-[#ffa300]")} />}
        {children}
      </Link>
    </SheetClose>
  );
}
