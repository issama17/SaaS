/**
 * Seed de démonstration : le tenant fictif et ses comptes.
 *
 * Idempotent — il peut être relancé sans dupliquer quoi que ce soit.
 * Lancement : `npm run db:seed` (ou automatiquement après `prisma migrate dev`).
 */
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL (ou DIRECT_URL) doit être défini pour seeder.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const DEMO_PASSWORD = "Outpost!Demo2026";

async function main() {
  // Une empreinte par compte : réutiliser la même réutiliserait aussi le sel,
  // ce qui révélerait que deux comptes partagent le même mot de passe.
  const owner = await prisma.user.upsert({
    where: { email: "jane.doe@vasseur-industries.fr" },
    update: { passwordHash: await hashPassword(DEMO_PASSWORD) },
    create: {
      email: "jane.doe@vasseur-industries.fr",
      name: "Jane Doe",
      jobTitle: "Responsable SSI",
      passwordHash: await hashPassword(DEMO_PASSWORD),
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: "karim.benali@vasseur-industries.fr" },
    update: { passwordHash: await hashPassword(DEMO_PASSWORD) },
    create: {
      email: "karim.benali@vasseur-industries.fr",
      name: "Karim Benali",
      jobTitle: "Analyste SOC",
      passwordHash: await hashPassword(DEMO_PASSWORD),
    },
  });

  // Compte invité sans mot de passe : la connexion par identifiants doit lui
  // être refusée tant qu'il n'en a pas défini un.
  const invited = await prisma.user.upsert({
    where: { email: "audit@cabinet-externe.fr" },
    update: {},
    create: {
      email: "audit@cabinet-externe.fr",
      name: "Cabinet d'audit",
      jobTitle: "Auditeur externe",
    },
  });

  const organization = await prisma.organization.upsert({
    where: { slug: "vasseur-industries" },
    update: {},
    create: {
      name: "Vasseur Industries",
      slug: "vasseur-industries",
      industry: "Sous-traitance aéronautique",
      employeeCount: 240,
      ownerId: owner.id,
    },
  });

  for (const [user, role] of [
    [owner, "OWNER"],
    [analyst, "ANALYST"],
    [invited, "VIEWER"],
  ] as const) {
    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: user.id,
        },
      },
      update: { role },
      create: { organizationId: organization.id, userId: user.id, role },
    });
  }

  console.log(
    `Seed terminé : ${organization.name}, 3 comptes (mot de passe de démo : ${DEMO_PASSWORD}).`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
