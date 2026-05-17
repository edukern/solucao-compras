import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      // Use Node.js-native better-sqlite3 build; the node_modules build targets Electron
      'better-sqlite3': path.resolve(__dirname, 'tests/native/index.cjs'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    passWithNoTests: true
  }
})
