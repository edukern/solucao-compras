import { useState } from 'react'

export default function Check() {
  const [texto, setTexto]       = useState('')
  const [status, setStatus]     = useState('idle') // idle | loading | done | error
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
    if (cpfs.length > 20)  { setErro('Máximo 20 CPFs por batch.'); return }
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
    const header = 'CPF\tNome\tRestrição\tScore BV\tClassif BV\tScore SPC 3m\tClasse SPC\tDébitos BV\tValor Débitos\tProtes tos BV\tSPC Ocorrências\tValor SPC\tSituação CPF\tErro'
    const linhas = resultados.map(r => [
      r.cpf, r.nome,
      r.restricao ? 'SIM' : 'Não',
      r.scoreBV, r.scoreClassifBV,
      r.score3m, r.score3mClasse,
      r.totalDebitos, r.valorDebitos,
      r.totalProtestos,
      r.totalSPC, r.valorSPC,
      r.situacaoCPF,
      r.erro || '',
    ].join('\t'))
    navigator.clipboard.writeText([header, ...linhas].join('\n'))
      .then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 2000) })
  }

  return (
    <div>
      <h1 style={s.heading}>Check em Lote</h1>
      <p style={s.sub}>Cole os CPFs (um por linha ou separados por vírgula/ponto-e-vírgula). Máximo 20.</p>

      <div style={s.card}>
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          style={s.textarea}
          placeholder={'000.000.000-00\n111.111.111-11\n222.222.222-22'}
          rows={6}
        />
        {erro && <p style={s.error}>{erro}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={executar} disabled={status === 'loading'} style={{ ...s.btnPrimary, opacity: status === 'loading' ? 0.6 : 1 }}>
            {status === 'loading' ? `Consultando ${parseCPFs(texto).length} CPFs…` : 'Executar checks'}
          </button>
          {status === 'loading' && <span style={{ fontSize: 13, color: '#888', alignSelf: 'center' }}>Isso pode levar alguns segundos…</span>}
        </div>
      </div>

      {resultados.length > 0 && (
        <div style={s.resultCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Resultados — {resultados.length} CPF(s)</h2>
            <button onClick={copiarTabela} style={s.btnSm}>{copiado ? '✓ Copiado!' : 'Copiar como planilha'}</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['CPF','Nome','Restrição','Score BV','Classif.','SPC 3m','Classe SPC','Déb. BV','SPC Oc.','Situação CPF'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resultados.map((r, i) => {
                  const restricao = r.restricao || r.temDebito || r.temProtesto || r.totalSPC > 0
                  const rowBg = r.erro ? '#fff9f9' : restricao ? '#fef9f0' : '#fff'
                  return (
                    <tr key={i} style={{ background: rowBg }}>
                      <td style={s.td}>{formatCPF(r.cpf)}</td>
                      <td style={s.td}>{r.nome}</td>
                      <td style={{ ...s.td, color: restricao ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                        {r.erro ? '—' : restricao ? '⚠ Sim' : '✓ Não'}
                      </td>
                      <td style={s.td}>{r.scoreBV}</td>
                      <td style={s.td}>{r.scoreClassifBV}</td>
                      <td style={s.td}>{r.score3m}</td>
                      <td style={s.td}>{r.score3mClasse}</td>
                      <td style={{ ...s.td, color: r.temDebito ? '#dc2626' : 'inherit' }}>
                        {r.totalDebitos} — R$ {r.valorDebitos}
                      </td>
                      <td style={{ ...s.td, color: r.totalSPC > 0 ? '#dc2626' : 'inherit' }}>{r.totalSPC}</td>
                      <td style={s.td}>{r.situacaoCPF}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function formatCPF(cpf) {
  const d = String(cpf).replace(/\D/g, '')
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const s = {
  heading:   { margin: '0 0 4px', fontSize: 24, fontWeight: 700, color: '#111' },
  sub:       { margin: '0 0 24px', fontSize: 14, color: '#666' },
  card:      { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 },
  textarea:  { width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box' },
  error:     { margin: 0, color: '#dc2626', fontSize: 13 },
  btnPrimary:{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#1e293b', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  btnSm:     { padding: '6px 14px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151' },
  resultCard:{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:        { padding: '8px 12px', textAlign: 'left', background: '#f8fafc', fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' },
  td:        { padding: '8px 12px', borderBottom: '1px solid #f3f4f6', color: '#111', whiteSpace: 'nowrap' },
}
