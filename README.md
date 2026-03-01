# Registre de Securite ERP

Application de bureau pour gerer le **registre de securite** des etablissements recevant du public (ERP).

Elle centralise tous les documents obligatoires en un seul endroit : verifications techniques, moyens de secours, formations, travaux, consignes, commissions de securite, etc.

## Fonctionnalites

- 8 chapitres reglementaires pre-configures, personnalisables
- Creation et edition de documents en Markdown
- Import de fichiers `.md` par glisser-deposer
- Export PDF
- Theme clair / sombre
- Donnees stockees localement (SQLite)

## Installation

### Pre-requis

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- Pre-requis Tauri v2 : voir [tauri.app/start/prerequisites](https://v2.tauri.app/start/prerequisites/)

### Lancer le projet

```bash
pnpm install
pnpm tauri dev
```

### Build de production

```bash
pnpm tauri build
```

## Licence

MIT
