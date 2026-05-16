// electron/main/db/connection.js
import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'

let _db = null

export function getDb() {
  if (!_db) {
    const dbPath = path.join(app.getPath('userData'), 'solucao-compras.db')
    _db = new Database(dbPath)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')
  }
  return _db
}

export function setDb(db) {
  _db = db
}
