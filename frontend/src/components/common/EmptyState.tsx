import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * One serif line, one action. Lives inside whatever frame the content
 * would have occupied.
 */
export function EmptyState({
  title,
  description,
  action,
  framed = true,
  className,
}: {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  /** Set false when rendering inside an existing Ledger/Panel frame. */
  framed?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 px-6 py-14 text-center",
        framed && "border border-rule bg-raised",
        className,
      )}
    >
      <p className="font-serif text-xl italic text-ink">{title}</p>
      {description ? <p className="max-w-sm text-[13px] text-ink-2">{description}</p> : null}
      {action ? (
        <Button variant="secondary" size="sm" onClick={action.onClick} className="mt-1">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
