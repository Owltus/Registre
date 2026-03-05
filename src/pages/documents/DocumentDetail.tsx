import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { useQuery } from "@/lib/hooks/useQuery"
import { useMutation } from "@/lib/hooks/useMutation"
import type { ChapterRow } from "@/lib/navigation"
import { PrintPreview } from "@/components/print/PrintPreview"
import { DocumentPages } from "@/components/print/DocumentPages"
import { preprocessPageBreaks, PAGEBREAK_MARKER } from "@/lib/print/preprocessPageBreaks"
import { MermaidBlock } from "@/components/MermaidBlock"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Pencil, Eye, FileDown, Save } from "lucide-react"

interface Doc {
  id: number
  title: string
  content: string
  chapter_id: string
  created_at: string
  updated_at: string
}

export default function DocumentDetail() {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { update } = useMutation("documents")
  const [previewOpen, setPreviewOpen] = useState(false)
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const editorScrollRef = useRef<HTMLTextAreaElement>(null)
  const isSyncing = useRef(false)

  const backPath = chapterId ? `/chapitres/${chapterId}` : "/"

  const filters = useMemo(() => ({ id: Number(id) }), [id])
  const { data: docs, loading, refetch } = useQuery<Doc>("documents", filters)
  const doc = docs[0] ?? null

  const chapterFilters = useMemo(() => ({ id: Number(chapterId) }), [chapterId])
  const { data: chapterRows } = useQuery<ChapterRow>("chapters", chapterFilters)
  const chapter = chapterRows[0] ?? null

  const [editing, setEditing] = useState(searchParams.get("edit") === "1")
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")

  // Contenu debounced pour l'aperçu A4 (évite des re-paginations à chaque frappe)
  const [debouncedContent, setDebouncedContent] = useState("")

  // Scaling dynamique des pages A4 selon la largeur du panneau
  const [scale, setScale] = useState(0.5)

  // Synchroniser le state local quand le document est chargé
  useEffect(() => {
    if (doc) {
      setEditTitle(doc.title)
      setEditContent(doc.content)
      setDebouncedContent(doc.content)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc?.id])

  // Debounce du contenu (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedContent(editContent), 300)
    return () => clearTimeout(timer)
  }, [editContent])

  // ResizeObserver pour le scaling dynamique
  useEffect(() => {
    const el = previewScrollRef.current
    if (!el || !editing) return
    const ro = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width
      const pageWidthPx = 210 * 3.7795 // ~793px
      const padding = 48 // marges internes
      setScale(Math.min(1, (width - padding) / pageWidthPx))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [editing])

  const handleSave = async () => {
    if (!id) return
    await update(id, {
      title: editTitle.trim() || "Sans titre",
      content: editContent,
      updated_at: new Date().toISOString(),
    })
    refetch()
    setEditing(false)
  }

  const handleExport = () => {
    setPreviewOpen(true)
  }

  // Synchronisation du scroll proportionnel (ratio)
  const syncScroll = useCallback((source: "preview" | "editor") => {
    if (isSyncing.current) return
    isSyncing.current = true

    const previewEl = previewScrollRef.current
    const editorEl = editorScrollRef.current
    if (!previewEl || !editorEl) {
      isSyncing.current = false
      return
    }

    const fromEl = source === "preview" ? previewEl : editorEl
    const toEl = source === "preview" ? editorEl : previewEl
    const fromMax = fromEl.scrollHeight - fromEl.clientHeight
    const toMax = toEl.scrollHeight - toEl.clientHeight
    if (fromMax > 0 && toMax > 0) {
      const ratio = fromEl.scrollTop / fromMax
      toEl.scrollTop = ratio * toMax
    }

    requestAnimationFrame(() => { isSyncing.current = false })
  }, [])

  const handleStartEdit = () => {
    if (doc) {
      setEditTitle(doc.title)
      setEditContent(doc.content)
      setDebouncedContent(doc.content)
    }
    setEditing(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <p>Document introuvable</p>
        <Button variant="outline" size="sm" onClick={() => navigate(backPath)}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => navigate(backPath)}
          aria-label="Retour"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {editing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="h-9 text-lg font-semibold flex-1"
            placeholder="Titre du document"
          />
        ) : (
          <h1 className="text-lg font-semibold flex-1 truncate">
            {doc.title || "Sans titre"}
          </h1>
        )}

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(false)
                  setEditTitle(doc.title)
                  setEditContent(doc.content)
                }}
              >
                <Eye className="h-4 w-4 mr-1.5" />
                Aperçu
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1.5" />
                Sauvegarder
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleStartEdit}>
                <Pencil className="h-4 w-4 mr-1.5" />
                Édition
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <FileDown className="h-4 w-4 mr-1.5" />
                Exporter PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Corps */}
      {editing ? (
        // Mode édition — Split view avec aperçu A4 paginé
        <div className="flex flex-1 min-h-0">
          {/* Aperçu A4 temps réel (gauche) */}
          <div
            ref={previewScrollRef}
            onScroll={() => syncScroll("preview")}
            className="w-1/2 overflow-y-auto border-r border-border bg-muted/30"
          >
            <div className="flex flex-col items-center gap-4 py-4" style={{ zoom: scale }}>
              <DocumentPages
                title={editTitle || "Sans titre"}
                content={debouncedContent}
                chapterName={chapter?.label}
                themed
              />
            </div>
          </div>

          {/* Éditeur brut (droite) */}
          <div className="w-1/2 flex flex-col p-4">
            <Textarea
              ref={editorScrollRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onScroll={() => syncScroll("editor")}
              placeholder="Écrivez en Markdown…"
              className="flex-1 min-h-0 font-mono text-sm resize-none"
            />
          </div>
        </div>
      ) : (
        // Mode aperçu
        <div className="flex-1 overflow-y-auto p-6">
          <div
            className="prose max-w-none mx-auto"
            style={{ maxWidth: "210mm" }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                p: ({ children }: { children?: React.ReactNode }) => {
                  const text = React.Children.toArray(children)
                  if (text.length === 1 && typeof text[0] === "string" && text[0].trim() === PAGEBREAK_MARKER) {
                    return <hr className="border-dashed opacity-40" />
                  }
                  return <p>{children}</p>
                },
                code: ({ className, children }: { className?: string; children?: React.ReactNode }) => {
                  if (className === "language-mermaid") {
                    return <MermaidBlock code={String(children).trim()} />
                  }
                  return <code className={className}>{children}</code>
                },
              }}
            >
              {preprocessPageBreaks(editContent)}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Aperçu avant impression */}
      <PrintPreview open={previewOpen} onOpenChange={setPreviewOpen}>
        <DocumentPages
          title={editTitle || "Sans titre"}
          content={editContent}
          chapterName={chapter?.label}
        />
      </PrintPreview>
    </div>
  )
}
