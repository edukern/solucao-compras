import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dir, '..')
const PAT  = process.argv[2]
const REF  = 'bhxpkysueyoblizkvomb'

if (!PAT) { console.error('Usage: node scripts/migrate.mjs <PAT>'); process.exit(1) }

async function runSQL(label, sql) {
  console.log(`\n▶ ${label}...`)
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  const body = await res.json()
  if (!res.ok) {
    console.error(`  ✗ HTTP ${res.status}:`, JSON.stringify(body))
    throw new Error(`SQL falhou: ${label}`)
  }
  console.log(`  ✓ OK`)
  return body
}

const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoeHBreXN1ZXlvYmxpemt2b21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTAyNDY0NiwiZXhwIjoyMDk0NjAwNjQ2fQ.AXaUuzmffj3DM8-zpV0CMxTbF3AhRV9NTQIckBpIAnE'

async function createUser(email, password, nome) {
  console.log(`  → ${nome} <${email}>`)
  const res = await fetch(`https://${REF}.supabase.co/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE}`,
      'apikey': SERVICE_ROLE,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  })
  const body = await res.json()
  if (!res.ok) {
    if (body.msg?.includes('already been registered') || body.message?.includes('already exists') || body.code === 'email_exists') {
      console.log(`    (já existe, pulando)`)
      return null
    }
    console.error(`    ✗ Erro:`, JSON.stringify(body))
    return null
  }
  return body.id
}

async function linkUserToComprador(userId, nome) {
  if (!userId) return
  await runSQL(`Link user → comprador '${nome}'`,
    `UPDATE compradores SET user_id = '${userId}' WHERE nome = '${nome.replace(/'/g, "''")}'`)
}

async function main() {
  // 1. Migrations
  const sql001 = readFileSync(join(ROOT, 'supabase/migrations/001_schema_inicial.sql'), 'utf8')
  const sql002 = readFileSync(join(ROOT, 'supabase/migrations/002_hist_tables.sql'), 'utf8')
  const sqlSeed = readFileSync(join(ROOT, 'supabase/seed.sql'), 'utf8')

  await runSQL('001_schema_inicial', sql001)
  await runSQL('002_hist_tables',   sql002)
  await runSQL('seed',              sqlSeed)

  // 2. Auth users
  console.log('\n▶ Criando usuários de autenticação...')
  const users = [
    { nome: 'Irmãos Backes',        email: 'irmaosbackes@grupobackes.com.br',  password: 'Backes@2026' },
    { nome: 'Samuel Paulo Backes',  email: 'samuel@grupobackes.com.br',         password: 'Backes@2026' },
    { nome: 'PSM Backes',           email: 'psm@grupobackes.com.br',            password: 'Backes@2026' },
    { nome: 'Alexandre Backes',     email: 'alexandre@grupobackes.com.br',      password: 'Backes@2026' },
    { nome: 'Elisangela M. Backes', email: 'elisangela@grupobackes.com.br',     password: 'Backes@2026' },
    { nome: 'Rafael J. Backes',     email: 'rafael@grupobackes.com.br',         password: 'Backes@2026' },
    { nome: 'Streit Conf',          email: 'streit@grupobackes.com.br',         password: 'Backes@2026' },
    { nome: 'FMV Streit Conf',      email: 'fmv@grupobackes.com.br',            password: 'Backes@2026' },
  ]

  for (const u of users) {
    const uid = await createUser(u.email, u.password, u.nome)
    await linkUserToComprador(uid, u.nome)
  }

  console.log('\n✅ Migração concluída!')
  console.log('\nCredenciais iniciais (senha padrão: Backes@2026):')
  users.forEach(u => console.log(`  ${u.nome.padEnd(25)} ${u.email}`))
  console.log('\nCada usuário pode trocar a senha pelo app depois.')
}

main().catch(e => { console.error('\n❌', e.message); process.exit(1) })
