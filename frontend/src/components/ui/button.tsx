import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-ctl text-[13px] font-medium transition-colors duration-100 active:brightness-95 disabled:pointer-events-none disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Ink-filled: one per view. The accent is for state, not buttons. */
        primary: "bg-flip text-ink-flip hover:bg-flip/90",
        secondary: "border border-rule-2 bg-transparent text-ink hover:bg-sunken",
        ghost: "text-ink-2 hover:bg-sunken hover:text-ink",
        destructive: "border border-oxide/40 bg-transparent text-oxide hover:bg-oxide-wash",
      },
      size: {
        default: "h-9 px-3",
        sm: "h-7 px-2.5 text-xs [&_svg]:h-3.5 [&_svg]:w-3.5",
        icon: "h-9 w-9",
        iconSm: "h-7 w-7 [&_svg]:h-3.5 [&_svg]:w-3.5",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
);
Button.displayName = "Button";
