/**
 * Jeu de données de démonstration.
 *
 * Tout est fictif — l'organisation, ses domaines, ses adresses — mais la forme
 * colle au schéma Prisma (`prisma/schema.prisma`) et les CVE citées sont
 * réelles, avec leurs scores CVSS/EPSS et leur présence au catalogue CISA KEV.
 * Remplacer ce module par des requêtes `prisma.*` ne changera pas l'UI.
 *
 * Toutes les dates dérivent de `NOW` : le rendu reste déterministe et
 * cohérent avec lui-même, sans dépendre de l'heure du build.
 */
import type {
  AssetType,
  ExposureLevel,
  FindingStatus,
  LeakSource,
  MonitoringStatus,
  ScanStatus,
  ScanType,
  SecurityGrade,
  Severity,
} from "@/generated/prisma/enums";

export const NOW = new Date("2026-08-11T09:12:00.000Z");

const HOUR = 3600_000;
const DAY = 24 * HOUR;

const ago = (ms: number) => new Date(NOW.getTime() - ms);
const ahead = (ms: number) => new Date(NOW.getTime() + ms);

// ---------------------------------------------------------------------------
// Tenant
// ---------------------------------------------------------------------------

export const organization = {
  id: "org_vasseur",
  name: "Vasseur Industries",
  slug: "vasseur-industries",
  industry: "Sous-traitance aéronautique",
  employeeCount: 240,
  plan: "Business",
};

export const currentUser = {
  id: "usr_jdoe",
  name: "Jane Doe",
  email: "jane.doe@vasseur-industries.fr",
  role: "Responsable SSI",
};

// ---------------------------------------------------------------------------
// Périmètres surveillés
// ---------------------------------------------------------------------------

export type MockTarget = {
  id: string;
  domain: string;
  label: string;
  status: MonitoringStatus;
  riskScore: number;
  grade: SecurityGrade;
  /** Variation du score sur 30 jours, en points. */
  scoreDelta: number;
  assetCount: number;
  criticalCount: number;
  highCount: number;
  leakCount: number;
  lastScanAt: Date;
  nextScanAt: Date;
  tags: string[];
};

export const targets: MockTarget[] = [
  {
    id: "tgt_corp",
    domain: "vasseur-industries.fr",
    label: "Site corporate & extranet",
    status: "ACTIVE",
    riskScore: 61,
    grade: "C",
    scoreDelta: -7,
    assetCount: 48,
    criticalCount: 2,
    highCount: 5,
    leakCount: 9,
    lastScanAt: ago(14 * 60_000),
    nextScanAt: ahead(6 * HOUR),
    tags: ["production", "vitrine"],
  },
  {
    id: "tgt_api",
    domain: "api.vasseur-cloud.io",
    label: "Plateforme client (SaaS)",
    status: "ACTIVE",
    riskScore: 48,
    grade: "D",
    scoreDelta: -12,
    assetCount: 63,
    criticalCount: 3,
    highCount: 7,
    leakCount: 4,
    lastScanAt: ago(2 * HOUR + 40 * 60_000),
    nextScanAt: ahead(3 * HOUR),
    tags: ["production", "pci-dss", "critique"],
  },
  {
    id: "tgt_rh",
    domain: "rh.vasseur-industries.fr",
    label: "SIRH externalisé",
    status: "ACTIVE",
    riskScore: 34,
    grade: "F",
    scoreDelta: -19,
    assetCount: 12,
    criticalCount: 2,
    highCount: 3,
    leakCount: 14,
    lastScanAt: ago(51 * 60_000),
    nextScanAt: ahead(HOUR),
    tags: ["rgpd", "tiers"],
  },
  {
    id: "tgt_shop",
    domain: "shop.vasseur-industries.fr",
    label: "Boutique pièces détachées",
    status: "ACTIVE",
    riskScore: 78,
    grade: "B",
    scoreDelta: +9,
    assetCount: 21,
    criticalCount: 0,
    highCount: 2,
    leakCount: 1,
    lastScanAt: ago(5 * HOUR),
    nextScanAt: ahead(7 * HOUR),
    tags: ["e-commerce"],
  },
  {
    id: "tgt_logistics",
    domain: "vsr-logistics.eu",
    label: "Filiale logistique",
    status: "PENDING_VERIFICATION",
    riskScore: 91,
    grade: "A",
    scoreDelta: +2,
    assetCount: 7,
    criticalCount: 0,
    highCount: 0,
    leakCount: 0,
    lastScanAt: ago(3 * DAY),
    nextScanAt: ahead(21 * HOUR),
    tags: ["filiale"],
  },
];

