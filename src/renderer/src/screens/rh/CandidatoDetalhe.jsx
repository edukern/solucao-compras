import { useState, useEffect } from 'react'

const ETAPA_LABELS = {
  triagem: 'Triagem', background_check: 'Bg. Check',
  entrevista_rh: 'Entrev. RH', entrevista_gestor: 'Entrev. Gestor',
  aprovado: 'Aprovado', reprovado: 'Reprovado',
}

const FORM_LABELS = {
  data_nascimento:  'Data de nasc.',
  estado_civil:     'Estado civil',
  filhos:           'Tem filhos',
  filhos_qtd:       'Qtd. filhos',
  facebook:         'Facebook',
  instagram:        'Instagram',
  endereco:         'Endereço',
  deslocamento:     'Como vem trabalhar',
  escolaridade:     'Escolaridade',
  estudando:        'Estudando',
  curso_prof:       'Curso profis.',
  curso_prof_qual:  'Qual curso',
  experiencia:      'Tem experiência',
  experiencia_desc: 'Desc. experiência',
  conhece_empresa:  'Conhece a Ponto E',
  motivacao:        'Motivação',
}

export default function CandidatoDetalhe({ navigate, candidatoId, vagaId, vagaTitulo }) {
  const [dados, setDados]             = useState(null)
  const [loading, setLoading]         = useState(true)
  const [editando, setEditando]       = useState(false)
  const [form, setForm]               = useState({})
  const [salvando, setSalvando]       = useState(false)
  const [checkStatus, setCheckStatus] = useState('idle')
  const [checkResult, setCheckResult] = useState(null)
  const [checkErro, setCheckErro]     = useState('')
  const [copiado, setCopiado]         = useState(false)
  const [formularioAberto, setFormularioAberto] = useState(null)
  const [notaState, setNotaState]     = useState({})

  function load() {
    setLoading(true)
    fetch(`/api/candidatos?id=${candidatoId}`)
      .then(r => r.json())
      .then(data => {
        setDados(data)
        setForm({ nome: data.nome, cpf: data.cpf, email: data.email, telefone: data.telefone, cidade: data.cidade })
        const notas = {}
        data.candidaturas?.forEach(c => { notas[c.id] = { value: c.notas || '', saving: false } })
        setNotaState(notas)
      })
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

  async function salvarNota(candId) {
    setNotaState(prev => ({ ...prev, [candId]: { ...prev[candId], saving: true } }))
    await fetch('/api/candidaturas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: candId, notas: notaState[candId]?.value || null }),
    })
    setNotaState(prev => ({ ...prev, [candId]: { ...prev[candId], saving: false } }))
  }

  async function executarCheck() {
    if (!dados?.cpf) {
      setCheckErro('Cadastre o CPF do candidato para executar o check.')
      return
    }
    setCheckErro('')
    setCheckStatus('loading')
    setCheckResult(null)
    const res = await fetch('/api/consultar-rh-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpfs: [dados.cpf], candidato_ids: [candidatoId] }),
    })
    if (!res.ok) { setCheckStatus('error'); return }
    const data = await res.json()
    setCheckResult(data[0])
    setCheckStatus('done')
    load()
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
      <button
        onClick={() => vagaId ? navigate('vaga-detalhe', { vagaId, vagaTitulo }) : navigate('vagas')}
        style={s.back}
      >
        ← {vagaTitulo || 'Vagas'}
      </button>

      {/* Dados do candidato */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <div>
            <div style={s.name}>{dados.nome || '(sem nome)'}</div>
            <div style={s.cpfText}>CPF: {dados.cpf ? formatCPF(dados.cpf) : '—'}</div>
          </div>
          {!editando && (
            <button onClick={() => setEditando(true)} style={s.btnSm}>Editar</button>
          )}
        </div>

        {editando ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
            {[['nome','Nome'],['cpf','CPF'],['email','Email'],['telefone','Telefone'],['cidade','Cidade']].map(([k, lbl]) => (
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
            {dados.cidade && <Info label="Cidade" value={dados.cidade} />}
          </div>
        )}
      </div>

      {/* Candidaturas */}
      {dados.candidaturas?.length > 0 && (
        <div style={s.card}>
          <h3 style={s.sectionTitle}>Candidaturas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {dados.candidaturas.map(c => {
              const nota  = notaState[c.id] || { value: c.notas || '', saving: false }
              const hasForm = c.formulario && Object.keys(FORM_LABELS).some(k => {
                const v = c.formulario[k]
                return v !== null && v !== undefined && v !== '' && v !== false
              })
              return (
                <div key={c.id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 16 }}>
                  <div style={s.candidaturaRow}>
                    <span
                      style={s.vagaNome}
                      onClick={() => navigate('vaga-detalhe', { vagaId: c.vagas?.id, vagaTitulo: c.vagas?.titulo })}
                    >
                      {c.vagas?.titulo || '(vaga)'}
                    </span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ ...s.etapaBadge, background: ETAPA_BG[c.etapa] || '#e5e7eb', color: ETAPA_FG[c.etapa] || '#374151' }}>
                        {ETAPA_LABELS[c.etapa] || c.etapa}
                      </span>
                      {hasForm && (
                        <button
                          onClick={() => setFormularioAberto(formularioAberto === c.id ? null : c.id)}
                          style={{ ...s.btnSm, fontSize: 12 }}
                        >
                          {formularioAberto === c.id ? '▲ Fechar' : '▼ Respostas'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notas de entrevista */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Notas de entrevista</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <textarea
                        value={nota.value}
                        onChange={e => setNotaState(prev => ({ ...prev, [c.id]: { ...prev[c.id], value: e.target.value } }))}
                        placeholder="Registre impressões da entrevista…"
                        style={{ ...s.input, flex: 1, minHeight: 56, resize: 'vertical', fontSize: 13, lineHeight: 1.5 }}
                      />
                      <button
                        onClick={() => salvarNota(c.id)}
                        disabled={nota.saving}
                        style={{ ...s.btnPrimary, alignSelf: 'flex-end', fontSize: 12, padding: '6px 14px' }}
                      >
                        {nota.saving ? '…' : 'Salvar'}
                      </button>
                    </div>
                  </div>

                  {/* Formulário de candidatura */}
                  {formularioAberto === c.id && c.formulario && (
                    <FormularioView f={c.formulario} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Background Check */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ ...s.sectionTitle, margin: 0 }}>Background Check</h3>
          <button onClick={executarCheck} disabled={checkStatus === 'loading'} style={s.btnPrimary}>
            {checkStatus === 'loading' ? 'Consultando…' : 'Executar check'}
          </button>
        </div>

        {checkErro && <p style={{ color: '#dc2626', fontSize: 13, margin: '0 0 12px' }}>{checkErro}</p>}
        {!dados.cpf && !checkErro && (
          <p style={{ color: '#888', fontSize: 13 }}>Cadastre o CPF do candidato para executar o check.</p>
        )}
        {checkStatus === 'error' && (
          <p style={{ color: '#dc2626', fontSize: 13 }}>Erro ao consultar. Tente novamente.</p>
        )}

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
              <Info label="Restrição" value={lastCheck.restricao ? '⚠ SIM' : '✓ Não'} />
              <Info label="Resumo"    value={lastCheck.resumo_texto || '—'} />
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

function FormularioView({ f }) {
  const entries = Object.entries(FORM_LABELS)
    .map(([k, label]) => {
      let val = f[k]
      if (val === null || val === undefined || val === '' || val === false) return null
      if (typeof val === 'boolean') val = 'Sim'
      return { label, val: String(val) }
    })
    .filter(Boolean)

  if (!entries.length) return null

  return (
    <div style={{ marginTop: 12, background: '#f8fafc', borderRadius: 8, padding: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Respostas do formulário
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {entries.map(({ label, val }) => (
          <div key={label} style={{ fontSize: 13 }}>
            <div style={{ color: '#888', marginBottom: 2 }}>{label}</div>
            <div style={{ fontWeight: 500, color: '#111', wordBreak: 'break-word' }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CheckResultado({ r }) {
  if (r.erro) return <p style={{ color: '#dc2626', fontSize: 13 }}>Erro: {r.erro}</p>
  const restricao = r.restricao || r.temDebito || r.temProtesto || r.totalSPC > 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ background: restricao ? '#fef2f2' : '#f0fdf4', color: restricao ? '#dc2626' : '#16a34a', fontWeight: 700, fontSize: 14, padding: '8px 12px', borderRadius: 8 }}>
        {restricao ? '⚠ Possui restrições' : '✓ Sem restrições'}
      </div>
      <div style={s.infoGrid}>
        <Info label="Score BV"        value={`${r.scoreBV} (${r.scoreClassifBV})`} />
        <Info label="Score SPC 3m"    value={`${r.score3m} (${r.score3mClasse})`} />
        <Info label="Débitos BV"      value={`${r.totalDebitos} — R$ ${r.valorDebitos}`} highlight={r.temDebito} />
        <Info label="Protestos BV"    value={r.totalProtestos} highlight={r.temProtesto} />
        <Info label="Ocorrências SPC" value={`${r.totalSPC} — R$ ${r.valorSPC}`} highlight={r.totalSPC > 0} />
        <Info label="Situação CPF"    value={r.situacaoCPF} />
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

const s = {
  back:          { padding: '6px 12px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#444', marginBottom: 20, display: 'inline-block' },
  card:          { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,.08)', marginBottom: 16 },
  cardHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  name:          { fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 4 },
  cpfText:       { fontSize: 14, color: '#666' },
  infoGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginTop: 16 },
  label:         { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#444' },
  input:         { padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  btnPrimary:    { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  btnSm:         { padding: '6px 12px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#444' },
  sectionTitle:  { margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#111' },
  candidaturaRow:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  vagaNome:      { fontSize: 14, color: '#111', fontWeight: 500, cursor: 'pointer' },
  etapaBadge:    { padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' },
  checkResult:   { background: '#f8fafc', borderRadius: 8, padding: 16, marginTop: 4 },
  histRow:       { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', padding: '4px 0' },
}
