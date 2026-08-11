import { KeyRoundIcon } from "lucide-react";

import { SeverityBadge } from "@/components/dashboard/severity-badge";
import type { MockLeak } from "@/lib/mock/easm";
import { LEAK_SOURCE_LABELS, relativeTime } from "@/lib/security";

export function LeakFeed({ items, now }: { items: MockLeak[]; now: Date }) {
  return (
    <ul className="divide-y divide-[var(--glass-border)]">
      {items.map((leak) => (
        <li key={leak.id} className="px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-mono text-sm">{leak.email}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {LEAK_SOURCE_LABELS[leak.source]} · {leak.breachName}
              </p>
            </div>
            <SeverityBadge severity={leak.severity} className="shrink-0" />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {leak.exposedData.map((item) => (
              <span
                key={item}
                className="rounded bg-muted/60 px-1.5 py-0.5 text-[11px] text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>

          <p className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>{relativeTime(leak.discoveredAt, now)}</span>
            <span className="tabular-nums">
              {leak.recordCount} {leak.recordCount > 1 ? "comptes" : "compte"}
            </span>
            {leak.passwordExposed ? (
              <span
                className="inline-flex items-center gap-1 font-medium"
                style={{ color: "var(--sev-critical)" }}
              >
                <KeyRoundIcon className="size-3" aria-hidden="true" />
                Mot de passe exposé
              </span>
            ) : null}
          </p>
        </li>
      ))}
    </ul>
  );
}
