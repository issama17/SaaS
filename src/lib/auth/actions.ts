"use server";

import { redirect } from "next/navigation";

import { fakeVerify, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export type LoginState = {
  error?: string;
  email?: string;
};

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60_000;

/**
 * Limitation des tentatives, en mémoire du processus. Suffisant pour freiner
 * un bourrinage depuis une IP, mais remis à zéro à chaque déploiement et non
 * partagé entre instances : en production, il faut le déporter dans Redis ou
 * une table dédiée.
 */
const attempts = new Map<string, { count: number; firstAt: number }>();

function tooManyAttempts(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string): void {
  const entry = attempts.get(key);
  if (!entry || Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: Date.now() });
    return;
  }
  entry.count += 1;
}

/** N'accepte qu'un chemin interne : un `next` absolu serait une redirection ouverte. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: "Renseignez votre e-mail et votre mot de passe.", email };
  }

  if (tooManyAttempts(email)) {
    return {
      error: "Trop de tentatives. Réessayez dans quelques minutes.",
      email,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  // Message unique et temps de réponse constant, que le compte existe ou non :
  // l'écran de connexion ne doit pas servir à énumérer les utilisateurs.
  const valid = user?.passwordHash
    ? await verifyPassword(password, user.passwordHash)
    : await fakeVerify(password).then(() => false);

  if (!user || !valid) {
    recordFailure(email);
    return { error: "E-mail ou mot de passe incorrect.", email };
  }

  attempts.delete(email);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await createSession(user.id);

  // `redirect` lève : rien ne doit suivre dans le bloc.
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
