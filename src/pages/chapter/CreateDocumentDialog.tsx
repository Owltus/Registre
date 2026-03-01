import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface CreateDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (title: string) => void
}

export function CreateDocumentDialog({ open, onOpenChange, onCreate }: CreateDocumentDialogProps) {
  const [title, setTitle] = useState("Sans titre")

  const handleSubmit = () => {
    onCreate(title.trim() || "Sans titre")
    setTitle("Sans titre")
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (v) setTitle("Sans titre")
        onOpenChange(v)
      }}
    >
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
              handleSubmit()
            }}
            className="px-6 py-4 flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="create-title" className="text-sm font-medium">
                Titre
              </label>
              <Input
                id="create-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
  )
}
