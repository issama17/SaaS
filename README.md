# Acme SaaS

Squelette d'application SaaS construit avec **Next.js 16 (App Router)**, **Tailwind CSS v4**,
**shadcn/ui** (style `base-nova`, sur Base UI) et **next-themes** pour le dark mode.

## Démarrer

```bash
npm install
npm run dev     # http://localhost:3000
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
├── hooks/use-mobile.ts
└── lib/utils.ts                # helper `cn`
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

## Ajouter un composant shadcn/ui

```bash
npx shadcn@latest add <composant>
```
