import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full text-[13px] bg-gray-50 border border-transparent text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#2F4F97]/30 focus:ring-4 focus:ring-[#2F4F97]/10 transition-all duration-300 rounded-xl px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
