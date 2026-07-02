import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Ledger — ruled table/list frame, the workhorse layout of the app.
 * Column templates vary per page, so rows receive their grid via `cols`.
 */
export function Ledger({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border border-rule bg-raised", className)} {...props} />;
}

/** Sunken header row with caps column heads. Hide on mobile per page needs. */
export function LedgerHead({
  cols,
  className,
  children,
}: {
  cols: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid h-9 items-center gap-4 border-b border-rule-2 bg-sunken px-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2",
        className,
      )}
      style={{ gridTemplateColumns: cols }}
    >
      {children}
    </div>
  );
}

export function LedgerRow({
  cols,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { cols?: string }) {
  return (
    <div
      className={cn(
        "grid min-h-10 items-center gap-4 border-b border-rule px-4 py-2 last:border-b-0",
        className,
      )}
      style={cols ? { gridTemplateColumns: cols } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
