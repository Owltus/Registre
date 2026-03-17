import { useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Trash2, FileDown, Pencil, BookMarked, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { IntercalaireSheet } from "@/components/print/IntercalaireSheet"
import type { Intercalaire } from "./types"
import type { IntercalaireDragData } from "@/lib/dnd/useDndRegistry"
import { A4Preview } from "./A4Preview"

interface IntercalaireCardProps {
  page: Intercalaire
  chapterId: string
  classeurId?: string
  chapterName?: string
  classeurName?: string
  establishment?: string
  sortableDisabled?: boolean
  selectionMode?: boolean
  selectionDragging?: boolean
  isSelected?: boolean
  onToggleSelect?: () => void
  onExport?: (e: React.MouseEvent, page: Intercalaire) => void
  onEdit?: (e: React.MouseEvent, page: Intercalaire) => void
  onDelete?: (e: React.MouseEvent, page: Intercalaire) => void
}

export function IntercalaireCard({ page, chapterId, classeurId, chapterName, classeurName, establishment, sortableDisabled, selectionMode, selectionDragging, isSelected, onToggleSelect, onExport, onEdit, onDelete }: IntercalaireCardProps) {
  const navigate = useNavigate()

  const dragData: IntercalaireDragData = useMemo(() => ({
    type: "intercalaire",
    pageId: page.id,
    pageTitle: page.title,
    sourceChapterId: chapterId,
  }), [page.id, page.title, chapterId])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `int-${page.id}`,
    data: dragData,
    disabled: sortableDisabled,
  })

  const style = selectionMode ? undefined : {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      onToggleSelect?.()
      return
    }
    if (selectionMode) {
      onToggleSelect?.()
      return
    }
    navigate(classeurId ? `/classeurs/${classeurId}/chapitres/${chapterId}/intercalaires/${page.id}` : `/chapitres/${chapterId}/intercalaires/${page.id}`)
  }, [navigate, chapterId, page.id, classeurId, selectionMode, onToggleSelect])

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative flex flex-col rounded-lg border border-border bg-card cursor-pointer hover:border-primary/50 transition-colors overflow-hidden",
        !sortableDisabled && "touch-none",
        !selectionMode && isDragging && "opacity-30 z-50",
        selectionDragging && isSelected && "opacity-30",
        isSelected && "border-primary bg-primary/5 ring-1 ring-primary/20"
      )}
      onClick={handleClick}
    >
      {/* Header — icône + titre */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <BookMarked className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs font-medium truncate flex-1">
              {page.title || "Sans titre"}
            </span>
          </TooltipTrigger>
          <TooltipContent>{page.title || "Sans titre"}</TooltipContent>
        </Tooltip>
        <button
          type="button"
          className={cn(
            "h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-all",
            isSelected
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground/30 opacity-0 group-hover:opacity-100",
            selectionMode && "opacity-100"
          )}
          onClick={(e) => { e.stopPropagation(); onToggleSelect?.() }}
          aria-label={isSelected ? "Désélectionner" : "Sélectionner"}
        >
          {isSelected && <Check className="h-3 w-3" />}
        </button>
      </div>

      {/* Miniature + boutons en surimpression */}
      <div className="relative">
        <A4Preview>
          <IntercalaireSheet
            title={page.title || "Sans titre"}
            description={page.description}
            chapterName={chapterName}
            classeurName={classeurName}
            establishment={establishment}
            themed
          />
        </A4Preview>

        {/* Actions en surimpression, bas centré */}
        {!sortableDisabled && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 rounded-md bg-background/90 border border-border shadow-sm px-1 py-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => onExport?.(e, page)} aria-label="Exporter PDF">
                    <FileDown className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Exporter PDF</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => onEdit?.(e, page)} aria-label="Modifier">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Modifier</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => onDelete?.(e, page)} aria-label="Supprimer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Supprimer</TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
