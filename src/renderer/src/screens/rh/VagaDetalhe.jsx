import { useState, useEffect } from 'react'

const ETAPAS = ['triagem', 'background_check', 'entrevista_rh', 'entrevista_gestor', 'aprovado', 'reprovado']
const ETAPA_LABELS = {
  triagem:           'Triagem',
  background_check:  'Bg. Check',
  entrevista_rh:     'Entrev. RH',
  entrevista_gestor: 'Entrev. Gestor',
  aprovado:          'Aprovado',
  reprovado:         'Reprovado',
}
const ETAPA_COLORS = {
  triagem:           '#3b82f6',
  background_check:  '#8b5cf6',
  entrevista_rh:     '#f59e0b',
  entrevista_gestor: '#f97316',
  aprovado:          '#16a34a',
  reprovado:         '#6b7280',
}
const FLOW = ['triagem', 'background_check', 'entrevista_rh', 'entrevista_gestor', 'aprovado']

export default function VagaDetalhe({ navigate, vagaId, vagaTitulo }) {
  const [candidaturas, setCandidaturas] = useState([])
  const [loading, setLoading]           = useState(true)
  const [showAdd, setShowAdd]           = useState(false)
  const [addForm, setAddForm]           = useState({ nome: '', cpf: '', email: '', telefone: '' })
  const [adding, setAdding]             = useState(false)
  const [addErro, setAddErro]           = useState('')

  function load() {
    setLoading(true)
    fetch(`/api/candidaturas?vaga_id=${vagaId}`)
      .then(r => r.json())
      .then(data => setCandidaturas(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }

  useEffect(load, [vagaId])

  async function moverEtapa(candidaturaId, novaEtapa) {
    await fetch('/api/candidaturas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: candidaturaId, etapa: novaEtapa }),
    })
    load()
  }

  async function handleAdd(e) {
    e.preventDefault()
    setAdding(true); setAddErro('')
    try {
      // Cria ou busca candidato, depois cria candidatura
      let candidatoId
      const cpf = addForm.cpf.replace(/\D/g, '')

      const resCand = await fetch('/api/candidatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: addForm.nome, cpf, email: addForm.email, telefone: addForm.telefone }),
      })
      const dataCand = await resCand.json()

      if (resCand.status === 409) {
        // CPF já existe — busca pelo CPF
        const busca = await fetch(`/api/candidatos?q=${encodeURIComponent(addForm.nome)}`).then(r => r.json())
        const encontrado = busca.find(c => c.cpf === cpf)
        if (!encontrado) { setAddErro('CPF já cadastrado. Tente buscar pelo nome.'); setAdding(false); return }
        candidatoId = encontrado.id
      } else if (!resCand.ok) {
        setAddErro(dataCand.error || 'Erro ao criar candidato.')
        setAdding(false); return
      } else {
        candidatoId = dataCand.id
      }

      const resCandidatura = await fetch('/api/candidaturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vaga_id: vagaId, candidato_id: candidatoId }),
      })
      const dataCandidatura = await resCandidatura.json()
      if (!resCandidatura.ok) {
        setAddErro(dataCandidatura.error || 'Erro ao adicionar à vaga.')
        setAdding(false); return
      }

      setShowAdd(false)
      setAddForm({ nome: '', cpf: '', email: '', telefone: '' })
      load()
    } catch {
      setAddErro('Falha de rede.')
    }
    setAdding(false)
  }

  const byEtapa = ETAPAS.reduce((acc, e) => {
    acc[e] = candidaturas.filter(c => c.etapa === e)
    return acc
  }, {})

  return (
    <div>
      <div style={s.topBar}>
        <button onClick={() => navigate('vagas')} style={s.back}>← Vagas</button>
        <h1 style={s.heading}>{vagaTitulo}</h1>
        <button onClick={() => setShowAdd(v => !v)} style={s.btnPrimary}>
          {showAdd ? 'Cancelar' : '+ Candidato'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} style={s.addCard}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Adicionar candidato</h3>
          <div style={s.row}>
            <label style={s.label}>Nome *<input value={addForm.nome} onChange={e => setAddForm(f => ({ ...f, nome: e.target.value }))} style={s.input} required /></label>
            <label style={s.label}>CPF<input value={addForm.cpf} onChange={e => setAddForm(f => ({ ...f, cpf: e.target.value }))} style={s.input} placeholder="000.000.000-00" /></label>
            <label style={s.label}>Email<input type="email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} style={s.input} /></label>
            <label style={s.label}>Telefone<input value={addForm.telefone} onChange={e => setAddForm(f => ({ ...f, telefone: e.target.value }))} style={s.input} /></label>
          </div>
          {addErro && <p style={s.error}>{addErro}</p>}
          <button type="submit" disabled={adding} style={{ ...s.btnPrimary, alignSelf: 'flex-start' }}>
            {adding ? 'Adicionando…' : 'Adicionar'}
          </button>
        </form>
      )}

      {loading ? (
        <p style={{ color: '#666', fontSize: 14 }}>Carregando…</p>
      ) : (
        <div style={s.kanban}>
          {ETAPAS.map(etapa => {
            const cards = byEtapa[etapa] || []
            const col = { ...s.col, borderTop: `3px solid ${ETAPA_COLORS[etapa]}` }
            return (
              <div key={etapa} style={col}>
                <div style={s.colHeader}>
                  <span style={s.colTitle}>{ETAPA_LABELS[etapa]}</span>
                  <span style={{ ...s.badge, background: ETAPA_COLORS[etapa] }}>{cards.length}</span>
                </div>
                {cards.length === 0 && <div style={s.empty}>—</div>}
                {cards.map(c => {
                  const cand = c.candidatos || {}
                  const idx  = FLOW.indexOf(c.etapa)
                  const prox = FLOW[idx + 1]
                  const prev = FLOW[idx - 1]
                  return (
                    <div key={c.id} style={s.cardItem}>
                      <div onClick={() => navigate('candidato', { candidatoId: cand.id })} style={s.cardName}>
                        {cand.nome || '(sem nome)'}
                      </div>
                      {cand.email && <div style={s.cardSub}>{cand.email}</div>}
                      <div style={s.cardBtns}>
                        {prev && (
                          <button onClick={() => moverEtapa(c.id, prev)} style={s.btnMove} title={`Voltar para ${ETAPA_LABELS[prev]}`}>←</button>
                        )}
                        {prox && (
                          <button onClick={() => moverEtapa(c.id, prox)} style={{ ...s.btnMove, background: '#1e293b', color: '#fff' }} title={`Avançar para ${ETAPA_LABELS[prox]}`}>→</button>
                        )}
                        {c.etapa !== 'reprovado' && (
                          <button onClick={() => moverEtapa(c.id, 'reprovado')} style={{ ...s.btnMove, color: '#dc2626' }} title="Reprovar">✕</button>
                        )}
                        {c.etapa === 'reprovado' && (
                          <button onClick={() => moverEtapa(c.id, 'triagem')} style={s.btnMove} title="Reativar">↺</button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const s = {
  topBar:    { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  back:      { padding: '6px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151' },
  heading:   { margin: 0, fontSize: 22, fontWeight: 700, color: '#111', flex: 1 },
  btnPrimary:{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#1e293b', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  addCard:   { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 12 },
  row:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 },
  label:     { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, fontWeight: 500, color: '#374151' },
  input:     { padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' },
  error:     { margin: 0, color: '#dc2626', fontSize: 13 },
  kanban:    { display: 'flex', gap: 12, overflowX: 'auto', alignItems: 'flex-start', paddingBottom: 16 },
  col:       { minWidth: 180, flex: '0 0 180px', background: '#fff', borderRadius: 10, padding: '12px 10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  colHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  colTitle:  { fontSize: 13, fontWeight: 600, color: '#374151' },
  badge:     { minWidth: 22, height: 22, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', padding: '0 6px' },
  empty:     { fontSize: 12, color: '#ccc', textAlign: 'center', padding: '8px 0' },
  cardItem:  { background: '#f8fafc', borderRadius: 8, padding: '10px', marginBottom: 8, cursor: 'default' },
  cardName:  { fontSize: 13, fontWeight: 600, color: '#1e293b', cursor: 'pointer', marginBottom: 2 },
  cardSub:   { fontSize: 11, color: '#888', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cardBtns:  { display: 'flex', gap: 4 },
  btnMove:   { padding: '3px 8px', borderRadius: 4, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12, cursor: 'pointer' },
}
