import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { containerClassName?: string }
>(({ className, containerClassName, children, ...props }, ref) => (
  <div className={cn("relative", containerClassName)}>
    <select
      ref={ref}
      className={cn(
        "h-9 w-full appearance-none rounded-ctl border border-rule-2 bg-raised py-1 pl-3 pr-8 text-[13px] text-ink transition-colors duration-100 focus-visible:border-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
  </div>
));
Select.displayName = "Select";
