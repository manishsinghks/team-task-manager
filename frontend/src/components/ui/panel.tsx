import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Panel — LEDGER's replacement for the card. Square corners, hairline
 * border, raised surface. No shadows, no icon tiles, no descriptions.
 */
export function Panel({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={cn("border border-rule bg-raised", className)} {...props} />;
}

/** 40px header row: caps title left, optional mono count / action right. */
export function PanelHeader({
  title,
  aside,
  className,
}: {
  title: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex h-10 items-center justify-between gap-3 border-b border-rule px-4",
        className,
      )}
    >
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2">{title}</h2>
      {aside ? <div className="flex items-center gap-2">{aside}</div> : null}
    </header>
  );
}

export function PanelBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}
