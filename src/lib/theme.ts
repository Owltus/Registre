export type Theme = "light" | "dark" | "system"

const STORAGE_KEY = "registre-securite-theme"

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(resolved)
}

export function getStoredTheme(): Theme {
  return (localStorage.getItem(STORAGE_KEY) as Theme) || "system"
}

export function setTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme)
  const resolved = theme === "system" ? getSystemTheme() : theme
  applyTheme(resolved)
}

export function initTheme() {
  const stored = getStoredTheme()
  const resolved = stored === "system" ? getSystemTheme() : stored
  applyTheme(resolved)

  // Écouter les changements de préférence OS
  // Ignorer les changements déclenchés par window.print() (passage en media print)
  let printing = false
  window.addEventListener("beforeprint", () => { printing = true })
  window.addEventListener("afterprint", () => {
    printing = false
    // Restaurer le thème correct après l'impression
    if (getStoredTheme() === "system") {
      applyTheme(getSystemTheme())
    }
  })

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (printing) return
      if (getStoredTheme() === "system") {
        applyTheme(getSystemTheme())
      }
    })
}