// ---------------------------------------------------------------------------
// Actifs découverts
// ---------------------------------------------------------------------------

export type MockAsset = {
  id: string;
  targetId: string;
  type: AssetType;
  value: string;
  ipAddress?: string;
  port?: number;
  product?: string;
  version?: string;
  exposure: ExposureLevel;
  country: string;
  firstSeenAt: Date;
  isNew: boolean;
  tlsExpiresAt?: Date;
};

export const assets: MockAsset[] = [
  {
    id: "ast_vpn",
    targetId: "tgt_corp",
    type: "SERVICE",
    value: "vpn.vasseur-industries.fr",
    ipAddress: "51.83.42.17",
    port: 443,
    product: "PAN-OS GlobalProtect",
    version: "10.2.7",
    exposure: "INTERNET_FACING",
    country: "FR",
    firstSeenAt: ago(94 * DAY),
    isNew: false,
  },
  {
    id: "ast_citrix",
    targetId: "tgt_corp",
    type: "SERVICE",
    value: "portail.vasseur-industries.fr",
    ipAddress: "51.83.42.23",
    port: 443,
    product: "Citrix NetScaler ADC",
    version: "13.1-48.47",
    exposure: "INTERNET_FACING",
    country: "FR",
    firstSeenAt: ago(210 * DAY),
    isNew: false,
  },
  {
    id: "ast_staging",
    targetId: "tgt_api",
    type: "SUBDOMAIN",
    value: "staging-v3.api.vasseur-cloud.io",
    ipAddress: "163.172.88.5",
    port: 8080,
    product: "Apache Tomcat",
    version: "9.0.71",
    exposure: "INTERNET_FACING",
    country: "FR",
    firstSeenAt: ago(2 * DAY),
    isNew: true,
  },
  {
    id: "ast_jenkins",
    targetId: "tgt_api",
    type: "SERVICE",
    value: "ci.vasseur-cloud.io",
    ipAddress: "163.172.88.41",
    port: 8443,
    product: "Jenkins",
    version: "2.441",
    exposure: "INTERNET_FACING",
    country: "FR",
    firstSeenAt: ago(6 * DAY),
    isNew: true,
  },
  {
    id: "ast_bucket",
    targetId: "tgt_api",
    type: "CLOUD_STORAGE",
    value: "s3://vasseur-cloud-backups",
    exposure: "INTERNET_FACING",
    country: "EU",
    firstSeenAt: ago(11 * DAY),
    isNew: false,
  },
  {
    id: "ast_elastic",
    targetId: "tgt_rh",
    type: "SERVICE",
    value: "data.rh.vasseur-industries.fr",
    ipAddress: "141.94.203.66",
    port: 9200,
    product: "Elasticsearch",
    version: "7.10.2",
    exposure: "INTERNET_FACING",
    country: "FR",
    firstSeenAt: ago(4 * DAY),
    isNew: true,
  },
  {
    id: "ast_mail",
    targetId: "tgt_corp",
    type: "MAIL_SERVER",
    value: "mail.vasseur-industries.fr",
    ipAddress: "51.83.42.9",
    port: 25,
    product: "Postfix",
    version: "3.6.4",
    exposure: "INTERNET_FACING",
    country: "FR",
    firstSeenAt: ago(410 * DAY),
    isNew: false,
  },
  {
    id: "ast_cert",
    targetId: "tgt_shop",
    type: "TLS_CERTIFICATE",
    value: "CN=shop.vasseur-industries.fr",
    exposure: "INTERNET_FACING",
    country: "FR",
    firstSeenAt: ago(320 * DAY),
    isNew: false,
    tlsExpiresAt: ahead(6 * DAY),
  },
];

// ---------------------------------------------------------------------------
// Vulnérabilités
// ---------------------------------------------------------------------------

export type MockVulnerability = {
  id: string;
  cveId: string | null;
  title: string;
  severity: Severity;
  cvssScore: number | null;
  epssScore: number | null;
  isKnownExploited: boolean;
  status: FindingStatus;
  detectedAt: Date;
  dueAt: Date;
  targetId: string;
  assetLabel: string;
  assetPort?: number;
  remediation: string;
};

