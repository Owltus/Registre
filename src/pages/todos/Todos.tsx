import { useState } from "react"
import { useQuery } from "@/lib/hooks/useQuery"
import { useMutation } from "@/lib/hooks/useMutation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2 } from "lucide-react"

interface Todo {
  id: number
  title: string
  completed: number
  created_at: string
}

type Filter = "all" | "active" | "completed"

export default function Todos() {
  const [newTitle, setNewTitle] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const { data: todos, loading, refetch } = useQuery<Todo>("todos")
  const { insert, update, remove } = useMutation("todos")

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed
    if (filter === "completed") return !!todo.completed
    return true
  })

  const remaining = todos.filter((t) => !t.completed).length

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    await insert({ title, completed: 0 })
    setNewTitle("")
    refetch()
  }

  const handleToggle = async (todo: Todo) => {
    await update(String(todo.id), { completed: todo.completed ? 0 : 1 })
    refetch()
  }

  const handleDelete = async (todo: Todo) => {
    await remove(String(todo.id))
    refetch()
  }

  const filterButtons: { key: Filter; label: string }[] = [
    { key: "all", label: "Toutes" },
    { key: "active", label: "Actives" },
    { key: "completed", label: "Terminées" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tâches</h1>
        <p className="mt-2 text-muted-foreground">
          Gérez vos tâches avec la base SQLite locale.
        </p>
      </div>

      {/* Formulaire d'ajout */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nouvelle tâche…"
          className="flex-1"
        />
        <Button type="submit" disabled={!newTitle.trim()}>
          Ajouter
        </Button>
      </form>

      {/* Filtres */}
      <div className="flex items-center gap-2">
        {filterButtons.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground">
          {remaining} tâche{remaining !== 1 ? "s" : ""} restante{remaining !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      ) : filteredTodos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p>
            {filter === "all" && "Aucune tâche. Ajoutez-en une ci-dessus !"}
            {filter === "active" && "Aucune tâche active."}
            {filter === "completed" && "Aucune tâche terminée."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filteredTodos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
            >
              <Checkbox
                checked={!!todo.completed}
                onChange={() => handleToggle(todo)}
              />
              <span
                className={
                  todo.completed
                    ? "flex-1 line-through text-muted-foreground"
                    : "flex-1"
                }
              >
                {todo.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(todo)}
                aria-label="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
