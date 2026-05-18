# HANDOFF — Solução Compras

> Última atualização: 2026-05-18 — Sessão 7 (FOB transportadora + seed + release v1.1.0)

---

## Objetivo principal

Sistema desktop (Electron + SQLite) para Samuel Backes gerenciar compras de moda para ~8 empresas compradoras. Substitui ~100 planilhas Excel.

Demo ao vivo: **https://solucao-compras-demo.vercel.app**

Branch de trabalho: `main` (tudo mergeado)

---

## Estado atual (pós v1.1.0)

### O que está 100% pronto

| Funcionalidade | Status |
|---|---|
| Fluxo de compra: sessão → pedidos por loja → PDF | ✓ |
| Dashboard com projeção vs comprado por segmentação | ✓ |
| Histórico de sessões com edição e exclusão | ✓ |
| Recuperação automática de sessão interrompida | ✓ |
| Importação de Análise de Coleção (planilha Excel) | ✓ |
| Dados iniciais pré-carregados (8 compradores, 8 fornecedores) | ✓ |
| Campo Transportadora quando Frete = FOB | ✓ |
| Auto-update via electron-updater + GitHub Actions | ✓ |
| 109 testes Vitest passando | ✓ |
| Release v1.1.0 publicado (build em andamento) | ✓ |

### Pendências remanescentes

| Prioridade | Item |
|---|---|
| Média | **Curva ABC** — botão na UI existe (disabled), handler não implementado |
| Média | **Quebra de Estoque** — mesmo caso que Curva ABC |
| Baixa | Configuracoes ausente na demo web |
| Baixa | Testes cobrem só DB modules — handlers IPC de backup/dialog/updater sem teste |

---

## Arquitetura

### IPC: 43 handlers (1:1 com preload)

```
colecoes      → list, create, setStatus
segmentacoes  → list, create, upsert, update, remove, findOrCreate
grades        → save, get, importar
projecoes     → calcular, salvar, get, ajustar, restaurar
fornecedores  → list, create, update, remove, importarArquivo
compradores   → list, create, update, remove
sessoes       → create, list, byId, update, cancelar
pedidos       → salvar, byVisita, totaisPorTamanho, totaisPorFornecedor,
                itensPorFornecedor, cancelar, salvarBatch
dashboard     → data
backup        → export, import
dialog        → openFile
updater       → install (+ onStatus listener)
```

### Screens do renderer

| Screen | Função |
|--------|--------|
| `Dashboard.jsx` | Projeção vs comprado por segmentação, drill-down por tamanho |
| `Planejamento.jsx` | Projeção via N-2+N-1, métodos: média simples/ponderada/manual + importar planilha |
| `Compras.jsx` | Fluxo: IniciarSessão → InserirPedidos → Resumo/PDF |
| `Relatorios.jsx` | Por Fornecedor ✓ / Por Segmentação ✓ / Curva ABC ✗ / Quebra de Estoque ✗ |
| `Configuracoes.jsx` | Coleções, Segmentações, Compradores, Fornecedores, Backup |
| `Pendencias.jsx` | Painel do projeto via Supabase |

### DB modules (electron/main/db/)

colecoes, segmentacoes, fornecedores, compradores, grades, projecoes, pedidos, sessoes, visitas, schema, connection

### Schema do banco (tabelas principais)

- `colecoes`: id, nome, estacao, ano, status
- `segmentacoes`: id, classificacao, tipo_produto, classe, tipo_grade, estacao
- `fornecedores`: id, nome, contato, categoria
- `compradores`: id, nome, cnpj, cidade
- `sessoes`: id, fornecedor_id, colecao_id, data_visita, vendedor, cond_pag, frete, **transportadora**, obs
- `visitas`: id, sessao_id, comprador_id
- `pedidos`: id, visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct, referencia, icms_pct
- `pedido_itens`: id, pedido_id, tamanho, qtd
- `grade_historica`: segmentacao_id, colecao_id, tamanho, qtd_comprada, qtd_vendida, qtd_estoque
- `projecoes`: segmentacao_id, colecao_id, tamanho, qtd_projetada, qtd_ajustada, metodo

**Banco em produção:** `C:\Users\eduke\AppData\Roaming\solucao-compras\solucao-compras.db`

---

## Decisões técnicas registradas

- **Grades CASAL, KING, QUEEN, SOLT, LAR, GERAL** → tamanho único (1 SKU), não aparecem na planilha Análise de Coleção
- **`importar.js`** — parser construído com base na planilha real "ANALISE DE INVERNO.xlsx" (198 blocos, 55 com compra, 143 zero corretamente ignorados)
- **`seedInitialData(db)`** — separada de `runMigrations` para não quebrar testes; chamada apenas em `index.js`
- **`transportadora` em sessoes** — campo session-level (não por pedido) porque a transportadora é definida na sessão de compra, não individualmente
- **`parsePlanilhaRows` usa avanço dinâmico** — quando Venda/Estoque ausentes, avança 1 posição
- **`pedidos.salvarBatch`** — transação única para múltiplos pedidos (um por loja por visita)
- **sandbox: false no BrowserWindow** — necessário porque preload usa ESM imports
- **`xlsx` em dependencies** (não devDependencies) — necessário para Electron packaged build

---

## Releases

| Versão | Data | Destaques |
|---|---|---|
| v1.0.0 | 2026-05-17 | Build inicial, fluxo de compras completo |
| v1.1.0 | 2026-05-18 | Importação planilha, FOB transportadora, seed de dados |

---

## Para rodar

```
cd "C:\Users\eduke\Solução Compras"
npm run dev
```

## Próxima ação recomendada

Aguardar Samuel testar o app atualizado (v1.1.0). Se reportar problemas, corrigir e publicar patch. Próximas features não-bloqueantes: Curva ABC e Quebra de Estoque.
