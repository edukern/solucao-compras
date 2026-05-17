// demo/src/mockApi.js — in-memory mock matching the Electron window.api contract

let nextId = 100

function uid() { return nextId++ }

// ── Seed data ──────────────────────────────────────────────────────────────

const colecoesList = [
  { id: 1, nome: 'Inverno 2026/1', estacao: 'inverno', ano: 2026, status: 'em_compra' }
]

const segmentacoesList = [
  { id: 1, classificacao: 'AD', tipo_produto: 'BERMUDA',  classe: 'FEM',  tipo_grade: 'AD',  estacao: 'inverno' },
  { id: 2, classificacao: 'AD', tipo_produto: 'CALCA',    classe: 'MASC', tipo_grade: 'AD',  estacao: 'inverno' },
  { id: 3, classificacao: 'EX', tipo_produto: 'BLUSINHA', classe: 'FEM',  tipo_grade: 'EX',  estacao: 'inverno' },
  { id: 4, classificacao: 'INF',tipo_produto: 'VESTIDO',  classe: 'FEM',  tipo_grade: 'INF', estacao: 'inverno' },
]

const fornecedoresList = [
  { id: 1, nome: 'LUNENDER',   contato: '', categoria: 'CONFECCOES' },
  { id: 2, nome: 'GANGSTER',   contato: '', categoria: 'ACESSORIOS'  },
  { id: 3, nome: 'FAKINI',     contato: '', categoria: 'CONFECCOES' },
  { id: 4, nome: 'ROVITEX',    contato: '', categoria: 'CONFECCOES' },
  { id: 5, nome: 'BIOGAS',     contato: '', categoria: 'CONFECCOES' },
  { id: 6, nome: 'CROCKER',    contato: '', categoria: 'CONFECCOES' },
  { id: 7, nome: 'HUTTZ',      contato: '', categoria: 'CONFECCOES' },
  { id: 8, nome: 'MOONCITY',   contato: '', categoria: 'CONFECCOES' },
]

const compradoresList = [
  { id: 1, nome: 'Irmãos Backes',        cnpj: '08.889.201/0001-01', cidade: 'Três Coroas/RS' },
  { id: 2, nome: 'Samuel Paulo Backes',  cnpj: '15.563.106/0001-70', cidade: 'Três Coroas/RS' },
  { id: 3, nome: 'PSM Backes',           cnpj: '28.010.922/0001-07', cidade: 'Igrejinha/RS'   },
  { id: 4, nome: 'Alexandre Backes',     cnpj: '06.284.903/0001-28', cidade: ''               },
  { id: 5, nome: 'Elisangela M. Backes', cnpj: '13.706.244/0001-36', cidade: 'Santa Maria do Herval/RS' },
  { id: 6, nome: 'Rafael J. Backes',     cnpj: '46.348.002/0001-77', cidade: 'Rolante/RS'     },
  { id: 7, nome: 'Streit Conf',          cnpj: '10.206.469/0001-35', cidade: 'Riozinho/RS'    },
  { id: 8, nome: 'FMV Streit Conf',      cnpj: '20.354.516/0001-41', cidade: 'Rolante/RS'     },
]

const projecoesList = [
  { segmentacao_id: 1, colecao_id: 1, tamanho: 'PP', qtd_ajustada: 50, qtd_projetada: 50 },
  { segmentacao_id: 1, colecao_id: 1, tamanho: 'P',  qtd_ajustada: 80, qtd_projetada: 80 },
  { segmentacao_id: 1, colecao_id: 1, tamanho: 'M',  qtd_ajustada: 60, qtd_projetada: 60 },
  { segmentacao_id: 1, colecao_id: 1, tamanho: 'G',  qtd_ajustada: 40, qtd_projetada: 40 },
  { segmentacao_id: 1, colecao_id: 1, tamanho: 'GG', qtd_ajustada: 20, qtd_projetada: 20 },
  { segmentacao_id: 1, colecao_id: 1, tamanho: 'XG', qtd_ajustada: 10, qtd_projetada: 10 },
  { segmentacao_id: 2, colecao_id: 1, tamanho: 'PP', qtd_ajustada: 40, qtd_projetada: 40 },
  { segmentacao_id: 2, colecao_id: 1, tamanho: 'P',  qtd_ajustada: 70, qtd_projetada: 70 },
  { segmentacao_id: 2, colecao_id: 1, tamanho: 'M',  qtd_ajustada: 50, qtd_projetada: 50 },
  { segmentacao_id: 2, colecao_id: 1, tamanho: 'G',  qtd_ajustada: 30, qtd_projetada: 30 },
  { segmentacao_id: 2, colecao_id: 1, tamanho: 'GG', qtd_ajustada: 20, qtd_projetada: 20 },
  { segmentacao_id: 2, colecao_id: 1, tamanho: 'XG', qtd_ajustada: 10, qtd_projetada: 10 },
  { segmentacao_id: 3, colecao_id: 1, tamanho: 'G1', qtd_ajustada: 30, qtd_projetada: 30 },
  { segmentacao_id: 3, colecao_id: 1, tamanho: 'G2', qtd_ajustada: 40, qtd_projetada: 40 },
  { segmentacao_id: 3, colecao_id: 1, tamanho: 'G3', qtd_ajustada: 35, qtd_projetada: 35 },
]

