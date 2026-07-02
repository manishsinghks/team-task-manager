import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  barClassName,
}: {
  /** 0–100 */
  value: number;
  className?: string;
  barClassName?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("h-1 w-full overflow-hidden bg-sunken", className)}>
      <div
        className={cn("h-full bg-ink-2 transition-[width] duration-300", barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
