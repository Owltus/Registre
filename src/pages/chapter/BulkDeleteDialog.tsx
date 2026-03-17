import * as Dialog from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { Trash2, X } from "lucide-react"

interface BulkDeleteDialogProps {
  open: boolean
  count: number
  onClose: () => void
  onConfirm: () => void
}

export function BulkDeleteDialog({ open, count, onClose, onConfirm }: BulkDeleteDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-sm border bg-background shadow-lg rounded-lg flex flex-col overflow-hidden focus:outline-none">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <Dialog.Title className="text-lg font-semibold">
              Supprimer {count} élément{count > 1 ? "s" : ""}
            </Dialog.Title>
            <Dialog.Close className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Fermer</span>
            </Dialog.Close>
          </div>

          <div className="px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Voulez-vous vraiment supprimer <span className="font-medium text-foreground">{count} élément{count > 1 ? "s" : ""}</span> ? Cette action est irréversible.
            </p>
          </div>

          <div className="flex justify-end gap-2 px-6 pb-4">
            <Dialog.Close asChild>
              <Button variant="outline">Annuler</Button>
            </Dialog.Close>
            <Button variant="destructive" onClick={onConfirm}>
              <Trash2 className="h-4 w-4 mr-1.5" />
              Supprimer
            </Button>
          </div>

          <Dialog.Description className="sr-only">
            Confirmer la suppression groupée de {count} éléments
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
