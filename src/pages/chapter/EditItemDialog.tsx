import { useState, useEffect, type ReactNode } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export interface EditField {
  key: string
  label: string
  placeholder: string
  /** Valeur initiale extraite de l'item */
  initialValue: string
}

interface EditItemDialogProps {
  /** null = fermé */
  open: boolean
  /** Titre de la dialog */
  dialogTitle: string
  /** Description accessible (sr-only) */
  srDescription: string
  /** Champs à éditer (titre, description, etc.) */
  fields: EditField[]
  /** Contenu supplémentaire inséré après les champs (ex: Select pour la périodicité) */
  extraContent?: ReactNode
  /** Désactiver le bouton Enregistrer */
  submitDisabled?: boolean
  onClose: () => void
  onSave: (values: Record<string, string>) => void
}

export function EditItemDialog({
  open,
  dialogTitle,
  srDescription,
  fields,
  extraContent,
  submitDisabled,
  onClose,
  onSave,
}: EditItemDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({})

  // Pré-remplir quand les champs changent (ouverture de la dialog)
  useEffect(() => {
    if (open) {
      const initial: Record<string, string> = {}
      for (const f of fields) {
        initial[f.key] = f.initialValue
      }
      setValues(initial)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSubmit = () => {
    onSave(values)
  }

  const updateField = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-sm border bg-background shadow-lg rounded-lg flex flex-col overflow-hidden focus:outline-none">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <Dialog.Title className="text-lg font-semibold">
              {dialogTitle}
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
            {fields.map((field, i) => (
              <div key={field.key} className="flex flex-col gap-2">
                <label htmlFor={`edit-field-${field.key}`} className="text-sm font-medium">
                  {field.label}
                </label>
                <Input
                  id={`edit-field-${field.key}`}
                  value={values[field.key] ?? ""}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  autoFocus={i === 0}
                  onFocus={i === 0 ? (e) => e.target.select() : undefined}
                />
              </div>
            ))}

            {extraContent}

            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={submitDisabled}>
                Enregistrer
              </Button>
            </div>
          </form>

          <Dialog.Description className="sr-only">
            {srDescription}
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
