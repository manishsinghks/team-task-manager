import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2",
        className,
      )}
      {...props}
    />
  );
}
