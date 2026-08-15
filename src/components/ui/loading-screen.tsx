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
      : "w-full h-full min-h-[60vh]";

  return (
    <div className={cn(containerClass, "flex items-center justify-center", className)}>
      <div className="flex flex-col items-center text-center px-4 py-6">
        <div className="relative flex items-center justify-center h-20 w-20">
          <div className="absolute inset-0 rounded-full border-[3px] border-[#2F4F97]/20 border-t-[#2F4F97] animate-spin" />
          <img src="/favicon.png" alt="Loading..." className="h-9 w-9 object-contain z-10" />
        </div>
      </div>
    </div>
  );
}
