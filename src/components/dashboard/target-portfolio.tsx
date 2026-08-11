import { ArrowDownRightIcon, ArrowUpRightIcon, ClockIcon } from "lucide-react";

import type { MockTarget } from "@/lib/mock/easm";
import { GRADE_META, relativeTime } from "@/lib/security";

export function TargetPortfolio({
  targets,
  now,
}: {
  targets: MockTarget[];
  now: Date;
}) {
  return (
    <ul className="divide-y divide-[var(--glass-border)]">
      {targets.map((target) => {
        const meta = GRADE_META[target.grade];
        const improving = target.scoreDelta >= 0;
        const DeltaIcon = improving ? ArrowUpRightIcon : ArrowDownRightIcon;

        return (
          <li
            key={target.id}
            className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.03]"
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold"
              style={{
                color: meta.color,
                backgroundColor: `color-mix(in oklab, ${meta.color} 14%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${meta.color} 35%, transparent)`,
              }}
              title={`Note ${target.grade} — ${meta.label}`}
            >
              {target.grade}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{target.domain}</p>
                {target.status === "PENDING_VERIFICATION" ? (
                  <span className="shrink-0 rounded bg-muted/60 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                    Vérification DNS en attente
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {target.label} · {target.assetCount} actifs ·{" "}
                {target.criticalCount} critiques · {target.leakCount} fuites
              </p>

              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${target.riskScore}%`,
                    backgroundColor: meta.color,
                  }}
                />
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold tabular-nums">
                {target.riskScore}
              </p>
              <p
                className="flex items-center justify-end gap-0.5 text-[11px] tabular-nums"
                style={{
                  color: improving ? "var(--sev-low)" : "var(--sev-high)",
                }}
              >
                <DeltaIcon className="size-3" aria-hidden="true" />
                {improving ? "+" : ""}
                {target.scoreDelta}
              </p>
              <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                <ClockIcon className="size-3" aria-hidden="true" />
                {relativeTime(target.lastScanAt, now)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
