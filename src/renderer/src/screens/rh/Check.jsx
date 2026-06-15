import { useState } from 'react'

export default function Check() {
  const [texto, setTexto]       = useState('')
  const [status, setStatus]     = useState('idle')
  const [resultados, setResultados] = useState([])
  const [copiado, setCopiado]   = useState(false)
  const [erro, setErro]         = useState('')

  function parseCPFs(raw) {
    return raw.split(/[\n,;]+/)
      .map(c => c.replace(/\D/g, ''))
      .filter(c => c.length === 11)
  }

  async function executar() {
    const cpfs = parseCPFs(texto)
    if (cpfs.length === 0) { setErro('Nenhum CPF válido encontrado (11 dígitos).'); return }
    if (cpfs.length > 20)  { setErro('Máximo 20 CPFs por vez.'); return }
    setStatus('loading'); setErro(''); setResultados([])

    const res = await fetch('/api/consultar-rh-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpfs }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setErro(data.error || `Erro ${res.status}`)
      setStatus('error')
      return
    }
    const data = await res.json()
    setResultados(data)
    setStatus('done')
  }

  function copiarTabela() {
    const header = 'CPF\tNome\tSituação\tO que consta'
    const linhas = resultados.map(r => {
      const ocorrencias = buildOcorrencias(r)
      return [
        formatCPF(r.cpf),
        r.nome,
        r.erro ? 'Erro na consulta' : ocorrencias.length === 0 ? 'Sem ocorrências' : 'Tem ocorrências',
        ocorrencias.join(' | ') || '—',
      ].join('\t')
    })
    navigator.clipboard.writeText([header, ...linhas].join('\n'))
      .then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 2000) })
  }

  return (
    <div>
      <h1 style={s.heading}>Checar CPF</h1>
      <p style={s.sub}>Cole os CPFs dos candidatos (um por linha ou separados por vírgula). Máximo 20.</p>

      <div style={s.card}>
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          style={s.textarea}
          placeholder={'000.000.000-00\n111.111.111-11'}
          rows={5}
        />
        {erro && <p style={s.error}>{erro}</p>}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={executar}
            disabled={status === 'loading'}
            style={{ ...s.btnPrimary, opacity: status === 'loading' ? 0.6 : 1 }}
          >
            {status === 'loading' ? `Consultando ${parseCPFs(texto).length} CPF(s)…` : 'Consultar'}
          </button>
          {status === 'loading' && (
            <span style={{ fontSize: 13, color: '#888' }}>Isso pode levar alguns segundos…</span>
          )}
        </div>
      </div>

      {resultados.length > 0 && (
        <div style={s.resultCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
              {resultados.length} CPF(s) consultado(s)
            </h2>
            <button onClick={copiarTabela} style={s.btnSm}>
              {copiado ? '✓ Copiado!' : 'Copiar como planilha'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {resultados.map((r, i) => {
              const ocorrencias = buildOcorrencias(r)
              const temOcorrencia = ocorrencias.length > 0
              const hasErro = !!r.erro

              return (
                <div key={i} style={{
                  ...s.resultRow,
                  borderLeft: `4px solid ${hasErro ? '#d1d5db' : temOcorrencia ? '#f59e0b' : '#22c55e'}`,
                  background: hasErro ? '#f9fafb' : temOcorrencia ? '#fffbeb' : '#f0fdf4',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                      <p style={s.nome}>{r.nome || '(nome não encontrado)'}</p>
                      <p style={s.cpfText}>{formatCPF(r.cpf)}</p>
                    </div>
                    <div style={{
                      ...s.badge,
                      background: hasErro ? '#f3f4f6' : temOcorrencia ? '#fef3c7' : '#dcfce7',
                      color: hasErro ? '#6b7280' : temOcorrencia ? '#92400e' : '#166534',
                    }}>
                      {hasErro ? '— Erro na consulta' : temOcorrencia ? '⚠ Tem ocorrências' : '✓ Nada consta'}
                    </div>
                  </div>

                  {temOcorrencia && (
                    <div style={s.ocorrencias}>
                      <p style={s.ocorrenciasLabel}>O que consta:</p>
                      <ul style={s.lista}>
                        {ocorrencias.map((o, j) => (
                          <li key={j} style={s.listaItem}>{o}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {hasErro && (
                    <p style={{ margin: '8px 0 0', fontSize: 13, color: '#6b7280' }}>
                      Não foi possível consultar este CPF: {r.erro}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function buildOcorrencias(r) {
  const lista = []

  if (r.restricao) {
    lista.push('Restrição ativa no SPC/Serasa')
  }
  if (r.temDebito && r.totalDebitos > 0) {
    const val = r.valorDebitos ? ` · R$ ${Number(r.valorDebitos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''
    lista.push(`${r.totalDebitos} débito(s) registrado(s)${val}`)
  }
  if (r.temProtesto && r.totalProtestos > 0) {
    lista.push(`${r.totalProtestos} protesto(s) em cartório`)
  }
  if (r.totalSPC > 0) {
    const val = r.valorSPC ? ` · R$ ${Number(r.valorSPC).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''
    lista.push(`${r.totalSPC} ocorrência(s) no SPC${val}`)
  }

  return lista
}

function formatCPF(cpf) {
  const d = String(cpf).replace(/\D/g, '')
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const s = {
  heading:        { margin: '0 0 4px', fontSize: 24, fontWeight: 700, color: '#111' },
  sub:            { margin: '0 0 24px', fontSize: 14, color: '#666' },
  card:           { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.08)', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 14 },
  textarea:       { width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box' },
  error:          { margin: 0, color: '#dc2626', fontSize: 13 },
  btnPrimary:     { padding: '10px 22px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  btnSm:          { padding: '6px 14px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#444' },
  resultCard:     { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.08)' },
  resultRow:      { borderRadius: 10, padding: '16px 20px', borderLeft: '4px solid #e5e7eb' },
  nome:           { margin: 0, fontSize: 15, fontWeight: 600, color: '#111' },
  cpfText:        { margin: '2px 0 0', fontSize: 13, color: '#6b7280' },
  badge:          { padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 },
  ocorrencias:    { marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,.06)' },
  ocorrenciasLabel: { margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' },
  lista:          { margin: 0, paddingLeft: 16 },
  listaItem:      { fontSize: 14, color: '#374151', marginBottom: 3 },
}
