"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Modal — native <dialog> so focus trapping, Esc, and focus restore come
 * from the platform. Level-3 elevation: the only shadow in the system.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
      className={cn(
        "m-auto w-[calc(100vw-32px)] max-w-[480px] rounded-pop border border-rule-2 bg-raised p-0 text-ink shadow-overlay backdrop:bg-flip/45 open:animate-rise",
        className,
      )}
    >
      <header className="flex h-11 items-center justify-between border-b border-rule py-1 pl-4 pr-2">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <Button
          type="button"
          variant="ghost"
          size="iconSm"
          onClick={() => ref.current?.close()}
          aria-label="Close dialog"
        >
          <X />
        </Button>
      </header>
      <div className="p-4">{children}</div>
    </dialog>
  );
}
