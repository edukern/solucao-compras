import { useState, useEffect } from 'react'
import styles from './Configuracoes.module.css'

// Bonus fix #4: module-level constant
const anoAtual = new Date().getFullYear()

// ---------------------------------------------------------------------------
// AbaColecoes
// ---------------------------------------------------------------------------
function AbaColecoes() {
  const [colecoes, setColecoes] = useState([])
  const [nome, setNome] = useState('')
  const [estacao, setEstacao] = useState('verao')
  const [ano, setAno] = useState(anoAtual)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)

  async function carregar() {
    setLoading(true)
    try {
      const lista = await window.api.colecoes.list()
      setColecoes(lista)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim()) return
    setSaving(true)
    try {
      await window.api.colecoes.create({ nome: nome.trim(), estacao, ano: Number(ano) })
      setNome('')
      setEstacao('verao')
      setAno(anoAtual)
      await carregar()
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(id, novoStatus) {
    setErro(null)
    try {
      await window.api.colecoes.setStatus(id, novoStatus)
      setColecoes(prev => prev.map(c => c.id === id ? { ...c, status: novoStatus } : c))
    } catch (e) {
      setErro('Erro ao atualizar status da coleção.')
    }
  }

  const statusLabels = {
    planejamento: 'Planejamento',
    em_compra: 'Em compra',
    finalizada: 'Finalizada',
  }

  const statusColors = {
    planejamento: styles.badgePlanning,
    em_compra: styles.badgeActive,
    finalizada: styles.badgeDone,
  }

  return (
    <div className={styles.section}>
      {erro && <div className={styles.erro}>{erro}</div>}
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.sectionTitle}>Nova Coleção</h2>
        <div className={styles.formRow}>
          <div className={styles.field}>
            <label className={styles.label}>Nome</label>
            <input
              className={styles.input}
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Verão 2026"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Ano</label>
            <input
              className={styles.input}
              type="number"
              value={ano}
              onChange={e => setAno(e.target.value)}
              min="2000"
              max="2099"
              required
            />
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Estação</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="verao"
                checked={estacao === 'verao'}
                onChange={() => setEstacao('verao')}
              />
              Verão
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="inverno"
                checked={estacao === 'inverno'}
                onChange={() => setEstacao('inverno')}
              />
              Inverno
            </label>
          </div>
        </div>
        <button className={styles.btnPrimary} type="submit" disabled={saving}>
          {saving ? 'Salvando…' : 'Adicionar Coleção'}
        </button>
      </form>

      <div className={styles.listSection}>
        <h2 className={styles.sectionTitle}>Coleções Cadastradas</h2>
        {loading ? (
          <p className={styles.muted}>Carregando…</p>
        ) : colecoes.length === 0 ? (
          <p className={styles.muted}>Nenhuma coleção cadastrada.</p>
        ) : (
          <div className={styles.list}>
            {colecoes.map(c => (
              <div key={c.id} className={styles.listItem}>
                <div className={styles.listItemLabel}>
                  <span className={styles.listItemName}>{c.nome}</span>
                  <span className={styles.listItemSub}>
                    {c.estacao === 'verao' ? 'Verão' : 'Inverno'} · {c.ano}
                  </span>
                </div>
                <div className={styles.listItemActions}>
                  <span className={`${styles.badge} ${statusColors[c.status] || ''}`}>
                    {statusLabels[c.status] || c.status}
                  </span>
                  <select
                    className={styles.statusSelect}
                    value={c.status}
                    onChange={e => handleStatusChange(c.id, e.target.value)}
                  >
                    <option value="planejamento">Planejamento</option>
                    <option value="em_compra">Em compra</option>
                    <option value="finalizada">Finalizada</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AbaSegmentacoes
// ---------------------------------------------------------------------------
function AbaSegmentacoes() {
  const [segmentacoes, setSegmentacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState(null)
  const [form, setForm] = useState({
    classificacao: 'AD',
    tipo_produto: '',
    classe: 'MASC',
    tipo_grade: 'AD',
    estacao: 'verao',
  })

  async function carregar() {
    setLoading(true)
    try {
      const lista = await window.api.segmentacoes.list()
      setSegmentacoes(lista)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.tipo_produto.trim()) return
    setSaving(true)
    try {
      await window.api.segmentacoes.create({ ...form, tipo_produto: form.tipo_produto.trim().toUpperCase() })
      setForm({ classificacao: 'AD', tipo_produto: '', classe: 'MASC', tipo_grade: 'AD', estacao: 'verao' })
      await carregar()
    } finally {
      setSaving(false)
    }
  }

  async function handleRemover(id) {
    setErro(null)
    try {
      await window.api.segmentacoes.remove(id)
      setSegmentacoes(prev => prev.filter(s => s.id !== id))
    } catch (e) {
      setErro('Erro ao remover segmentação.')
    }
  }

  // Group by classificacao
  const grupos = ['AD', 'EX', 'INF']
  const agrupado = grupos.reduce((acc, g) => {
    acc[g] = segmentacoes.filter(s => s.classificacao === g)
    return acc
  }, {})

  return (
    <div className={styles.section}>
      {erro && <div className={styles.erro}>{erro}</div>}
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.sectionTitle}>Nova Segmentação</h2>
        <div className={styles.formRow}>
          <div className={styles.field}>
            <label className={styles.label}>Classificação</label>
            <select className={styles.select} value={form.classificacao} onChange={e => handleChange('classificacao', e.target.value)}>
              <option value="AD">AD</option>
              <option value="EX">EX</option>
              <option value="INF">INF</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Tipo de Produto</label>
            <input
              className={styles.input}
              type="text"
              value={form.tipo_produto}
              onChange={e => handleChange('tipo_produto', e.target.value)}
              placeholder="Ex: CALCA, CAMISETA"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Classe</label>
            <select className={styles.select} value={form.classe} onChange={e => handleChange('classe', e.target.value)}>
              <option value="MASC">MASC</option>
              <option value="FEM">FEM</option>
              <option value="UNI">UNI</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Tipo Grade</label>
            <select className={styles.select} value={form.tipo_grade} onChange={e => handleChange('tipo_grade', e.target.value)}>
              <option value="AD">AD</option>
              <option value="EX">EX</option>
              <option value="INF">INF</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Estação</label>
            <select className={styles.select} value={form.estacao} onChange={e => handleChange('estacao', e.target.value)}>
              <option value="verao">Verão</option>
              <option value="inverno">Inverno</option>
            </select>
          </div>
        </div>
        <button className={styles.btnPrimary} type="submit" disabled={saving}>
          {saving ? 'Salvando…' : 'Adicionar Segmentação'}
        </button>
      </form>

      <div className={styles.listSection}>
        <h2 className={styles.sectionTitle}>Segmentações Cadastradas</h2>
        {loading ? (
          <p className={styles.muted}>Carregando…</p>
        ) : (
          grupos.map(g => (
            agrupado[g].length > 0 && (
              <div key={g} className={styles.grupo}>
                <h3 className={styles.grupoTitle}>{g}</h3>
                <div className={styles.list}>
                  {agrupado[g].map(s => (
                    <div key={s.id} className={styles.listItem}>
                      <span className={styles.listItemLabel}>
                        {s.tipo_produto} — {s.classe} — {s.tipo_grade} — {s.estacao === 'verao' ? 'Verão' : 'Inverno'}
                      </span>
                      <div className={styles.listItemActions}>
                        <button
                          className={styles.btnDanger}
                          onClick={() => handleRemover(s.id)}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))
        )}
        {!loading && segmentacoes.length === 0 && (
          <p className={styles.muted}>Nenhuma segmentação cadastrada.</p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AbaCompradores
// ---------------------------------------------------------------------------
function AbaCompradores() {
  const [compradores, setCompradores] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingNovo, setSavingNovo] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [erro, setErro] = useState(null)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ nome: '', cnpj: '', cidade: '' })
  const [novoForm, setNovoForm] = useState({ nome: '', cnpj: '', cidade: '' })

  async function carregar() {
    setLoading(true)
    try {
      const lista = await window.api.compradores.list()
      setCompradores(lista)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function handleCriar(e) {
    e.preventDefault()
    if (!novoForm.nome.trim()) return
    setErro(null)
    setSavingNovo(true)
    try {
      await window.api.compradores.create(novoForm)
      setNovoForm({ nome: '', cnpj: '', cidade: '' })
      await carregar()
    } catch (e) {
      setErro('Erro ao adicionar comprador.')
    } finally {
      setSavingNovo(false)
    }
  }

  function handleStartEdit(c) {
    setEditId(c.id)
    setEditForm({ nome: c.nome, cnpj: c.cnpj || '', cidade: c.cidade || '' })
  }

  function handleCancelEdit() {
    setEditId(null)
    setEditForm({ nome: '', cnpj: '', cidade: '' })
  }

  async function handleSaveEdit(id) {
    setErro(null)
    setSavingEdit(true)
    try {
      await window.api.compradores.update(id, editForm)
      setEditId(null)
      await carregar()
    } catch (e) {
      setErro('Erro ao salvar comprador.')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleRemover(id) {
    setErro(null)
    try {
      await window.api.compradores.remove(id)
      setCompradores(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      setErro('Erro ao remover comprador.')
    }
  }

  return (
    <div className={styles.section}>
      {erro && <div className={styles.erro}>{erro}</div>}
      <div className={styles.listSection}>
        <h2 className={styles.sectionTitle}>Compradores Cadastrados</h2>
        {loading ? (
          <p className={styles.muted}>Carregando…</p>
        ) : compradores.length === 0 ? (
          <p className={styles.muted}>Nenhum comprador cadastrado.</p>
        ) : (
          <div className={styles.list}>
            {compradores.map(c => (
              <div key={c.id} className={styles.listItem}>
                {editId === c.id ? (
                  <div className={styles.inlineEdit}>
                    <div className={styles.formRow}>
                      <div className={styles.field}>
                        <label className={styles.label}>Nome</label>
                        <input
                          className={styles.input}
                          type="text"
                          value={editForm.nome}
                          onChange={e => setEditForm(prev => ({ ...prev, nome: e.target.value }))}
                          required
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>CNPJ</label>
                        <input
                          className={styles.input}
                          type="text"
                          value={editForm.cnpj}
                          onChange={e => setEditForm(prev => ({ ...prev, cnpj: e.target.value }))}
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>Cidade</label>
                        <input
                          className={styles.input}
                          type="text"
                          value={editForm.cidade}
                          onChange={e => setEditForm(prev => ({ ...prev, cidade: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className={styles.inlineActions}>
                      <button className={styles.btnPrimary} onClick={() => handleSaveEdit(c.id)} disabled={savingEdit}>
                        {savingEdit ? 'Salvando…' : 'Salvar'}
                      </button>
                      <button className={styles.btnSecondary} onClick={handleCancelEdit}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.listItemLabel}>
                      <span className={styles.listItemName}>{c.nome}</span>
                      <span className={styles.listItemSub}>
                        {[c.cnpj, c.cidade].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                    <div className={styles.listItemActions}>
                      <button
                        className={styles.btnSecondary}
                        onClick={() => handleStartEdit(c)}
                        disabled={editId !== null}
                      >
                        Editar
                      </button>
                      <button
                        className={styles.btnDanger}
                        onClick={() => handleRemover(c.id)}
                        disabled={editId !== null}
                      >
                        Remover
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <form className={styles.form} onSubmit={handleCriar}>
        <h2 className={styles.sectionTitle}>Novo Comprador</h2>
        <div className={styles.formRow}>
          <div className={styles.field}>
            <label className={styles.label}>Nome</label>
            <input
              className={styles.input}
              type="text"
              value={novoForm.nome}
              onChange={e => setNovoForm(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Nome do comprador"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>CNPJ</label>
            <input
              className={styles.input}
              type="text"
              value={novoForm.cnpj}
              onChange={e => setNovoForm(prev => ({ ...prev, cnpj: e.target.value }))}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Cidade</label>
            <input
              className={styles.input}
              type="text"
              value={novoForm.cidade}
              onChange={e => setNovoForm(prev => ({ ...prev, cidade: e.target.value }))}
              placeholder="Cidade"
            />
          </div>
        </div>
        <button className={styles.btnPrimary} type="submit" disabled={savingNovo}>
          {savingNovo ? 'Salvando…' : 'Adicionar Comprador'}
        </button>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AbaBackup
// ---------------------------------------------------------------------------
function AbaBackup() {
  const [status, setStatus] = useState(null)
  const [working, setWorking] = useState(false)

  async function handleExport() {
    setWorking(true)
    setStatus(null)
    try {
      const ok = await window.api.backup.export()
      setStatus(ok ? 'Backup exportado com sucesso.' : null)
    } catch {
      setStatus('Erro ao exportar backup. Tente novamente.')
    } finally {
      setWorking(false)
    }
  }

  async function handleImport() {
    if (!window.confirm('ATENÇÃO: Isso vai sobrescrever todos os dados atuais com o backup selecionado. Tem certeza?')) return
    setWorking(true)
    setStatus(null)
    try {
      await window.api.backup.import()
      // ok=false: usuário cancelou o dialog de arquivo
    } catch {
      setStatus('Erro ao restaurar backup.')
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.backupCard}>
        <h2 className={styles.sectionTitle}>Backup do banco de dados</h2>
        <p className={styles.hint}>
          Exporta ou restaura o arquivo <code>.db</code> com todos os dados do sistema.
        </p>
        <div className={styles.backupActions}>
          <button className={styles.btnPrimary} onClick={handleExport} disabled={working}>
            ↓ Exportar backup
          </button>
          <button className={styles.btnDanger} onClick={handleImport} disabled={working}>
            ↑ Restaurar backup
          </button>
        </div>
        {status && (
          <p className={status.startsWith('Erro') ? styles.backupError : styles.backupStatus}>
            {status}
          </p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Configuracoes screen
// ---------------------------------------------------------------------------
export default function Configuracoes() {
  const [aba, setAba] = useState('colecoes')

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Configurações</h1>
      <div className={styles.tabs}>
        <button
          className={aba === 'colecoes' ? styles.tabActive : styles.tab}
          onClick={() => setAba('colecoes')}
        >
          Coleções
        </button>
        <button
          className={aba === 'segmentacoes' ? styles.tabActive : styles.tab}
          onClick={() => setAba('segmentacoes')}
        >
          Segmentações
        </button>
        <button
          className={aba === 'compradores' ? styles.tabActive : styles.tab}
          onClick={() => setAba('compradores')}
        >
          Compradores
        </button>
        <button
          className={aba === 'backup' ? styles.tabActive : styles.tab}
          onClick={() => setAba('backup')}
        >
          Backup
        </button>
      </div>
      {aba === 'colecoes'     && <AbaColecoes />}
      {aba === 'segmentacoes' && <AbaSegmentacoes />}
      {aba === 'compradores'  && <AbaCompradores />}
      {aba === 'backup'       && <AbaBackup />}
    </div>
  )
}
