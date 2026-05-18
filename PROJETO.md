# Solução Compras — Contexto do Projeto

> Documentação de referência. Ver HANDOFF.md para estado atual de desenvolvimento.
> Última atualização: 2026-05-18 (sessão 7)

---

## O que é

Sistema de gestão de compras de moda para substituir ~100 planilhas Excel desconectadas.

**Negócio:** Samuel Backes (gestor) coordena compras de fornecedores (marcas/confecções) e distribui para 8 empresas compradoras do grupo Backes/Streit, todas no RS.

**Compradores do grupo:**
1. Irmãos Backes — Três Coroas
2. Samuel Paulo Backes — Três Coroas
3. PSM Backes — Igrejinha
4. Alexandre Backes
5. Elisangela M. Backes — Santa Maria do Herval
6. Rafael J. Backes — Rolante
7. Streit Conf — Riozinho
8. FMV Streit Conf — Rolante

---

## Tecnologia

| Camada | Stack |
|--------|-------|
| Desktop | Electron + React + SQLite (better-sqlite3) |
| Web demo | Vite + React + React Router (Vercel) |
| Estilos | CSS Modules + variáveis CSS |
| Estado global | CollectionContext (React Context API) |
| API renderer→main | `window.api` via contextBridge (IPC) |
| Testes | Vitest — 109 testes, 14 arquivos, SQLite in-memory |
| Auto-update | electron-updater + GitHub Actions |

Demo pública: **https://solucao-compras-demo.vercel.app**

---

## Modelo de dados (tabelas SQLite)

```
colecoes          id, nome, estacao(verao|inverno), ano, status
segmentacoes      id, classificacao, tipo_produto, classe, tipo_grade
                  tipo_grade: PP|BB|INF|JUV|AD|EX|AD1|EX1|AD2|EX2|U
                  UNIQUE(classificacao, tipo_produto, classe, tipo_grade)
fornecedores      id, nome, contato, categoria
compradores       id, nome, cnpj, cidade
sessoes           id, fornecedor_id, colecao_id, data_visita,
                  vendedor, cond_pag, frete(CIF|FOB), transportadora, obs
visitas           id, sessao_id, comprador_id  ← join table
pedidos           id, visita_id, comprador_id, segmentacao_id,
                  valor_unitario, desconto_pct, referencia, icms_pct, obs
pedido_itens      id, pedido_id, tamanho, qtd
grade_historica   id, segmentacao_id, colecao_id, tamanho,
                  qtd_comprada, qtd_vendida, qtd_estoque
projecoes         id, segmentacao_id, colecao_id, tamanho,
                  qtd_projetada, qtd_ajustada, metodo
```

---

## Contrato window.api (IPC)

```js
window.api.colecoes.list()
window.api.colecoes.create({ nome, estacao, ano })
window.api.colecoes.setStatus(id, status)

window.api.segmentacoes.list()
window.api.segmentacoes.create(data)
window.api.segmentacoes.upsert(data)
window.api.segmentacoes.update(id, data)
window.api.segmentacoes.remove(id)
window.api.segmentacoes.findOrCreate(data)

window.api.grades.save(segmentacaoId, colecaoId, rows)
window.api.grades.get(segmentacaoId, colecaoId)
window.api.grades.importar(filePath, colecaoId)

window.api.projecoes.calcular(segmentacaoId, colecaoId, metodo)
window.api.projecoes.salvar(segmentacaoId, colecaoId, rows)
window.api.projecoes.get(segmentacaoId, colecaoId)
window.api.projecoes.ajustar(segmentacaoId, colecaoId, tamanho, qtd)
window.api.projecoes.restaurar(segmentacaoId, colecaoId)

window.api.fornecedores.list()
window.api.fornecedores.create(data)
window.api.fornecedores.update(id, data)
window.api.fornecedores.remove(id)
window.api.fornecedores.importarArquivo(filePath)

window.api.compradores.list()
window.api.compradores.create(data)
window.api.compradores.update(id, data)
window.api.compradores.remove(id)

window.api.sessoes.create(data, lojaIds)
window.api.sessoes.list(colecaoId)
window.api.sessoes.byId(id)
window.api.sessoes.update(id, data)
window.api.sessoes.cancelar(id)

window.api.pedidos.salvar(data)
window.api.pedidos.byVisita(visitaId)
window.api.pedidos.totaisPorTamanho(visitaId, segmentacaoId)
window.api.pedidos.totaisPorFornecedor(colecaoId, segmentacaoId?)
window.api.pedidos.itensPorFornecedor(fornecedorId, colecaoId)
window.api.pedidos.cancelar(pedidoId)
window.api.pedidos.salvarBatch(batch)

window.api.dashboard.data(colecaoId)

window.api.backup.export(filePath)
window.api.backup.import(filePath)

window.api.dialog.openFile(options)

window.api.updater.install()
window.api.updater.onStatus(callback)
```

