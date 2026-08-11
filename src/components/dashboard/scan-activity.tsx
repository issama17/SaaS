import {
  CircleCheckIcon,
  CircleXIcon,
  LoaderCircleIcon,
  RadarIcon,
} from "lucide-react";

import type { MockScan } from "@/lib/mock/easm";
import { SCAN_STATUS_LABELS, relativeTime } from "@/lib/security";

const SCAN_TYPE_LABELS: Record<string, string> = {
  DISCOVERY: "Découverte d'actifs",
  VULNERABILITY: "Analyse de vulnérabilités",
  LEAK_MONITORING: "Veille fuites",
  FULL: "Scan complet",
};

const STATUS_STYLE: Record<
  string,
  { icon: typeof RadarIcon; color: string; spin?: boolean }
> = {
  RUNNING: { icon: LoaderCircleIcon, color: "var(--primary)", spin: true },
  COMPLETED: { icon: CircleCheckIcon, color: "var(--sev-low)" },
  FAILED: { icon: CircleXIcon, color: "var(--sev-critical)" },
  QUEUED: { icon: RadarIcon, color: "var(--muted-foreground)" },
  CANCELLED: { icon: CircleXIcon, color: "var(--muted-foreground)" },
};

export function ScanActivity({
  scans,
  now,
}: {
  scans: MockScan[];
  now: Date;
}) {
  return (
    <ul className="divide-y divide-[var(--glass-border)]">
      {scans.map((scan) => {
        const style = STATUS_STYLE[scan.status] ?? STATUS_STYLE.QUEUED;
        const Icon = style.icon;

        return (
          <li key={scan.id} className="px-4 py-3">
            <div className="flex items-start gap-3">
              <Icon
                className={`mt-0.5 size-4 shrink-0 ${style.spin ? "animate-spin" : ""}`}
                style={{ color: style.color }}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {scan.targetDomain}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {SCAN_TYPE_LABELS[scan.type]} · {scan.engine}
                </p>

                {scan.status === "RUNNING" && scan.progress !== undefined ? (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted/50">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${scan.progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {scan.progress} %
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="shrink-0 text-right text-[11px] text-muted-foreground">
                <p style={{ color: style.color }}>
                  {SCAN_STATUS_LABELS[scan.status]}
                </p>
                <p className="mt-0.5">{relativeTime(scan.startedAt, now)}</p>
                {scan.newFindings > 0 ? (
                  <p className="mt-0.5 tabular-nums">
                    +{scan.newFindings} findings
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
