#!/usr/bin/env node
// Roda o schema do módulo RH via Supabase Management API.
// Requer SUPABASE_PAT no .env.local (gere em supabase.com/dashboard/account/tokens).
//
// Uso: node scripts/rh-schema.js

const https = require('https')
const fs    = require('fs')
const path  = require('path')

// Carrega .env.local manualmente (sem dotenv instalado globalmente)
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) return
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [k, ...rest] = line.split('=')
    if (k && !k.startsWith('#')) process.env[k.trim()] = rest.join('=').trim()
  })
}
loadEnv()

const PAT     = process.env.SUPABASE_PAT
const SB_URL  = process.env.VITE_SUPABASE_URL || ''
const REF     = SB_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

if (!PAT)  { console.error('❌  SUPABASE_PAT não encontrado no .env.local\n   Gere em: supabase.com/dashboard/account/tokens'); process.exit(1) }
if (!REF)  { console.error('❌  Não foi possível extrair o project ref de VITE_SUPABASE_URL'); process.exit(1) }

const SQL = fs.readFileSync(path.join(__dirname, '..', 'api', '_schema-rh.sql'), 'utf-8')

console.log(`🚀  Rodando schema no projeto ${REF}…`)

const body = JSON.stringify({ query: SQL })

const options = {
  hostname: 'api.supabase.com',
  path:     `/v1/projects/${REF}/database/query`,
  method:   'POST',
  headers:  {
    'Authorization': `Bearer ${PAT}`,
    'Content-Type':  'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
}

const req = https.request(options, res => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅  Schema criado com sucesso!')
      console.log('\nPróximo passo: node scripts/rh-bootstrap.js')
    } else {
      console.error(`❌  Erro ${res.statusCode}:`, data)
      process.exit(1)
    }
  })
})
req.on('error', e => { console.error('❌  Erro de rede:', e.message); process.exit(1) })
req.write(body)
req.end()
