/**
 * Mini event bus typé pour la communication entre composants non-liés
 * (ex: une page notifie la sidebar qu'un chapitre a été modifié/supprimé).
 */

/** Événement déclenché quand la liste des chapitres change */
export const CHAPTERS_CHANGED = "chapters:changed" as const

/** Événement déclenché quand la liste/données des classeurs change */
export const CLASSEURS_CHANGED = "classeurs:changed" as const

/** Événements applicatifs — ajouter ici chaque nouvel événement */
export type AppEvent = typeof CHAPTERS_CHANGED | typeof CLASSEURS_CHANGED

type Listener = () => void

const listeners: Partial<Record<AppEvent, Set<Listener>>> = {}

export function on(event: AppEvent, fn: Listener) {
  if (!listeners[event]) listeners[event] = new Set()
  listeners[event]!.add(fn)
  return () => { listeners[event]?.delete(fn) }
}

export function emit(event: AppEvent) {
  listeners[event]?.forEach((fn) => fn())
}
