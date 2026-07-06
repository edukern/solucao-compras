import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import ConfirmModal from '../components/ConfirmModal'
import styles from './Compras.module.css'
import { sessoes as sessoesService } from '../services/sessoes'
import { pedidos as pedidosService } from '../services/pedidos'
import { fmtDate } from '../lib/format'
import { salvarPDFVisita } from '../lib/pdfHelpers'

export function HistoricoSessoes({ colId, onNovaSessao, onVisualizar, onPreencherLoja, onRetomarSessao = null, retomarLoading = null, refreshKey = 0, onMarkup = null }) {
  const { comprador } = useAuth()
  const [sessoesList,      setSessoesList]      = useState([])
  const [loading,          setLoading]          = useState(true)
  const [reimprimindo,     setReimprimindo]     = useState(null)
  const [editSessaoId,        setEditSessaoId]        = useState(null)
  const [editSessaoForm,      setEditSessaoForm]      = useState({})
  const [savingEditSessao,    setSavingEditSessao]    = useState(false)
  const [confirmDeleteSessao, setConfirmDeleteSessao] = useState(null)
  const [statsMap,            setStatsMap]            = useState({}) // { [sessao_id]: { pcs, valor, lojas } }
  const [openGearId,          setOpenGearId]          = useState(null)

  useEffect(() => {
    let cancelled = false
    sessoesService.list(colId).then(list => {
      if (cancelled) return
      setSessoesList(list)
      setLoading(false)
      // Load aggregate stats for all sessions in one background query
      const ids = list.map(s => s.id)
      if (!ids.length) return
      sessoesService.statsPorSessoes(ids).then(rows => {
        if (cancelled) return
        const map = {}
        for (const row of rows) {
          const sid = row.sessao_id
          if (!map[sid]) map[sid] = { pcs: 0, valor: 0, lojasSet: new Set() }
          let visitaHasData = false
          for (const ped of row.pedidos ?? []) {
            const qtd = (ped.pedido_itens ?? []).reduce((s, i) => s + (i.qtd || 0), 0)
            map[sid].pcs += qtd
            map[sid].valor += qtd * (ped.valor_unitario || 0)
            if (qtd > 0) visitaHasData = true
          }
          if (visitaHasData) map[sid].lojasSet.add(row.id)
        }
        const final = {}
        for (const [sid, stat] of Object.entries(map)) {
          final[sid] = { pcs: stat.pcs, valor: stat.valor, lojas: stat.lojasSet.size }
        }
        setStatsMap(final)
      })
    })
    return () => { cancelled = true }
  }, [colId, refreshKey])

  function handleStartEditSessao(ses) {
    setEditSessaoId(ses.id)
    setEditSessaoForm({
      data_visita:    ses.data_visita,
      data_entrega:   ses.data_entrega   ?? '',
      vendedor:       ses.vendedor       ?? '',
      cond_pag:       ses.cond_pag       ?? '',
      frete:          ses.frete          ?? '',
      transportadora: ses.transportadora ?? '',
      obs:            ses.obs            ?? '',
    })
  }

  async function handleSaveEditSessao(id) {
    setSavingEditSessao(true)
    try {
      const payload = {
        ...editSessaoForm,
        data_entrega: editSessaoForm.data_entrega || null,
        data_visita:  editSessaoForm.data_visita  || null,
      }
      const updated = await sessoesService.update(id, payload)
      setSessoesList(prev => prev.map(s => s.id === id ? { ...updated, visitas: s.visitas } : s))
      setEditSessaoId(null)
    } catch (e) {
      alert(`Erro ao salvar sessão: ${e.message}`)
    } finally {
      setSavingEditSessao(false)
    }
  }

  async function executarDeleteSessao() {
    const id = confirmDeleteSessao
    setConfirmDeleteSessao(null)
    await sessoesService.cancelar(id)
    setSessoesList(prev => prev.filter(s => s.id !== id))
  }

  async function handleReimprimir(ses, escopo = 'all') {
    setReimprimindo(ses.id)
    try {
      // Carrega pedidos de TODAS as visitas via itensPorFornecedor (inclui pedido_itens)
      const visitasComPedidos = await pedidosService.itensPorFornecedor(ses.id)
      const allPeds = Object.fromEntries(
        visitasComPedidos.map(v => [v.id, v.pedidos ?? []])
      )
      // 'mine' = só a loja do usuário logado; 'all' = todas as lojas do fornecedor
      const visitasBase = escopo === 'mine' && comprador
        ? (ses.visitas ?? []).filter(v => v.comprador_id === comprador.id)
        : (ses.visitas ?? [])
      const visitasForPDF = visitasBase.map(v => ({
        id:                 v.visita_id,
        comprador_nome:     v.comprador_nome,
        comprador_cnpj:     v.comprador_cnpj     ?? '',
        comprador_cidade:   v.comprador_cidade   ?? '',
        comprador_fantasia: v.comprador_fantasia ?? '',
        comprador_ie:       v.comprador_ie       ?? '',
        comprador_email:    v.comprador_email    ?? '',
        comprador_telefone: v.comprador_telefone ?? '',
        comprador_endereco: v.comprador_endereco ?? '',
      }))
      for (const vis of visitasForPDF) {
        const visPedidos = allPeds[vis.id] ?? []
        if (!visPedidos.length) continue
        await salvarPDFVisita(ses, vis, visPedidos)
      }
    } finally {
      setReimprimindo(null)
    }
  }

  return (
    <div className={styles.historico}>
      {(onNovaSessao || true) && (
        <div className={styles.sessoesHomeHeader}>
          <h2 className={styles.sessoesHomeTitle}>Sessões de compra</h2>
          {onNovaSessao && comprador?.is_editor && (
            <button className={styles.btnNovaSessao} onClick={onNovaSessao}>
              + Nova sessão
            </button>
          )}
        </div>
      )}

      {confirmDeleteSessao && (
        <ConfirmModal
          message="Excluir esta sessão inteira? Todos os pedidos serão removidos. Essa ação não pode ser desfeita."
          confirmLabel="Excluir sessão"
          danger
          onConfirm={executarDeleteSessao}
          onCancel={() => setConfirmDeleteSessao(null)}
        />
      )}

      {loading && <p className={styles.muted}>Carregando histórico…</p>}
      {sessoesList.length === 0 && !loading && (
        <p className={styles.muted}>Nenhuma sessão registrada nesta coleção.</p>
      )}

      {sessoesList.map(ses => {
        const fornNome = ses.fornecedor?.nome || ses.fornecedor_nome || '—'
        const stats = statsMap[ses.id]
        return (
        <div key={ses.id} className={styles.histSessao}>
          <div className={styles.histSessaoHeader}>
            <button
              className={styles.histSessaoToggle}
              onClick={() => setOpenGearId(openGearId === ses.id ? null : ses.id)}
            >
              <span className={styles.histSessaoMain}>
                <strong className={styles.histFornNome}>{fornNome}</strong>
                <span className={styles.histSessaoMeta}>
                  <span>{fmtDate(ses.data_visita)}</span>
                  {ses.fechada_em && <span className={styles.badgeFechada}>Fechada</span>}
                  {ses.vendedor && <><span className={styles.dot}>·</span><span>{ses.vendedor}</span></>}
                  {ses.cond_pag && <><span className={styles.dot}>·</span><span>{ses.cond_pag}</span></>}
                </span>
              </span>
              {stats && stats.pcs > 0 && (
                <span className={styles.histSessaoStats}>
                  <span>{stats.lojas} loja{stats.lojas !== 1 ? 's' : ''}</span>
                  <span className={styles.dot}>·</span>
                  <span>{stats.pcs} pç</span>
                  <span className={styles.dot}>·</span>
                  <strong>R$ {stats.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </span>
              )}
            </button>

            <div className={styles.histSessaoActions}>
              <button
                className={`${styles.histGearBtn} ${openGearId === ses.id ? 'open' : ''}`}
                onClick={() => setOpenGearId(openGearId === ses.id ? null : ses.id)}
                title="Ações desta sessão"
              ><span aria-hidden="true">⚙</span> Opções</button>
            </div>
          </div>

          {openGearId === ses.id && (() => {
            const minhaVisita = comprador
              ? (ses.visitas ?? []).find(v => v.comprador_id === comprador.id)
              : null
            return (
              <div className={styles.histGearPanel}>
                {minhaVisita && onPreencherLoja && (
                  <button
                    className={`${styles.btnHistAction} ${styles.btnHistPreencher}`}
                    onClick={() => { onPreencherLoja(ses.id, minhaVisita.visita_id, comprador.nome); setOpenGearId(null) }}
                  >Preencher</button>
                )}
                {onVisualizar && (
                  <button
                    className={styles.btnHistAction}
                    onClick={() => { onVisualizar(ses.id); setOpenGearId(null) }}
                  >Visualizar</button>
                )}
                {comprador?.is_editor && (
                  <button
                    className={`${styles.btnHistAction} ${styles.btnHistEdit}`}
                    onClick={() => { onRetomarSessao ? onRetomarSessao(ses) : handleStartEditSessao(ses); setOpenGearId(null) }}
                    disabled={onRetomarSessao ? retomarLoading === ses.id : editSessaoId !== null}
                  >{onRetomarSessao && retomarLoading === ses.id ? '…' : 'Retomar'}</button>
                )}
                {comprador?.is_editor && onMarkup && (
                  <button
                    className={`${styles.btnHistAction} ${styles.btnHistMarkup}`}
                    onClick={() => { onMarkup(ses); setOpenGearId(null) }}
                  >Markup</button>
                )}
                {minhaVisita && (
                  <button
                    className={styles.btnHistAction}
                    onClick={() => handleReimprimir(ses, 'mine')}
                    disabled={reimprimindo === ses.id}
                  >{reimprimindo === ses.id ? '…' : '🖨 Reimprimir minha loja'}</button>
                )}
                <button
                  className={styles.btnHistAction}
                  onClick={() => handleReimprimir(ses, 'all')}
                  disabled={reimprimindo === ses.id}
                >{reimprimindo === ses.id ? '…' : '🖨 Reimprimir todas as lojas'}</button>
                {comprador?.is_editor && (
                  <button
                    className={styles.histGearPanelDanger}
                    onClick={() => { setConfirmDeleteSessao(ses.id); setOpenGearId(null) }}
                  >Excluir sessão</button>
                )}
              </div>
            )
          })()}

          {editSessaoId === ses.id && (
            <div className={styles.histEditForm}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <span className={styles.label}>Data</span>
                  <input type="date" value={editSessaoForm.data_visita}
                    onChange={e => setEditSessaoForm(p => ({ ...p, data_visita: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Entrega</span>
                  <input type="date" value={editSessaoForm.data_entrega}
                    onChange={e => setEditSessaoForm(p => ({ ...p, data_entrega: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Vendedor</span>
                  <input type="text" value={editSessaoForm.vendedor}
                    onChange={e => setEditSessaoForm(p => ({ ...p, vendedor: e.target.value }))}
                    placeholder="Nome do vendedor" />
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Cond. pagamento</span>
                  <input type="text" value={editSessaoForm.cond_pag}
                    onChange={e => setEditSessaoForm(p => ({ ...p, cond_pag: e.target.value }))}
                    placeholder="Ex: 30/60 dias" />
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Frete</span>
                  <select value={editSessaoForm.frete}
                    onChange={e => setEditSessaoForm(p => ({ ...p, frete: e.target.value, transportadora: e.target.value !== 'FOB' ? '' : p.transportadora }))}>
                    <option value="">—</option>
                    <option value="CIF">CIF</option>
                    <option value="FOB">FOB</option>
                  </select>
                </div>
                {editSessaoForm.frete === 'FOB' && (
                  <div className={styles.field}>
                    <span className={styles.label}>Transportadora</span>
                    <input type="text" value={editSessaoForm.transportadora}
                      onChange={e => setEditSessaoForm(p => ({ ...p, transportadora: e.target.value }))}
                      placeholder="Nome da transportadora" />
                  </div>
                )}
                <div className={styles.field} style={{ minWidth: 200 }}>
                  <span className={styles.label}>Obs</span>
                  <input type="text" value={editSessaoForm.obs}
                    onChange={e => setEditSessaoForm(p => ({ ...p, obs: e.target.value }))}
                    placeholder="Observações" />
                </div>
              </div>
              <div className={styles.phaseActions} style={{ marginTop: '0.5rem' }}>
                <button className={styles.btnSecondary} onClick={() => setEditSessaoId(null)} disabled={savingEditSessao}>
                  Cancelar
                </button>
                <button className={styles.btnPrimary} onClick={() => handleSaveEditSessao(ses.id)} disabled={savingEditSessao}>
                  {savingEditSessao ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </div>
          )}

        </div>
        )
      })}
    </div>
  )
}
