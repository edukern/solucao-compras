const API_BASE = 'https://solucao-compras-demo.vercel.app'

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const target = `${API_BASE}${url.pathname}${url.search}`

  return fetch(target, {
    method:  context.request.method,
    headers: context.request.headers,
    body:    ['GET', 'HEAD'].includes(context.request.method) ? undefined : context.request.body,
  })
}
