import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { getStoredTheme, setTheme, type Theme } from "@/lib/theme"

interface ThemeToggleProps {
  /** Mode icône seule (pour la top bar) */
  iconOnly?: boolean
  /** Mode rétracté (pour la sidebar) */
  collapsed?: boolean
  /** Classes CSS additionnelles (conteneur) */
  className?: string
}

export function ThemeToggle({ iconOnly = false, collapsed = false, className }: ThemeToggleProps) {
  const [current, setCurrent] = useState<Theme>(getStoredTheme)

  useEffect(() => {
    setTheme(current)
  }, [current])

  const isDark =
    current === "dark" ||
    (current === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  if (iconOnly) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setCurrent(isDark ? "light" : "dark")}
            className={cn("rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground", className)}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </TooltipTrigger>
        <TooltipContent>{isDark ? "Thème clair" : "Thème sombre"}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => setCurrent(isDark ? "light" : "dark")}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-full",
            collapsed && "justify-center",
            className
          )}
        >
          {isDark ? <Sun className="h-5 w-5 shrink-0" /> : <Moon className="h-5 w-5 shrink-0" />}
          {!collapsed && <span className="text-sm">{isDark ? "Thème clair" : "Thème sombre"}</span>}
        </button>
      </TooltipTrigger>
      <TooltipContent>{isDark ? "Thème clair" : "Thème sombre"}</TooltipContent>
    </Tooltip>
  )
}
