# Acme SaaS

Squelette d'application SaaS construit avec **Next.js 16 (App Router)**, **Tailwind CSS v4**,
**shadcn/ui** (style `base-nova`, sur Base UI), **next-themes** pour le dark mode et
**Prisma 7** sur PostgreSQL (Supabase).

## Démarrer

```bash
npm install         # génère aussi le client Prisma
cp .env.example .env
npm run dev         # http://localhost:3000
```

Autres scripts : `npm run build`, `npm run start`, `npm run lint`.

## Structure

```
src/
├── app/
│   ├── layout.tsx              # <html>, polices, ThemeProvider, TooltipProvider
│   ├── globals.css             # tokens Tailwind v4 + thèmes clair/sombre
│   └── (app)/                  # zone applicative authentifiée
│       ├── layout.tsx          # Sidebar + Header + zone de contenu
│       ├── page.tsx            # Dashboard (page d'accueil)
│       └── */page.tsx          # projets, analytics, clients, facturation…
├── components/
│   ├── layout/
│   │   ├── app-sidebar.tsx     # navigation de gauche (repliable en icônes)
│   │   ├── site-header.tsx     # header : trigger, recherche, thème, profil
│   │   ├── user-menu.tsx       # bouton de profil + menu déroulant
│   │   └── page-header.tsx     # titre / description / actions d'une page
│   ├── ui/                     # composants shadcn/ui
│   ├── empty-state.tsx
│   ├── mode-toggle.tsx         # bascule clair / sombre
│   └── theme-provider.tsx
├── config/nav.ts               # source unique de la navigation
├── generated/prisma/           # client Prisma généré (git-ignoré)
├── hooks/use-mobile.ts
└── lib/
    ├── prisma.ts               # singleton PrismaClient
    └── utils.ts                # helper `cn`
```

## Layout

Le groupe de routes `(app)` porte le shell : `SidebarProvider` + `AppSidebar` + `SidebarInset`
contenant le header collant et le contenu de la page. Ajouter une page revient à créer
`src/app/(app)/<route>/page.tsx` et à l'inscrire dans `src/config/nav.ts` — l'état actif du
lien est déduit du `pathname`.

Un futur groupe `(auth)` peut vivre à côté de `(app)` pour les écrans sans sidebar
(connexion, inscription).

## Dark mode

`next-themes` applique la classe `.dark` sur `<html>` (`attribute="class"`), ce que
`globals.css` exploite via `@custom-variant dark`. Le thème par défaut suit le système ;
`ModeToggle` bascule entre clair et sombre. `suppressHydrationWarning` sur `<html>` est
nécessaire puisque la classe est posée avant l'hydratation.

## Base de données

Prisma 7 + PostgreSQL (Supabase). Le client généré est git-ignoré et recréé par
`npm install` (script `postinstall`).

```bash
cp .env.example .env      # puis renseignez DATABASE_URL / DIRECT_URL
npm run db:generate       # régénère le client
npm run db:migrate        # première migration (pas encore exécutée)
npm run db:studio
```

| Fichier | Rôle |
| --- | --- |
| `prisma/schema.prisma` | modèles `User` et `Project` (relation 1‑N) |
| `prisma.config.ts` | config CLI ; charge `.env` et choisit l'URL de migration |
| `src/lib/prisma.ts` | singleton `PrismaClient`, à importer côté serveur |
| `src/generated/prisma/` | client généré (git-ignoré) |

Deux URLs sont nécessaires côté Supabase : `DATABASE_URL` pointe sur le pooler
(port 6543) et sert au runtime, `DIRECT_URL` pointe sur la connexion directe
(port 5432) et sert aux commandes Prisma, le pooler ne sachant pas exécuter de
migrations. Prisma 7 se connecte via un driver adapter (`@prisma/adapter-pg`),
configuré dans `src/lib/prisma.ts`.

Usage :

```ts
import { prisma } from "@/lib/prisma";

const projects = await prisma.project.findMany({ include: { user: true } });
```

## Ajouter un composant shadcn/ui

```bash
npx shadcn@latest add <composant>
```
