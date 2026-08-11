"use client";

import * as React from "react";

import { formatDate } from "@/lib/security";

type Point = { capturedAt: Date; riskScore: number; criticalCount: number };

const W = 720;
const H = 220;
const PAD = { top: 16, right: 44, bottom: 28, left: 34 };
const TICKS = [0, 25, 50, 75, 100];

export function RiskTrendChart({ data }: { data: Point[] }) {
  const [active, setActive] = React.useState<number | null>(null);
  const plotRef = React.useRef<SVGRectElement>(null);

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const x = React.useCallback(
    (i: number) => PAD.left + (i / (data.length - 1)) * plotW,
    [data.length, plotW]
  );
  const y = React.useCallback(
    (value: number) => PAD.top + (1 - value / 100) * plotH,
    [plotH]
  );

  const line = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.riskScore).toFixed(1)}`)
    .join(" ");
  const area = `${line} L ${x(data.length - 1).toFixed(1)} ${PAD.top + plotH} L ${x(0).toFixed(1)} ${PAD.top + plotH} Z`;

  const last = data[data.length - 1];
  const shown = active === null ? data.length - 1 : active;
  const point = data[shown];

  function pick(clientX: number) {
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (clientX - rect.left) / rect.width;
    const index = Math.round(ratio * (data.length - 1));
    setActive(Math.max(0, Math.min(data.length - 1, index)));
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const step = event.key === "ArrowLeft" ? -1 : 1;
    setActive((current) => {
      const base = current ?? data.length - 1;
      return Math.max(0, Math.min(data.length - 1, base + step));
    });
  }

  return (
    <div className="p-4">
      <div
        className="relative rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        tabIndex={0}
        role="img"
        aria-label={`Score d'exposition sur ${data.length} jours, de ${data[0].riskScore} à ${last.riskScore} sur 100. Flèches gauche et droite pour parcourir les points.`}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          onPointerMove={(e) => pick(e.clientX)}
          onPointerLeave={() => setActive(null)}
        >
          <defs>
            <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--viz-series)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--viz-series)" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Grille : hairlines pleines, une teinte au-dessus de la surface. */}
          {TICKS.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={PAD.left + plotW}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--viz-grid)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={y(tick) + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[11px] tabular-nums"
              >
                {tick}
              </text>
            </g>
          ))}

          <path d={area} fill="url(#riskFill)" />
          <path
            d={line}
            fill="none"
            stroke="var(--viz-series)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Repères de dates, un sur sept — en sautant celui qui viendrait
              buter contre l'étiquette de fin. */}
          {data.map((d, i) =>
            (i % 7 === 0 && i < data.length - 4) || i === data.length - 1 ? (
              <text
                key={d.capturedAt.toISOString()}
                x={x(i)}
                y={H - 8}
                textAnchor={i === data.length - 1 ? "end" : "middle"}
                className="fill-muted-foreground text-[11px]"
              >
                {new Intl.DateTimeFormat("fr-FR", {
                  day: "2-digit",
                  month: "short",
                }).format(d.capturedAt)}
              </text>
            ) : null
          )}

          {active !== null ? (
            <line
              x1={x(active)}
              x2={x(active)}
              y1={PAD.top}
              y2={PAD.top + plotH}
              stroke="var(--viz-axis)"
              strokeWidth={1}
            />
          ) : null}

          {/* Marqueur : anneau de 2 px en couleur de surface pour rester
              lisible là où il croise la courbe. */}
          <circle
            cx={x(shown)}
            cy={y(point.riskScore)}
            r={4.5}
            fill="var(--viz-series)"
            stroke="var(--card)"
            strokeWidth={2}
          />

          {active === null ? (
            <text
              x={x(data.length - 1) + 10}
              y={y(last.riskScore) + 4}
              className="fill-foreground text-[13px] font-semibold"
            >
              {last.riskScore}
            </text>
          ) : null}

          <rect
            ref={plotRef}
            x={PAD.left}
            y={PAD.top}
            width={plotW}
            height={plotH}
            fill="transparent"
          />
        </svg>

        {active !== null ? (
          <div
            className="glass pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-lg px-3 py-2 text-xs whitespace-nowrap"
            style={{
              left: `${(x(active) / W) * 100}%`,
            }}
          >
            <p className="font-medium">{formatDate(point.capturedAt)}</p>
            <p className="mt-1 text-muted-foreground">
              Score{" "}
              <span className="text-foreground tabular-nums">
                {point.riskScore}
              </span>{" "}
              · {point.criticalCount}{" "}
              {point.criticalCount > 1 ? "critiques" : "critique"}
            </p>
          </div>
        ) : null}
      </div>

      <details className="group mt-3">
        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
          Voir les valeurs sous forme de tableau
        </summary>
        <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-[var(--glass-border)]">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-3 py-1.5 text-left font-medium">Date</th>
                <th className="px-3 py-1.5 text-right font-medium">Score</th>
                <th className="px-3 py-1.5 text-right font-medium">Critiques</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr
                  key={d.capturedAt.toISOString()}
                  className="border-t border-[var(--glass-border)]"
                >
                  <td className="px-3 py-1.5">{formatDate(d.capturedAt)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    {d.riskScore}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    {d.criticalCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
