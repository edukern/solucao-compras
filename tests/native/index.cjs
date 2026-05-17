'use strict';
// Wrapper that loads better-sqlite3 with the Node.js 24-compatible native binary.
// The main node_modules build is compiled for Electron and won't work in plain Node tests.
const path = require('path');
const BetterSqlite3 = require('../../node_modules/better-sqlite3');

const NATIVE_PATH = path.join(__dirname, 'build', 'Release', 'better_sqlite3.node');

function Database(filename, options) {
  return new BetterSqlite3(filename, { ...options, nativeBinding: NATIVE_PATH });
}

// Copy static properties / prototype so callers can use it as a drop-in
Object.setPrototypeOf(Database, BetterSqlite3);
Database.SqliteError = BetterSqlite3.SqliteError;

module.exports = Database;
module.exports.default = Database;
