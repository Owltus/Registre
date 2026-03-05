import { open } from "@tauri-apps/plugin-shell"

/**
 * Intercepte les clics sur les liens externes (http/https/mailto)
 * et les ouvre dans le navigateur par défaut du système
 * au lieu de naviguer dans la webview Tauri.
 */
export function initExternalLinks() {
  document.addEventListener("click", (event) => {
    const link = (event.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null
    if (!link) return

    const href = link.getAttribute("href")
    if (!href) return

    if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) {
      event.preventDefault()
      event.stopPropagation()
      open(href).catch((err) => console.error("Impossible d'ouvrir le lien :", err))
    }
  }, true)
}
