import type { SecurityGrade, Severity } from "@/generated/prisma/enums";

/**
 * Palette de statut fixe, validée pour les deux thèmes (contraste ≥ 3:1 sur la
 * surface sombre). Elle n'est jamais réutilisée comme couleur de série, et une
 * teinte ne porte jamais seule le sens : chaque usage est doublé d'un libellé.
 */
export const SEVERITY_META: Record<
  Severity,
  { label: string; short: string; color: string; rank: number; slaDays: number }
> = {
  CRITICAL: {
    label: "Critique",
    short: "CRIT",
    color: "var(--sev-critical)",
    rank: 0,
    slaDays: 7,
  },
  HIGH: {
    label: "Élevée",
    short: "HIGH",
    color: "var(--sev-high)",
    rank: 1,
    slaDays: 30,
  },
  MEDIUM: {
    label: "Moyenne",
    short: "MED",
    color: "var(--sev-medium)",
    rank: 2,
    slaDays: 90,
  },
  LOW: {
    label: "Faible",
    short: "LOW",
    color: "var(--sev-low)",
    rank: 3,
    slaDays: 180,
  },
  INFO: {
    label: "Informative",
    short: "INFO",
    color: "var(--sev-info)",
    rank: 4,
    slaDays: 365,
  },
};

export const GRADE_META: Record<
  SecurityGrade,
  { color: string; label: string }
> = {
  A: { color: "var(--sev-low)", label: "Exposition maîtrisée" },
  B: { color: "var(--sev-low)", label: "Quelques écarts" },
  C: { color: "var(--sev-medium)", label: "Corrections attendues" },
  D: { color: "var(--sev-high)", label: "Exposition préoccupante" },
  F: { color: "var(--sev-critical)", label: "Exposition critique" },
};

/** Barème du score d'exposition (100 = sain), aligné sur GRADE_META. */
export function gradeFromScore(score: number): SecurityGrade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

export const EXPOSURE_LABELS: Record<string, string> = {
  INTERNET_FACING: "Exposé Internet",
  RESTRICTED: "Accès restreint",
  INTERNAL: "Interne",
  UNKNOWN: "Inconnu",
};

export const ASSET_TYPE_LABELS: Record<string, string> = {
  DOMAIN: "Domaine",
  SUBDOMAIN: "Sous-domaine",
  IP_ADDRESS: "Adresse IP",
  SERVICE: "Service",
  TLS_CERTIFICATE: "Certificat TLS",
  CLOUD_STORAGE: "Stockage cloud",
  MAIL_SERVER: "Serveur de messagerie",
  CODE_REPOSITORY: "Dépôt de code",
};

export const LEAK_SOURCE_LABELS: Record<string, string> = {
  BREACH_DUMP: "Dump de brèche",
  COMBOLIST: "Combolist",
  STEALER_LOG: "Stealer log",
  PASTE_SITE: "Site de paste",
  RANSOMWARE_BLOG: "Blog d'extorsion",
  DARK_WEB_MARKET: "Marché dark web",
};

export const SCAN_STATUS_LABELS: Record<string, string> = {
  QUEUED: "En file",
  RUNNING: "En cours",
  COMPLETED: "Terminé",
  FAILED: "Échec",
  CANCELLED: "Annulé",
};

export const FINDING_STATUS_LABELS: Record<string, string> = {
  OPEN: "Ouvert",
  TRIAGED: "Trié",
  IN_PROGRESS: "En traitement",
  RESOLVED: "Résolu",
  ACCEPTED_RISK: "Risque accepté",
  FALSE_POSITIVE: "Faux positif",
};

/**
 * Score de priorisation : le CVSS dit la gravité théorique, l'EPSS la
 * probabilité d'exploitation, le KEV le fait qu'elle a déjà lieu. Les trois
 * ensemble ordonnent une file de remédiation bien mieux que le CVSS seul.
 */
export function priorityScore(input: {
  cvssScore?: number | null;
  epssScore?: number | null;
  isKnownExploited?: boolean;
}): number {
  const cvss = input.cvssScore ?? 5;
  const epss = input.epssScore ?? 0.01;
  const kev = input.isKnownExploited ? 1.35 : 1;
  return Math.min(100, Math.round(cvss * 6 * (0.45 + epss * 0.55) * kev));
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600_000],
  ["month", 30 * 24 * 3600_000],
  ["day", 24 * 3600_000],
  ["hour", 3600_000],
  ["minute", 60_000],
];

/** « il y a 14 min », « dans 6 jours » — calculé par rapport à une référence. */
export function relativeTime(date: Date, reference: Date): string {
  const diff = date.getTime() - reference.getTime();
  const formatter = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });

  for (const [unit, ms] of RELATIVE_UNITS) {
    if (Math.abs(diff) >= ms) {
      return formatter.format(Math.round(diff / ms), unit);
    }
  }
  return "à l'instant";
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
