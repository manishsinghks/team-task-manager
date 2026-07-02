import { cn } from "@/lib/utils";

/** Square, hairline-bordered placeholder — matches loaded geometry, never a blob. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("animate-pulse border border-rule bg-sunken", className)} {...props} />
  );
}
