import { Skeleton } from "@/components/ui/skeleton";

/**
 * Page-level loading placeholder in ledger geometry: a title line, a stat
 * strip, and ruled rows — the exact shapes the loaded page will occupy.
 */
export function Loading({ lines = 5 }: { lines?: number }) {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-56 border-0 bg-sunken" />
      <Skeleton className="h-16 w-full" />
      <div className="border border-rule bg-raised">
        {Array.from({ length: Math.max(3, lines) }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-rule px-4 py-3 last:border-b-0">
            <Skeleton className="h-3 w-1/3 border-0" />
            <Skeleton className="ml-auto h-3 w-16 border-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