export const vulnerabilities: MockVulnerability[] = [
  {
    id: "vul_1",
    cveId: "CVE-2024-3400",
    title: "Injection de commande dans PAN-OS GlobalProtect",
    severity: "CRITICAL",
    cvssScore: 10.0,
    epssScore: 0.94,
    isKnownExploited: true,
    status: "OPEN",
    detectedAt: ago(2 * DAY + 3 * HOUR),
    dueAt: ahead(5 * DAY),
    targetId: "tgt_corp",
    assetLabel: "vpn.vasseur-industries.fr",
    assetPort: 443,
    remediation: "Appliquer PAN-OS 10.2.9-h1 et révoquer les sessions actives.",
  },
  {
    id: "vul_2",
    cveId: "CVE-2023-4966",
    title: "Citrix Bleed — fuite de jetons de session NetScaler",
    severity: "CRITICAL",
    cvssScore: 9.4,
    epssScore: 0.97,
    isKnownExploited: true,
    status: "IN_PROGRESS",
    detectedAt: ago(6 * DAY),
    dueAt: ago(12 * HOUR),
    targetId: "tgt_corp",
    assetLabel: "portail.vasseur-industries.fr",
    assetPort: 443,
    remediation:
      "Mettre à jour en 13.1-51.15 puis invalider toutes les sessions persistantes.",
  },
  {
    id: "vul_3",
    cveId: "CVE-2024-23897",
    title: "Lecture de fichiers arbitraires via le CLI Jenkins",
    severity: "CRITICAL",
    cvssScore: 9.8,
    epssScore: 0.92,
    isKnownExploited: true,
    status: "OPEN",
    detectedAt: ago(20 * HOUR),
    dueAt: ahead(6 * DAY),
    targetId: "tgt_api",
    assetLabel: "ci.vasseur-cloud.io",
    assetPort: 8443,
    remediation: "Passer en 2.442+ ou désactiver l'accès CLI anonyme.",
  },
  {
    id: "vul_4",
    cveId: null,
    title: "Cluster Elasticsearch exposé sans authentification",
    severity: "CRITICAL",
    cvssScore: 9.1,
    epssScore: null,
    isKnownExploited: false,
    status: "TRIAGED",
    detectedAt: ago(4 * DAY),
    dueAt: ahead(3 * DAY),
    targetId: "tgt_rh",
    assetLabel: "data.rh.vasseur-industries.fr",
    assetPort: 9200,
    remediation:
      "Restreindre 9200 au VPN, activer X-Pack Security et purger les index RH.",
  },
  {
    id: "vul_5",
    cveId: "CVE-2024-21762",
    title: "Écriture hors limites dans FortiOS SSL-VPN",
    severity: "CRITICAL",
    cvssScore: 9.8,
    epssScore: 0.89,
    isKnownExploited: true,
    status: "OPEN",
    detectedAt: ago(9 * DAY),
    dueAt: ago(2 * DAY),
    targetId: "tgt_api",
    assetLabel: "gw.vasseur-cloud.io",
    assetPort: 443,
    remediation: "Migrer en FortiOS 7.4.3 — exploitation active constatée.",
  },
  {
    id: "vul_6",
    cveId: "CVE-2023-46604",
    title: "Exécution de code à distance Apache ActiveMQ (OpenWire)",
    severity: "HIGH",
    cvssScore: 10.0,
    epssScore: 0.86,
    isKnownExploited: true,
    status: "IN_PROGRESS",
    detectedAt: ago(12 * DAY),
    dueAt: ahead(11 * DAY),
    targetId: "tgt_api",
    assetLabel: "mq.vasseur-cloud.io",
    assetPort: 61616,
    remediation: "Mettre à jour ActiveMQ en 5.18.3 et filtrer le port 61616.",
  },
  {
    id: "vul_7",
    cveId: "CVE-2024-6387",
    title: "regreSSHion — RCE pré-authentification dans OpenSSH",
    severity: "HIGH",
    cvssScore: 8.1,
    epssScore: 0.41,
    isKnownExploited: false,
    status: "OPEN",
    detectedAt: ago(3 * DAY),
    dueAt: ahead(24 * DAY),
    targetId: "tgt_corp",
    assetLabel: "bastion.vasseur-industries.fr",
    assetPort: 22,
    remediation: "Passer en OpenSSH 9.8p1 ou fixer LoginGraceTime à 0.",
  },
  {
    id: "vul_8",
    cveId: null,
    title: "Bucket de sauvegarde accessible en lecture publique",
    severity: "HIGH",
    cvssScore: 8.6,
    epssScore: null,
    isKnownExploited: false,
    status: "OPEN",
    detectedAt: ago(11 * DAY),
    dueAt: ahead(18 * DAY),
    targetId: "tgt_api",
    assetLabel: "s3://vasseur-cloud-backups",
    remediation:
      "Retirer l'ACL publique, activer le chiffrement SSE-KMS et auditer les accès.",
  },
  {
    id: "vul_9",
    cveId: "CVE-2021-44228",
    title: "Log4Shell sur un environnement de recette oublié",
    severity: "HIGH",
    cvssScore: 10.0,
    epssScore: 0.78,
    isKnownExploited: true,
    status: "TRIAGED",
    detectedAt: ago(2 * DAY),
    dueAt: ahead(27 * DAY),
    targetId: "tgt_api",
    assetLabel: "staging-v3.api.vasseur-cloud.io",
    assetPort: 8080,
    remediation:
      "Décommissionner l'environnement ou passer Log4j en 2.17.1 minimum.",
  },
  {
    id: "vul_10",
    cveId: null,
    title: "Certificat TLS expirant dans 6 jours",
    severity: "MEDIUM",
    cvssScore: 5.3,
    epssScore: null,
    isKnownExploited: false,
    status: "OPEN",
    detectedAt: ago(HOUR),
    dueAt: ahead(6 * DAY),
    targetId: "tgt_shop",
    assetLabel: "CN=shop.vasseur-industries.fr",
    remediation: "Renouveler le certificat et automatiser le renouvellement ACME.",
  },
  {
    id: "vul_11",
    cveId: null,
    title: "DMARC absent — usurpation du domaine possible",
    severity: "MEDIUM",
    cvssScore: 6.1,
    epssScore: null,
    isKnownExploited: false,
    status: "OPEN",
    detectedAt: ago(16 * DAY),
    dueAt: ahead(74 * DAY),
    targetId: "tgt_corp",
    assetLabel: "mail.vasseur-industries.fr",
    assetPort: 25,
    remediation: "Publier un enregistrement DMARC en p=quarantine puis p=reject.",
  },
  {
    id: "vul_12",
    cveId: null,
    title: "Interface d'administration phpMyAdmin exposée",
    severity: "MEDIUM",
    cvssScore: 6.5,
    epssScore: null,
    isKnownExploited: false,
    status: "ACCEPTED_RISK",
    detectedAt: ago(23 * DAY),
    dueAt: ahead(67 * DAY),
    targetId: "tgt_shop",
    assetLabel: "shop.vasseur-industries.fr/pma",
    assetPort: 443,
    remediation: "Placer l'interface derrière le VPN et activer la double authentification.",
  },
  {
    id: "vul_13",
    cveId: null,
    title: "En-têtes de sécurité HTTP absents (HSTS, CSP)",
    severity: "LOW",
    cvssScore: 3.7,
    epssScore: null,
    isKnownExploited: false,
    status: "OPEN",
    detectedAt: ago(19 * DAY),
    dueAt: ahead(161 * DAY),
    targetId: "tgt_corp",
    assetLabel: "vasseur-industries.fr",
    assetPort: 443,
    remediation: "Ajouter Strict-Transport-Security et une CSP en report-only.",
  },
  {
    id: "vul_14",
    cveId: null,
    title: "Version du serveur divulguée dans les en-têtes",
    severity: "LOW",
    cvssScore: 3.1,
    epssScore: null,
    isKnownExploited: false,
    status: "OPEN",
    detectedAt: ago(21 * DAY),
    dueAt: ahead(159 * DAY),
    targetId: "tgt_api",
    assetLabel: "staging-v3.api.vasseur-cloud.io",
    assetPort: 8080,
    remediation: "Masquer la bannière Server et les pages d'erreur par défaut.",
  },
  {
    id: "vul_15",
    cveId: null,
    title: "SPF en ~all — usurpation partiellement tolérée",
    severity: "LOW",
    cvssScore: 3.4,
    epssScore: null,
    isKnownExploited: false,
    status: "TRIAGED",
    detectedAt: ago(28 * DAY),
    dueAt: ahead(152 * DAY),
    targetId: "tgt_corp",
    assetLabel: "mail.vasseur-industries.fr",
    assetPort: 25,
    remediation: "Passer la politique SPF en -all une fois les émetteurs inventoriés.",
  },
];

