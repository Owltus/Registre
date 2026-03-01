import { useState, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import * as Dialog from "@radix-ui/react-dialog"
import { useQuery } from "@/lib/hooks/useQuery"
import { useMutation } from "@/lib/hooks/useMutation"
import { exportToPdf } from "@/lib/export-pdf"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, FileText, FileDown, X } from "lucide-react"

interface Doc {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
}

export default function Documents() {
  const { data: docs, loading, refetch } = useQuery<Doc>("documents")
  const { insert, remove } = useMutation("documents")
  const navigate = useNavigate()

  const [createOpen, setCreateOpen] = useState(false)
  const [createTitle, setCreateTitle] = useState("Sans titre")
  const [pdfDoc, setPdfDoc] = useState<Doc | null>(null)
  const pdfRef = useRef<HTMLDivElement>(null)

  const handleExport = useCallback((e: React.MouseEvent, doc: Doc) => {
    e.stopPropagation()
    setPdfDoc(doc)
  }, [])

  // Quand le rendu off-screen est prêt, exporter et nettoyer
  const handlePdfRendered = useCallback(() => {
    if (!pdfDoc || !pdfRef.current) return
    const html = pdfRef.current.innerHTML
    exportToPdf(pdfDoc.title || "Sans titre", html)
    setPdfDoc(null)
  }, [pdfDoc])

  const handleCreate = async () => {
    const title = createTitle.trim() || "Sans titre"
    await insert({ title, content: "" })
    refetch()
    setCreateOpen(false)
    setCreateTitle("Sans titre")
  }

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    await remove(String(id))
    refetch()
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="mt-2 text-muted-foreground">
            Créez et gérez vos documents Markdown.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setCreateTitle("Sans titre")
            setCreateOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Nouveau
        </Button>
      </div>

      <div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <FileText className="h-10 w-10 mb-3 opacity-50" />
            <p className="font-medium">Aucun document</p>
            <p className="text-sm mt-1">Cliquez sur Nouveau pour en créer un</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                <h3 className="font-medium truncate flex-1">
                  {doc.title || "Sans titre"}
                </h3>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDate(doc.updated_at || doc.created_at)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
                  onClick={(e) => handleExport(e, doc)}
                  aria-label="Exporter PDF"
                >
                  <FileDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
                  onClick={(e) => handleDelete(e, doc.id)}
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rendu off-screen pour export PDF */}
      {pdfDoc && (
        <div className="fixed -left-[9999px] top-0" aria-hidden>
          <div ref={(el) => { pdfRef.current = el; if (el) handlePdfRendered() }} className="prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{pdfDoc.content}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Dialog de création */}
      <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-sm border bg-background shadow-lg rounded-lg flex flex-col overflow-hidden focus:outline-none">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <Dialog.Title className="text-lg font-semibold">
                Nouveau document
              </Dialog.Title>
              <Dialog.Close className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Fermer</span>
              </Dialog.Close>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleCreate()
              }}
              className="px-6 py-4 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="create-title" className="text-sm font-medium">
                  Titre
                </label>
                <Input
                  id="create-title"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="Titre du document"
                  autoFocus
                  onFocus={(e) => e.target.select()}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Dialog.Close asChild>
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </Dialog.Close>
                <Button type="submit">Créer</Button>
              </div>
            </form>

            <Dialog.Description className="sr-only">
              Saisir le titre du nouveau document
            </Dialog.Description>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
