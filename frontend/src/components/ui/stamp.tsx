import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Stamp — LEDGER's badge. Mono, uppercase, wash background with its
 * matching text-safe hue. Status is always glyph + label + hue.
 */
const stampVariants = cva(
  "inline-flex h-[18px] items-center gap-1 rounded-ctl px-1.5 font-mono text-[11px] font-medium uppercase tracking-wide",
  {
    variants: {
      tone: {
        neutral: "bg-sunken text-ink-2",
        active: "bg-ochre-wash text-ochre",
        done: "bg-moss-wash text-moss",
        danger: "bg-oxide-wash text-oxide",
        accent: "bg-accent-wash text-accent-ink",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Stamp({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof stampVariants>) {
  return <span className={cn(stampVariants({ tone }), className)} {...props} />;
}
