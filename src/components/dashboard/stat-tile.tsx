import * as React from "react";
import { TrendingDownIcon, TrendingUpIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Sparkline de 12 points : le tracé est en teinte de retrait, seule
 *  l'extrémité courante porte l'accent. */
function Sparkline({ points, color }: { points: number[]; color: string }) {
  const width = 96;
  const height = 28;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const coords = points.map((value, index) => ({
    x: (index / (points.length - 1)) * width,
    y: height - ((value - min) / span) * (height - 6) - 3,
  }));

  const path = coords
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const last = coords[coords.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-7 w-24 shrink-0"
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeOpacity={0.45}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={last.x}
        cy={last.y}
        r={3}
        fill={color}
        stroke="var(--card)"
        strokeWidth={2}
      />
    </svg>
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  accent = "var(--viz-series)",
  delta,
  deltaIsGood,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  accent?: string;
  delta?: string;
  deltaIsGood?: boolean;
  trend?: number[];
  className?: string;
}) {
  const DeltaIcon = deltaIsGood ? TrendingDownIcon : TrendingUpIcon;

  return (
    <div
      className={cn(
        "glass flex flex-col justify-between gap-3 rounded-xl p-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon ? (
          <span
            className="flex size-7 items-center justify-center rounded-md"
            style={{
              color: accent,
              backgroundColor: `color-mix(in oklab, ${accent} 14%, transparent)`,
            }}
          >
            <Icon className="size-3.5" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl leading-none font-semibold tracking-tight">
            {value}
          </p>
          {hint ? (
            <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        {trend ? <Sparkline points={trend} color={accent} /> : null}
      </div>

      {delta ? (
        <p
          className="flex items-center gap-1 text-xs"
          style={{
            color: deltaIsGood ? "var(--sev-low)" : "var(--sev-high)",
          }}
        >
          <DeltaIcon className="size-3.5" aria-hidden="true" />
          {delta}
        </p>
      ) : null}
    </div>
  );
}
