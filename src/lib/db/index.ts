import Database from "@tauri-apps/plugin-sql"

let dbPromise: Promise<Database> | null = null

export function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = Database.load("sqlite:owl.db")
      .then(async (db) => {
        // PRAGMAs appliqués à chaque connexion (pas en migration car journal_mode retourne un résultat)
        await db.execute("PRAGMA journal_mode = WAL")
        await db.execute("PRAGMA busy_timeout = 5000")
        await db.execute("PRAGMA foreign_keys = ON")
        await db.execute("PRAGMA synchronous = NORMAL")
        return db
      })
      .catch((err) => {
        dbPromise = null // Permettre un retry si la connexion échoue
        throw err
      })
  }
  return dbPromise
}

export interface DataAdapter {
  get(table: string, id: string): Promise<unknown>
  getAll(table: string, filters?: Record<string, unknown>): Promise<unknown[]>
  insert(table: string, data: Record<string, unknown>): Promise<string>
  update(table: string, id: string, data: Record<string, unknown>): Promise<void>
  remove(table: string, id: string): Promise<void>
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>
  execute(sql: string, params?: unknown[]): Promise<void>
}
