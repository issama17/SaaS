-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'ADMIN', 'ANALYST', 'VIEWER');

-- CreateEnum
CREATE TYPE "SecurityGrade" AS ENUM ('A', 'B', 'C', 'D', 'F');

-- CreateEnum
CREATE TYPE "MonitoringStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('DOMAIN', 'SUBDOMAIN', 'IP_ADDRESS', 'SERVICE', 'TLS_CERTIFICATE', 'CLOUD_STORAGE', 'MAIL_SERVER', 'CODE_REPOSITORY');

-- CreateEnum
CREATE TYPE "ExposureLevel" AS ENUM ('INTERNET_FACING', 'RESTRICTED', 'INTERNAL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO');

-- CreateEnum
CREATE TYPE "FindingStatus" AS ENUM ('OPEN', 'TRIAGED', 'IN_PROGRESS', 'RESOLVED', 'ACCEPTED_RISK', 'FALSE_POSITIVE');

-- CreateEnum
CREATE TYPE "ScanType" AS ENUM ('DISCOVERY', 'VULNERABILITY', 'LEAK_MONITORING', 'FULL');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeakSource" AS ENUM ('BREACH_DUMP', 'COMBOLIST', 'STEALER_LOG', 'PASTE_SITE', 'RANSOMWARE_BLOG', 'DARK_WEB_MARKET');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "industry" TEXT,
    "employeeCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'ANALYST',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "target_domains" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "label" TEXT,
    "status" "MonitoringStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "verificationToken" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "grade" "SecurityGrade" NOT NULL DEFAULT 'C',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastScanAt" TIMESTAMP(3),
    "nextScanAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "addedById" TEXT,

    CONSTRAINT "target_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "value" TEXT NOT NULL,
    "ipAddress" TEXT,
    "port" INTEGER,
    "service" TEXT,
    "product" TEXT,
    "version" TEXT,
    "exposure" "ExposureLevel" NOT NULL DEFAULT 'UNKNOWN',
    "country" TEXT,
    "asn" TEXT,
    "tlsExpiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetId" TEXT NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vulnerabilities" (
    "id" TEXT NOT NULL,
    "cveId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "Severity" NOT NULL,
    "cvssScore" DOUBLE PRECISION,
    "cvssVector" TEXT,
    "epssScore" DOUBLE PRECISION,
    "isKnownExploited" BOOLEAN NOT NULL DEFAULT false,
    "status" "FindingStatus" NOT NULL DEFAULT 'OPEN',
    "remediation" TEXT,
    "references" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "targetId" TEXT NOT NULL,
    "assetId" TEXT,
    "assignedToId" TEXT,

    CONSTRAINT "vulnerabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_leaks" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" "LeakSource" NOT NULL,
    "breachName" TEXT NOT NULL,
    "exposedData" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "passwordExposed" BOOLEAN NOT NULL DEFAULT false,
    "severity" "Severity" NOT NULL,
    "status" "FindingStatus" NOT NULL DEFAULT 'OPEN',
    "recordCount" INTEGER,
    "occurredAt" TIMESTAMP(3),
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetId" TEXT NOT NULL,

    CONSTRAINT "data_leaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scans" (
    "id" TEXT NOT NULL,
    "type" "ScanType" NOT NULL,
    "status" "ScanStatus" NOT NULL DEFAULT 'QUEUED',
    "engine" TEXT,
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "durationSec" INTEGER,
    "assetsDiscovered" INTEGER NOT NULL DEFAULT 0,
    "findingsFound" INTEGER NOT NULL DEFAULT 0,
    "newFindings" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "targetId" TEXT NOT NULL,
    "triggeredById" TEXT,

    CONSTRAINT "scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_snapshots" (
    "id" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "grade" "SecurityGrade" NOT NULL,
    "criticalCount" INTEGER NOT NULL DEFAULT 0,
    "highCount" INTEGER NOT NULL DEFAULT 0,
    "mediumCount" INTEGER NOT NULL DEFAULT 0,
    "lowCount" INTEGER NOT NULL DEFAULT 0,
    "leakCount" INTEGER NOT NULL DEFAULT 0,
    "exposedAssets" INTEGER NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    "targetId" TEXT,

    CONSTRAINT "risk_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_ownerId_idx" ON "organizations"("ownerId");

-- CreateIndex
CREATE INDEX "organization_members_userId_idx" ON "organization_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_organizationId_userId_key" ON "organization_members"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "target_domains_status_idx" ON "target_domains"("status");

-- CreateIndex
CREATE UNIQUE INDEX "target_domains_organizationId_domain_key" ON "target_domains"("organizationId", "domain");

-- CreateIndex
CREATE INDEX "assets_targetId_type_idx" ON "assets"("targetId", "type");

-- CreateIndex
CREATE INDEX "assets_exposure_idx" ON "assets"("exposure");

-- CreateIndex
CREATE UNIQUE INDEX "assets_targetId_value_port_key" ON "assets"("targetId", "value", "port");

-- CreateIndex
CREATE INDEX "vulnerabilities_targetId_status_idx" ON "vulnerabilities"("targetId", "status");

-- CreateIndex
CREATE INDEX "vulnerabilities_severity_status_idx" ON "vulnerabilities"("severity", "status");

-- CreateIndex
CREATE INDEX "vulnerabilities_cveId_idx" ON "vulnerabilities"("cveId");

-- CreateIndex
CREATE INDEX "data_leaks_targetId_status_idx" ON "data_leaks"("targetId", "status");

-- CreateIndex
CREATE INDEX "data_leaks_email_idx" ON "data_leaks"("email");

-- CreateIndex
CREATE INDEX "scans_targetId_status_idx" ON "scans"("targetId", "status");

-- CreateIndex
CREATE INDEX "scans_queuedAt_idx" ON "scans"("queuedAt");

-- CreateIndex
CREATE INDEX "risk_snapshots_capturedAt_idx" ON "risk_snapshots"("capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "risk_snapshots_organizationId_targetId_capturedAt_key" ON "risk_snapshots"("organizationId", "targetId", "capturedAt");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "target_domains" ADD CONSTRAINT "target_domains_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "target_domains" ADD CONSTRAINT "target_domains_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "target_domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vulnerabilities" ADD CONSTRAINT "vulnerabilities_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "target_domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vulnerabilities" ADD CONSTRAINT "vulnerabilities_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vulnerabilities" ADD CONSTRAINT "vulnerabilities_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_leaks" ADD CONSTRAINT "data_leaks_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "target_domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "target_domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_snapshots" ADD CONSTRAINT "risk_snapshots_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_snapshots" ADD CONSTRAINT "risk_snapshots_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "target_domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
