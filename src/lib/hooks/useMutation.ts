import { useCallback } from "react"
import { sqliteAdapter } from "@/lib/db/sqlite"

export function useMutation(table: string) {
  const insert = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        return await sqliteAdapter.insert(table, data)
      } catch (error) {
        console.error(`Erreur insert dans "${table}":`, error)
        throw error
      }
    },
    [table]
  )

  const update = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      try {
        return await sqliteAdapter.update(table, id, data)
      } catch (error) {
        console.error(`Erreur update dans "${table}" (id=${id}):`, error)
        throw error
      }
    },
    [table]
  )

  const remove = useCallback(
    async (id: string) => {
      try {
        return await sqliteAdapter.remove(table, id)
      } catch (error) {
        console.error(`Erreur remove dans "${table}" (id=${id}):`, error)
        throw error
      }
    },
    [table]
  )

  return { insert, update, remove }
}
