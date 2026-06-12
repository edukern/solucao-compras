import { useState, useEffect } from 'react'

const STATUS_COLORS = { aberta: '#16a34a', pausada: '#d97706', encerrada: '#6b7280' }
const STATUS_LABELS = { aberta: 'Aberta', pausada: 'Pausada', encerrada: 'Encerrada' }

export default function Vagas({ navigate }) {
  const [vagas, setVagas]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ titulo: '', descricao: '', local: '', status: 'aberta' })
  const [saving, setSaving]       = useState(false)
  const [erro, setErro]           = useState('')
  const [editVaga, setEditVaga]   = useState(null)
  const [editForm, setEditForm]   = useState({})
  const [editSaving, setEditSaving] = useState(false)
  const [copiadoId, setCopiadoId] = useState(null)

  function load() {
    setLoading(true)
    fetch('/api/vagas').then(r => r.json()).then(data => {
      setVagas(Array.isArray(data) ? data : [])
    }).finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true); setErro('')
    const res = await fetch('/api/vagas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setErro(data.error || 'Erro ao criar.'); return }
    setShowForm(false)
    setForm({ titulo: '', descricao: '', local: '', status: 'aberta' })
    load()
  }

  async function handleEdit(e) {
    e.preventDefault()
    setEditSaving(true)
    await fetch('/api/vagas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editVaga.id, ...editForm }),
    })
    setEditSaving(false)
    setEditVaga(null)
    load()
  }

  async function patchStatus(id, status) {
    await fetch('/api/vagas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    load()
  }

  function copiarLink(vagaId) {
    const link = `${window.location.origin}/candidatura/${vagaId}`
    navigator.clipboard.writeText(link).then(() => {
      setCopiadoId(vagaId)
      setTimeout(() => setCopiadoId(null), 2000)
    })
  }

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.heading}>Vagas</h1>
        <button onClick={() => setShowForm(v => !v)} style={s.btnPrimary}>
          {showForm ? 'Cancelar' : '+ Nova vaga'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={s.formCard}>
          <h2 style={s.formTitle}>Nova vaga</h2>
          <div style={s.row}>
            <label style={s.label}>
              Título *
              <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                style={s.input} required placeholder="Ex: Vendedor externo" />
            </label>
            <label style={s.label}>
              Local
              <input value={form.local} onChange={e => setForm(f => ({ ...f, local: e.target.value }))}
                style={s.input} placeholder="Ex: Nova Hartz" />
            </label>
          </div>
          <label style={s.label}>
            Descrição
            <textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              style={{ ...s.input, minHeight: 80, resize: 'vertical' }} placeholder="Requisitos, atividades…" />
          </label>
          {erro && <p style={s.error}>{erro}</p>}
          <button type="submit" disabled={saving} style={{ ...s.btnPrimary, alignSelf: 'flex-start' }}>
            {saving ? 'Salvando…' : 'Criar vaga'}
          </button>
        </form>
      )}

      {editVaga && (
        <form onSubmit={handleEdit} style={s.formCard}>
          <h2 style={s.formTitle}>Editar vaga</h2>
          <div style={s.row}>
            <label style={s.label}>
              Título *
              <input value={editForm.titulo} onChange={e => setEditForm(f => ({ ...f, titulo: e.target.value }))}
                style={s.input} required />
            </label>
            <label style={s.label}>
              Local
              <input value={editForm.local} onChange={e => setEditForm(f => ({ ...f, local: e.target.value }))}
                style={s.input} />
            </label>
          </div>
          <label style={s.label}>
            Descrição
            <textarea value={editForm.descricao} onChange={e => setEditForm(f => ({ ...f, descricao: e.target.value }))}
              style={{ ...s.input, minHeight: 80, resize: 'vertical' }} />
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={editSaving} style={{ ...s.btnPrimary, alignSelf: 'flex-start' }}>
              {editSaving ? 'Salvando…' : 'Salvar'}
            </button>
            <button type="button" onClick={() => setEditVaga(null)} style={s.btnSm}>Cancelar</button>
          </div>
        </form>
      )}

      {loading ? (
        <p style={{ color: '#666', fontSize: 14 }}>Carregando…</p>
      ) : vagas.length === 0 ? (
        <p style={{ color: '#888', fontSize: 14 }}>Nenhuma vaga cadastrada.</p>
      ) : (
        <div style={s.list}>
          {vagas.map(v => {
            const count = v.candidaturas?.[0]?.count ?? null
            return (
              <div key={v.id} style={s.card}>
                <div style={s.cardMain} onClick={() => navigate('vaga-detalhe', { vagaId: v.id, vagaTitulo: v.titulo })}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ ...s.badge, background: STATUS_COLORS[v.status] + '22', color: STATUS_COLORS[v.status] }}>
                      {STATUS_LABELS[v.status]}
                    </span>
                    {v.local && <span style={s.meta}>📍 {v.local}</span>}
                    {count !== null && (
                      <span style={s.meta}>{count} candidato{count !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                  <div style={s.vagaTitulo}>{v.titulo}</div>
                  {v.descricao && <div style={s.vagaDesc}>{v.descricao.slice(0, 120)}{v.descricao.length > 120 ? '…' : ''}</div>}
                </div>
                <div style={s.cardActions}>
                  <button
                    onClick={e => { e.stopPropagation(); copiarLink(v.id) }}
                    style={s.btnSm}
                    title={`${window.location.origin}/candidatura/${v.id}`}
                  >
                    {copiadoId === v.id ? '✓ Copiado' : '🔗 Link'}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setEditVaga(v); setEditForm({ titulo: v.titulo, descricao: v.descricao || '', local: v.local || '' }) }}
                    style={s.btnSm}
                  >
                    Editar
                  </button>
                  {v.status !== 'encerrada' ? (
                    <>
                      <button
                        onClick={e => { e.stopPropagation(); patchStatus(v.id, v.status === 'aberta' ? 'pausada' : 'aberta') }}
                        style={s.btnSm}
                      >
                        {v.status === 'aberta' ? 'Pausar' : 'Reabrir'}
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); patchStatus(v.id, 'encerrada') }}
                        style={{ ...s.btnSm, color: '#dc2626' }}
                      >
                        Encerrar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); patchStatus(v.id, 'aberta') }}
                      style={s.btnSm}
                    >
                      Reabrir
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const s = {
  header:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  heading:     { margin: 0, fontSize: 24, fontWeight: 700, color: '#111' },
  btnPrimary:  { padding: '9px 18px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  btnSm:       { padding: '6px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#444', whiteSpace: 'nowrap' },
  formCard:    { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 4px 24px rgba(0,0,0,.08)', display: 'flex', flexDirection: 'column', gap: 16 },
  formTitle:   { margin: 0, fontSize: 16, fontWeight: 600, color: '#111' },
  row:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  label:       { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#444' },
  input:       { padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  error:       { margin: 0, color: '#dc2626', fontSize: 13 },
  list:        { display: 'flex', flexDirection: 'column', gap: 12 },
  card:        { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
  cardMain:    { flex: 1, cursor: 'pointer', minWidth: 0 },
  cardActions: { display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'flex-start' },
  badge:       { padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' },
  meta:        { fontSize: 12, color: '#888' },
  vagaTitulo:  { fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 4 },
  vagaDesc:    { fontSize: 13, color: '#666' },
}
