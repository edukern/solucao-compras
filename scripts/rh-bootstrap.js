#!/usr/bin/env node
// Cria a empresa Backes + primeiro usuário admin no Supabase.
// Requer SUPABASE_SERVICE_KEY no .env.local (Project Settings → API → service_role).
//
// Uso: node scripts/rh-bootstrap.js

const https   = require('https')
const fs      = require('fs')
const path    = require('path')
const readline = require('readline')
const bcrypt  = require('bcryptjs')

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) return
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [k, ...rest] = line.split('=')
    if (k && !k.startsWith('#')) process.env[k.trim()] = rest.join('=').trim()
  })
}
loadEnv()

const SB_URL = process.env.VITE_SUPABASE_URL
const SB_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SB_URL) { console.error('❌  VITE_SUPABASE_URL não encontrado no .env.local'); process.exit(1) }
if (!SB_KEY) { console.error('❌  SUPABASE_SERVICE_KEY não encontrado no .env.local\n   Fica em Project Settings → API → service_role (botão "Reveal")'); process.exit(1) }

function sbPost(table, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body)
    const url  = new URL(`${SB_URL}/rest/v1/${table}`)
    const opts = {
      hostname: url.hostname,
      path:     url.pathname,
      method:   'POST',
      headers:  {
        apikey:         SB_KEY,
        Authorization:  `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer:         'return=representation',
        'Content-Length': Buffer.byteLength(data),
      },
    }
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(JSON.parse(d))
        else reject(new Error(`HTTP ${res.statusCode}: ${d}`))
      })
    })
    req.on('error', reject)
    req.write(data); req.end()
  })
}

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()) }))
}

;(async () => {
  console.log('\n🔧  Bootstrap do módulo RH — Backes\n')

  const email = await prompt('Email do admin:        ')
  const nome  = await prompt('Nome do admin:         ')
  const senha = await prompt('Senha do admin (min 8):', )

  if (!email || !nome || senha.length < 8) {
    console.error('❌  Dados incompletos.'); process.exit(1)
  }

  console.log('\n⏳  Criando empresa Backes…')
  const [empresa] = await sbPost('empresas', { nome: 'Backes' })

  console.log('⏳  Criando usuário admin…')
  const senha_hash = await bcrypt.hash(senha, 12)
  const [usuario] = await sbPost('usuarios', {
    empresa_id: empresa.id,
    email:      email.toLowerCase(),
    nome,
    senha_hash,
  })

  console.log('\n✅  Setup concluído!')
  console.log(`   Empresa: Backes (${empresa.id})`)
  console.log(`   Admin:   ${email} (${usuario.id})`)
  console.log('\n📋  Env vars para adicionar no Vercel:')
  console.log(`   SUPABASE_URL=${SB_URL}`)
  console.log(`   SUPABASE_SERVICE_KEY=<service_role key>`)
  console.log(`   RH_JWT_SECRET=<gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")>`)
  console.log(`   RH_ENCRYPTION_KEY=<gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")>`)
  console.log(`   RH_HMAC_KEY=<gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")>`)
})().catch(e => { console.error('❌  Erro:', e.message); process.exit(1) })
