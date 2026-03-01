export type Theme = "light" | "dark" | "system"

const STORAGE_KEY = "owl-theme"

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
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (getStoredTheme() === "system") {
        applyTheme(getSystemTheme())
      }
    })
}
