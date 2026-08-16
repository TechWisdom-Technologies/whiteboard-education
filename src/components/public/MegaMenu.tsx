import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCurrency, Currency } from "../../contexts/CurrencyContext";
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
import { GlobalBreadcrumbs } from "./GlobalBreadcrumbs";

const CurrencySelector = ({ isMobile = false }: { isMobile?: boolean }) => {
  const { currency, setCurrency } = useCurrency();
  
  if (isMobile) {
    return (
      <Collapsible>
        <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2.5 text-[14px] font-poppins font-normal text-black hover:bg-[#F8FAFC]/50 rounded-xl transition-colors">
          <span className="flex items-center gap-2.5">
            <RefreshCw className="h-4 w-4 text-muted-foreground" /> Currency ({currency})
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-9 space-y-1 mt-1">
          <SheetClose asChild>
            <div onClick={() => setCurrency("MYR")} className={`cursor-pointer px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${currency === "MYR" ? "bg-[#EEF4FF] text-[#2F4F97] font-bold" : "text-gray-600 hover:text-black hover:bg-gray-50"}`}>
              MYR (Ringgit)
            </div>
          </SheetClose>
          <SheetClose asChild>
            <div onClick={() => setCurrency("USD")} className={`cursor-pointer px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${currency === "USD" ? "bg-[#EEF4FF] text-[#2F4F97] font-bold" : "text-gray-600 hover:text-black hover:bg-gray-50"}`}>
              USD (Dollar)
            </div>
          </SheetClose>
          <SheetClose asChild>
            <div onClick={() => setCurrency("BDT")} className={`cursor-pointer px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${currency === "BDT" ? "bg-[#EEF4FF] text-[#2F4F97] font-bold" : "text-gray-600 hover:text-black hover:bg-gray-50"}`}>
              BDT (Taka)
            </div>
          </SheetClose>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-[#F8FAFC]/50 transition-all border-[#e8e8e8] [&_svg]:!text-[#2F4F97]">
          <div className="relative">
            <RefreshCw className="h-[18px] w-[18px] text-[#2F4F97]" />
            <span className="absolute -bottom-1.5 -right-1.5 text-[9px] font-bold bg-[#2F4F97] text-white rounded-full w-[14px] h-[14px] flex items-center justify-center">
              $
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white border-[#e8e8e8] shadow-md rounded-xl p-2 z-[100]">
        <div className="text-xs font-semibold text-gray-500 mb-2 px-2 uppercase">Currency</div>
        <DropdownMenuItem onClick={() => setCurrency("MYR")} className={`cursor-pointer rounded-lg mb-1 ${currency === "MYR" ? "bg-[#EEF4FF] text-[#2F4F97] font-bold" : ""}`}>
          MYR (Ringgit)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrency("USD")} className={`cursor-pointer rounded-lg mb-1 ${currency === "USD" ? "bg-[#EEF4FF] text-[#2F4F97] font-bold" : ""}`}>
          USD (Dollar)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrency("BDT")} className={`cursor-pointer rounded-lg ${currency === "BDT" ? "bg-[#EEF4FF] text-[#2F4F97] font-bold" : ""}`}>
          BDT (Taka)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const resourceToolsLinks = [
  { label: "Blog", to: "/blog", icon: PenTool, bgImage: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&q=80" },
  { label: "AI Eligibility Test", to: "/eligibility", icon: Sparkles, bgImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80" },
  { label: "Compare Universities", to: "/compare", icon: GitCompare, bgImage: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=500&q=80" },
  { label: "Housing", to: "/housing", icon: Home, bgImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&q=80" },
];

export function MegaMenu({ disableSticky = false, hideBreadcrumbs = false }: { disableSticky?: boolean, hideBreadcrumbs?: boolean } = {}) {
  const { user, hasRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

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
    <>
      {/* Top Utility Bar - Not Sticky */}
      <div className="bg-[#1E293B] text-white py-2">
        <div className="container mx-auto flex justify-end gap-6 px-4 lg:px-8">
          {hasRole("partner") ? (
            <Link 
              to="/partner-dashboard" 
              className="text-[12px] font-semibold hover:text-gray-300 transition-colors flex items-center gap-1.5 tracking-wide pr-3"
            >
              <LayoutDashboard className="h-3 w-3" /> PARTNER DASHBOARD
            </Link>
          ) : (
            <Link 
              to="/partner" 
              className="text-[12px] font-semibold hover:text-gray-300 transition-colors flex items-center gap-1.5 tracking-wide pr-3"
            >
              <Handshake className="h-3 w-3" /> APPLY FOR PARTNERSHIP
            </Link>
          )}
          {!user ? (
            <Link 
              to="/login" 
              className="text-[12px] font-semibold hover:text-gray-300 transition-colors flex items-center gap-1.5 tracking-wide pr-3"
            >
              <LogIn className="h-3 w-3" /> PARTNER LOGIN
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-tight pr-3">Logged in as {user.email}</span>
            </div>
          )}
        </div>
      </div>

      <header className={`${disableSticky ? 'relative' : 'sticky top-0'} z-50 w-full bg-[#F8FAFC]`}>
        <div className="bg-[#F8FAFC]">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
          {/* Brand - Left */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <img src="/logo.png" alt="Whiteboard Education" className="h-6 md:h-8 w-auto object-contain" />
          </Link>

          {/* Desktop Nav - Right Aligned */}
          <div className="hidden lg:flex items-center gap-1">
            <nav className="flex items-center gap-1">
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
                      "h-10 text-[14px] font-poppins font-normal text-black hover:text-[#2F4F97] [&_svg]:hover:!text-[#2F4F97] hover:bg-transparent gap-1.5 px-3 transition-colors",
                      toolsActive && "text-[#2F4F97] [&_svg]:!text-[#2F4F97]",
                    )}
                  >
                    <BookOpen className="h-3.5 w-3.5" /> Resources
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={20} className="w-[520px] p-5 shadow-xl border-[#e8e8e8] border-t-[3px] border-t-[#2F4F97] rounded-t-none">
                  <div className="grid grid-cols-4 gap-3">
                    {resourceToolsLinks.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="relative aspect-square rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
                      >
                        <img 
                          src={item.bgImage} 
                          alt={item.label} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/95 via-[#1E293B]/60 to-[#1E293B]/20" />
                        <div className="absolute inset-0 p-2 flex flex-col items-center justify-center text-center">
                          <item.icon className="h-6 w-6 text-[#2F4F97] mb-1.5" />
                          <span className="text-[11px] font-bold text-white leading-tight">{item.label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <NavItem to="/contact" icon={Phone}>Contact</NavItem>
              <CurrencySelector />

              {user && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-transparent transition-all ml-1">
                      <Avatar className="h-10 w-10 border-2 border-[#2F4F97]/30 overflow-hidden rounded-full shrink-0">
                        <AvatarImage src={avatarUrl} alt={user?.email || "User avatar"} className="object-cover w-full h-full rounded-full" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold rounded-full w-full h-full flex items-center justify-center">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border-[#e8e8e8] shadow-md rounded-xl p-2 z-[100] mt-1">
                    <div className="flex flex-col space-y-1 p-2 mb-2 border-b border-gray-100">
                      <p className="text-sm font-medium leading-none truncate">{user.email}</p>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1">
                        {hasRole("admin") ? "Administrator" : hasRole("partner") ? "Partner" : "User"}
                      </p>
                    </div>
                    {hasRole("admin") && (
                      <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer rounded-lg py-2.5">
                        <ShieldCheck className="mr-2 h-4 w-4 text-[#2F4F97]" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    )}
                    {hasRole("partner") && (
                      <DropdownMenuItem onClick={() => navigate("/partner-dashboard")} className="cursor-pointer rounded-lg py-2.5">
                        <LayoutDashboard className="mr-2 h-4 w-4 text-[#2F4F97]" />
                        <span>Partner Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-gray-100" />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg py-2.5">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </nav>
          </div>

          {/* Mobile Hamburger - now visible on mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden ml-auto hover:text-[#2F4F97] transition-colors rounded-xl">
                <Menu className="h-6 w-6 stroke-[3]" />
              </Button>
            </SheetTrigger>
              <SheetContent side="top" className="w-screen h-screen p-0 border-none">
                <div className="flex flex-col h-full bg-white">
                  {/* Mobile Header */}
                  <div className="p-5 border-b border-[#cacdd4] flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5">
                      <img src="/logo.png" alt="Whiteboard Education" className="h-6 w-auto object-contain" />
                    </Link>
                  </div>

                  {/* Mobile Nav */}
                  <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-2 mt-2">
                    <MobileNavLink to="/universities" icon={GraduationCap}>Universities</MobileNavLink>
                    <MobileNavLink to="/courses" icon={BookOpen}>Courses</MobileNavLink>
                    <MobileNavLink to="/language-centers" icon={Languages}>Language Centers</MobileNavLink>

                    <Collapsible>
                      <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-3.5 text-[16px] font-poppins font-medium text-black hover:bg-[#F8FAFC]/50 rounded-xl transition-colors">
                        <span className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5 text-muted-foreground" /> Resources & Tools
                        </span>
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-6 space-y-2 mt-2">
                        {resourceToolsLinks.map((item) => (
                          <MobileNavLink key={item.to} to={item.to} icon={item.icon}>{item.label}</MobileNavLink>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>

                    <MobileNavLink to="/contact" icon={Phone}>Contact Us</MobileNavLink>
                    <CurrencySelector isMobile={true} />
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
    </header>
    {!hideBreadcrumbs && <GlobalBreadcrumbs />}
    </>
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
          "h-10 text-[14px] font-poppins font-normal text-black hover:text-[#2F4F97] [&_svg]:hover:!text-[#2F4F97] hover:bg-transparent gap-1.5 px-3 transition-colors",
          isActive && "text-[#2F4F97] [&_svg]:!text-[#2F4F97]",
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5" />}
        <span className="relative flex flex-col items-center justify-center">
          {children}
          <div className={cn(
            "absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-[#2F4F97] transition-all duration-300",
            isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
          )} />
        </span>
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
          "flex items-center gap-2.5 px-3 py-2.5 text-[14px] font-poppins font-normal text-black hover:bg-[#F8FAFC]/50 rounded-xl transition-colors",
          isActive && "text-[#2F4F97]"
        )}
      >
        {Icon && <Icon className={cn("h-4 w-4 text-muted-foreground", isActive && "text-[#2F4F97]")} />}
        {children}
        <div className={cn(
          "w-1.5 h-1.5 rounded-full bg-[#2F4F97] transition-all duration-300 ml-1",
          isActive ? "opacity-100 scale-100" : "opacity-0 scale-0 w-0 ml-0"
        )} />
      </Link>
    </SheetClose>
  );
}
