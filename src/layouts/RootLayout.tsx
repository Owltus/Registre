import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { Menu, Minus, Square, X } from "lucide-react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Sidebar } from "@/components/Sidebar"
import { SettingsDialog } from "@/features/settings/SettingsDialog"
import { OwlLogo } from "@/components/OwlLogo"
import { APP_NAME } from "@/lib/navigation"

/** Icône « restaurer » Windows : deux carrés superposés */
function RestoreIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      {/* Carré arrière (décalé haut-droite) */}
      <rect x="3" y="0.5" width="6.5" height="6.5" rx="0.5" />
      {/* Carré avant (décalé bas-gauche) */}
      <rect x="0.5" y="3" width="6.5" height="6.5" rx="0.5" fill="var(--background, white)" />
    </svg>
  )
}

export function RootLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const appWindow = getCurrentWindow()

  // Suivre l'état maximisé (couvre bouton, double-clic, Aero Snap, raccourcis)
  useEffect(() => {
    appWindow.isMaximized().then(setMaximized)
    const unlisten = appWindow.onResized(() => {
      appWindow.isMaximized().then(setMaximized)
    })
    return () => { unlisten.then(fn => fn()) }
  }, [])

  return (
    <div className="flex h-screen flex-col">
      {/* Titlebar — zone de drag + contrôles */}
      <header
        data-tauri-drag-region
        className="flex select-none items-center border-b px-4 py-2"
      >
        {/* Gauche : logo + nom (pointer-events-none pour laisser le drag traverser) */}
        <div className="pointer-events-none flex items-center gap-2">
          <OwlLogo size={20} />
          <span className="text-sm font-semibold">{APP_NAME}</span>
        </div>

        {/* Droite : hamburger (mobile) + boutons fenêtre */}
        <div className="ml-auto flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Menu</TooltipContent>
          </Tooltip>

          {/* Boutons de contrôle fenêtre — masqués en mobile */}
          <div className="hidden md:flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => appWindow.minimize()}
                  aria-label="Réduire"
                  className="inline-flex h-8 w-10 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Réduire</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => appWindow.toggleMaximize()}
                  aria-label={maximized ? "Restaurer" : "Agrandir"}
                  className="inline-flex h-8 w-10 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {maximized ? (
                    <RestoreIcon className="h-4 w-4" />
                  ) : (
                    <Square className="h-3.5 w-3.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{maximized ? "Restaurer" : "Agrandir"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => appWindow.close()}
                  aria-label="Fermer"
                  className="inline-flex h-8 w-10 items-center justify-center rounded-sm text-muted-foreground hover:bg-red-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Fermer</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Contenu : sidebar + page */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar desktop */}
        <Sidebar onOpenSettings={() => setSettingsOpen(true)} />

        {/* Sidebar mobile (drawer) */}
        <Sidebar mobile open={mobileOpen} onClose={() => setMobileOpen(false)} onOpenSettings={() => setSettingsOpen(true)} />

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
