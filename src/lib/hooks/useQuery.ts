import { useEffect, useState, useCallback, useRef } from "react"
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

  // Stabiliser les dépendances : JSON.stringify évite les re-renders
  // causés par un objet filters recréé à chaque render
  const filtersKey = JSON.stringify(filters)
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const fetch = useCallback(() => {
    setLoading(true)
    sqliteAdapter
      .getAll(table, filtersRef.current)
      .then((rows) => {
        setData(rows as T[])
        setError(null)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filtersKey])

  useEffect(() => {
    fetch()  
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}
