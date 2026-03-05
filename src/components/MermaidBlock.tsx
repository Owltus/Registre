import { useEffect, useState } from "react"
import { renderMermaid, useDarkMode } from "@/lib/mermaid"

/**
 * Composant qui rend un diagramme Mermaid en SVG.
 * Re-génère le SVG automatiquement quand le thème change.
 * Expose un attribut `data-mermaid-status` pour que la pagination
 * puisse attendre que tous les diagrammes soient prêts.
 */
export function MermaidBlock({ code }: { code: string }) {
  const [svg, setSvg] = useState<string | null>(null)
  const isDark = useDarkMode()

  useEffect(() => {
    let cancelled = false
    renderMermaid(code, isDark)
      .then((result) => { if (!cancelled) setSvg(result) })
      .catch(() => { if (!cancelled) setSvg(null) })
    return () => { cancelled = true }
  }, [code, isDark])

  if (!svg) {
    return (
      <div
        data-mermaid-status="pending"
        className="flex items-center justify-center py-4"
      >
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    )
  }

  return (
    <div
      data-mermaid-status="rendered"
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{ textAlign: "center" }}
    />
  )
}
