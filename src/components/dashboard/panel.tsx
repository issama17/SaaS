import * as React from "react";

import { cn } from "@/lib/utils";

/** Surface vitrée de base : tout le dashboard est construit dessus. */
export function Panel({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("glass rounded-xl overflow-hidden", className)}
      {...props}
    />
  );
}

export function PanelHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b border-[var(--glass-border)] px-4 py-3",
        className
      )}
    >
      <div className="space-y-0.5">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
