import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[168px] w-full rounded-none border border-rule-hairline bg-paper-base px-3.5 py-3 font-sans text-[15px] leading-[1.6] text-ink-primary placeholder:text-ink-muted focus-visible:border-accent-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-y",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