const visitasList = []
const sessoesList = []
const sessaoVisitasList = []
const pedidosList = []
const pedidoItensList = []

// ── Helpers ────────────────────────────────────────────────────────────────

function delay(ms = 40) { return new Promise(r => setTimeout(r, ms)) }

function totaisPorTamanhoCalc(segId, colId) {
  const pedIds = pedidosList
    .filter(p => p.segmentacao_id === segId)
    .filter(p => {
      const v = visitasList.find(v => v.id === p.visita_id)
      return v && v.colecao_id === colId
    })
    .map(p => p.id)

  const map = {}
  for (const item of pedidoItensList) {
    if (pedIds.includes(item.pedido_id)) {
      map[item.tamanho] = (map[item.tamanho] ?? 0) + item.qtd
    }
  }
  return Object.entries(map).map(([tamanho, total_pedido]) => ({ tamanho, total_pedido }))
}

function enrichVisita(v) {
  const forn = fornecedoresList.find(f => f.id === v.fornecedor_id)
  const numPedidos = pedidosList.filter(p => p.visita_id === v.id).length
  return { ...v, fornecedor_nome: forn?.nome ?? '', num_pedidos: numPedidos }
}

function enrichPedido(p) {
  const comp = compradoresList.find(c => c.id === p.comprador_id)
  const seg  = segmentacoesList.find(s => s.id === p.segmentacao_id)
  const itens = pedidoItensList.filter(i => i.pedido_id === p.id)
  return {
    ...p,
    comprador_nome: comp?.nome ?? '',
    cnpj:   comp?.cnpj ?? '',
    cidade: comp?.cidade ?? '',
    classificacao: seg?.classificacao ?? '',
    tipo_produto:  seg?.tipo_produto ?? '',
    classe:        seg?.classe ?? '',
    tipo_grade:    seg?.tipo_grade ?? '',
    itens,
  }
}

// ── API ────────────────────────────────────────────────────────────────────

