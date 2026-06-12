// AES-256-GCM para dados em repouso + HMAC para lookup indexado.
// Env vars necessárias:
//   RH_ENCRYPTION_KEY — 64 chars hex (32 bytes): node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
//   RH_HMAC_KEY       — qualquer string secreta (diferente da de criptografia)
const crypto = require('crypto')

function getAesKey() {
  const k = process.env.RH_ENCRYPTION_KEY || ''
  if (k.length < 64) throw new Error('RH_ENCRYPTION_KEY precisa ter 64 chars hex (32 bytes)')
  return Buffer.from(k.slice(0, 64), 'hex')
}

// Criptografia autenticada: garante confidencialidade + integridade
// Formato de saída: "enc:ivHex:tagHex:dataHex"
function encrypt(plaintext) {
  if (plaintext == null || plaintext === '') return plaintext
  const key = getAesKey()
  const iv  = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `enc:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

// Descriptografa — aceita "enc:..." ou texto puro (retrocompatibilidade)
function decrypt(value) {
  if (!value || !String(value).startsWith('enc:')) return value
  const parts = String(value).slice(4).split(':')
  if (parts.length !== 3) return value
  const [ivHex, tagHex, dataHex] = parts
  try {
    const key     = getAesKey()
    const iv      = Buffer.from(ivHex, 'hex')
    const tag     = Buffer.from(tagHex, 'hex')
    const data    = Buffer.from(dataHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
  } catch {
    return '[cifrado]'
  }
}

// HMAC determinístico para lookup indexado (dedup de CPF sem expor o valor)
// Diferente de SHA256 puro: requer a chave secreta, imune a rainbow tables
function hmacHash(value) {
  if (value == null || value === '') return null
  const key = process.env.RH_HMAC_KEY
  if (!key) throw new Error('RH_HMAC_KEY não configurado')
  return crypto.createHmac('sha256', key).update(String(value)).digest('hex')
}

// Tenta criptografar sem lançar erro (para campos opcionais)
function tryEncrypt(value) {
  if (!process.env.RH_ENCRYPTION_KEY) return value // modo sem criptografia (dev)
  try { return encrypt(value) } catch { return value }
}

function tryDecrypt(value) {
  try { return decrypt(value) } catch { return value }
}

function tryHmac(value) {
  if (!process.env.RH_HMAC_KEY || !value) return null
  try { return hmacHash(value) } catch { return null }
}

module.exports = { encrypt, decrypt, hmacHash, tryEncrypt, tryDecrypt, tryHmac }
