"use client";

import * as React from "react";

import { SEVERITY_META, formatDate } from "@/lib/security";

type Bucket = { capturedAt: Date; criticalCount: number; highCount: number };

const W = 720;
const H = 220;
const PAD = { top: 16, right: 12, bottom: 28, left: 30 };
const BAR_MAX = 18;
/** Séparation entre segments empilés : du vide, jamais un contour. */
const GAP = 2;

/** Extrémité de donnée arrondie à 4 px, pied d'appui carré. */
function cappedBar(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, h, w / 2);
  return `M ${x} ${y + h} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + h} Z`;
}

export function FindingsChart({ data }: { data: Bucket[] }) {
  const [active, setActive] = React.useState<number | null>(null);

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const band = plotW / data.length;
  const barW = Math.min(BAR_MAX, band - 10);

  const peak = Math.max(...data.map((d) => d.criticalCount + d.highCount));
  const top = Math.ceil(peak / 4) * 4 || 4;
  const ticks = [0, top / 2, top];

  const yOf = (value: number) => PAD.top + (1 - value / top) * plotH;
  const xOf = (i: number) => PAD.left + i * band + (band - barW) / 2;

  const totals = data.reduce(
    (acc, d) => ({
      critical: acc.critical + d.criticalCount,
      high: acc.high + d.highCount,
    }),
    { critical: 0, high: 0 }
  );

  return (
    <div className="p-4">
      {/* Légende : présente dès deux séries, l'identité ne repose jamais sur
          la seule couleur. */}
      <div className="mb-2 flex flex-wrap items-center gap-4 text-xs">
        {(
          [
            ["CRITICAL", totals.critical],
            ["HIGH", totals.high],
          ] as const
        ).map(([severity, total]) => (
          <span key={severity} className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-[3px]"
              style={{ backgroundColor: SEVERITY_META[severity].color }}
              aria-hidden="true"
            />
            <span className="text-muted-foreground">
              {SEVERITY_META[severity].label}
            </span>
            <span className="tabular-nums">{total}</span>
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Findings exploitables par jour sur ${data.length} jours : ${totals.critical} critiques et ${totals.high} élevés au total.`}
        onPointerLeave={() => setActive(null)}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={PAD.left + plotW}
              y1={yOf(tick)}
              y2={yOf(tick)}
              stroke="var(--viz-grid)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={yOf(tick) + 4}
              textAnchor="end"
              className="fill-muted-foreground text-[11px] tabular-nums"
            >
              {tick}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const criticalH = (d.criticalCount / top) * plotH;
          const highH = (d.highCount / top) * plotH;
          const baseY = PAD.top + plotH;

          return (
            <g
              key={d.capturedAt.toISOString()}
              onPointerEnter={() => setActive(i)}
            >
              {/* Bande de survol élargie. Le repère est un fond, pas un
                  grisage des voisines : les teintes de sévérité doivent
                  rester fidèles en permanence. */}
              <rect
                x={PAD.left + i * band}
                y={PAD.top}
                width={band}
                height={plotH}
                fill={active === i ? "var(--viz-grid)" : "transparent"}
              />
              {d.criticalCount > 0 ? (
                <rect
                  x={xOf(i)}
                  y={baseY - criticalH}
                  width={barW}
                  height={criticalH}
                  fill={SEVERITY_META.CRITICAL.color}
                />
              ) : null}
              {d.highCount > 0 ? (
                <path
                  d={cappedBar(
                    xOf(i),
                    baseY - criticalH - GAP - highH,
                    barW,
                    highH
                  )}
                  fill={SEVERITY_META.HIGH.color}
                />
              ) : null}
            </g>
          );
        })}

        <line
          x1={PAD.left}
          x2={PAD.left + plotW}
          y1={PAD.top + plotH}
          y2={PAD.top + plotH}
          stroke="var(--viz-axis)"
          strokeWidth={1}
        />

        {data.map((d, i) =>
          i % 3 === 0 ? (
            <text
              key={d.capturedAt.toISOString()}
              x={xOf(i) + barW / 2}
              y={H - 8}
              textAnchor="middle"
              className="fill-muted-foreground text-[11px]"
            >
              {new Intl.DateTimeFormat("fr-FR", {
                day: "2-digit",
                month: "2-digit",
              }).format(d.capturedAt)}
            </text>
          ) : null
        )}
      </svg>

      <p className="mt-1 h-4 text-center text-xs text-muted-foreground">
        {active !== null
          ? `${formatDate(data[active].capturedAt)} — ${data[active].criticalCount} ${data[active].criticalCount > 1 ? "critiques" : "critique"}, ${data[active].highCount} ${data[active].highCount > 1 ? "élevés" : "élevé"}`
          : "Survolez une colonne pour le détail du jour"}
      </p>
    </div>
  );
}
