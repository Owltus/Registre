import { useEffect, useState, useCallback } from "react"
import { getDb } from "@/lib/db/index"

type UsePreferenceReturn = [string, (value: string) => Promise<void>]

export function usePreference(key: string, defaultValue: string): UsePreferenceReturn {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    getDb().then(async (db) => {
      const rows = await db.select<{ value: string }[]>(
        "SELECT value FROM preferences WHERE key = $1",
        [key]
      )
      if (rows.length > 0) {
        setValue(rows[0].value)
      }
    })
  }, [key])

  const setPreference = useCallback(
    async (newValue: string) => {
      const previousValue = value
      setValue(newValue)
      try {
        const db = await getDb()
        await db.execute(
          "INSERT OR REPLACE INTO preferences (key, value) VALUES ($1, $2)",
          [key, newValue]
        )
      } catch (error) {
        console.error(`Erreur écriture préférence "${key}":`, error)
        setValue(previousValue)
      }
    },
    [key, value]
  )

  return [value, setPreference]
}
