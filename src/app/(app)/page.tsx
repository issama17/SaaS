import {
  KeyRoundIcon,
  NetworkIcon,
  ShieldAlertIcon,
  TimerOffIcon,
} from "lucide-react";

import { AddTargetDialog } from "@/components/dashboard/add-target-dialog";
import { FindingsChart } from "@/components/dashboard/findings-chart";
import { LeakFeed } from "@/components/dashboard/leak-feed";
import { Panel, PanelHeader } from "@/components/dashboard/panel";
import { PriorityVulnerabilities } from "@/components/dashboard/priority-vulnerabilities";
import { RiskGauge } from "@/components/dashboard/risk-gauge";
import { RiskTrendChart } from "@/components/dashboard/risk-trend-chart";
import { ScanActivity } from "@/components/dashboard/scan-activity";
import { SeverityBreakdown } from "@/components/dashboard/severity-badge";
import { StatTile } from "@/components/dashboard/stat-tile";
import { TargetPortfolio } from "@/components/dashboard/target-portfolio";
import {
  NOW,
  dataLeaks,
  organization,
  riskHistory,
  scans,
  summary,
  targets,
  vulnerabilities,
} from "@/lib/mock/easm";
import { relativeTime } from "@/lib/security";

export const metadata = { title: "Surface d'attaque" };

export default function DashboardPage() {
  const last12 = riskHistory.slice(-12);
  const last14 = riskHistory.slice(-14);

  return (
    <div className="space-y-4">
      {/* En-tête de page + call to action principal --------------------- */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Surface d&apos;attaque externe
          </h1>
          <p className="text-sm text-muted-foreground">
            {organization.name} · {summary.monitoredTargets} périmètres
            surveillés · dernier scan {relativeTime(summary.lastScanAt, NOW)}
          </p>
        </div>
        <AddTargetDialog />
      </div>

      {/* Bandeau héros : la note globale et les quatre chiffres clés ----- */}
      <Panel className="grid-lines">
        <div className="grid gap-6 p-4 lg:grid-cols-[auto_1fr] lg:items-center">
          <RiskGauge
            score={summary.riskScore}
            delta={summary.scoreDelta}
            className="mx-auto lg:mx-0 lg:pr-6"
          />

          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            <StatTile
              label="Actifs exposés"
              value={summary.exposedAssets}
              hint={`${summary.newAssets} découverts cette semaine`}
              icon={NetworkIcon}
              accent="var(--viz-series)"
              trend={last12.map((s) => s.exposedAssets)}
            />
            <StatTile
              label="Vulnérabilités critiques"
              value={summary.criticalCount}
              hint={`dont ${summary.kevCount} au catalogue CISA KEV`}
              icon={ShieldAlertIcon}
              accent="var(--sev-critical)"
              delta="+3 sur 30 jours"
              deltaIsGood={false}
              trend={last12.map((s) => s.criticalCount)}
            />
            <StatTile
              label="Identifiants fuités"
              value={summary.leakedCredentials}
              hint={`${summary.leakedPasswords} avec mot de passe exploitable`}
              icon={KeyRoundIcon}
              accent="var(--sev-high)"
              delta="+15 sur 30 jours"
              deltaIsGood={false}
            />
            <StatTile
              label="SLA de remédiation dépassés"
              value={summary.overdueSla}
              hint="au-delà du délai contractuel"
              icon={TimerOffIcon}
              accent="var(--sev-medium)"
            />
          </div>
        </div>
      </Panel>

      {/* Tendance + répartition ----------------------------------------- */}
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Score d'exposition — 30 jours"
            description="100 = surface saine. Les décrochages correspondent à l'apparition de services non déclarés."
          />
          <RiskTrendChart data={riskHistory} />
        </Panel>

        <Panel>
          <PanelHeader
            title="Findings ouverts"
            description="Par sévérité, avec le SLA de remédiation associé."
          />
          <SeverityBreakdown
            counts={[
              { severity: "CRITICAL", count: summary.criticalCount },
              { severity: "HIGH", count: summary.highCount },
              { severity: "MEDIUM", count: summary.mediumCount },
              { severity: "LOW", count: summary.lowCount },
            ]}
          />
        </Panel>
      </div>

      {/* File de remédiation + fuites ------------------------------------ */}
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="File de remédiation"
            description="Triée par CVSS × EPSS × exploitation constatée, pas par CVSS seul."
          />
          <PriorityVulnerabilities items={vulnerabilities} now={NOW} />
        </Panel>

        <Panel>
          <PanelHeader
            title="Fuites d'identifiants"
            description="Corrélées aux domaines surveillés."
          />
          <LeakFeed items={dataLeaks} now={NOW} />
        </Panel>
      </div>

      {/* Volumétrie + activité ------------------------------------------- */}
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Findings exploitables — 14 jours"
            description="Critiques et élevés ouverts chaque jour."
          />
          <FindingsChart data={last14} />
        </Panel>

        <Panel>
          <PanelHeader title="Activité des scans" />
          <ScanActivity scans={scans} now={NOW} />
        </Panel>
      </div>

      {/* Portefeuille de périmètres -------------------------------------- */}
      <Panel>
        <PanelHeader
          title="Périmètres surveillés"
          description="Note d'exposition par domaine racine."
        />
        <TargetPortfolio targets={targets} now={NOW} />
      </Panel>
    </div>
  );
}
