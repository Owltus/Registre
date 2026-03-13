import { useMemo, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X, Plus, Pencil, Trash2, Minus, Equal, AlertTriangle, FileText, ClipboardList, Users, BookOpen } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getChapterIcon } from "@/lib/navigation"
import type { MergePreview, MergePreviewItem } from "@/lib/exportMarkdown"

interface MergePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preview: MergePreview | null
  loading?: boolean
  onConfirm: () => void
}

const ACTION_CONFIG: Record<string, { label: string; icon: typeof Plus; className: string }> = {
  insert:    { label: "Créé",      icon: Plus,    className: "text-status-success" },
  update:    { label: "Mis à jour", icon: Pencil,  className: "text-status-warning" },
  delete:    { label: "Supprimé",  icon: Trash2,  className: "text-status-danger" },
  skip:      { label: "Ignoré",    icon: Minus,   className: "text-status-danger" },
  unchanged: { label: "Inchangé",  icon: Equal,   className: "text-muted-foreground" },
}

const KIND_CONFIG: Record<string, { label: string; icon: LucideIcon }> = {
  document:        { label: "Document",            icon: FileText },
  tracking_sheet:  { label: "Fiche de suivi",      icon: ClipboardList },
  signature_sheet: { label: "Fiche d'émargement",  icon: Users },
  intercalaire:    { label: "Intercalaire",        icon: BookOpen },
}

interface ChapterGroup {
  label: string
  chapterAction: MergePreviewItem | null
  items: MergePreviewItem[]
}

