import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-none border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.06em] tabular-nums",
  {
    variants: {
      variant: {
        default:
          "border-rule-hairline bg-paper-base text-ink-secondary",
        emerald:
          "border-accent-primary/50 bg-accent-primary/10 text-accent-primary",
        amber:
          "border-status-caution/50 bg-status-caution/10 text-status-caution",
        rose:
          "border-status-deficit/50 bg-status-deficit/10 text-status-deficit",
        sky:
          "border-rule-hairline bg-paper-interactive text-ink-primary",
        violet:
          "border-rule-hairline bg-paper-interactive text-ink-primary",
        locked:
          "border-rule-hairline bg-paper-base text-ink-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
