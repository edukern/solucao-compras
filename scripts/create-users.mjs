import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const REF = 'bhxpkysueyoblizkvomb'

// service_role/secret key vem do ambiente — NUNCA hardcoded.
// Defina SUPABASE_SERVICE_KEY no .env.local (Settings → API Keys → secret key sb_secret_...).
const __dir = dirname(fileURLToPath(import.meta.url))
try {
  for (const line of readFileSync(join(__dir, '..', '.env.local'), 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq !== -1 && !(t.slice(0, eq).trim() in process.env)) {
      process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim()
    }
  }
} catch { /* sem .env.local — usa env do shell */ }

const SERVICE_ROLE = process.env.SUPABASE_SERVICE_KEY
if (!SERVICE_ROLE) {
  console.error('❌ SUPABASE_SERVICE_KEY ausente. Defina no .env.local (Settings → API Keys → secret key).')
  process.exit(1)
}

const users = [
  { nome: 'Irmãos Backes',        email: 'irmaosbackes@grupobackes.com.br'  },
  { nome: 'Samuel Paulo Backes',  email: 'samuel@grupobackes.com.br'         },
  { nome: 'PSM Backes',           email: 'psm@grupobackes.com.br'            },
  { nome: 'Alexandre Backes',     email: 'alexandre@grupobackes.com.br'      },
  { nome: 'Elisangela M. Backes', email: 'elisangela@grupobackes.com.br'     },
  { nome: 'Rafael J. Backes',     email: 'rafael@grupobackes.com.br'         },
  { nome: 'Streit Conf',          email: 'streit@grupobackes.com.br'         },
  { nome: 'FMV Streit Conf',      email: 'fmv@grupobackes.com.br'            },
]
const PASSWORD = 'Backes@2026'

async function authReq(method, path, body) {
  const res = await fetch(`https://${REF}.supabase.co/auth/v1${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE}`,
      'apikey': SERVICE_ROLE,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  return { ok: res.ok, status: res.status, body: json }
}

async function dbReq(sql) {
  const res = await fetch(`https://${REF}.supabase.co/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE}`,
      'apikey': SERVICE_ROLE,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  })
  return { ok: res.ok, status: res.status, body: await res.text() }
}

async function listUsers() {
  const { ok, body } = await authReq('GET', '/admin/users?per_page=100')
  if (!ok) return []
  return body.users ?? []
}

async function linkUser(userId, nome) {
  const res = await fetch(`https://${REF}.supabase.co/rest/v1/compradores?nome=eq.${encodeURIComponent(nome)}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE}`,
      'apikey': SERVICE_ROLE,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ user_id: userId }),
  })
  return res.ok
}

async function main() {
  console.log('▶ Buscando usuários existentes...')
  const existing = await listUsers()
  const existingEmails = new Set(existing.map(u => u.email))
  console.log(`  ${existing.length} usuário(s) já cadastrado(s)`)

  console.log('\n▶ Criando usuários de autenticação...')
  for (const u of users) {
    process.stdout.write(`  ${u.nome.padEnd(25)} `)
    if (existingEmails.has(u.email)) {
      const ex = existing.find(e => e.email === u.email)
      process.stdout.write(`(já existe, linkando)\n`)
      const ok = await linkUser(ex.id, u.nome)
      if (ok) console.log(`    ↳ linked user_id = ${ex.id}`)
      continue
    }
    const { ok, body } = await authReq('POST', '/admin/users', {
      email: u.email, password: PASSWORD, email_confirm: true,
    })
    if (!ok) {
      console.log(`✗ ${JSON.stringify(body)}`)
      continue
    }
    console.log(`✓ criado`)
    const linked = await linkUser(body.id, u.nome)
    console.log(`    ↳ user_id = ${body.id}${linked ? '' : ' (link falhou)'}`)
  }

  console.log('\n✅ Pronto!')
  console.log('\nCredenciais (todos com senha: Backes@2026):')
  users.forEach(u => console.log(`  ${u.email}`))
}

main().catch(e => { console.error('❌', e.message); process.exit(1) })
