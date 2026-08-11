import { GRADE_META, gradeFromScore } from "@/lib/security";
import { cn } from "@/lib/utils";

/** Arc de 270°, tracé une fois et rempli via `pathLength=100` : la longueur du
 *  trait vaut donc directement le score, sans calcul de circonférence. */
const ARC = "M 43.43 156.57 A 80 80 0 1 1 156.57 156.57";

export function RiskGauge({
  score,
  delta,
  className,
}: {
  score: number;
  delta: number;
  className?: string;
}) {
  const grade = gradeFromScore(score);
  const meta = GRADE_META[grade];
  const improving = delta >= 0;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <svg
          viewBox="0 0 200 190"
          className="h-44 w-44"
          role="img"
          aria-label={`Score d'exposition ${score} sur 100, note ${grade} — ${meta.label}`}
        >
          <path
            d={ARC}
            fill="none"
            stroke={`color-mix(in oklab, ${meta.color} 22%, transparent)`}
            strokeWidth={12}
            strokeLinecap="round"
          />
          <path
            d={ARC}
            fill="none"
            stroke={meta.color}
            strokeWidth={12}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${score} 100`}
          />
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2">
          {/* Chiffre héros : une seule fois par vue, chiffres proportionnels. */}
          <span className="text-5xl leading-none font-semibold tracking-tight">
            {score}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>

      <div className="-mt-4 flex items-center gap-2">
        <span
          className="flex size-9 items-center justify-center rounded-lg text-lg font-semibold"
          style={{
            color: meta.color,
            backgroundColor: `color-mix(in oklab, ${meta.color} 16%, transparent)`,
            boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${meta.color} 40%, transparent)`,
          }}
        >
          {grade}
        </span>
        <div className="leading-tight">
          <p className="text-sm font-medium">{meta.label}</p>
          <p className="text-xs text-muted-foreground">
            {improving ? "+" : ""}
            {delta} pts sur 30 jours
          </p>
        </div>
      </div>
    </div>
  );
}
