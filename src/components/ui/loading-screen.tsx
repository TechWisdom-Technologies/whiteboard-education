import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  label?: string;
  sublabel?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  className?: string;
}

export function LoadingScreen({
  label = "Loading...",
  sublabel = "Please wait",
  fullScreen = false,
  overlay = false,
  className,
}: LoadingScreenProps) {
  const containerClass = overlay
    ? "fixed inset-0 z-[90] bg-background/80 backdrop-blur-sm"
    : fullScreen
      ? "min-h-screen"
      : "w-full";

  return (
    <div className={cn(containerClass, "flex items-center justify-center", className)}>
      <div className="flex flex-col items-center text-center px-4 py-6">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <h3 className="mt-3 text-base font-medium text-foreground">{label}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{sublabel}</p>
      </div>
    </div>
  );
}
