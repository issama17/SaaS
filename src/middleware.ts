import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/constants";

/**
 * Filtre de premier niveau, et rien de plus : il ne regarde que la *présence*
 * du cookie, ce qui suffit à rediriger un visiteur anonyme vers /login en
 * conservant la page qu'il demandait. Un cookie forgé ou expiré passe ici sans
 * problème — la vérification qui fait autorité reste `requireUser()` dans le
 * layout (app), seul endroit capable d'interroger la base.
 */
export function middleware(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set(
    "next",
    request.nextUrl.pathname + request.nextUrl.search
  );
  return NextResponse.redirect(url);
}

export const config = {
  // Tout sauf /login, les ressources Next et les fichiers statiques.
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
