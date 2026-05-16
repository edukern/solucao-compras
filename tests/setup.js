// tests/setup.js
import Database from 'better-sqlite3'
import { runMigrations } from '../electron/main/db/schema.js'

export function makeDb() {
  const db = new Database(':memory:')
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  runMigrations(db)
  return db
}