export const mockApi = {
  colecoes: {
    async list() {
      await delay()
      return [...colecoesList]
    },
    async create(dados) {
      await delay()
      const nova = { id: uid(), status: 'planejamento', ...dados }
      colecoesList.push(nova)
      return nova
    },
    async setStatus(id, status) {
      await delay()
      const c = colecoesList.find(c => c.id === id)
      if (c) c.status = status
    },
  },

  segmentacoes: {
    async list() {
      await delay()
      return [...segmentacoesList]
    },
    async create(d) {
      await delay()
      const nova = { id: uid(), ...d }
      segmentacoesList.push(nova)
      return nova.id
    },
    async upsert(d) {
      await delay()
      const existing = segmentacoesList.find(s =>
        s.classificacao === d.classificacao &&
        s.tipo_produto  === d.tipo_produto  &&
        s.classe        === d.classe        &&
        s.tipo_grade    === d.tipo_grade
      )
      if (existing) return existing.id
      const nova = { id: uid(), ...d }
      segmentacoesList.push(nova)
      return nova.id
    },
  },

  grades: {
    async save() { await delay() },
    async get()  { await delay(); return [] },
  },

  projecoes: {
    async get(segId, colId) {
      await delay()
      return projecoesList.filter(p => p.segmentacao_id === segId && p.colecao_id === colId)
    },
    async calcular() { await delay(); return [] },
    async salvar()   { await delay() },
    async ajustar()  { await delay() },
    async restaurar(){ await delay() },
  },

  fornecedores: {
    async list() {
      await delay()
      return [...fornecedoresList]
    },
    async create(d) {
      await delay()
      const f = { id: uid(), contato: '', categoria: '', ...d }
      fornecedoresList.push(f)
      return f
    },
    async update(id, d) {
      await delay()
      const idx = fornecedoresList.findIndex(f => f.id === id)
      if (idx !== -1) fornecedoresList[idx] = { ...fornecedoresList[idx], ...d }
    },
  },

  compradores: {
    async list() {
      await delay()
      return [...compradoresList]
    },
    async create(d) {
      await delay()
      const c = { id: uid(), cnpj: '', cidade: '', ...d }
      compradoresList.push(c)
      return c
    },
  },

  sessoes: {
    async create(dados, lojaIds) {
      await delay()
      const forn = fornecedoresList.find(f => f.id === dados.fornecedor_id)
      const id = uid()
      const sessao = { id, ...dados, fornecedor_nome: forn?.nome ?? '' }
      sessoesList.push(sessao)

      // Create a visita per loja and link them
      const visitasArr = []
      for (const compradorId of lojaIds) {
        const visitaId = uid()
        visitasList.push({
          id: visitaId,
          fornecedor_id: dados.fornecedor_id,
          colecao_id: dados.colecao_id,
          data_visita: dados.data_visita,
          vendedor: dados.vendedor,
          cond_pag: dados.cond_pag,
          frete: dados.frete,
          obs: dados.obs ?? '',
          comprador_id: compradorId,
          sessao_id: id,
        })
        sessaoVisitasList.push({ sessao_id: id, visita_id: visitaId, comprador_id: compradorId })
        visitasArr.push({ visita_id: visitaId, comprador_id: compradorId })
      }

      return { ...sessao, visitas: visitasArr }
    },
    async list(colId) {
      await delay()
      return sessoesList
        .filter(s => s.colecao_id === colId)
        .map(s => {
          const forn = fornecedoresList.find(f => f.id === s.fornecedor_id)
          return { ...s, fornecedor_nome: forn?.nome ?? '' }
        })
    },
    async byId(id) {
      await delay()
      const s = sessoesList.find(s => s.id === id)
      if (!s) return null
      const forn = fornecedoresList.find(f => f.id === s.fornecedor_id)
      const visitas = sessaoVisitasList.filter(sv => sv.sessao_id === id)
      return { ...s, fornecedor_nome: forn?.nome ?? '', visitas }
    },
  },

  visitas: {
    async create(d) {
      await delay()
      const forn = fornecedoresList.find(f => f.id === d.fornecedor_id)
      const v = { id: uid(), ...d, fornecedor_nome: forn?.nome ?? '', num_pedidos: 0 }
      visitasList.push(v)
      return v
    },
    async list(colId) {
      await delay()
      return visitasList
        .filter(v => v.colecao_id === colId)
        .map(enrichVisita)
        .sort((a, b) => b.data_visita.localeCompare(a.data_visita))
    },
    async byId(id) {
      await delay()
      const v = visitasList.find(v => v.id === id)
      return v ? enrichVisita(v) : null
    },
  },

  pedidos: {
    async salvar({ visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct = 0,
                   transportadora = '', nota_fiscal = '', obs = '', itens }) {
      await delay()
      const id = uid()
      pedidosList.push({ id, visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct, transportadora, nota_fiscal, obs })
      for (const item of itens) {
        pedidoItensList.push({ id: uid(), pedido_id: id, tamanho: item.tamanho, qtd: item.qtd })
      }
      return enrichPedido(pedidosList.find(p => p.id === id))
    },
    async byVisita(visitaId) {
      await delay()
      return pedidosList
        .filter(p => p.visita_id === visitaId)
        .map(enrichPedido)
    },
    async totaisPorTamanho(segId, colId) {
      await delay()
      return totaisPorTamanhoCalc(segId, colId)
    },
  },

  backup: {
    async export() { return false },
    async import() { return false },
  },

  dialog: {
    async openFile() { return null },
  },
}

export default mockApi
