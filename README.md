# Outpost — External Attack Surface

SaaS B2B de **gestion de la surface d'attaque externe (EASM)** et de **threat
intelligence** pour les PME. Construit avec **Next.js 16 (App Router)**,
**Tailwind CSS v4**, **shadcn/ui** (style `base-nova`, sur Base UI),
**next-themes** et **Prisma 7** sur PostgreSQL (Supabase).

## Démarrer

```bash
npm install         # génère aussi le client Prisma
cp .env.example .env
npm run dev         # http://localhost:3000
```

Autres scripts : `npm run build`, `npm run start`, `npm run lint`.

## Le produit

La promesse tient en une phrase : **montrer à une PME ce qu'un attaquant voit
d'elle depuis Internet, et lui dire par quoi commencer.** Une PME n'a pas
d'équipe SOC ; elle a besoin d'une liste courte et ordonnée, pas d'un scanner de
plus.

Le dashboard répond donc à trois questions, dans cet ordre :

1. **Que voit-on de nous ?** — inventaire des actifs exposés (sous-domaines, IP,
   services, certificats, buckets), avec ce qui est *apparu* depuis le dernier
   scan. Le shadow IT est le premier risque des PME : c'est ce qui n'a jamais
   été déclaré qui tombe.
2. **Qu'est-ce qui est réellement attaquable ?** — les vulnérabilités, triées
   par **CVSS × EPSS × exploitation constatée (CISA KEV)**, pas par CVSS seul.
   Un 9.8 jamais exploité passe après un 8.1 déjà utilisé dans la nature ; c'est
   la différence entre une liste de 400 lignes et une liste de 5.
3. **Nos accès sont-ils déjà dans la nature ?** — identifiants d'entreprise
   retrouvés dans les dumps, combolists et stealer logs. Un mot de passe VPN
   valide vaut plus cher, pour un attaquant, qu'une RCE à exploiter.

Une **note d'exposition A→F** chapeaute le tout : un chiffre unique
communicable en comité de direction ou à un client qui exige une preuve de
posture. Sa **tendance** compte plus que sa valeur absolue — c'est elle qui dit
si la situation se dégrade.

## Structure

```
src/
├── app/
│   ├── layout.tsx              # <html>, polices, ThemeProvider, TooltipProvider
│   ├── globals.css             # tokens Tailwind v4, palette sombre, glassmorphism
│   └── (app)/                  # zone applicative authentifiée
│       ├── layout.tsx          # Sidebar + Header + halos d'ambiance
│       ├── page.tsx            # Dashboard EASM
│       └── */page.tsx          # surface d'attaque, vulnérabilités, fuites, scans…
├── components/
│   ├── dashboard/              # jauge, tuiles, graphiques, tables, dialogue d'ajout
│   ├── layout/                 # sidebar, header, menu profil, en-tête de page
│   └── ui/                     # composants shadcn/ui
├── config/nav.ts               # source unique de la navigation
├── generated/prisma/           # client Prisma généré (git-ignoré)
└── lib/
    ├── mock/easm.ts            # jeu de données de démonstration
    ├── prisma.ts               # singleton PrismaClient
    ├── security.ts             # sévérités, notes, priorisation, formats
    └── utils.ts                # helper `cn`
```

## Layout

Le groupe de routes `(app)` porte le shell : `SidebarProvider` + `AppSidebar` +
`SidebarInset` contenant le header collant et le contenu de la page. Ajouter une
page revient à créer `src/app/(app)/<route>/page.tsx` et à l'inscrire dans
`src/config/nav.ts` — l'état actif du lien est déduit du `pathname`.

Un futur groupe `(auth)` peut vivre à côté de `(app)` pour les écrans sans
sidebar (connexion, inscription).

## Authentification

Sessions serveur maison, sans dépendance d'authentification : Server Actions +
cookie opaque + table `Session`. Le choix face à Auth.js tient à une chose —
une session en base est **révocable**, là où un JWT autoporteur reste valide
jusqu'à son expiration même après déconnexion.

| Fichier | Rôle |
| --- | --- |
| `src/lib/auth/password.ts` | scrypt (N=32768, r=8), sel par mot de passe, comparaison à temps constant |
| `src/lib/auth/session.ts` | création / lecture / destruction de session, `requireUser()` |
| `src/lib/auth/actions.ts` | Server Actions `loginAction` et `logoutAction` |
| `src/middleware.ts` | redirection rapide des anonymes vers `/login?next=…` |
| `src/app/(auth)/login/` | page de connexion |

Ce qui protège réellement les pages, c'est `requireUser()` dans
`src/app/(app)/layout.tsx` : toute route sous `(app)` traverse ce layout. Le
middleware ne regarde que la *présence* du cookie — un jeton forgé le franchit
et se fait rejeter juste après, en base.

Détails qui comptent :

- Le cookie porte un jeton aléatoire de 32 octets ; la base n'en stocke que le
  SHA-256. Un accès en lecture à la table ne permet pas de rejouer les sessions.
