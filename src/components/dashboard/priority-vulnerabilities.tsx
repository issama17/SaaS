import { CrosshairIcon, TriangleAlertIcon } from "lucide-react";

import { SeverityBadge } from "@/components/dashboard/severity-badge";
import type { MockVulnerability } from "@/lib/mock/easm";
import { priorityScore, relativeTime } from "@/lib/security";

/**
 * File de remédiation ordonnée par score de priorité (CVSS × EPSS × KEV) et
 * non par CVSS seul : un 9.8 jamais exploité passe après un 8.1 déjà utilisé.
 */
export function PriorityVulnerabilities({
  items,
  now,
}: {
  items: MockVulnerability[];
  now: Date;
}) {
  const ranked = [...items]
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .slice(0, 7);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-sm">
        <thead>
          <tr className="border-b border-[var(--glass-border)] text-xs text-muted-foreground">
            <th className="px-4 py-2 text-left font-medium">Vulnérabilité</th>
            <th className="px-2 py-2 text-left font-medium">Sévérité</th>
            <th className="px-2 py-2 text-right font-medium">CVSS</th>
            <th className="px-2 py-2 text-right font-medium">EPSS</th>
            <th className="px-2 py-2 text-left font-medium">Actif</th>
            <th className="px-4 py-2 text-right font-medium">SLA</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((vuln) => {
            const overdue = vuln.dueAt.getTime() < now.getTime();

            return (
              <tr
                key={vuln.id}
                className="border-b border-[var(--glass-border)] last:border-0 hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{vuln.title}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        {vuln.cveId ? (
                          <span className="font-mono">{vuln.cveId}</span>
                        ) : (
                          <span>Défaut de configuration</span>
                        )}
                        {vuln.isKnownExploited ? (
                          <span
                            className="inline-flex items-center gap-1 rounded px-1 py-0.5 font-medium"
                            style={{
                              color: "var(--sev-critical)",
                              backgroundColor:
                                "color-mix(in oklab, var(--sev-critical) 14%, transparent)",
                            }}
                            title="Présent au catalogue CISA KEV : exploitation confirmée"
                          >
                            <CrosshairIcon className="size-3" aria-hidden="true" />
                            KEV
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-3">
                  <SeverityBadge severity={vuln.severity} />
                </td>
                <td className="px-2 py-3 text-right tabular-nums">
                  {vuln.cvssScore?.toFixed(1) ?? "—"}
                </td>
                <td className="px-2 py-3 text-right tabular-nums text-muted-foreground">
                  {vuln.epssScore
                    ? `${Math.round(vuln.epssScore * 100)} %`
                    : "—"}
                </td>
                <td className="max-w-[13rem] px-2 py-3">
                  <span
                    className="block truncate font-mono text-xs text-muted-foreground"
                    title={`${vuln.assetLabel}${vuln.assetPort ? `:${vuln.assetPort}` : ""}`}
                  >
                    {vuln.assetLabel}
                    {vuln.assetPort ? `:${vuln.assetPort}` : ""}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-xs whitespace-nowrap">
                  {overdue ? (
                    <span
                      className="inline-flex items-center gap-1 font-medium"
                      style={{ color: "var(--sev-critical)" }}
                    >
                      <TriangleAlertIcon className="size-3" aria-hidden="true" />
                      Dépassé
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      {relativeTime(vuln.dueAt, now)}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
