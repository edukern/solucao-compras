/**
 * Bolt Compras — Keep-alive Worker
 * Roda toda segunda-feira às 08h (BRT) para manter o projeto Supabase ativo.
 * Sem esse worker, o Supabase free tier pausa após 7 dias sem uso.
 */

export default {
  async scheduled(event, env, ctx) {
    const url = `${env.SUPABASE_URL}/rest/v1/sessoes?select=id&limit=1`

    const res = await fetch(url, {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      },
    })

    const status = res.ok ? 'OK' : `ERRO ${res.status}`
    console.log(`[keep-alive] Supabase ping: ${status} — ${new Date().toISOString()}`)
  },
}
