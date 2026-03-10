import { useCallback, useState } from "react"
import { sqliteAdapter } from "@/lib/db/sqlite"

export function useMutation(table: string) {
  const [error, setError] = useState<Error | null>(null)

  const insert = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        setError(null)
        return await sqliteAdapter.insert(table, data)
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err))
        console.error(`Erreur insert dans "${table}":`, e)
        setError(e)
        throw e
      }
    },
    [table]
  )

  const update = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      try {
        setError(null)
        return await sqliteAdapter.update(table, id, data)
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err))
        console.error(`Erreur update dans "${table}" (id=${id}):`, e)
        setError(e)
        throw e
      }
    },
    [table]
  )

  const remove = useCallback(
    async (id: string) => {
      try {
        setError(null)
        return await sqliteAdapter.remove(table, id)
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err))
        console.error(`Erreur remove dans "${table}" (id=${id}):`, e)
        setError(e)
        throw e
      }
    },
    [table]
  )

  return { insert, update, remove, error }
}
