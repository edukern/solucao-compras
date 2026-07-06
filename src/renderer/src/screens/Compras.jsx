import { useState, useEffect } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import { useAuth } from '../contexts/AuthContext'
import ConfirmModal from '../components/ConfirmModal'
import { MarkupSessao } from './MarkupSessao'
import { HistoricoSessoes } from './HistoricoSessoes'
import { VisualizarSessao } from './VisualizarSessao'
import { PreencherMinhaLoja } from './PreencherMinhaLoja'
import { FecharSessao } from './FecharSessao'
import { RegistrarPedidoSessao } from './RegistrarPedidoSessao'
import { IniciarSessao } from './IniciarSessao'
import styles from './Compras.module.css'
import { sessoes as sessoesService } from '../services/sessoes'
import { pedidos as pedidosService } from '../services/pedidos'
import { segmentacoes as segmentacoesService } from '../services/segmentacoes'
import { fornecedores as fornecedoresService } from '../services/fornecedores'
import { compradores as compradoresService } from '../services/compradores'
import { appConfig as appConfigService } from '../services/appConfig'
import { fmtDate } from '../lib/format'

// ─── Orchestrator ─────────────────────────────────────────────────────────

export default function Compras() {
  const { active } = useCollection()
  const { comprador: currentComprador } = useAuth()
  const [segs,        setSegs]        = useState([])
  const [forns,       setForns]       = useState([])
  const [compradores, setCompradores] = useState([])
  // phases: 0=home, 1=nova sessão, 2=registrar, 3=fechar, 4=visualizar
  const [phase,           setPhase]           = useState(0)
  const [sessao,          setSessao]          = useState(null)
  const [visitas,         setVisitas]         = useState([])
  const [pedidosFechados, setPedidosFechados] = useState([])
  const [viewSessaoId,    setViewSessaoId]    = useState(null)
  const [preencherInfo,   setPreencherInfo]   = useState(null) // { sessaoId, visitaId, compradorNome }
  const [histRefreshKey,  setHistRefreshKey]  = useState(0)
  const [recoveryData,    setRecoveryData]    = useState([])
  const [recoveryInitial, setRecoveryInitial] = useState(null)
  const [retomarLoading,  setRetomarLoading]  = useState(null)
  const [sessaoCorDetalhe, setSessaoCorDetalhe] = useState(false)
  const [isOnline,        setIsOnline]        = useState(navigator.onLine)
  const [markupSessao,    setMarkupSessao]    = useState(null) // sessão aberta no modal de markup
  const [manutencao,      setManutencao]      = useState(null) // null | { manutencao, mensagem }

  // Polling leve da flag de manutenção (a cada 30s) — bloqueia gravação durante migração
  useEffect(() => {
    let alive = true
    const load = () => appConfigService.get().then(c => { if (alive) setManutencao(c) }).catch(() => {})
    load()
    const t = setInterval(load, 30000)
    return () => { alive = false; clearInterval(t) }
  }, [])

  useEffect(() => {
    const onOnline  = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      segmentacoesService.list(),
      fornecedoresService.listAtivos(),
      compradoresService.list(),
    ]).then(([s, f, c]) => { if (!cancelled) { setSegs(s); setForns(f); setCompradores(c) } })
    return () => { cancelled = true }
  }, [])

  // Verifica se há sessões interrompidas para recuperar (uma ou mais)
  useEffect(() => {
    if (!active?.id) return
    let cancelled = false
    // Migra chave legada SC_RECOVERY_<colId> para o novo formato por sessão
    const legacyKey = `SC_RECOVERY_${active.id}`
    const legacyRaw = localStorage.getItem(legacyKey)
    if (legacyRaw) {
      try {
        const legacyData = JSON.parse(legacyRaw)
        if (legacyData.sessao_id) {
          localStorage.setItem(`SC_RECOVERY_SESSAO_${legacyData.sessao_id}`, legacyRaw)
        }
      } catch {}
      localStorage.removeItem(legacyKey)
    }
    const keys = Object.keys(localStorage).filter(k => k.startsWith('SC_RECOVERY_SESSAO_'))
    if (!keys.length) { setRecoveryData([]); return }

    Promise.all(keys.map(async key => {
      try {
        const data = JSON.parse(localStorage.getItem(key))
        const sessaoDb = await sessoesService.byId(data.sessao_id)
        if (!sessaoDb) { localStorage.removeItem(key); return null }
        // Ignora sessões de outras coleções
        if (sessaoDb.colecao_id !== active.id) return null
        // Banco é a fonte da verdade. O buffer local só sobrevive se for estritamente mais
        // novo que o updated_at máximo do banco (crash antes do flush de 2s). Senão, descarta.
        const maxUpdated = await pedidosService.maxUpdatedAt(data.sessao_id)
        if (maxUpdated && (!data.savedAt || data.savedAt <= maxUpdated)) {
          localStorage.removeItem(key); return null
        }
        const visEnriquecidas = sessaoDb.visitas.map(v => ({
          id:                 v.visita_id,
          comprador_id:       v.comprador_id,
          comprador_nome:     v.comprador_nome,
          comprador_cnpj:     v.comprador_cnpj     ?? '',
          comprador_cidade:   v.comprador_cidade   ?? '',
          comprador_fantasia: v.comprador_fantasia ?? '',
          comprador_ie:       v.comprador_ie       ?? '',
          comprador_email:    v.comprador_email    ?? '',
          comprador_telefone: v.comprador_telefone ?? '',
          comprador_endereco: v.comprador_endereco ?? '',
        }))
        return { sessao: sessaoDb, visitas: visEnriquecidas, ...data }
      } catch {
        localStorage.removeItem(key)
        return null
      }
    })).then(results => {
      if (cancelled) return
      setRecoveryData(results.filter(Boolean))
    })
    return () => { cancelled = true }
  }, [active?.id])

  function handleStart(novaSessao, lojas, temCorDetalhe = false) {
    const visitasEnriquecidas = novaSessao.visitas.map(v => {
      const loja = lojas.find(l => l.id === v.comprador_id)
      return {
        id: v.visita_id,
        comprador_id:       v.comprador_id,
        comprador_nome:     loja?.nome     ?? `Loja #${v.comprador_id}`,
        comprador_cnpj:     loja?.cnpj     ?? '',
        comprador_cidade:   loja?.cidade   ?? '',
        comprador_fantasia: loja?.fantasia ?? '',
        comprador_ie:       loja?.ie       ?? '',
        comprador_email:    loja?.email    ?? '',
        comprador_telefone: loja?.telefone ?? '',
        comprador_endereco: loja?.endereco ?? '',
      }
    })
    // Ordenar visitas pela mesma ordem da tela de Configurações (compradores.ordem)
    const ordemIds = lojas.map(l => l.id)
    visitasEnriquecidas.sort((a, b) => ordemIds.indexOf(a.comprador_id) - ordemIds.indexOf(b.comprador_id))
    // Enrich with fornecedor name from the already-loaded forns list
    const forn = forns.find(f => f.id === novaSessao.fornecedor_id)
    const sessaoEnriquecida = { ...novaSessao, fornecedor_nome: forn?.nome || novaSessao.fornecedor_nome || '' }
    setSessao(sessaoEnriquecida)
    setVisitas(visitasEnriquecidas)
    setSessaoCorDetalhe(temCorDetalhe)
    setPhase(2)
  }

  function handleFechar(pedidos) {
    setPedidosFechados(pedidos)
    setPhase(3)
  }

  function handleRecover(entry) {
    const { sessao, visitas, items, qtds, activeId, lojaIdx } = entry
    setSessao(sessao)
    setVisitas(visitas)
    setRecoveryInitial({ items: items ?? [], qtds: qtds ?? {}, activeId: activeId ?? null, lojaIdx: lojaIdx ?? 0 })
    setRecoveryData([])
    setPhase(2)
  }

  function handleDismissRecovery(sessaoId) {
    localStorage.removeItem(`SC_RECOVERY_SESSAO_${sessaoId}`)
    setRecoveryData(prev => prev.filter(r => r.sessao.id !== sessaoId))
  }

  async function handleRetomarSessao(ses) {
    setRetomarLoading(ses.id)
    try {
      const [sessaoDb, visitasComPedidos] = await Promise.all([
        sessoesService.byId(ses.id),
        pedidosService.itensPorFornecedor(ses.id),
      ])

      const visitasEnriquecidas = sessaoDb.visitas.map(v => ({
        id:                 v.visita_id,
        comprador_id:       v.comprador_id,
        comprador_nome:     v.comprador_nome,
        comprador_cnpj:     v.comprador_cnpj     ?? '',
        comprador_cidade:   v.comprador_cidade   ?? '',
        comprador_fantasia: v.comprador_fantasia ?? '',
        comprador_ie:       v.comprador_ie       ?? '',
        comprador_email:    v.comprador_email    ?? '',
        comprador_telefone: v.comprador_telefone ?? '',
        comprador_endereco: v.comprador_endereco ?? '',
      }))
      const ordemIds = compradores.map(c => c.id)
      visitasEnriquecidas.sort((a, b) => ordemIds.indexOf(a.comprador_id) - ordemIds.indexOf(b.comprador_id))

      const toStr = n => (n != null && n !== '') ? String(n).replace('.', ',') : ''

      // Build items as union of all refs across all visitas (keyed by referencia+variante_key to deduplicate)
      // Sort by id (auto-increment) so references appear in the order they were originally added
      const allPedidos = visitasComPedidos.flatMap(v => v.pedidos ?? [])
      allPedidos.sort((a, b) => a.id - b.id)

      const itemMap = new Map()
      for (const ped of allPedidos) {
        const vk = ped.variante_key ?? ''
        const lId = `${ped.referencia}|${vk}`
        if (!itemMap.has(lId)) {
          itemMap.set(lId, {
            localId: lId,
            variante_key: vk,
            ref: ped.referencia,
            tipo_produto: ped.segmentacao?.tipo_produto ?? '',
            tipo_grade: ped.segmentacao?.tipo_grade ?? 'AD',
            classe: ped.segmentacao?.classe ?? 'FEM',
            icms_pct: toStr(ped.icms_pct),
            valor: toStr(ped.valor_unitario),
            markup_pct: toStr(ped.markup_pct),
            preco_venda: toStr(ped.preco_venda),
            cor: ped.cor ?? '',
            detalhe: ped.detalhe ?? '',
            obs: ped.obs ?? '',
          })
        }
      }
      const items = [...itemMap.values()]

      // Load ALL stores' qtds (Phase 5 fills + Phase 2 organizer fills)
      const qtds = {}
      for (const visita of visitasComPedidos) {
        for (const ped of visita.pedidos ?? []) {
          const lId = `${ped.referencia}|${ped.variante_key ?? ''}`
          if (!qtds[lId]) qtds[lId] = {}
          const visitaQtds = {}
          for (const it of ped.itens ?? []) {
            if (it.qtd > 0) visitaQtds[it.tamanho] = it.qtd
          }
          if (Object.keys(visitaQtds).length) {
            qtds[lId][visita.id] = visitaQtds
          }
        }
      }

      const forn = forns.find(f => f.id === ses.fornecedor_id)
      setSessao({ ...sessaoDb, fornecedor_nome: forn?.nome || sessaoDb.fornecedor?.nome || '', fechada_em: null })
      setVisitas(visitasEnriquecidas)
      setRecoveryInitial({ items, qtds, activeId: items[0]?.localId ?? null, lojaIdx: 0 })
      setPhase(2)
      // Reabrir a edição volta a sessão para "aberta" (limpa o carimbo). Não-bloqueante;
      // só grava se estava fechada, p/ não escrever à toa a cada Retomar.
      if (ses.fechada_em) {
        sessoesService.update(ses.id, { fechada_em: null })
          .catch(e => console.warn('Não consegui reabrir o status da sessão:', e.message))
      }
    } catch (e) {
      alert(`Erro ao retomar sessão: ${e.message}`)
    } finally {
      setRetomarLoading(null)
    }
  }

  function handleNovaSessao() {
    setSessao(null)
    setVisitas([])
    setPedidosFechados([])
    setRecoveryInitial(null)
    setHistRefreshKey(k => k + 1)
    setPhase(0)
  }

  async function handleVisualizar(sessaoId) {
    setRetomarLoading(sessaoId)
    try {
      const sessaoDb = await sessoesService.byId(sessaoId)
      const visitasEnriquecidas = sessaoDb.visitas.map(v => ({
        id:                 v.visita_id,
        comprador_id:       v.comprador_id,
        comprador_nome:     v.comprador_nome,
        comprador_cnpj:     v.comprador_cnpj     ?? '',
        comprador_cidade:   v.comprador_cidade   ?? '',
        comprador_fantasia: v.comprador_fantasia ?? '',
        comprador_ie:       v.comprador_ie       ?? '',
        comprador_email:    v.comprador_email    ?? '',
        comprador_telefone: v.comprador_telefone ?? '',
        comprador_endereco: v.comprador_endereco ?? '',
      }))
      const ordemIds = compradores.map(c => c.id)
      visitasEnriquecidas.sort((a, b) => ordemIds.indexOf(a.comprador_id) - ordemIds.indexOf(b.comprador_id))
      const forn = forns.find(f => f.id === sessaoDb.fornecedor_id)
      setSessao({ ...sessaoDb, fornecedor_nome: forn?.nome || sessaoDb.fornecedor?.nome || '' })
      setVisitas(visitasEnriquecidas)
      setPedidosFechados([])
      setPhase(3)
    } catch (e) {
      alert(`Erro ao carregar sessão: ${e.message}`)
    } finally {
      setRetomarLoading(null)
    }
  }

  function handleBackFromView() {
    setViewSessaoId(null)
    setPhase(0)
  }

  function handlePreencherLoja(sessaoId, visitaId, compradorNome) {
    setPreencherInfo({ sessaoId, visitaId, compradorNome })
    setPhase(5)
  }

  function handleBackFromPreencher() {
    setPreencherInfo(null)
    setPhase(0)
  }

  const sessaoDisplay = sessao ?? null
  const inSession = phase >= 2

  useEffect(() => {
    if (phase === 2 && currentComprador !== undefined && !currentComprador?.is_editor) {
      setPhase(0)
    }
  }, [phase, currentComprador])

  if (!active) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Compras</h1>
        <div className={styles.placeholder}>Selecione uma coleção ativa na barra lateral.</div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Compras — {active.nome}</h1>

      {manutencao?.manutencao && (
        <div style={{
          background: 'var(--red, #e05252)', color: '#fff', padding: '8px 16px',
          textAlign: 'center', fontWeight: 600, fontSize: 14, borderRadius: 6, marginBottom: 8
        }}>
          {manutencao.mensagem}
        </div>
      )}

      {!isOnline && (
        <div className={styles.offlineBanner}>
          Sem conexão com a internet — mudanças não serão salvas.
        </div>
      )}

      {/* Recovery banners — shown in Phase 0 (home) */}
      {phase === 0 && recoveryData.map(entry => (
        <div key={entry.sessao.id} className={styles.recoveryBanner}>
          <span>
            Rascunho local não enviado: <strong>{entry.sessao.fornecedor?.nome || entry.sessao.fornecedor_nome}</strong>
            {' '}em <strong>{fmtDate(entry.sessao.data_visita)}</strong>. Deseja continuar de onde parou?
            <small style={{ display: 'block', color: 'inherit', opacity: 0.7, fontSize: '0.78em', marginTop: '2px' }}>
              Ignorar apenas oculta este aviso — a sessão continua salva no banco.
            </small>
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button className={styles.btnPrimary} onClick={() => handleRecover(entry)}>Continuar</button>
            <button className={styles.btnSecondary} onClick={() => handleDismissRecovery(entry.sessao.id)}>Ignorar</button>
          </div>
        </div>
      ))}

      {/* Phase 0: Home — sessions list */}
      {phase === 0 && (
        <HistoricoSessoes
          colId={active.id}
          refreshKey={histRefreshKey}
          onNovaSessao={() => setPhase(1)}
          onVisualizar={handleVisualizar}
          onPreencherLoja={handlePreencherLoja}
          onRetomarSessao={handleRetomarSessao}
          retomarLoading={retomarLoading}
          onMarkup={ses => setMarkupSessao(ses)}
        />
      )}

      {/* Markup modal — global, can open from Histórico */}
      {markupSessao && (
        <MarkupSessao sessao={markupSessao} onClose={() => setMarkupSessao(null)} />
      )}

      {/* Phase 1: Nova sessão form */}
      {phase === 1 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <button className={styles.btnBack} onClick={() => setPhase(0)}>← Voltar</button>
          </div>
          <div className={styles.stepBar}>
            {['Iniciar sessão', 'Registrar pedidos', 'Gerar PDFs'].map((label, i) => (
              <div key={i} className={`${styles.step} ${phase === i + 1 ? styles.stepActive : ''} ${phase > i + 1 ? styles.stepDone : ''}`}>
                <span className={styles.stepNum}>{i + 1}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <IniciarSessao
            forns={forns}
            compradores={compradores}
            colId={active.id}
            onStart={handleStart}
          />
        </>
      )}

      {/* Phase 2: Registrar pedidos */}
      {phase === 2 && sessao && (
        <RegistrarPedidoSessao
          sessao={sessaoDisplay}
          visitas={visitas}
          colId={active.id}
          colEstacao={active.estacao}
          segs={segs}
          onFechar={handleFechar}
          onCancelarSessao={async () => {
            await sessoesService.cancelar(sessao.id)
            setSessao(null)
            setVisitas([])
            setRecoveryInitial(null)
            setPhase(0)
          }}
          onRemoveVisita={(visId) => setVisitas(prev => prev.filter(v => v.id !== visId))}
          initialItems={recoveryInitial?.items ?? []}
          initialQtds={recoveryInitial?.qtds ?? {}}
          initialActiveId={recoveryInitial?.activeId ?? null}
          initialLojaIdx={recoveryInitial?.lojaIdx ?? 0}
          initialCorDetalhe={sessaoCorDetalhe}
          manutencaoAtiva={!!manutencao?.manutencao}
        />
      )}

      {/* Phase 3: Fechar sessão */}
      {phase === 3 && sessao && (
        <FecharSessao
          sessao={sessaoDisplay}
          visitas={visitas}
          segs={segs}
          pedidos={pedidosFechados}
          onNovaSessao={handleNovaSessao}
        />
      )}

      {/* Phase 4: Visualizar sessão (somente leitura, auto-refresh) */}
      {phase === 4 && viewSessaoId && (
        <VisualizarSessao
          sessaoId={viewSessaoId}
          onBack={handleBackFromView}
        />
      )}

      {/* Phase 5: Preenchimento colaborativo — loja do usuário logado */}
      {phase === 5 && preencherInfo && (
        <PreencherMinhaLoja
          sessaoId={preencherInfo.sessaoId}
          visitaId={preencherInfo.visitaId}
          compradorNome={preencherInfo.compradorNome}
          colEstacao={active.estacao}
          onBack={handleBackFromPreencher}
        />
      )}
    </div>
  )
}
