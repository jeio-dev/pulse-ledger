import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-slate-700 bg-slate-800/80 text-slate-200",
        emerald:
          "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        amber:
          "bg-amber-500/10 text-amber-400 border-amber-500/30",
        rose:
          "bg-rose-500/10 text-rose-400 border-rose-500/30",
        sky:
          "bg-sky-500/10 text-sky-400 border-sky-500/30",
        violet:
          "bg-violet-500/10 text-violet-400 border-violet-500/30",
        locked:
          "bg-slate-800/90 text-slate-400 border-slate-700/80",
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
