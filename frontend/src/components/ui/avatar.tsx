import { cn } from "@/lib/utils";
import { initials } from "@/lib/task-meta";

/**
 * One quiet style — no rainbow hash palette. Identity comes from the
 * initials themselves, set in mono like every other piece of data.
 */
export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full border border-rule-2 bg-sunken font-mono text-[10px] font-medium uppercase text-ink-2",
        className,
      )}
    >
      {initials(name) || "?"}
    </span>
  );
}
