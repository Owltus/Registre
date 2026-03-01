import { useState, useRef, useEffect } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { iconMap } from "@/lib/navigation"

const iconEntries = Object.entries(iconMap)

interface IconPickerProps {
  value: string
  onChange: (name: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)

  // Scroll vers l'icône sélectionnée au premier rendu
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "center" })
  }, [])

  const filtered = search
    ? iconEntries.filter(([name]) => name.toLowerCase().includes(search.toLowerCase()))
    : iconEntries

  return (
    <div className="flex flex-col gap-2">
      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une icône…"
          className="w-full rounded-md border border-input bg-transparent pl-8 pr-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Grille scrollable */}
      <div className="max-h-52 overflow-y-auto rounded-md border border-input p-2">
        {filtered.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Aucun résultat</p>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {filtered.map(([name, IconComp]) => (
              <button
                key={name}
                ref={name === value ? selectedRef : undefined}
                type="button"
                onClick={() => onChange(name)}
                title={name}
                className={cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  value === name
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <IconComp className="h-5 w-5" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Icône sélectionnée */}
      {value && (
        <p className="text-xs text-muted-foreground">
          Sélection : <span className="font-medium text-foreground">{value}</span>
        </p>
      )}
    </div>
  )
}
