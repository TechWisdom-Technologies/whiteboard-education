import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full text-[13px] bg-gray-50 border border-transparent text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:ring-0 focus:border-transparent focus:bg-primary focus:text-white focus:placeholder:text-white/60 focus:caret-white focus:[&::-webkit-calendar-picker-indicator]:filter focus:[&::-webkit-calendar-picker-indicator]:invert transition-all duration-200 rounded-xl px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-[13px] file:font-medium",
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