export function MergePreviewDialog({ open, onOpenChange, preview, loading, onConfirm }: MergePreviewDialogProps) {
  const [actionFilter, setActionFilter] = useState<string | null>(null)

  // Single-pass : séparer chapitres et contenu, grouper par chapitre, filtrer
  const groups = useMemo(() => {
    if (!preview) return []

    const map = new Map<string, ChapterGroup>()
    const getGroup = (key: string) => {
      let g = map.get(key)
      if (!g) { g = { label: key, chapterAction: null, items: [] }; map.set(key, g) }
      return g
    }

    for (const item of preview.items) {
      const key = item.chapter_label || "Sans chapitre"
      const passesFilter = !actionFilter || item.action === actionFilter

      if (item.kind === "chapter") {
        const g = getGroup(key)
        if (passesFilter) g.chapterAction = item
      } else if (passesFilter) {
        getGroup(key).items.push(item)
      }
    }

    if (actionFilter) {
      for (const [key, group] of map) {
        if (!group.chapterAction && group.items.length === 0) map.delete(key)
      }
    }

    return Array.from(map.values())
  }, [preview, actionFilter])

  const hasChanges = preview ? (preview.total_insert + preview.total_update + preview.total_delete) > 0 : false

  const toggleFilter = (action: string) => {
    setActionFilter(prev => prev === action ? null : action)
  }

  const badges: { key: string; count: number; label: string; colorClass: string; activeClass: string }[] = [
    { key: "insert", count: preview?.total_insert ?? 0, label: "créé", colorClass: "text-status-success", activeClass: "bg-status-success/15 ring-1 ring-status-success/40" },
    { key: "update", count: preview?.total_update ?? 0, label: "mis à jour", colorClass: "text-status-warning", activeClass: "bg-status-warning/15 ring-1 ring-status-warning/40" },
    { key: "delete", count: preview?.total_delete ?? 0, label: "supprimé", colorClass: "text-status-danger", activeClass: "bg-status-danger/15 ring-1 ring-status-danger/40" },
    { key: "unchanged", count: preview?.total_unchanged ?? 0, label: "inchangé", colorClass: "text-muted-foreground", activeClass: "bg-muted ring-1 ring-border" },
    { key: "skip", count: preview?.total_skip ?? 0, label: "ignoré", colorClass: "text-status-danger", activeClass: "bg-status-danger/15 ring-1 ring-status-danger/40" },
  ]

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-2xl h-[80vh] border bg-background shadow-lg rounded-lg flex flex-col overflow-hidden focus:outline-none">

          {/* En-tête */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <Dialog.Title className="text-lg font-semibold">
              Prévisualisation de l'import
            </Dialog.Title>
            <Dialog.Close className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Fermer</span>
            </Dialog.Close>
          </div>

          {/* Warnings */}
          {preview && preview.warnings.length > 0 && (
            <div className="mx-6 mt-3 rounded-md border border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-950/30 px-4 py-3">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                  {preview.warnings.length} avertissement(s)
                </span>
              </div>
              <ul className="text-xs text-orange-600 dark:text-orange-400 space-y-0.5 ml-6">
                {preview.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Résumé — badges cliquables pour filtrer */}
          {preview && (
            <div className="flex gap-2 px-6 py-3 border-b text-sm flex-wrap">
              {badges.map((b) => (
                b.count > 0 || b.key === "insert" || b.key === "update" || b.key === "unchanged" ? (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => toggleFilter(b.key)}
                    className={`font-medium px-2 py-0.5 rounded-md transition-colors ${b.colorClass} ${
                      actionFilter === b.key ? b.activeClass : "hover:bg-accent"
                    }`}
                  >
                    {b.count} {b.label}(s)
                  </button>
                ) : null
              ))}
              {actionFilter && (
                <button
                  type="button"
                  onClick={() => setActionFilter(null)}
                  className="text-xs text-muted-foreground hover:text-foreground ml-auto"
                >
                  Tout afficher
                </button>
              )}
            </div>
          )}

          {/* Liste des items groupés par chapitre */}
          <div className="flex-1 overflow-auto px-6 py-4">
            {!preview ? (
              <p className="text-sm text-muted-foreground">Chargement de la prévisualisation...</p>
            ) : preview.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun élément dans le fichier importé.</p>
            ) : groups.length === 0 && actionFilter ? (
              <p className="text-sm text-muted-foreground">Aucun élément pour ce filtre.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {groups.map((group) => {
                  const chConfig = group.chapterAction
                    ? ACTION_CONFIG[group.chapterAction.action]
                    : null

                  const chAction = group.chapterAction?.action
                  const hasAction = chAction && chAction !== "unchanged"

                  // Icône Lucide du chapitre (dynamique depuis le nom stocké en base)
                  const chapterIconName = group.chapterAction?.icon ?? group.items[0]?.icon
                  const ChapterIcon = chapterIconName ? getChapterIcon(chapterIconName) : null

                  return (
                    <div key={group.label}>
                      <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2 mb-1">
                        {ChapterIcon && (
                          <ChapterIcon className="h-4 w-4 shrink-0" />
                        )}
                        <span className="text-sm font-semibold flex-1">{group.label}</span>
                        {hasAction && chConfig && (
                          <chConfig.icon className={`h-3.5 w-3.5 shrink-0 ${chConfig.className}`} />
                        )}
                      </div>

                      {/* Items de contenu */}
                      {group.items.length > 0 && (
                        <div className="flex flex-col gap-0.5 pl-5 mb-2">
                          {group.items.map((item, i) => {
                            const config = ACTION_CONFIG[item.action] ?? ACTION_CONFIG.unchanged
                            const ActionIcon = config.icon
                            const kindCfg = KIND_CONFIG[item.kind]
                            const KindIcon = kindCfg?.icon ?? FileText
                            return (
                              <div key={i} className="flex items-center gap-2.5 py-1 px-2 rounded hover:bg-accent/50 text-sm">
                                <KindIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                <span className="truncate">{item.title || "Sans titre"}</span>
                                <ActionIcon className={`h-3.5 w-3.5 shrink-0 ml-auto ${config.className}`} />
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Pied de page */}
          <div className="flex justify-end gap-2 border-t px-6 py-4">
            <Dialog.Close asChild>
              <Button variant="outline">Annuler</Button>
            </Dialog.Close>
            <Button
              onClick={onConfirm}
              disabled={!preview || loading || !hasChanges}
            >
              {loading ? "Import en cours..." : hasChanges ? "Confirmer l'import" : "Aucun changement"}
            </Button>
          </div>

          <Dialog.Description className="sr-only">
            Prévisualisation des changements avant import
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
