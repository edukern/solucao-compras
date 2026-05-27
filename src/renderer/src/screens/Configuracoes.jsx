import { useState, useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'
import styles from './Configuracoes.module.css'
import { CLASSIFICACOES, gradesPorClassificacao } from '../constants/grades'
import { TIPOS_PRODUTO } from '../constants/tipoProduto'
import { colecoes as colecoesService } from '../services/colecoes'
import { segmentacoes as segmentacoesService } from '../services/segmentacoes'
import { compradores as compradoresService } from '../services/compradores'
import { fornecedores as fornecedoresService } from '../services/fornecedores'

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
      const lista = await colecoesService.list()
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
      await colecoesService.create({ nome: nome.trim(), estacao, ano: Number(ano) })
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
      await colecoesService.setStatus(id, novoStatus)
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
  const [savingEdit, setSavingEdit] = useState(false)
  const [erro, setErro] = useState(null)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ tipo_produto: '', classe: 'MASC', tipo_grade: '', estacao: 'verao' })

  function makeDefaultForm(classificacao = 'AD') {
    const grades = gradesPorClassificacao(classificacao)
    return {
      classificacao,
      tipo_produto: '',
      classe: 'MASC',
      tipo_grade: grades[0]?.tipo_grade ?? classificacao,
      estacao: 'verao',
    }
  }

  const [form, setForm] = useState(() => makeDefaultForm())
  const gradesDisponiveis = gradesPorClassificacao(form.classificacao)

  async function carregar() {
    setLoading(true)
    try {
      const lista = await segmentacoesService.list()
      setSegmentacoes(lista)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  function handleChange(field, value) {
    if (field === 'classificacao') {
      const grades = gradesPorClassificacao(value)
      setForm(prev => ({ ...prev, classificacao: value, tipo_grade: grades[0]?.tipo_grade ?? value }))
    } else {
      setForm(prev => ({ ...prev, [field]: value }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const tipoProdutoNorm = form.tipo_produto.trim().toUpperCase()
    if (!TIPOS_PRODUTO.includes(tipoProdutoNorm)) {
      setErro('Selecione um tipo de produto válido da lista.')
      return
    }
    setErro(null)
    setSaving(true)
    try {
      await segmentacoesService.create({ ...form, tipo_produto: tipoProdutoNorm })
      setForm(makeDefaultForm(form.classificacao))
      await carregar()
    } finally {
      setSaving(false)
    }
  }

  async function handleRemover(id) {
    setErro(null)
    try {
      await segmentacoesService.remove(id)
      setSegmentacoes(prev => prev.filter(s => s.id !== id))
    } catch {
      setErro('Erro ao remover segmentação.')
    }
  }

  function handleStartEdit(s) {
    setEditId(s.id)
    setEditForm({ tipo_produto: s.tipo_produto, classe: s.classe, tipo_grade: s.tipo_grade, estacao: s.estacao })
  }

  async function handleSaveEdit(id) {
    setErro(null)
    setSavingEdit(true)
    try {
      await segmentacoesService.update(id, editForm)
      setEditId(null)
      await carregar()
    } catch {
      setErro('Erro ao salvar edição.')
    } finally {
      setSavingEdit(false)
    }
  }

  const agrupado = CLASSIFICACOES.reduce((acc, g) => {
    acc[g] = segmentacoes.filter(s => s.classificacao === g)
    return acc
  }, {})

  // Segmentações com classificação fora das 12 opções (dados legados)
  const legados = segmentacoes.filter(s => !CLASSIFICACOES.includes(s.classificacao))

  return (
    <div className={styles.section}>
      {erro && <div className={styles.erro}>{erro}</div>}
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.sectionTitle}>Nova Segmentação</h2>
        <datalist id="tipos-produto">
          {TIPOS_PRODUTO.map(t => <option key={t} value={t} />)}
        </datalist>
        <div className={styles.formRow}>
          <div className={styles.field}>
            <label className={styles.label}>Classificação</label>
            <select className={styles.select} value={form.classificacao} onChange={e => handleChange('classificacao', e.target.value)}>
              {CLASSIFICACOES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Tipo de Produto</label>
            <input
              className={styles.input}
              type="text"
              list="tipos-produto"
              value={form.tipo_produto}
              onChange={e => handleChange('tipo_produto', e.target.value)}
              placeholder="Digite ou selecione…"
              autoComplete="off"
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
          {gradesDisponiveis.length > 1 && (
            <div className={styles.field}>
              <label className={styles.label}>Tipo de Grade</label>
              <select className={styles.select} value={form.tipo_grade} onChange={e => handleChange('tipo_grade', e.target.value)}>
                {gradesDisponiveis.map(g => (
                  <option key={g.tipo_grade} value={g.tipo_grade}>
                    {g.tipo_grade} ({g.tamanhos.join(', ')})
                  </option>
                ))}
              </select>
            </div>
          )}
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
        ) : segmentacoes.length === 0 ? (
          <p className={styles.muted}>Nenhuma segmentação cadastrada.</p>
        ) : (
          <>
            {CLASSIFICACOES.map(g => agrupado[g].length > 0 && (
              <div key={g} className={styles.grupo}>
                <h3 className={styles.grupoTitle}>{g}</h3>
                <div className={styles.list}>
                  {agrupado[g].map(s => (
                    <div key={s.id} className={styles.listItem}>
                      {editId === s.id ? (
                        <div className={styles.inlineEdit}>
                          <datalist id="tipos-produto-edit">
                            {TIPOS_PRODUTO.map(t => <option key={t} value={t} />)}
                          </datalist>
                          <span className={styles.listItemLabel} style={{fontWeight:'bold',marginBottom:4}}>{s.classificacao}</span>
                          <div className={styles.formRow}>
                            <div className={styles.field}>
                              <label className={styles.label}>Tipo de Produto</label>
                              <input className={styles.input} type="text" list="tipos-produto-edit" autoComplete="off"
                                value={editForm.tipo_produto}
                                onChange={e => setEditForm(prev => ({ ...prev, tipo_produto: e.target.value }))} />
                            </div>
                            <div className={styles.field}>
                              <label className={styles.label}>Classe</label>
                              <select className={styles.select} value={editForm.classe}
                                onChange={e => setEditForm(prev => ({ ...prev, classe: e.target.value }))}>
                                <option value="MASC">MASC</option>
                                <option value="FEM">FEM</option>
                                <option value="UNI">UNI</option>
                              </select>
                            </div>
                            {gradesPorClassificacao(s.classificacao).length > 1 && (
                              <div className={styles.field}>
                                <label className={styles.label}>Tipo de Grade</label>
                                <select className={styles.select} value={editForm.tipo_grade}
                                  onChange={e => setEditForm(prev => ({ ...prev, tipo_grade: e.target.value }))}>
                                  {gradesPorClassificacao(s.classificacao).map(g => (
                                    <option key={g.tipo_grade} value={g.tipo_grade}>{g.tipo_grade} ({g.tamanhos.join(', ')})</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            <div className={styles.field}>
                              <label className={styles.label}>Estação</label>
                              <select className={styles.select} value={editForm.estacao}
                                onChange={e => setEditForm(prev => ({ ...prev, estacao: e.target.value }))}>
                                <option value="verao">Verão</option>
                                <option value="inverno">Inverno</option>
                              </select>
                            </div>
                          </div>
                          <div className={styles.listItemActions}>
                            <button className={styles.btnPrimary} onClick={() => handleSaveEdit(s.id)} disabled={savingEdit}>
                              {savingEdit ? 'Salvando…' : 'Salvar'}
                            </button>
                            <button className={styles.btnSecondary} onClick={() => setEditId(null)} disabled={savingEdit}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className={styles.listItemLabel}>
                            {s.tipo_produto} — {s.classe} — {s.tipo_grade} — {s.estacao === 'verao' ? 'Verão' : 'Inverno'}
                          </span>
                          <div className={styles.listItemActions}>
                            <button className={styles.btnSecondary} onClick={() => handleStartEdit(s)} disabled={editId !== null}>
                              Editar
                            </button>
                            <button className={styles.btnDanger} onClick={() => handleRemover(s.id)} disabled={editId !== null}>
                              Remover
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {legados.length > 0 && (
              <div className={styles.grupo}>
                <h3 className={styles.grupoTitle}>Outros (legado)</h3>
                <div className={styles.list}>
                  {legados.map(s => (
                    <div key={s.id} className={styles.listItem}>
                      <span className={styles.listItemLabel}>
                        [{s.classificacao}] {s.tipo_produto} — {s.classe} — {s.tipo_grade}
                      </span>
                      <div className={styles.listItemActions}>
                        <button className={styles.btnDanger} onClick={() => handleRemover(s.id)}>
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
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
      const lista = await compradoresService.list()
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
      await compradoresService.create(novoForm)
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
      await compradoresService.update(id, editForm)
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
      await compradoresService.remove(id)
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
  const hasBackup = !!window.api?.backup

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
        {hasBackup ? (
          <>
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
          </>
        ) : (
          <p className={styles.hint}>
            Backup disponível apenas no app instalado. Os dados ficam armazenados na nuvem (Supabase).
          </p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AbaFornecedores
// ---------------------------------------------------------------------------
function AbaFornecedores() {
  const [fornecedores, setFornecedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(null)
  const [busca, setBusca] = useState('')
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ nome: '', contato: '', categoria: '' })
  const [novoForm, setNovoForm] = useState({ nome: '', contato: '', categoria: '' })
  const [savingEdit, setSavingEdit] = useState(false)
  const fileInputRef = useRef(null)

  async function carregar() {
    setLoading(true)
    try {
      const lista = await fornecedoresService.list()
      setFornecedores(lista)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function handleImportar() {
    setErro(null)
    setSucesso(null)
    if (window.api?.dialog) {
      const filePath = await window.api.dialog.openFile({
        title: 'Selecione o arquivo do ERP',
        filters: [{ name: 'Excel', extensions: ['xlsx', 'xls'] }],
        properties: ['openFile']
      })
      if (!filePath) return
      setImporting(true)
      try {
        const result = await window.api.fornecedores.importarArquivo(filePath)
        setFornecedores(result.fornecedores)
        setSucesso(`${result.inserted} fornecedores importados, ${result.skipped} já existiam.`)
      } catch (e) {
        setErro('Erro ao importar arquivo.')
      } finally {
        setImporting(false)
      }
    } else {
      fileInputRef.current?.click()
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setErro(null)
    setSucesso(null)
    try {
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws)
      const parsed = rows.map(r => ({
        nome: String(r.nome ?? r.Nome ?? '').trim(),
        contato: String(r.contato ?? r.Contato ?? '').trim(),
        categoria: String(r.categoria ?? r.Categoria ?? '').trim(),
      })).filter(r => r.nome)
      const data = await fornecedoresService.importarDados(parsed)
      await carregar()
      setSucesso(`${data.length} fornecedores importados/atualizados.`)
    } catch (e) {
      setErro('Erro ao importar arquivo.')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  async function handleCriar(e) {
    e.preventDefault()
    if (!novoForm.nome.trim()) return
    setErro(null)
    setSucesso(null)
    setSaving(true)
    try {
      await fornecedoresService.create({ nome: novoForm.nome.trim(), contato: novoForm.contato.trim(), categoria: novoForm.categoria.trim() })
      setNovoForm({ nome: '', contato: '', categoria: '' })
      await carregar()
    } catch (e) {
      setErro('Erro ao adicionar fornecedor.')
    } finally {
      setSaving(false)
    }
  }

  function handleStartEdit(f) {
    setEditId(f.id)
    setEditForm({ nome: f.nome, contato: f.contato || '', categoria: f.categoria || '' })
  }

  function handleCancelEdit() {
    setEditId(null)
    setEditForm({ nome: '', contato: '', categoria: '' })
  }

  async function handleSaveEdit(id) {
    setErro(null)
    setSavingEdit(true)
    try {
      await fornecedoresService.update(id, { nome: editForm.nome.trim(), contato: editForm.contato.trim(), categoria: editForm.categoria.trim() })
      setEditId(null)
      setSucesso(null)
      await carregar()
    } catch (e) {
      setErro('Erro ao salvar fornecedor.')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleRemover(id) {
    setErro(null)
    setSucesso(null)
    try {
      await fornecedoresService.remove(id)
      setFornecedores(prev => prev.filter(f => f.id !== id))
    } catch (e) {
      setErro('Erro ao remover fornecedor.')
    }
  }

  const filtrados = busca.trim()
    ? fornecedores.filter(f => f.nome.toLowerCase().includes(busca.toLowerCase()))
    : fornecedores

  return (
    <div className={styles.section}>
      {erro && <div className={styles.erro}>{erro}</div>}
      {sucesso && <div className={styles.sucesso}>{sucesso}</div>}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className={styles.listSection}>
        <div className={styles.listHeader}>
          <h2 className={styles.sectionTitle}>Fornecedores ({fornecedores.length})</h2>
          <button
            className={styles.btnPrimary}
            onClick={handleImportar}
            disabled={importing}
          >
            {importing ? 'Importando…' : 'Importar do ERP'}
          </button>
        </div>
        <input
          className={styles.input}
          type="text"
          placeholder="Buscar por nome…"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        {loading ? (
          <p className={styles.muted}>Carregando…</p>
        ) : filtrados.length === 0 ? (
          <p className={styles.muted}>{busca ? 'Nenhum fornecedor encontrado.' : 'Nenhum fornecedor cadastrado.'}</p>
        ) : (
          <div className={styles.list}>
            {filtrados.map(f => (
              <div key={f.id} className={styles.listItem}>
                {editId === f.id ? (
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
                        <label className={styles.label}>Contato</label>
                        <input
                          className={styles.input}
                          type="text"
                          value={editForm.contato}
                          onChange={e => setEditForm(prev => ({ ...prev, contato: e.target.value }))}
                          placeholder="Tel ou e-mail"
                        />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.label}>Categoria</label>
                        <input
                          className={styles.input}
                          type="text"
                          value={editForm.categoria}
                          onChange={e => setEditForm(prev => ({ ...prev, categoria: e.target.value }))}
                          placeholder="Ex: CONFECCOES"
                        />
                      </div>
                    </div>
                    <div className={styles.inlineActions}>
                      <button className={styles.btnPrimary} onClick={() => handleSaveEdit(f.id)} disabled={savingEdit}>
                        {savingEdit ? 'Salvando…' : 'Salvar'}
                      </button>
                      <button className={styles.btnSecondary} onClick={handleCancelEdit}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.listItemLabel}>
                      <span className={styles.listItemName}>{f.nome}</span>
                      <span className={styles.listItemSub}>
                        {[f.contato, f.categoria].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                    <div className={styles.listItemActions}>
                      <button className={styles.btnSecondary} onClick={() => handleStartEdit(f)} disabled={editId !== null}>Editar</button>
                      <button className={styles.btnDanger} onClick={() => handleRemover(f.id)} disabled={editId !== null}>Remover</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <form className={styles.form} onSubmit={handleCriar}>
        <h2 className={styles.sectionTitle}>Novo Fornecedor</h2>
        <div className={styles.formRow}>
          <div className={styles.field}>
            <label className={styles.label}>Nome</label>
            <input
              className={styles.input}
              type="text"
              value={novoForm.nome}
              onChange={e => setNovoForm(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Nome do fornecedor"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Contato</label>
            <input
              className={styles.input}
              type="text"
              value={novoForm.contato}
              onChange={e => setNovoForm(prev => ({ ...prev, contato: e.target.value }))}
              placeholder="Tel ou e-mail"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Categoria</label>
            <input
              className={styles.input}
              type="text"
              value={novoForm.categoria}
              onChange={e => setNovoForm(prev => ({ ...prev, categoria: e.target.value }))}
              placeholder="Ex: CONFECCOES"
            />
          </div>
        </div>
        <button className={styles.btnPrimary} type="submit" disabled={saving}>
          {saving ? 'Salvando…' : 'Adicionar Fornecedor'}
        </button>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AbaAtualizacoes
// ---------------------------------------------------------------------------
function AbaAtualizacoes() {
  const [versao, setVersao] = useState(null)
  const [status, setStatus] = useState(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    window.api?.app?.version().then(setVersao)
    if (!window.api?.updater) return
    return window.api.updater.onStatus(s => {
      setChecking(false)
      setStatus(s)
    })
  }, [])

  function handleCheck() {
    setChecking(true)
    setStatus(null)
    window.api.updater.check()
    // Se em 10s não chegar nenhum evento, o app está na versão mais recente
    setTimeout(() => setChecking(prev => {
      if (prev) setStatus({ type: 'upToDate' })
      return false
    }), 10000)
  }

  const statusMsg = {
    upToDate:    'Você está na versão mais recente.',
    available:   s => `Versão ${s.version} disponível — baixando em segundo plano…`,
    downloading: s => `Baixando… ${s.percent}%`,
    ready:       'Atualização baixada e pronta para instalar.',
    error:       s => `Erro: ${s.message}`,
  }

  function renderStatus() {
    if (!status) return null
    const color = status.type === 'ready' || status.type === 'upToDate'
      ? 'var(--green)'
      : status.type === 'error' ? 'var(--red, #ef4444)' : 'var(--accent)'
    const msg = typeof statusMsg[status.type] === 'function'
      ? statusMsg[status.type](status)
      : statusMsg[status.type] ?? status.type
    return <p style={{ color, marginTop: '0.75rem', fontSize: '0.875rem' }}>{msg}</p>
  }

  return (
    <div className={styles.section}>
      <div className={styles.backupCard}>
        <h2 className={styles.sectionTitle}>Versão do aplicativo</h2>
        {versao && (
          <p className={styles.hint}>
            Versão instalada: <strong>{versao}</strong>
          </p>
        )}
        <p className={styles.hint}>
          Atualizações são baixadas automaticamente em segundo plano quando o app está aberto.
          Use o botão abaixo para checar agora.
        </p>
        <div className={styles.backupActions}>
          <button
            className={styles.btnPrimary}
            onClick={handleCheck}
            disabled={checking || !window.api?.updater}
          >
            {checking ? 'Verificando…' : 'Verificar atualizações'}
          </button>
          {status?.type === 'ready' && (
            <button className={styles.btnPrimary} onClick={() => window.api.updater.install()}>
              Reiniciar e instalar
            </button>
          )}
        </div>
        {renderStatus()}
        {!window.api?.updater && (
          <p className={styles.hint} style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            (Verificação de atualizações disponível apenas no app instalado.)
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
          className={aba === 'fornecedores' ? styles.tabActive : styles.tab}
          onClick={() => setAba('fornecedores')}
        >
          Fornecedores
        </button>
        <button
          className={aba === 'backup' ? styles.tabActive : styles.tab}
          onClick={() => setAba('backup')}
        >
          Backup
        </button>
        <button
          className={aba === 'atualizacoes' ? styles.tabActive : styles.tab}
          onClick={() => setAba('atualizacoes')}
        >
          Atualizações
        </button>
      </div>
      {aba === 'colecoes'     && <AbaColecoes />}
      {aba === 'segmentacoes' && <AbaSegmentacoes />}
      {aba === 'compradores'  && <AbaCompradores />}
      {aba === 'fornecedores' && <AbaFornecedores />}
      {aba === 'backup'       && <AbaBackup />}
      {aba === 'atualizacoes' && <AbaAtualizacoes />}
    </div>
  )
}
