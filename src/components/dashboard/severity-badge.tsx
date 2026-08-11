import type { Severity } from "@/generated/prisma/enums";
import { SEVERITY_META } from "@/lib/security";
import { cn } from "@/lib/utils";

/** Pastille de sévérité : toujours teinte + libellé, jamais la teinte seule. */
export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  const meta = SEVERITY_META[severity];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        className
      )}
      style={{
        color: meta.color,
        backgroundColor: `color-mix(in oklab, ${meta.color} 14%, transparent)`,
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
        aria-hidden="true"
      />
      {meta.label}
    </span>
  );
}

/** Répartition des findings ouverts : une jauge par sévérité, chacune
 *  directement étiquetée. */
export function SeverityBreakdown({
  counts,
}: {
  counts: { severity: Severity; count: number }[];
}) {
  const total = counts.reduce((sum, c) => sum + c.count, 0) || 1;

  return (
    <ul className="space-y-3 p-4">
      {counts.map(({ severity, count }) => {
        const meta = SEVERITY_META[severity];
        const share = (count / total) * 100;

        return (
          <li key={severity} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: meta.color }}
                  aria-hidden="true"
                />
                <span className="text-muted-foreground">{meta.label}</span>
              </span>
              <span className="tabular-nums">
                {count}
                <span className="ml-1.5 text-muted-foreground">
                  SLA {meta.slaDays} j
                </span>
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full"
              style={{
                backgroundColor: `color-mix(in oklab, ${meta.color} 16%, transparent)`,
              }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(share, count > 0 ? 4 : 0)}%`,
                  backgroundColor: meta.color,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
