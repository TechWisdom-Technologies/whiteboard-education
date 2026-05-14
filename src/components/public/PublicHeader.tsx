import { Link, useLocation } from "react-router-dom";
import { GraduationCap, Menu, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { useState } from "react";

const navLinks = [
  { label: "Universities", href: "/countries" },
  { label: "Compare", href: "/compare" },
  { label: "Eligibility Test", href: "/eligibility" },
  { label: "Cost Calculator", href: "/cost-calculator" },
  { label: "Partner With Us", href: "/b2b" },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-[#ffa300]" />
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-primary">Your</span>
            <span className="text-[#ffa300]">Uni</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) => (
            <NavLink 
              key={l.label} 
              to={l.href} 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-sm"
              activeClassName="text-primary bg-primary/10 font-semibold border-b-2 border-primary"
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="hidden lg:inline-flex gap-1.5">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
          <Link to="/admin">
            <Button variant="outline" size="sm" className="hidden lg:inline-flex">Admin</Button>
          </Link>
          <Link to="/partner-dashboard">
            <Button size="sm" className="hidden lg:inline-flex bg-[#ffa300] text-[#181d29] hover:bg-[#ffa300]/90">Partner Portal</Button>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t bg-background p-4 space-y-3 animate-fade-in">
          {navLinks.map((l) => (
            <NavLink 
              key={l.label} 
              to={l.href} 
              className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-sm"
              activeClassName="text-primary bg-primary/10 font-semibold border-b-2 border-primary"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/login" onClick={() => setMobileOpen(false)}><Button variant="ghost" size="sm" className="w-full justify-start gap-1.5"><LogIn className="h-4 w-4" />Sign In</Button></Link>
            <Link to="/admin" onClick={() => setMobileOpen(false)}><Button variant="outline" size="sm" className="w-full">Admin</Button></Link>
            <Link to="/partner-dashboard" onClick={() => setMobileOpen(false)}><Button size="sm" className="w-full bg-[#ffa300] text-[#181d29]">Partner Portal</Button></Link>
          </div>
        </div>
      )}
    </header>
  );
}
