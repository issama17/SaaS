import { redirect } from "next/navigation";
import {
  KeyRoundIcon,
  NetworkIcon,
  RadarIcon,
  ShieldAlertIcon,
} from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { appName, appTagline } from "@/config/nav";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = { title: "Connexion" };

const PITCH = [
  {
    icon: NetworkIcon,
    title: "Inventaire continu",
    text: "Sous-domaines, IP, services et certificats découverts sans agent.",
  },
  {
    icon: ShieldAlertIcon,
    title: "Priorisation réelle",
    text: "CVSS croisé à l'EPSS et au catalogue CISA KEV, pas une liste de 400 lignes.",
  },
  {
    icon: KeyRoundIcon,
    title: "Veille identifiants",
    text: "Alerte dès qu'un compte de l'entreprise apparaît dans un stealer log.",
  },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Déjà connecté : inutile de repasser par le formulaire.
  if (await getCurrentUser()) redirect("/");

  const { next } = await searchParams;
  const target = next?.startsWith("/") && !next.startsWith("//") ? next : "/";

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:gap-16">
      {/* Colonne de présentation, masquée sur mobile où seul le formulaire compte. */}
      <section className="hidden lg:block">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <RadarIcon className="size-5" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-lg font-semibold tracking-tight">{appName}</p>
            <p className="text-xs text-muted-foreground">{appTagline}</p>
          </div>
        </div>

        <h1 className="mt-10 max-w-lg text-4xl leading-tight font-semibold tracking-tight text-balance">
          Ce qu&apos;un attaquant voit de vous, avant qu&apos;il ne s&apos;en
          serve.
        </h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          Surveillance de la surface d&apos;attaque externe et threat
          intelligence, pensées pour les PME qui n&apos;ont pas de SOC.
        </p>

        <ul className="mt-10 space-y-5">
          {PITCH.map((item) => (
            <li key={item.title} className="flex gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-0.5 max-w-sm text-sm text-muted-foreground">
                  {item.text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-md">
        <div className="glass rounded-2xl p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <RadarIcon className="size-4" aria-hidden="true" />
            </span>
            <p className="font-semibold tracking-tight">{appName}</p>
          </div>

          <h2 className="text-xl font-semibold tracking-tight">
            Connexion à votre espace
          </h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Accédez au tableau de bord de votre organisation.
          </p>

          <LoginForm next={target} />

          <div className="mt-6 rounded-lg border border-dashed border-[var(--glass-border)] p-3">
            <p className="text-xs font-medium">Compte de démonstration</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              jane.doe@vasseur-industries.fr
              <br />
              Outpost!Demo2026
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Jeu de données fictif. À retirer avant toute mise en production.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Les sessions expirent après 7 jours et sont révocables depuis le
          serveur.
        </p>
      </section>
    </main>
  );
}
