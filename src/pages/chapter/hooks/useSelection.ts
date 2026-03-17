import { useState, useCallback, useMemo, useEffect } from "react"
import type { ChapterItem } from "../types"

type ItemKind = ChapterItem["kind"]

/** Clé unique pour identifier un item dans la sélection : "kind:id" */
export type SelectionKey = `${ItemKind}:${number}`

export function toSelectionKey(kind: ItemKind, id: number): SelectionKey {
  return `${kind}:${id}`
}

export function fromSelectionKey(key: SelectionKey): { kind: ItemKind; id: number } {
  const idx = key.lastIndexOf(":")
  return { kind: key.slice(0, idx) as ItemKind, id: Number(key.slice(idx + 1)) }
}

export function useSelection() {
  const [selected, setSelected] = useState<Set<SelectionKey>>(new Set())

  const toggle = useCallback((key: SelectionKey) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const selectAll = useCallback((items: ChapterItem[]) => {
    setSelected(new Set(items.map((item) => toSelectionKey(item.kind, item.data.id))))
  }, [])

  const clear = useCallback(() => {
    setSelected((prev) => prev.size === 0 ? prev : new Set())
  }, [])

  const count = selected.size
  const selectionMode = count > 0

  // Escape pour tout désélectionner
  useEffect(() => {
    if (!selectionMode) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        clear()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [selectionMode, clear])

  return useMemo(
    () => ({ selected, toggle, selectAll, clear, count, selectionMode }),
    [selected, toggle, selectAll, clear, count, selectionMode],
  )
}
