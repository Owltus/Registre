import { useState, useEffect } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { useQuery } from "@/lib/hooks/useQuery"
import { X } from "lucide-react"
import type { TrackingSheet, Periodicite } from "./types"

interface EditTrackingSheetDialogProps {
  sheet: TrackingSheet | null
  onClose: () => void
  onSave: (id: number, title: string, periodiciteId: number) => void
}

export function EditTrackingSheetDialog({ sheet, onClose, onSave }: EditTrackingSheetDialogProps) {
  const [title, setTitle] = useState("")
  const [periodiciteId, setPeriodiciteId] = useState<string>("")

  const { data: periodicites } = useQuery<Periodicite>("periodicites")

  // Pré-remplir quand la feuille change
  useEffect(() => {
    if (sheet) {
      setTitle(sheet.title)
      setPeriodiciteId(String(sheet.periodicite_id))
    }
  }, [sheet])

  const handleSubmit = () => {
    if (!sheet) return
    const pId = Number(periodiciteId)
    if (!pId) return
    onSave(sheet.id, title.trim() || "Sans titre", pId)
  }

  return (
    <Dialog.Root open={sheet !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-sm border bg-background shadow-lg rounded-lg flex flex-col overflow-hidden focus:outline-none">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <Dialog.Title className="text-lg font-semibold">
              Modifier la feuille de suivi
            </Dialog.Title>
            <Dialog.Close className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Fermer</span>
            </Dialog.Close>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            className="px-6 py-4 flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="edit-ts-title" className="text-sm font-medium">
                Titre
              </label>
              <Input
                id="edit-ts-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de la feuille de suivi"
                autoFocus
                onFocus={(e) => e.target.select()}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="edit-ts-periodicite" className="text-sm font-medium">
                Périodicité
              </label>
              <Select value={periodiciteId} onValueChange={setPeriodiciteId}>
                <SelectTrigger id="edit-ts-periodicite">
                  <SelectValue placeholder="Choisir une périodicité" />
                </SelectTrigger>
                <SelectContent>
                  {periodicites.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={!periodiciteId}>
                Enregistrer
              </Button>
            </div>
          </form>

          <Dialog.Description className="sr-only">
            Modifier le titre et la périodicité de la feuille de suivi
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
