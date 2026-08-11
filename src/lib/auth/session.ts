import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE } from "@/lib/auth/constants";
import { prisma } from "@/lib/prisma";

export { SESSION_COOKIE };

const SESSION_TTL_DAYS = 7;

/** Le cookie porte le jeton en clair ; la base n'en garde que l'empreinte. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  jobTitle: string | null;
};

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000);
  const headerList = await headers();

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
      userAgent: headerList.get("user-agent")?.slice(0, 255) ?? null,
      ipAddress:
        headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Désactivable en local, où le site est servi en clair.
    secure: process.env.SESSION_COOKIE_SECURE !== "false",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Session courante, ou `null`. Mémoïsé par `cache()` : le layout, le header et
 * les server actions d'un même rendu partagent une seule requête.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      expiresAt: true,
      user: {
        select: { id: true, email: true, name: true, jobTitle: true },
      },
    },
  });

  if (!session) return null;

  // Expiration vérifiée côté serveur : la date du cookie n'engage que le client.
  if (session.expiresAt.getTime() <= Date.now()) return null;

  return session.user;
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Supprime la session en base *et* le cookie : la révocation est effective. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session
      .delete({ where: { tokenHash: hashToken(token) } })
      .catch(() => {
        // Session déjà expirée ou révoquée ailleurs : rien à faire.
      });
  }

  cookieStore.delete(SESSION_COOKIE);
}
