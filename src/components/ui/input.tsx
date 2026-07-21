import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full text-[13px] bg-gray-50 border border-transparent text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#2F4F97]/30 focus:ring-4 focus:ring-[#2F4F97]/10 transition-all duration-300 rounded-xl px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-[13px] file:font-medium",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
