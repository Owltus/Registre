/* eslint-disable react-refresh/only-export-components */
import { useState, useRef, useCallback } from "react"
import { Upload } from "lucide-react"

interface DropZoneResult {
  isDragOver: boolean
  dragProps: {
    onDragEnter: (e: React.DragEvent) => void
    onDragOver: (e: React.DragEvent) => void
    onDragLeave: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent) => void
  }
}

/** Hook pour gérer le drag-and-drop de fichiers .md */
export function useDropZone(onImport: (files: { title: string; content: string }[]) => void): DropZoneResult {
  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounter = useRef(0)

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    setIsDragOver(true)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragOver(false)
  }, [])

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.name.endsWith(".md")
    )
    if (files.length === 0) return

    const reads = files.map(
      (file) =>
        new Promise<{ title: string; content: string }>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () =>
            resolve({
              title: file.name.replace(/\.md$/, ""),
              content: reader.result as string,
            })
          reader.onerror = () => reject(reader.error)
          reader.readAsText(file)
        })
    )

    const results = await Promise.all(reads)
    onImport(results)
  }, [onImport])

  return { isDragOver, dragProps: { onDragEnter, onDragOver, onDragLeave, onDrop } }
}

/** Overlay visuel affiché pendant le drag */
export function DropOverlay() {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/5 backdrop-blur-[2px] pointer-events-none">
      <div className="flex flex-col items-center gap-2 rounded-xl bg-background/80 px-8 py-6 shadow-sm">
        <Upload className="h-8 w-8 text-primary" />
        <p className="text-sm font-medium text-primary">Déposez vos fichiers .md ici</p>
      </div>
    </div>
  )
}
