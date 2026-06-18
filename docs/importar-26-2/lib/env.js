const fs = require('fs')
const path = require('path')

// Lê .env.local da raiz do repo sem depender de dotenv.
function loadEnv() {
  const p = path.resolve(__dirname, '..', '..', '..', '.env.local')
  const txt = fs.readFileSync(p, 'utf8')
  const env = {}
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
  }
  return env
}

module.exports = { loadEnv }
