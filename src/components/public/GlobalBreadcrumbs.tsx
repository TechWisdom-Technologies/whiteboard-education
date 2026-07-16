import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface GlobalBreadcrumbsProps {
  theme?: "light" | "dark" | "transparent";
}

export function GlobalBreadcrumbs({ theme = "light" }: GlobalBreadcrumbsProps) {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Don't show breadcrumbs on the home page
  if (pathnames.length === 0) {
    return null;
  }

  // Helper to format path segments nicely
  const formatSegment = (segment: string) => {
    // If it's a UUID, fallback to "Details"
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(segment) || /^\d+$/.test(segment)) {
      return "Details";
    }
    // E.g., 'language-centers' -> 'Language Centers'
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const bgClass = theme === "light" ? "bg-white" : "bg-transparent";
  const textClass = theme === "light" ? "text-gray-500" : "text-blue-200";
  const hoverClass = theme === "light" ? "hover:text-[#2F4F97]" : "hover:text-white";
  const activeClass = theme === "light" ? "text-[#1E293B]" : "text-white";
  const separatorClass = theme === "light" ? "text-gray-400" : "text-blue-300/50";

  return (
    <div className={`${bgClass} w-full z-40 relative`}>
      <div className="container mx-auto px-4 lg:px-8 py-5">
        <nav className={`flex flex-wrap items-center text-[12px] ${textClass} font-medium`}>
          <Link to="/" className={`${hoverClass} transition-colors flex items-center shrink-0`}>
            <Home className="h-3.5 w-3.5 mr-1" />
            Home
          </Link>
          
          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;

            return (
              <div key={to} className="flex items-center shrink-0">
                <ChevronRight className={`h-3.5 w-3.5 mx-1.5 ${separatorClass}`} />
                {last ? (
                  <span className={`${activeClass} font-semibold truncate max-w-[200px] sm:max-w-xs`}>{formatSegment(value)}</span>
                ) : (
                  <Link to={to} className={`${hoverClass} transition-colors`}>
                    {formatSegment(value)}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