// ---------------------------------------------------------------------------
// Fuites d'identifiants
// ---------------------------------------------------------------------------

export type MockLeak = {
  id: string;
  email: string;
  source: LeakSource;
  breachName: string;
  exposedData: string[];
  passwordExposed: boolean;
  severity: Severity;
  status: FindingStatus;
  recordCount: number;
  discoveredAt: Date;
  targetId: string;
};

export const dataLeaks: MockLeak[] = [
  {
    id: "leak_1",
    email: "j.moreau@vasseur-industries.fr",
    source: "STEALER_LOG",
    breachName: "RedLine — log daté du 04/08",
    exposedData: [
      "mot de passe en clair",
      "cookies de session",
      "profil VPN",
    ],
    passwordExposed: true,
    severity: "CRITICAL",
    status: "OPEN",
    recordCount: 1,
    discoveredAt: ago(11 * HOUR),
    targetId: "tgt_corp",
  },
  {
    id: "leak_2",
    email: "paie@rh.vasseur-industries.fr",
    source: "STEALER_LOG",
    breachName: "Lumma — lot revendu sur Telegram",
    exposedData: ["mot de passe en clair", "jetons SSO"],
    passwordExposed: true,
    severity: "CRITICAL",
    status: "TRIAGED",
    recordCount: 3,
    discoveredAt: ago(2 * DAY + 4 * HOUR),
    targetId: "tgt_rh",
  },
  {
    id: "leak_3",
    email: "*@rh.vasseur-industries.fr",
    source: "COMBOLIST",
    breachName: "ALIEN TXTBASE (agrégat 2026)",
    exposedData: ["adresse e-mail", "mot de passe en clair"],
    passwordExposed: true,
    severity: "HIGH",
    status: "OPEN",
    recordCount: 11,
    discoveredAt: ago(3 * DAY),
    targetId: "tgt_rh",
  },
  {
    id: "leak_4",
    email: "devops@vasseur-cloud.io",
    source: "PASTE_SITE",
    breachName: "Clé d'API dans un gist public",
    exposedData: ["clé d'API", "URL de webhook interne"],
    passwordExposed: false,
    severity: "HIGH",
    status: "IN_PROGRESS",
    discoveredAt: ago(5 * DAY),
    recordCount: 1,
    targetId: "tgt_api",
  },
  {
    id: "leak_5",
    email: "*@vasseur-industries.fr",
    source: "BREACH_DUMP",
    breachName: "Fuite d'un prestataire logistique (2025)",
    exposedData: ["adresse e-mail", "hash bcrypt", "poste occupé"],
    passwordExposed: false,
    severity: "MEDIUM",
    status: "TRIAGED",
    recordCount: 47,
    discoveredAt: ago(9 * DAY),
    targetId: "tgt_corp",
  },
  {
    id: "leak_6",
    email: "direction@vasseur-industries.fr",
    source: "RANSOMWARE_BLOG",
    breachName: "Mention sur le blog d'extorsion « LockRoom »",
    exposedData: ["nom de l'entreprise", "échantillon de documents"],
    passwordExposed: false,
    severity: "HIGH",
    status: "OPEN",
    recordCount: 1,
    discoveredAt: ago(31 * HOUR),
    targetId: "tgt_corp",
  },
];

