# Solução Compras — Contexto do Projeto

> Documentação enxuta de referência. Atualizar ao fim de cada sessão de trabalho.
> Última atualização: 2026-05-16

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
| Estado | CollectionContext (React Context API) |
| API | `window.api` via contextBridge (IPC) |

Demo pública: **https://solucao-compras-demo.vercel.app**

---

## Modelo de dados (tabelas SQLite)

```
colecoes        id, nome, estacao(verão|inverno), ano, status(em_preparacao|em_compra|finalizada)
segmentacoes    id, classificacao(AD|EX|INF), tipo_produto, classe(FEM|MASC|UNI)
                UNIQUE(classificacao, tipo_produto, classe)
grades          id, segmentacao_id, colecao_id, tamanho, qtd_comprada, qtd_vendida, estoque
projecoes       id, segmentacao_id, colecao_id, tamanho, qtd_calculada, qtd_ajustada, metodo
fornecedores    id, nome, cnpj, contato
pedidos         id, fornecedor_id, segmentacao_id, colecao_id, tamanho, qtd_pedida, valor_unitario, data_pedido, status
```

---

## Contrato window.api

```js
window.api.colecoes.list()
window.api.colecoes.create(nome, estacao, ano)
window.api.segmentacoes.list()
window.api.segmentacoes.create(classificacao, tipo, classe)
window.api.fornecedores.list()
window.api.fornecedores.create(nome, cnpj, contato)
window.api.pedidos.salvar(pedido)
window.api.pedidos.totaisPorFornecedor(colecaoId, segmentacaoId?)
window.api.pedidos.itensPorFornecedor(fornecedorId, colecaoId)
window.api.pedidos.totaisPorTamanho(fornecedorId, colecaoId)
window.api.pedidos.listarVisitas(fornecedorId)
window.api.pedidos.listarPorColecao(colecaoId)
window.api.projecoes.get(segmentacaoId, colecaoId)
window.api.projecoes.calcular(segmentacaoId, colecaoId, metodo)
window.api.projecoes.salvar(segmentacaoId, colecaoId, tamanho, qtdAjustada)
window.api.grades.get(segmentacaoId, colecaoId)
```

---

## Telas implementadas

| Tela | O que faz | Status |
|------|-----------|--------|
| Landing | Página de apresentação da demo | ✅ |
| Dashboard | Visão geral: métricas, progresso, tabela por segmentação | ✅ |
| Planejamento | Revisão e ajuste de projeções por segmentação e método | ✅ (placeholder na demo) |
| Compras | Registro de pedidos com tabela de grade por tamanho | ✅ |
| Relatórios › Por Fornecedor | Lista + detalhe com filtros por segmentação | ✅ |
| Relatórios › Por Segmentação | Filtro cascata → detalhe por fornecedor | ✅ |
| Relatórios › Curva ABC | Desabilitado, "Em breve" | 🔧 |
| Relatórios › Quebra de Estoque | Desabilitado, "Em breve" | 🔧 |

---

## Tipos de grade (da planilha atual)

Ao registrar um pedido, o tipo de grade determina os tamanhos disponíveis:

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
| U | F / M / U |

**Atenção:** O sistema digital atual usa apenas classificação (AD/EX/INF). A granularidade de tipos de grade da planilha ainda não está integrada.

---

## Campos do pedido na planilha (referência para integração futura)

Cabeçalho do pedido: Fornecedor, Vendedor, Data, Fone, Entrega, Cond. Pagamento, Nota Fiscal, Frete, Transportadora, Crédito, Desconto 10%, Obs, Trocas

Colunas por item: Ref (código), Produto, Grade (tipo), Classe (FEM/MASC/UNI), ICMS, Valor unitário, Valor líquido, T1–T10 (qtd por tamanho)

---

## O que está pronto vs. pendente

### ✅ Pronto
- Schema SQLite completo
- API bridge (window.api) com todos os métodos
- Todas as telas (Dashboard, Planejamento, Compras, Relatórios completo)
- Demo no Vercel com dados mock (Inverno 2026, 15 fornecedores)
- Tema claro

### 🔧 Pendente / não iniciado
- Interface para criar/editar coleções
- Importação automática de histórico via Excel (TOTAL GRADE)
- Cadastro completo de fornecedores (~150 do ERP)
- Tipos de grade granulares (PP, BB, JUV, AD1, EX1, etc.) no modelo de dados
- Distribuição de pedidos por comprador (os 8 do grupo)
- Campos adicionais do pedido (Vendedor, Cond. Pag, NF, Frete, ICMS, etc.)

### 💡 Features sugeridas (pendentes de aprovação do gestor)
- **Cálculo automático de grade por proporção:** usuário digita total de peças → sistema distribui por tamanho com base no histórico de projeções
- **Exportação de cadastro de produtos para ERP:** gera arquivo com marca, grades e detalhes de produto a partir dos pedidos registrados, pronto para subir no ERP

---

## Decisões técnicas importantes

- `window.api` é síncrono internamente (better-sqlite3) mas exposto como Promise para consistência
- CollectionContext envolve todo o app — toda tela acessa coleção ativa via `useCollection()`
- Demo usa `mockApi.js` com mesmo contrato que o app desktop — telas são reutilizadas sem alteração
- Coleções "permanentes" entram em toda projeção independente de estação
- Projeção usa N−2 e N−1 (duas coleções equivalentes anteriores): média simples ou ponderada (40%/60%)
- Saldo a comprar = qtd_ajustada − total_já_pedido (por tamanho)
