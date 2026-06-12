import { useState, useEffect } from 'react'

const ETAPA_LABELS = {
  triagem: 'Triagem', background_check: 'Bg. Check',
  entrevista_rh: 'Entrev. RH', entrevista_gestor: 'Entrev. Gestor',
  aprovado: 'Aprovado', reprovado: 'Reprovado',
}

export default function CandidatoDetalhe({ navigate, candidatoId }) {
  const [dados, setDados]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [editando, setEditando]   = useState(false)
  const [form, setForm]           = useState({})
  const [salvando, setSalvando]   = useState(false)
  const [checkStatus, setCheckStatus] = useState('idle') // idle | loading | done | error
  const [checkResult, setCheckResult] = useState(null)
  const [copiado, setCopiado]     = useState(false)

  function load() {
    setLoading(true)
    fetch(`/api/candidatos?id=${candidatoId}`)
      .then(r => r.json())
      .then(data => { setDados(data); setForm({ nome: data.nome, cpf: data.cpf, email: data.email, telefone: data.telefone }) })
      .finally(() => setLoading(false))
  }

  useEffect(load, [candidatoId])

  async function salvarEdicao() {
    setSalvando(true)
    const res = await fetch('/api/candidatos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: candidatoId, ...form }),
    })
    if (res.ok) { setEditando(false); load() }
    setSalvando(false)
  }

  async function executarCheck() {
    if (!dados?.cpf) { alert('Candidato não tem CPF cadastrado.'); return }
    setCheckStatus('loading'); setCheckResult(null)
    const res = await fetch('/api/consultar-rh-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpfs: [dados.cpf], candidato_ids: [candidatoId] }),
    })
    if (!res.ok) { setCheckStatus('error'); return }
    const data = await res.json()
    setCheckResult(data[0])
    setCheckStatus('done')
    load() // reload para mostrar novo check salvo
  }

  function copiarResumo() {
    if (!checkResult) return
    const r = checkResult
    const texto = [
      `Nome: ${r.nome}`,
      `CPF: ${r.cpf}`,
      `Situação CPF: ${r.situacaoCPF}`,
      `Restrição: ${r.restricao ? 'SIM' : 'NÃO'}`,
      `Score Boa Vista: ${r.scoreBV} (${r.scoreClassifBV})`,
      `Score SPC 3 meses: ${r.score3m} (${r.score3mClasse})`,
      `Débitos BV: ${r.totalDebitos} ocorrência(s) — R$ ${r.valorDebitos}`,
      `Protestos BV: ${r.totalProtestos} ocorrência(s)`,
      `SPC: ${r.totalSPC} ocorrência(s) — R$ ${r.valorSPC}`,
      r.erro ? `Erro: ${r.erro}` : null,
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(texto).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 2000) })
  }

  if (loading) return <p style={{ color: '#666', fontSize: 14 }}>Carregando…</p>
  if (!dados)  return <p style={{ color: '#dc2626', fontSize: 14 }}>Candidato não encontrado.</p>

  const lastCheck = dados.checks?.[0]

  return (
    <div style={{ maxWidth: 720 }}>
      <button onClick={() => navigate('vagas')} style={s.back}>← Voltar</button>

      {/* Dados do candidato */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <div>
            <div style={s.name}>{dados.nome || '(sem nome)'}</div>
            <div style={s.cpf}>CPF: {dados.cpf ? formatCPF(dados.cpf) : '—'}</div>
          </div>
          {!editando && (
            <button onClick={() => setEditando(true)} style={s.btnSm}>Editar</button>
          )}
        </div>

        {editando ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
            {[['nome','Nome'],['cpf','CPF'],['email','Email'],['telefone','Telefone']].map(([k, lbl]) => (
              <label key={k} style={s.label}>
                {lbl}
                <input value={form[k] || ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={s.input} />
              </label>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={salvarEdicao} disabled={salvando} style={s.btnPrimary}>{salvando ? 'Salvando…' : 'Salvar'}</button>
              <button onClick={() => setEditando(false)} style={s.btnSm}>Cancelar</button>
            </div>
          </div>
        ) : (
          <div style={s.infoGrid}>
            <Info label="Email"    value={dados.email    || '—'} />
            <Info label="Telefone" value={dados.telefone || '—'} />
          </div>
        )}
      </div>

      {/* Candidaturas */}
      {dados.candidaturas?.length > 0 && (
        <div style={s.card}>
          <h3 style={s.sectionTitle}>Candidaturas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dados.candidaturas.map(c => (
              <div key={c.id} style={s.candidaturaRow}>
                <span style={s.vagaNome} onClick={() => navigate('vaga-detalhe', { vagaId: c.vagas?.id, vagaTitulo: c.vagas?.titulo })}>
                  {c.vagas?.titulo || '(vaga)'}
                </span>
                <span style={{ ...s.etapaBadge, background: ETAPA_BG[c.etapa] || '#e5e7eb', color: ETAPA_FG[c.etapa] || '#374151' }}>
                  {ETAPA_LABELS[c.etapa] || c.etapa}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Background Check */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ ...s.sectionTitle, margin: 0 }}>Background Check</h3>
          <button onClick={executarCheck} disabled={checkStatus === 'loading' || !dados.cpf} style={s.btnPrimary}>
            {checkStatus === 'loading' ? 'Consultando…' : 'Executar check'}
          </button>
        </div>

        {!dados.cpf && <p style={{ color: '#888', fontSize: 13 }}>Cadastre o CPF do candidato para executar o check.</p>}

        {checkStatus === 'error' && <p style={{ color: '#dc2626', fontSize: 13 }}>Erro ao consultar. Tente novamente.</p>}

        {checkResult && (
          <div style={s.checkResult}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Resultado mais recente</div>
              <button onClick={copiarResumo} style={s.btnSm}>{copiado ? '✓ Copiado!' : 'Copiar resumo'}</button>
            </div>
            <CheckResultado r={checkResult} />
          </div>
        )}

        {!checkResult && lastCheck && (
          <div style={s.checkResult}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
              Último check — {new Date(lastCheck.criado_em).toLocaleDateString('pt-BR')}
            </div>
            <div style={s.infoGrid}>
              <Info label="Restrição"    value={lastCheck.restricao ? '⚠ SIM' : '✓ Não'} />
              <Info label="Resumo"       value={lastCheck.resumo_texto || '—'} />
            </div>
          </div>
        )}

        {dados.checks?.length > 1 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Histórico ({dados.checks.length} checks)</div>
            {dados.checks.slice(1).map((c, i) => (
              <div key={i} style={s.histRow}>
                <span>{new Date(c.criado_em).toLocaleDateString('pt-BR')}</span>
                <span style={{ color: c.restricao ? '#dc2626' : '#16a34a' }}>{c.restricao ? 'Com restrição' : 'Sem restrição'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CheckResultado({ r }) {
  if (r.erro) return <p style={{ color: '#dc2626', fontSize: 13 }}>Erro: {r.erro}</p>
  const restricao = r.restricao || r.temDebito || r.temProtesto || r.totalSPC > 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ ...sBadge, background: restricao ? '#fef2f2' : '#f0fdf4', color: restricao ? '#dc2626' : '#16a34a', fontWeight: 700, fontSize: 14, padding: '8px 12px', borderRadius: 8 }}>
        {restricao ? '⚠ Possui restrições' : '✓ Sem restrições'}
      </div>
      <div style={s.infoGrid}>
        <Info label="Score BV"          value={`${r.scoreBV} (${r.scoreClassifBV})`} />
        <Info label="Score SPC 3m"      value={`${r.score3m} (${r.score3mClasse})`} />
        <Info label="Débitos BV"        value={`${r.totalDebitos} — R$ ${r.valorDebitos}`} highlight={r.temDebito} />
        <Info label="Protestos BV"      value={r.totalProtestos} highlight={r.temProtesto} />
        <Info label="Ocorrências SPC"   value={`${r.totalSPC} — R$ ${r.valorSPC}`} highlight={r.totalSPC > 0} />
        <Info label="Situação CPF"      value={r.situacaoCPF} />
      </div>
    </div>
  )
}

function Info({ label, value, highlight }) {
  return (
    <div style={{ fontSize: 13 }}>
      <div style={{ color: '#888', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 500, color: highlight ? '#dc2626' : '#111' }}>{value}</div>
    </div>
  )
}

function formatCPF(cpf) {
  const d = String(cpf).replace(/\D/g, '')
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const ETAPA_BG = { aprovado: '#f0fdf4', reprovado: '#f3f4f6', background_check: '#ede9fe', triagem: '#eff6ff', entrevista_rh: '#fffbeb', entrevista_gestor: '#fff7ed' }
const ETAPA_FG = { aprovado: '#16a34a', reprovado: '#6b7280', background_check: '#7c3aed', triagem: '#1d4ed8', entrevista_rh: '#d97706', entrevista_gestor: '#ea580c' }
const sBadge = {}

const s = {
  back:          { padding: '6px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151', marginBottom: 20, display: 'inline-block' },
  card:          { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16 },
  cardHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  name:          { fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 4 },
  cpf:           { fontSize: 14, color: '#666' },
  infoGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginTop: 16 },
  label:         { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500, color: '#374151' },
  input:         { padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none' },
  btnPrimary:    { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#1e293b', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  btnSm:         { padding: '6px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151' },
  sectionTitle:  { margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#111' },
  candidaturaRow:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' },
  vagaNome:      { fontSize: 14, color: '#1e293b', fontWeight: 500, cursor: 'pointer' },
  etapaBadge:    { padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  checkResult:   { background: '#f8fafc', borderRadius: 8, padding: 16, marginTop: 4 },
  histRow:       { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', padding: '4px 0' },
}
