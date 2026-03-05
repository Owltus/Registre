import { useState, useCallback, useRef } from "react"
import { paginate, type PageData } from "./paginate"
import { CONTENT_WIDTH_MM, CONTENT_HEIGHT_MM } from "./constants"

export type { PageData }

interface PaginationResult {
  pages: PageData[]
  measuring: boolean
  measureRef: (node: HTMLDivElement | null) => void
}

/**
 * Convertit des mm en px selon le DPI standard (96 DPI).
 * 1mm = 3.7795275591 px.
 */
function mmToPx(mm: number): number {
  return mm * 3.7795275591
}

/**
 * Hook de pagination.
 *
 * @param contentKey  Clé qui identifie le contenu (ex: le markdown brut).
 *                    Un changement de clé force une re-mesure + re-pagination.
 *
 * Phase 1 : mesure dans un conteneur caché → découpage en pages via paginate().
 * Phase 2 : rendu du HTML extrait de chaque page dans un <A4Page>.
 */
export function usePagination(contentKey?: string): PaginationResult {
  const [pages, setPages] = useState<PageData[]>([])
  const [measuring, setMeasuring] = useState(true)
  const lastKey = useRef<string | undefined>(undefined)

  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return
    // Ne re-mesurer que si la clé a changé (ou première mesure)
    if (lastKey.current === contentKey && pages.length > 0) return
    lastKey.current = contentKey

    setMeasuring(true)

    // Attendre que le DOM ait fini de peindre + que les Mermaid soient rendus
    requestAnimationFrame(() => {
      waitForMermaid(node).then(() => {
        const maxHeight = mmToPx(CONTENT_HEIGHT_MM)
        const pageData = paginate(node, maxHeight)

        setPages(pageData)
        setMeasuring(false)
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKey])

  return { pages, measuring, measureRef }
}

/**
 * Attend que tous les diagrammes Mermaid soient rendus dans le conteneur.
 * Résout immédiatement si aucun diagramme n'est en attente.
 */
function waitForMermaid(container: HTMLElement): Promise<void> {
  const pending = container.querySelectorAll('[data-mermaid-status="pending"]')
  if (pending.length === 0) return Promise.resolve()

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const still = container.querySelectorAll('[data-mermaid-status="pending"]')
      if (still.length === 0) {
        observer.disconnect()
        resolve()
      }
    })
    observer.observe(container, { attributes: true, subtree: true })
  })
}

/**
 * Retourne la largeur de la zone contenu A4 en px (pour dimensionner le conteneur de mesure).
 */
export function getContentWidthPx(): number {
  return mmToPx(CONTENT_WIDTH_MM)
}
