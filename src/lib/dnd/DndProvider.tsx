import { useCallback, useRef, useState } from "react"
import {
  DndContext,
  closestCenter,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type UniqueIdentifier,
  type CollisionDetection,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers"
import { FileText, ClipboardList } from "lucide-react"
import { DndRegistryContext, type DragData, type DragHandler, type DndRegistryValue } from "./useDndRegistry"

export function DndProvider({ children }: { children: React.ReactNode }) {
  const handlersRef = useRef<Record<string, DragHandler>>({})
  const [activeDragType, setActiveDragType] = useState<string | null>(null)
  const [activeDragData, setActiveDragData] = useState<DragData | null>(null)
  const [activeOverId, setActiveOverId] = useState<UniqueIdentifier | null>(null)

  // Ref pour accéder au type actif dans la collision detection (pas de re-render)
  const activeDragTypeRef = useRef<string | null>(null)

  const registerHandler = useCallback((type: string, handler: DragHandler) => {
    handlersRef.current[type] = handler
  }, [])

  const unregisterHandler = useCallback((type: string) => {
    delete handlersRef.current[type]
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined
    const type = data?.type ?? null
    setActiveDragType(type)
    setActiveDragData(data ?? null)
    activeDragTypeRef.current = type
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setActiveOverId(event.over?.id ?? null)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const data = event.active.data.current as DragData | undefined
    const type = data?.type
    if (type && handlersRef.current[type]) {
      handlersRef.current[type](event)
    }
    setActiveDragType(null)
    setActiveDragData(null)
    setActiveOverId(null)
    activeDragTypeRef.current = null
  }, [])

  const handleDragCancel = useCallback(() => {
    setActiveDragType(null)
    setActiveDragData(null)
    setActiveOverId(null)
    activeDragTypeRef.current = null
  }, [])

  // Collision detection adaptative :
  // - chapitres (tri) → closestCenter (meilleur pour le réordonnancement)
  // - documents (cross-container) → pointerWithin (meilleur pour le drop sur cible)
  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      if (activeDragTypeRef.current === "document" || activeDragTypeRef.current === "tracking_sheet") {
        return pointerWithin(args)
      }
      return closestCenter(args)
    },
    []
  )

  // Modifiers conditionnels : contraintes verticales seulement pour les chapitres
  const modifiers = activeDragType === "chapter"
    ? [restrictToVerticalAxis, restrictToParentElement]
    : []

  const registryValue: DndRegistryValue = {
    registerHandler,
    unregisterHandler,
    activeDragType,
    activeDragData,
    activeOverId,
  }

  return (
    <DndRegistryContext.Provider value={registryValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        modifiers={modifiers}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          {activeDragType === "document" && activeDragData?.type === "document" && (
            <div className="flex items-center gap-3 rounded-lg border border-primary bg-card px-4 py-3 shadow-lg opacity-90 max-w-xs">
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm font-medium truncate">
                {activeDragData.docTitle || "Sans titre"}
              </span>
            </div>
          )}
          {activeDragType === "tracking_sheet" && activeDragData?.type === "tracking_sheet" && (
            <div className="flex items-center gap-3 rounded-lg border border-primary bg-card px-4 py-3 shadow-lg opacity-90 max-w-xs">
              <ClipboardList className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm font-medium truncate">
                {activeDragData.sheetTitle || "Sans titre"}
              </span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </DndRegistryContext.Provider>
  )
}