// ---------------------------------------------------------------------------
// Scans
// ---------------------------------------------------------------------------

export type MockScan = {
  id: string;
  targetDomain: string;
  type: ScanType;
  status: ScanStatus;
  engine: string;
  startedAt: Date;
  durationSec: number | null;
  assetsDiscovered: number;
  newFindings: number;
  /** Progression 0–100 pour un scan en cours. */
  progress?: number;
};

export const scans: MockScan[] = [
  {
    id: "scn_1",
    targetDomain: "api.vasseur-cloud.io",
    type: "FULL",
    status: "RUNNING",
    engine: "surface-engine v4.2",
    startedAt: ago(9 * 60_000),
    durationSec: null,
    assetsDiscovered: 41,
    newFindings: 3,
    progress: 68,
  },
  {
    id: "scn_2",
    targetDomain: "vasseur-industries.fr",
    type: "VULNERABILITY",
    status: "COMPLETED",
    engine: "surface-engine v4.2",
    startedAt: ago(14 * 60_000),
    durationSec: 214,
    assetsDiscovered: 48,
    newFindings: 2,
  },
  {
    id: "scn_3",
    targetDomain: "rh.vasseur-industries.fr",
    type: "LEAK_MONITORING",
    status: "COMPLETED",
    engine: "intel-collector v2.9",
    startedAt: ago(51 * 60_000),
    durationSec: 87,
    assetsDiscovered: 0,
    newFindings: 11,
  },
  {
    id: "scn_4",
    targetDomain: "vsr-logistics.eu",
    type: "DISCOVERY",
    status: "FAILED",
    engine: "surface-engine v4.2",
    startedAt: ago(3 * DAY),
    durationSec: 12,
    assetsDiscovered: 0,
    newFindings: 0,
  },
  {
    id: "scn_5",
    targetDomain: "shop.vasseur-industries.fr",
    type: "FULL",
    status: "COMPLETED",
    engine: "surface-engine v4.2",
    startedAt: ago(5 * HOUR),
    durationSec: 341,
    assetsDiscovered: 21,
    newFindings: 1,
  },
];

