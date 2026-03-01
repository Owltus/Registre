import { useEffect, useState, useCallback } from "react"
import { sqliteAdapter } from "@/lib/db/sqlite"

interface UseQueryResult<T> {
  data: T[]
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useQuery<T = unknown>(
  table: string,
  filters?: Record<string, unknown>
): UseQueryResult<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(() => {
    setLoading(true)
    sqliteAdapter
      .getAll(table, filters)
      .then((rows) => {
        setData(rows as T[])
        setError(null)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [table, filters])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}
