import { useState, useRef, useCallback, useMemo } from "react"
import { useParams } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useQuery } from "@/lib/hooks/useQuery"
import { useMutation } from "@/lib/hooks/useMutation"
import { exportToPdf } from "@/lib/export-pdf"
import type { ChapterRow } from "@/lib/navigation"
import { Button } from "@/components/ui/button"
import { Plus, FileText } from "lucide-react"
import type { Doc } from "./types"
import { ChapterHeader } from "./ChapterHeader"
import { DocumentCard } from "./DocumentCard"
import { CreateDocumentDialog } from "./CreateDocumentDialog"
import { DeleteDocumentDialog } from "./DeleteDocumentDialog"
import { useDropZone, DropOverlay } from "./DropZone"

export default function ChapterPage() {
  const { chapterId } = useParams<{ chapterId: string }>()

  // Chargement du chapitre depuis la DB
  const chapterFilters = useMemo(() => ({ id: Number(chapterId) }), [chapterId])
  const { data: chapterRows, loading: chapterLoading } = useQuery<ChapterRow>("chapters", chapterFilters)
  const chapter = chapterRows[0] ?? null

  const filters = useMemo(() => ({ chapter_id: String(chapterId ?? "") }), [chapterId])
  const { data: docs, loading, refetch } = useQuery<Doc>("documents", filters)
  const { insert, remove } = useMutation("documents")

  const [createOpen, setCreateOpen] = useState(false)
  const [deleteDoc, setDeleteDoc] = useState<Doc | null>(null)
  const [pdfDoc, setPdfDoc] = useState<Doc | null>(null)
  const pdfRef = useRef<HTMLDivElement>(null)

  // Drag-and-drop
  const handleImport = useCallback(async (files: { title: string; content: string }[]) => {
    for (const { title, content } of files) {
      await insert({ title, content, chapter_id: chapterId ?? "" })
    }
    refetch()
  }, [insert, chapterId, refetch])

  const { isDragOver, dragProps } = useDropZone(handleImport)

  // Export PDF
  const handleExport = useCallback((e: React.MouseEvent, doc: Doc) => {
    e.stopPropagation()
    setPdfDoc(doc)
  }, [])

  const handlePdfRendered = useCallback(() => {
    if (!pdfDoc || !pdfRef.current) return
    const html = pdfRef.current.innerHTML
    exportToPdf(pdfDoc.title || "Sans titre", html)
    setPdfDoc(null)
  }, [pdfDoc])

  // Création
  const handleCreate = useCallback(async (title: string) => {
    await insert({ title, content: "", chapter_id: chapterId ?? "" })
    refetch()
    setCreateOpen(false)
  }, [insert, chapterId, refetch])

  // Suppression
  const handleDeleteClick = useCallback((e: React.MouseEvent, doc: Doc) => {
    e.stopPropagation()
    setDeleteDoc(doc)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDoc) return
    await remove(String(deleteDoc.id))
    refetch()
    setDeleteDoc(null)
  }, [deleteDoc, remove, refetch])

  if (chapterLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <p>Chapitre introuvable</p>
      </div>
    )
  }

  return (
    <div className="p-6 relative flex flex-col min-h-full" {...dragProps}>
      <ChapterHeader chapter={chapter} />

      {/* Liste des documents */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Documents</h2>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nouveau
        </Button>
      </div>

      {/* Zone de drop — prend tout l'espace restant */}
      <div className="relative flex-1 rounded-lg flex flex-col">
        {isDragOver && <DropOverlay />}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 h-full text-center text-muted-foreground">
            <FileText className="h-10 w-10 mb-3 opacity-50" />
            <p className="font-medium">Aucun document</p>
            <p className="text-sm mt-1">Cliquez sur Nouveau pour en créer un</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {docs.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                chapterId={chapterId!}
                onExport={handleExport}
                onDelete={handleDeleteClick}
              />
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

      <CreateDocumentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreate}
      />

      <DeleteDocumentDialog
        doc={deleteDoc}
        onClose={() => setDeleteDoc(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