// ---------------------------------------------------------------------------
// Historique du risque (30 jours)
// ---------------------------------------------------------------------------

export type MockSnapshot = {
  capturedAt: Date;
  riskScore: number;
  criticalCount: number;
  highCount: number;
  exposedAssets: number;
};

/** PRNG déterministe : deux rendus donnent la même courbe. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildHistory(days: number): MockSnapshot[] {
  const random = mulberry32(20260811);
  const history: MockSnapshot[] = [];
  let score = 74;
  let critical = 2;
  let high = 9;
  let assets = 128;

  for (let i = days - 1; i >= 0; i--) {
    // Dérive lente à la baisse, ponctuée de deux décrochages : l'apparition
    // des services de recette (J-9) puis la découverte du cluster RH (J-4).
    const drift = i === 9 ? -6 : i === 4 ? -5 : (random() - 0.62) * 2.4;
    score = Math.max(38, Math.min(96, score + drift));

    if (i === 9) critical += 2;
    if (i === 4) critical += 1;
    if (i === 17) critical = Math.max(0, critical - 1);
    high = Math.max(3, Math.round(high + (random() - 0.45) * 1.6));
    assets = Math.round(assets + random() * 3.4 - 0.6);

    history.push({
      capturedAt: new Date(NOW.getTime() - i * DAY),
      riskScore: Math.round(score),
      criticalCount: critical,
      highCount: high,
      exposedAssets: assets,
    });
  }

  return history;
}

export const riskHistory = buildHistory(30);

// ---------------------------------------------------------------------------
// Agrégats affichés par le dashboard
// ---------------------------------------------------------------------------

const openVulns = vulnerabilities.filter(
  (v) => v.status !== "RESOLVED" && v.status !== "FALSE_POSITIVE"
);

export const summary = {
  riskScore: riskHistory[riskHistory.length - 1].riskScore,
  scoreDelta:
    riskHistory[riskHistory.length - 1].riskScore - riskHistory[0].riskScore,
  exposedAssets: targets.reduce((total, t) => total + t.assetCount, 0),
  newAssets: assets.filter((a) => a.isNew).length,
  criticalCount: openVulns.filter((v) => v.severity === "CRITICAL").length,
  highCount: openVulns.filter((v) => v.severity === "HIGH").length,
  mediumCount: openVulns.filter((v) => v.severity === "MEDIUM").length,
  lowCount: openVulns.filter((v) => v.severity === "LOW").length,
  kevCount: openVulns.filter((v) => v.isKnownExploited).length,
  leakedCredentials: dataLeaks.reduce((total, l) => total + l.recordCount, 0),
  leakedPasswords: dataLeaks
    .filter((l) => l.passwordExposed)
    .reduce((total, l) => total + l.recordCount, 0),
  overdueSla: openVulns.filter((v) => v.dueAt.getTime() < NOW.getTime()).length,
  monitoredTargets: targets.filter((t) => t.status === "ACTIVE").length,
  lastScanAt: scans[1].startedAt,
};
