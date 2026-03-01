# Owl Boilerplate

> **Boilerplate** — Ce repo est une base technique prete a l'emploi, concue pour etre **forkee**. Il ne contient aucune logique metier : uniquement les fondations (navigation, theme, base de donnees, layout) pour demarrer rapidement une nouvelle application desktop ou mobile.

Application Tauri v2 pour desktop (Windows / macOS / Linux) et Android. Forkez, renommez, codez.

## Stack

| Couche | Technologie |
|--------|-------------|
| Framework | Tauri v2 |
| Backend | Rust (stable, edition 2021) |
| Frontend | React 19 + TypeScript |
| Bundler | Vite |
| UI | shadcn/ui (Radix UI) + Tailwind CSS v3 |
| Routing | React Router v7 (lazy loading) |
| BDD locale | SQLite via tauri-plugin-sql |
| Theme | CSS custom properties (light / dark / system) |

## Fonctionnalites incluses

- **Navigation responsive** : sidebar sur desktop, drawer sur mobile
- **Theme clair/sombre** : detection OS au premier lancement, choix persistant en SQLite
- **Couche donnees** : `useQuery` / `useMutation` / `usePreference` hooks generiques
- **Titlebar custom** : decoration native desactivee, titlebar maison
- **Export PDF** : via le moteur d'impression Chromium
- **Pages de demo** : Accueil, Tableau de bord, Taches (CRUD), Documents (Markdown + split view)

> **Note :** Les features ci-dessus (Taches, Documents, Export PDF…) sont presentes uniquement comme **proof of concept** pour illustrer l'utilisation de la stack. Elles ne sont pas destinees a rester : supprimez celles dont vous n'avez pas besoin. Chaque feature est independante et peut etre retiree sans casser le reste du boilerplate.

## Structure du projet

```
src/
├── layouts/          # RootLayout (titlebar + sidebar + content)
├── components/       # Sidebar, NavItem, ThemeToggle, ui/ (shadcn)
├── features/
│   └── settings/     # SettingsDialog (Apparence + A propos)
├── pages/
│   ├── home/         # Page d'accueil
│   ├── dashboard/    # Tableau de bord
│   ├── todos/        # Liste de taches (CRUD)
│   └── documents/    # Documents Markdown (liste + detail + edition)
├── lib/
│   ├── db/           # DataAdapter, sqlite.ts
│   ├── hooks/        # useQuery, useMutation, usePreference
│   ├── navigation.ts # Config nav centrale
│   ├── theme.ts      # Gestionnaire de theme
│   └── export-pdf.ts # Export PDF
└── styles/
    └── globals.css   # CSS custom properties (tokens light/dark)

src-tauri/
└── src/
    ├── main.rs       # Point d'entree
    ├── lib.rs        # Setup app, plugins, migrations
    ├── state.rs      # AppState (db + config sous Mutex)
    ├── error.rs      # AppError enum
    └── commands/     # Commandes Tauri (app, files)
```

## Demarrage rapide

### Pre-requis

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- Pre-requis Tauri v2 : voir [tauri.app/start/prerequisites](https://v2.tauri.app/start/prerequisites/)

### Installation

```bash
pnpm install
```

### Developpement

```bash
# Lancer l'app (frontend + backend)
pnpm tauri dev
```

### Build de production

```bash
# Build complet (frontend + backend + packaging)
pnpm tauri build
```

### Autres commandes

```bash
# Build frontend seul (TypeScript check + Vite)
pnpm build

# Lint frontend
pnpm lint

# Build backend Rust seul
cd src-tauri && cargo build

# Generer les icones depuis un PNG source
pnpm tauri icon app-icon.png
```

## Forker ce boilerplate

Ce repo est fait pour etre fork. Cliquez sur **"Use this template"** sur GitHub (ou forkez classiquement), puis renommez les references au projet :



| Fichier | Valeur a changer |
|---------|-----------------|
| `package.json` | `name` |
| `src-tauri/Cargo.toml` | `name`, `description` |
| `src-tauri/tauri.conf.json` | `productName`, `identifier`, `windows[0].title` |
| `src/lib/navigation.ts` | `APP_NAME` |
| `src-tauri/src/lib.rs` | Nom de la base SQLite (`sqlite:owl.db`) |
| `index.html` | `<title>` |

### Ensuite

Supprimez ou adaptez les pages de demo (`todos/`, `documents/`) selon vos besoins. Chaque feature est independante et peut etre retiree sans casser le reste.

### Ajouter une page

1. Creer `src/pages/ma-page/MaPage.tsx`
2. Ajouter l'entree dans `src/lib/navigation.ts`
3. Ajouter la route lazy dans `src/App.tsx`

### Ajouter une commande Tauri

1. Creer ou modifier un fichier dans `src-tauri/src/commands/`
2. Exporter le module dans `src-tauri/src/commands/mod.rs`
3. Enregistrer la commande dans `src-tauri/src/lib.rs` → `generate_handler![]`
4. Si besoin d'un plugin, ajouter la permission dans `src-tauri/capabilities/default.json`

## Schema SQLite

Trois tables creees automatiquement au lancement :

```sql
-- Preferences (theme, etc.)
CREATE TABLE preferences (key TEXT PRIMARY KEY, value TEXT NOT NULL);

-- Taches de demo
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Documents Markdown
CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Licence

MIT
