/**
 * Exporte du contenu HTML (rendu Markdown) en PDF via le moteur d'impression Chromium.
 * Crée un iframe invisible isolé puis appelle print() dedans.
 *
 * Convention : un `---` dans le Markdown (rendu en <hr>) produit un saut de page dans le PDF.
 */

function escapeHtml(text: string): string {
  const el = document.createElement("span")
  el.textContent = text
  return el.innerHTML
}

const PRINT_STYLES = `
  @page {
    size: A4 portrait;
    margin: 10mm 15mm 18mm 15mm;

    @bottom-center {
      content: counter(page) " / " counter(pages);
      font-size: 9pt;
      color: #888;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
  }


  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body {
    font-family: Georgia, 'Times New Roman', Times, serif;
    font-size: 11pt;
    line-height: 1.7;
    color: #1a1a1a;
    padding: 0;
    overflow-wrap: break-word;
    word-wrap: break-word;
  }


  h1, h2, h3, h4, h5, h6 {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    color: #111;
    break-after: avoid;
    page-break-after: avoid;
    break-inside: avoid;
    page-break-inside: avoid;
    position: relative;
  }

  /* Le premier élément après un titre reste collé avec lui */
  h1 + *, h2 + *, h3 + *, h4 + * {
    break-before: avoid;
    page-break-before: avoid;
  }

  h1 { font-size: 16pt; margin-top: 0.8cm; margin-bottom: 0.35cm; }
  h2 { font-size: 14pt; margin-top: 0.6cm; margin-bottom: 0.3cm; }
  h3 { font-size: 12pt; margin-top: 0.5cm; margin-bottom: 0.25cm; }
  h4 { font-size: 11pt; margin-top: 0.4cm; margin-bottom: 0.2cm; font-weight: 600; }

  p {
    margin-bottom: 0.35cm;
    orphans: 3;
    widows: 3;
  }

  hr {
    border: none;
    height: 0;
    margin: 0;
    padding: 0;
    visibility: hidden;
    break-after: page;
  }

  ul, ol {
    padding-left: 1.4cm;
    margin-bottom: 0.35cm;
  }

  li {
    margin-bottom: 0.12cm;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* Orphelins/veuves dans les items de liste */
  li p {
    orphans: 2;
    widows: 2;
  }

  ul.contains-task-list {
    list-style-type: none;
    padding-left: 0;
  }

  li.task-list-item {
    display: flex;
    align-items: baseline;
    gap: 0.3cm;
  }

  :not(pre) > code {
    font-family: 'Cascadia Code', Consolas, 'Courier New', monospace;
    font-size: 0.9em;
    background-color: #f0f0f0;
    padding: 1pt 4pt;
    border-radius: 3pt;
  }

  pre {
    font-family: 'Cascadia Code', Consolas, 'Courier New', monospace;
    font-size: 9.5pt;
    line-height: 1.45;
    background-color: #f6f8fa;
    border: 1pt solid #e1e4e8;
    border-radius: 4pt;
    padding: 0.4cm;
    margin-bottom: 0.4cm;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-x: visible;
    break-inside: avoid;
    page-break-inside: avoid;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  pre code {
    background: transparent;
    padding: 0;
    border-radius: 0;
    font-size: inherit;
  }

  table {
    width: 100%;
    max-width: 100%;
    border-collapse: collapse;
    margin-bottom: 0.4cm;
    font-size: 10pt;
    break-inside: avoid;
    page-break-inside: avoid;
    table-layout: fixed;
  }

  /* Répéter l'en-tête du tableau sur chaque page */
  thead {
    display: table-header-group;
  }

  tfoot {
    display: table-footer-group;
  }

  tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  th {
    background-color: #f0f0f0;
    font-weight: 600;
    text-align: left;
    padding: 5pt 8pt;
    border: 1pt solid #ccc;
  }

  td {
    padding: 5pt 8pt;
    border: 1pt solid #ccc;
  }

  blockquote {
    border-left: 3pt solid #ccc;
    margin: 0 0 0.4cm 0;
    padding-left: 0.5cm;
    color: #444;
    font-style: italic;
    break-inside: avoid;
    page-break-inside: avoid;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  a {
    color: #1a1a1a;
    text-decoration: underline;
  }

  a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 8pt;
    color: #888;
    word-break: break-all;
  }

  img {
    max-width: 100%;
    max-height: 200mm;
    height: auto;
    break-inside: avoid;
    page-break-inside: avoid;
    margin-bottom: 0.3cm;
  }

  /* Image + légende ou paragraphe suivant restent ensemble */
  img + p, img + em {
    break-before: avoid;
    page-break-before: avoid;
  }

  /* Neutraliser les floats qui cassent la fragmentation */
  [style*="float"] {
    float: none !important;
  }

  strong { font-weight: 700; }
  em { font-style: italic; }
  del { text-decoration: line-through; color: #888; }
`

export function exportToPdf(title: string, htmlContent: string): void {
  if (document.getElementById("pdf-export-iframe")) return

  const iframe = document.createElement("iframe")
  iframe.id = "pdf-export-iframe"
  Object.assign(iframe.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    zIndex: "9999",
    opacity: "0",
    pointerEvents: "none",
    border: "none",
  } as CSSStyleDeclaration)

  document.body.appendChild(iframe)

  const doc = iframe.contentDocument!
  doc.open()
  doc.write(
    `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>${PRINT_STYLES}</style>
</head>
<body>
  ${htmlContent}
</body>
</html>`
  )
  doc.close()

  const cleanup = () => {
    if (iframe.parentNode) {
      document.body.removeChild(iframe)
    }
  }

  iframe.contentWindow!.addEventListener("afterprint", cleanup)
  const fallbackTimer = setTimeout(cleanup, 120_000)
  iframe.contentWindow!.addEventListener("afterprint", () => clearTimeout(fallbackTimer))

  setTimeout(() => {
    iframe.contentWindow!.print()
  }, 300)
}
