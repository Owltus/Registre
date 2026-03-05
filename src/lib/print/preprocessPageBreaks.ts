/**
 * Pré-traitement des marqueurs de saut de page.
 *
 * L'utilisateur écrit === seul sur une ligne pour forcer un saut de page.
 * ReactMarkdown transformerait === en <hr>, donc on le remplace par un
 * marqueur Unicode unique détecté par un composant `p` custom.
 */

const PAGEBREAK_MARKER = "\u29E8SAUT_DE_PAGE\u29E9" // ⧨SAUT_DE_PAGE⧩
const PAGEBREAK_REGEX = /^===\s*$/gm

export { PAGEBREAK_MARKER }

export function preprocessPageBreaks(content: string): string {
  return content.replace(PAGEBREAK_REGEX, `\n${PAGEBREAK_MARKER}\n`)
}