- `httpOnly`, `SameSite=Lax`, `Secure` par défaut — désactivable en local via
  `SESSION_COOKIE_SECURE="false"`, jamais en production.
- Un e-mail inconnu déclenche quand même un calcul scrypt : même message, même
  temps de réponse, donc pas d'énumération des comptes.
- Cinq tentatives par e-mail et par tranche de dix minutes. Le compteur est en
  mémoire du processus : à déporter dans Redis ou en base pour du multi-instance.
- La déconnexion passe par un POST (Server Action) : un GET serait déclenchable
  par un simple lien ou un préchargement.
- Un compte sans `passwordHash` (invité) ne peut pas se connecter par
  identifiants.

Comptes de démonstration créés par le seed, mot de passe `Outpost!Demo2026` :
`jane.doe@vasseur-industries.fr` (propriétaire),
`karim.benali@vasseur-industries.fr` (analyste), et
`audit@cabinet-externe.fr` (invité sans mot de passe, connexion refusée). Le
bloc qui affiche ces identifiants sur `/login` est à retirer avant toute mise
en production.

## Design

Le produit est **pensé en sombre** : `defaultTheme="dark"`, palette bleu de nuit
et accent cyan. Le thème clair reste fonctionnel via la bascule du header.

- **Glassmorphism** : la classe `.glass` (`globals.css`) compose un voile
  translucide, un `backdrop-filter`, un liseré lumineux sur l'arête haute et une
  ombre portée. Tous les panneaux du dashboard en héritent.
- **Halos d'ambiance** : `.aurora`, en position fixe sous le contenu et
  `aria-hidden`, purement décoratif.
- **Couleurs de sévérité** : palette de statut fixe (`--sev-critical` →
  `--sev-low`), contraste ≥ 3:1 sur la surface sombre, jamais réutilisée comme
  couleur de série. Une teinte ne porte jamais seule le sens : chaque usage est
  doublé d'un libellé ou d'une icône.
- **Graphiques** : SVG écrit à la main, sans librairie. Traits de 2 px, remplissage
  de zone à ~10 %, grille en hairlines pleines, colonnes plafonnées à 18 px avec
  extrémité arrondie et 2 px de vide entre segments empilés. Chaque graphique a
  une couche de survol (crosshair ou bande) **et** une vue tableau, pour que
  aucune valeur ne soit accessible uniquement au survol. La courbe de tendance
  est navigable au clavier (flèches gauche/droite).
- **Mouvement** : neutralisé sous `prefers-reduced-motion`.

## Base de données

Prisma 7 + PostgreSQL (Supabase). Le client généré est git-ignoré et recréé par
`npm install` (script `postinstall`).

```bash
cp .env.example .env      # puis renseignez DATABASE_URL / DIRECT_URL
npm run db:generate       # régénère le client
npm run db:deploy         # applique les migrations
npm run db:seed           # crée le tenant et les comptes de démonstration
npm run db:studio
```

`DATABASE_URL` doit aussi être défini dans l'environnement de build (Vercel) :
le client Prisma est instancié au chargement du module et échoue sans elle.

Chaîne de découverte :

```
Organization → TargetDomain → Asset → Vulnerability
                           ↘ DataLeak
                           ↘ Scan        ↘ RiskSnapshot
```

| Modèle | Rôle |
| --- | --- |
| `User`, `Organization`, `OrganizationMember` | comptes et tenant multi-utilisateur |
| `TargetDomain` | périmètre déclaré, vérifié par enregistrement DNS TXT |
| `Asset` | ce que la découverte remonte : sous-domaine, IP, service, certificat, bucket |
| `Vulnerability` | finding CVE ou défaut de configuration, avec CVSS, EPSS, KEV et SLA |
| `DataLeak` | identifiant exposé, avec sa provenance et ce qui a fuité |
| `Scan` | exécution d'un moteur sur un périmètre |
| `RiskSnapshot` | photo quotidienne du risque — alimente les courbes de tendance |

Deux URLs sont nécessaires côté Supabase : `DATABASE_URL` pointe sur le pooler
(port 6543) et sert au runtime, `DIRECT_URL` pointe sur la connexion directe
(port 5432) et sert aux commandes Prisma, le pooler ne sachant pas exécuter de
migrations. Prisma 7 se connecte via un driver adapter (`@prisma/adapter-pg`),
configuré dans `src/lib/prisma.ts`.

## Données de démonstration

`src/lib/mock/easm.ts` fournit un jeu de données typé avec les enums du schéma :
organisation fictive, cinq périmètres, quinze findings, six fuites, trente jours
d'historique. Les CVE citées sont réelles (CVSS, EPSS et statut KEV compris) ;
l'organisation, ses domaines et ses adresses sont inventés.

Toutes les dates dérivent d'une constante `NOW`, et l'historique est produit par
un PRNG à graine fixe : le rendu est déterministe et ne dépend pas de l'heure du
build. Brancher la vraie base revient à remplacer les imports de ce module par
des requêtes `prisma.*` — les composants ne changent pas.

## Ajouter un composant shadcn/ui

```bash
npx shadcn@latest add <composant>
```
