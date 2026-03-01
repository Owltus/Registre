import { Home, BarChart3, CheckSquare, FileText, type LucideIcon } from "lucide-react"

/** Nom de l'application — utilisé dans la sidebar, la top bar, etc. */
export const APP_NAME = "Owl Boilerplate"

export interface NavItem {
  path: string
  label: string
  icon: LucideIcon
}

/** Items de navigation — affichés dans la sidebar */
export const mainNavItems: NavItem[] = [
  { path: "/", label: "Accueil", icon: Home },
  { path: "/dashboard", label: "Tableau de bord", icon: BarChart3 },
  { path: "/todos", label: "Tâches", icon: CheckSquare },
  { path: "/documents", label: "Documents", icon: FileText },
]

/** Tous les items de navigation */
export const navItems: NavItem[] = [...mainNavItems]
