/**
 * Impression via iframe caché.
 * Clone les pages A4 visibles dans l'aperçu dans un iframe temporaire,
 * copie les feuilles de style, puis appelle print() sur l'iframe.
 * Cela contourne les limitations du Dialog Radix (position fixed, flex, overflow)
 * qui empêchent window.print() d'afficher toutes les pages.
 */
export function printViaIframe(scrollContainer: HTMLElement) {
  // Récupérer toutes les pages A4
  const pages = scrollContainer.querySelectorAll<HTMLElement>(".a4-page")
  if (pages.length === 0) return

  // Créer l'iframe caché
  const iframe = document.createElement("iframe")
  iframe.style.position = "fixed"
  iframe.style.left = "-9999px"
  iframe.style.top = "0"
  iframe.style.width = "0"
  iframe.style.height = "0"
  iframe.style.border = "none"
  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (!iframeDoc) {
    document.body.removeChild(iframe)
    return
  }

  // Construire le HTML des pages
  const pagesHtml = Array.from(pages)
    .map((page) => page.outerHTML)
    .join("\n")

  // Écrire le document de base dans l'iframe
  iframeDoc.open()
  iframeDoc.write(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>${pagesHtml}</body>
</html>`)
  iframeDoc.close()

  // Copier toutes les feuilles de style du document principal dans l'iframe
  const linkLoadPromises: Promise<void>[] = []

  document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
    if (el instanceof HTMLStyleElement) {
      // <style> : copier le contenu textuel (déjà compilé par Vite/PostCSS)
      const clone = iframeDoc.createElement("style")
      clone.textContent = el.textContent
      iframeDoc.head.appendChild(clone)
    } else if (el instanceof HTMLLinkElement) {
      // <link> : cloner le tag et attendre le chargement
      const clone = iframeDoc.createElement("link")
      clone.rel = "stylesheet"
      clone.href = el.href
      if (el.media) clone.media = el.media
      linkLoadPromises.push(
        new Promise<void>((resolve) => {
          clone.onload = () => resolve()
          clone.onerror = () => resolve() // on continue même si un style échoue
        })
      )
      iframeDoc.head.appendChild(clone)
    }
  })

  // Ajouter les styles d'impression spécifiques à l'iframe
  const printStyle = iframeDoc.createElement("style")
  printStyle.textContent = `
    @media print {
      @page { size: 210mm 297mm; margin: 0; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    html, body { margin: 0; padding: 0; }
    .a4-page {
      box-shadow: none !important;
      break-after: page;
      margin: 0 !important;
    }
    .a4-page:last-child {
      break-after: auto;
    }
  `
  iframeDoc.head.appendChild(printStyle)

  // Attendre le chargement des <link> + des polices, puis imprimer
  Promise.all(linkLoadPromises)
    .then(() => iframeDoc.fonts.ready)
    .then(() => {
      // Double rAF pour s'assurer que le layout est calculé
      iframe.contentWindow?.requestAnimationFrame(() => {
        iframe.contentWindow?.requestAnimationFrame(() => {
          iframe.contentWindow?.print()

          // Nettoyer après fermeture du dialog d'impression
          setTimeout(() => {
            if (iframe.parentNode) {
              document.body.removeChild(iframe)
            }
          }, 1000)
        })
      })
    })
}
