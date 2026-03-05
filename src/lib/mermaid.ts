import { useState, useEffect } from "react"
import mermaid from "mermaid"

/**
 * Variables de thème alignées sur les tokens shadcn/ui (palette slate).
 */
const lightVars = {
  // Nœuds principaux — bleu doux, cohérent avec le primary navy de l'app
  primaryColor: "#dbeafe",
  primaryTextColor: "#1e3a5f",
  primaryBorderColor: "#93c5fd",
  // Lignes et flèches
  lineColor: "#475569",
  // Nœuds secondaires — indigo très clair
  secondaryColor: "#e0e7ff",
  secondaryTextColor: "#1e3a5f",
  secondaryBorderColor: "#a5b4fc",
  // Nœuds tertiaires — slate neutre
  tertiaryColor: "#f1f5f9",
  tertiaryTextColor: "#0f172a",
  tertiaryBorderColor: "#cbd5e1",
  // Général
  textColor: "#0f172a",
  mainBkg: "#dbeafe",
  nodeBorder: "#93c5fd",
  clusterBkg: "#eff6ff",
  clusterBorder: "#bfdbfe",
  edgeLabelBackground: "#ffffff",
  titleColor: "#0f172a",
  nodeTextColor: "#1e3a5f",
  // Diagrammes de séquence
  actorBkg: "#dbeafe",
  actorTextColor: "#1e3a5f",
  actorBorder: "#93c5fd",
  actorLineColor: "#93c5fd",
  signalColor: "#475569",
  signalTextColor: "#0f172a",
  labelBoxBkgColor: "#eff6ff",
  labelTextColor: "#0f172a",
  noteBkgColor: "#e0e7ff",
  noteTextColor: "#1e3a5f",
  noteBorderColor: "#a5b4fc",
  activationBkgColor: "#dbeafe",
  activationBorderColor: "#93c5fd",
}

const darkVars = {
  // Nœuds principaux — slate-700, bien visibles sur le fond sombre
  primaryColor: "#334155",
  primaryTextColor: "#e2e8f0",
  primaryBorderColor: "#64748b",
  // Lignes et flèches
  lineColor: "#94a3b8",
  // Nœuds secondaires — slate-800
  secondaryColor: "#1e293b",
  secondaryTextColor: "#e2e8f0",
  secondaryBorderColor: "#475569",
  // Nœuds tertiaires
  tertiaryColor: "#293548",
  tertiaryTextColor: "#e2e8f0",
  tertiaryBorderColor: "#475569",
  // Général
  textColor: "#e2e8f0",
  mainBkg: "#334155",
  nodeBorder: "#64748b",
  clusterBkg: "#1e293b",
  clusterBorder: "#475569",
  edgeLabelBackground: "#1e293b",
  titleColor: "#f8fafc",
  nodeTextColor: "#e2e8f0",
  // Diagrammes de séquence
  actorBkg: "#334155",
  actorTextColor: "#e2e8f0",
  actorBorder: "#64748b",
  actorLineColor: "#64748b",
  signalColor: "#94a3b8",
  signalTextColor: "#e2e8f0",
  labelBoxBkgColor: "#1e293b",
  labelTextColor: "#e2e8f0",
  noteBkgColor: "#293548",
  noteTextColor: "#e2e8f0",
  noteBorderColor: "#475569",
  activationBkgColor: "#475569",
  activationBorderColor: "#64748b",
}

let currentDark: boolean | null = null

/**
 * Initialise mermaid avec le thème adapté (clair ou sombre).
 * Ne ré-initialise que si le mode a changé.
 */
function initMermaid(dark: boolean) {
  if (currentDark === dark) return
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    themeVariables: dark ? darkVars : lightVars,
    securityLevel: "strict",
  })
  currentDark = dark
}

let renderCounter = 0

/**
 * Rend un diagramme Mermaid et retourne le SVG résultant.
 * Initialise automatiquement mermaid avec le bon thème avant le rendu.
 */
export async function renderMermaid(code: string, dark: boolean): Promise<string> {
  initMermaid(dark)
  const id = `mermaid-${++renderCounter}`
  const { svg } = await mermaid.render(id, code)
  return svg
}

/**
 * Hook qui observe la classe `dark` sur `<html>` et retourne l'état courant.
 * Permet aux composants de réagir automatiquement aux changements de thème.
 */
export function useDarkMode(): boolean {
  const [dark, setDark] = useState(
    document.documentElement.classList.contains("dark")
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"))
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  return dark
}
