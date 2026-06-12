const crypto = require('crypto')
const axios  = require('axios')

const SECRET = process.env.RH_JWT_SECRET || 'dev-secret-set-RH_JWT_SECRET-in-prod'
const SB_URL = process.env.SUPABASE_URL
const SB_KEY = process.env.SUPABASE_SERVICE_KEY

function signToken(payload) {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 86_400_000 })
  const b64  = Buffer.from(data).toString('base64url')
  const sig  = crypto.createHmac('sha256', SECRET).update(b64).digest('hex')
  return `${b64}.${sig}`
}

function verifyToken(token) {
  if (!token) return null
  const dot = token.lastIndexOf('.')
  if (dot < 0) return null
  const b64 = token.slice(0, dot)
  const sig  = token.slice(dot + 1)
  const expected = crypto.createHmac('sha256', SECRET).update(b64).digest('hex')
  if (sig !== expected) return null
  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString())
    if (Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

function parseCookies(req) {
  const header = req.headers.cookie || ''
  return Object.fromEntries(
    header.split(';')
      .map(c => c.trim())
      .filter(Boolean)
      .map(c => {
        const i = c.indexOf('=')
        if (i < 0) return null
        return [c.slice(0, i).trim(), decodeURIComponent(c.slice(i + 1).trim())]
      })
      .filter(Boolean)
  )
}

function setCookieHeader(name, value, opts = {}) {
  if (opts.clear) return `${name}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${name}=${encodeURIComponent(value)}; Max-Age=${opts.maxAge ?? 86400}; Path=/; HttpOnly; SameSite=Lax${secure}`
}

function authenticate(req) {
  const cookies = parseCookies(req)
  return verifyToken(cookies.hr_session)
}

function sb() {
  if (!SB_URL || !SB_KEY) throw new Error('SUPABASE_URL e SUPABASE_SERVICE_KEY não configurados.')
  return axios.create({
    baseURL: `${SB_URL}/rest/v1/`,
    headers: {
      apikey:          SB_KEY,
      Authorization:   `Bearer ${SB_KEY}`,
      'Content-Type':  'application/json',
      Prefer:          'return=representation',
    },
    timeout: 10000,
  })
}

// Grava evento no audit log (não bloqueia a resposta principal)
async function auditLog(req, session, acao, { alvo_id, alvo_hash } = {}) {
  if (!SB_URL || !SB_KEY) return
  const ip         = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || null
  const user_agent = (req.headers['user-agent'] || '').slice(0, 200)
  sb().post('rh_audit_logs', {
    empresa_id: session?.empresa_id || null,
    usuario_id: session?.id        || null,
    acao, alvo_id, alvo_hash, ip, user_agent,
  }).catch(e => console.error('[audit] write error:', e.message))
}

module.exports = { signToken, verifyToken, parseCookies, setCookieHeader, authenticate, sb, auditLog }
