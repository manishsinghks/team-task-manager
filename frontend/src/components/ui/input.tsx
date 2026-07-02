import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "h-9 w-full rounded-ctl border border-rule-2 bg-raised px-3 text-[13px] text-ink transition-colors duration-100 placeholder:text-ink-3 focus-visible:border-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50",
        (type === "date" || type === "email") && "font-mono text-xs",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";
