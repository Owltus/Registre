import { useState, useRef, useEffect, useMemo, useCallback, type ChangeEvent } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { iconEntries } from "@/lib/navigation"

/** Nombre d'icônes affichées par lot */
const PAGE_SIZE = 126 // 7 colonnes × 18 lignes

interface IconPickerProps {
  value: string
  onChange: (name: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState("")
  const selectedRef = useRef<HTMLButtonElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Filtrer les icônes selon la recherche
  const filtered = useMemo(() => {
    if (!search) return iconEntries
    const q = search.toLowerCase()
    return iconEntries.filter(([name]) => name.toLowerCase().includes(q))
  }, [search])

  const [visibleCount, setVisibleCount] = useState(() => {
    const idx = iconEntries.findIndex(([name]) => name === value)
    return idx >= PAGE_SIZE ? idx + PAGE_SIZE : PAGE_SIZE
  })

  // Réinitialiser le compteur quand la recherche change
  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setVisibleCount(PAGE_SIZE)
  }, [])

  // Scroll vers l'icône sélectionnée au premier rendu
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "center" })
  }, [])

  // Charger plus au scroll
  const handleScroll = useCallback(() => {
    const el = gridRef.current
    if (!el) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length))
    }
  }, [filtered.length])

  const visible = filtered.slice(0, visibleCount)

  return (
    <div className="flex flex-col gap-2">
      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Rechercher une icône…"
          className="w-full rounded-md border border-input bg-transparent pl-8 pr-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Compteur */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} icône{filtered.length > 1 ? "s" : ""}
        {search && " trouvée" + (filtered.length > 1 ? "s" : "")}
      </p>

      {/* Grille scrollable avec chargement progressif */}
      <div
        ref={gridRef}
        onScroll={handleScroll}
        className="h-64 overflow-y-auto rounded-md border border-input p-2"
      >
        {filtered.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Aucun résultat</p>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {visible.map(([name, IconComp]) => (
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