---

## Telas implementadas

| Tela | O que faz | Status |
|------|-----------|--------|
| Dashboard | Projeção vs comprado por segmentação, drill-down por tamanho | ✅ |
| Planejamento | Projeção N-2+N-1, ajuste manual + importar planilha Excel | ✅ |
| Compras | Sessão → pedidos por loja → PDF (3 fases) + histórico | ✅ |
| Relatórios › Por Fornecedor | Total comprado por fornecedor + detalhes | ✅ |
| Relatórios › Por Segmentação | Filtro cascata → detalhe por fornecedor | ✅ |
| Relatórios › Curva ABC | Desabilitado, sem handler | 🔧 |
| Relatórios › Quebra de Estoque | Desabilitado, sem handler | 🔧 |
| Configurações | Coleções, Segmentações, Compradores, Fornecedores, Backup | ✅ |
| Pendências | Painel do projeto via Supabase (dev tool) | ✅ |

---

## Tipos de grade

| Tipo | Tamanhos |
|------|----------|
| PP | RN / P / M / G / GG |
| BB | 1 / 2 / 3 / 4 |
| INF | 2 / 4 / 6 / 8 / 10 / 12 |
| JUV | 10 / 12 / 14 / 16 / 18 / 20 |
| AD | PP / P / M / G / GG / XG |
| EX | G1 / G2 / G3 / G4 / G5 / G6 / G7 / G8 / G9 / G10 |
| AD1 | 34 / 36 / 38 / 40 / 42 / 44 / 46 / 48 / 50 / 52 |
| EX1 | 46 / 48 / 50 / 52 / 54 / 56 / 58 / 60 / 62 / 64 |
| AD2 | 1 / 2 / 3 / 4 / 5 |
| EX2 | 6 / 7 / 8 / 9 / 10 |
| U | F / M / U (tamanho único) |
| CASAL / KING / QUEEN / SOLT / LAR / GERAL | U (cama/mesa — não aparecem na planilha Análise de Coleção) |

---

## Fluxo principal de uso

1. **Preparação:** criar coleção + importar planilha "Análise de Coleção" para popular projeções
2. **Compra:** para cada fornecedor → criar sessão com lojas participantes → registrar pedidos por segmentação → fechar e gerar PDFs
3. **Acompanhamento:** Dashboard mostra projeção vs comprado; Relatórios para visão detalhada

---

## Decisões técnicas relevantes

- **`window.api` é síncrono internamente** (better-sqlite3) mas exposto como Promise para consistência
- **CollectionContext** envolve todo o renderer — toda tela acessa coleção ativa via `useCollection()`
- **Demo usa mockApi** com mesmo contrato que o app desktop — telas são reutilizadas sem alteração
- **Projeção usa N−2 e N−1** (duas coleções equivalentes anteriores): média simples (50/50) ou ponderada (40/60)
- **`seedInitialData(db)`** separada de `runMigrations(db)` — chamada só em produção (index.js), não nos testes
- **`sandbox: false` no BrowserWindow** — necessário porque preload usa ESM imports
- **`xlsx` em dependencies** (não devDependencies) — necessário para build empacotado do Electron
