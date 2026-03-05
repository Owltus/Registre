import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Trash2, FileDown, Pencil, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TrackingSheet, Periodicite } from "./types"
import type { TrackingSheetDragData } from "@/lib/dnd/useDndRegistry"

interface TrackingSheetCardProps {
  sheet: TrackingSheet
  chapterId: string
  periodicite?: Periodicite
  onExport: (e: React.MouseEvent, sheet: TrackingSheet) => void
  onEdit: (e: React.MouseEvent, sheet: TrackingSheet) => void
  onDelete: (e: React.MouseEvent, sheet: TrackingSheet) => void
}

export function TrackingSheetCard({ sheet, chapterId, periodicite, onExport, onEdit, onDelete }: TrackingSheetCardProps) {
  const dragData: TrackingSheetDragData = {
    type: "tracking_sheet",
    sheetId: sheet.id,
    sheetTitle: sheet.title,
    sourceChapterId: chapterId,
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `sheet-${sheet.id}`,
    data: dragData,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/50 touch-none cursor-pointer",
        isDragging && "opacity-30 z-50"
      )}
    >
      <ClipboardList className="h-4 w-4 text-muted-foreground shrink-0" />
      <h3 className="text-sm font-medium truncate flex-1">
        {sheet.title || "Sans titre"}
      </h3>
      {periodicite && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground shrink-0">
          {periodicite.label}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
        onClick={(e) => onExport(e, sheet)}
        aria-label="Exporter PDF"
      >
        <FileDown className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
        onClick={(e) => onEdit(e, sheet)}
        aria-label="Modifier"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
        onClick={(e) => onDelete(e, sheet)}
        aria-label="Supprimer"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
