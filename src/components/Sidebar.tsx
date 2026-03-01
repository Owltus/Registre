import { useState, useEffect } from "react"
import { Settings } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { mainNavItems } from "@/lib/navigation"
import { NavItem } from "./NavItem"

/** Breakpoint lg Tailwind (1024px) */
const LG_QUERY = "(min-width: 1024px)"

interface SidebarProps {
  mobile?: boolean
  open?: boolean
  onClose?: () => void
  onOpenSettings?: () => void
}

export function Sidebar({ mobile = false, open = false, onClose, onOpenSettings }: SidebarProps) {
  // Détecte si la sidebar desktop est étendue (lg+)
  const [isExpanded, setIsExpanded] = useState(() => window.matchMedia(LG_QUERY).matches)

  useEffect(() => {
    const mq = window.matchMedia(LG_QUERY)
    const handler = (e: MediaQueryListEvent) => setIsExpanded(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // --- Version mobile : drawer + overlay ---
  if (mobile) {
    return (
      <>
        {open && (
          <div
            className="fixed inset-0 z-50 bg-black/40 md:hidden"
            onClick={onClose}
          />
        )}

        <aside
          className={cn(
            "fixed left-0 top-0 z-50 flex h-full w-60 flex-col border-r bg-card transition-transform duration-200 md:hidden",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto">
            {mainNavItems.map((item) => (
              <NavItem key={item.path} item={item} onClick={onClose} />
            ))}
          </nav>

          <div className="mt-auto border-t p-2 flex flex-col gap-1">
            <button
              onClick={() => { onOpenSettings?.(); onClose?.() }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-full"
            >
              <Settings className="h-5 w-5 shrink-0" />
              <span className="text-sm">Paramètres</span>
            </button>
          </div>
        </aside>
      </>
    )
  }

  // --- Version desktop : sidebar fixe ---
  const showTooltip = !isExpanded

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-card overflow-hidden transition-[width] duration-200",
        isExpanded ? "w-60" : "w-16"
      )}
    >
      <nav className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavItem key={item.path} item={item} responsive />
        ))}
      </nav>

      <div className="mt-auto border-t p-2 flex flex-col gap-1">
        <Tooltip open={showTooltip ? undefined : false}>
          <TooltipTrigger asChild>
            <div>
              <button
                onClick={() => onOpenSettings?.()}
                className="flex items-center rounded-lg py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-full"
              >
                <span className="flex items-center justify-center w-12 shrink-0">
                  <Settings className="h-5 w-5" />
                </span>
                <span className={cn(
                  "text-sm whitespace-nowrap transition-opacity duration-200",
                  !isExpanded && "opacity-0"
                )}>
                  Paramètres
                </span>
              </button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">Paramètres</TooltipContent>
        </Tooltip>
      </div>
    </aside>
  )
}
