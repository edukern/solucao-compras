# Demo Vercel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar um subprojeto `demo/` com Vite + React + React Router, deployável no Vercel, com landing page e app interativo completo usando mock data realista da operação.

**Architecture:** App standalone `demo/` dentro do repo existente. `window.api = mockApi` injetado antes do render — os screens do renderer são copiados sem alteração. Duas rotas: `/` (landing) e `/app` (app interativo com CollectionProvider + Sidebar adaptada).

**Tech Stack:** Vite 5, React 18, React Router 6, CSS Modules, Vercel

---

### Task 1: Scaffold `demo/`

**Files:**
- Create: `demo/package.json`
- Create: `demo/vite.config.js`
- Create: `demo/vercel.json`
- Create: `demo/index.html`

- [ ] **Step 1: Criar demo/package.json**

```json
{
  "name": "solucao-compras-demo",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.3.1"
  }
}
```

- [ ] **Step 2: Criar demo/vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 3: Criar demo/vercel.json**

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 4: Criar demo/index.html**

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Solução Compras — Demo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Instalar dependências**

```
cd demo && npm install
```

Expected: `node_modules/` criado, sem erros.

- [ ] **Step 6: Commit**

```bash
git add demo/package.json demo/vite.config.js demo/vercel.json demo/index.html demo/package-lock.json
git commit -m "feat(demo): scaffold Vite + React project"
```

---

### Task 2: Mock data

**Files:**
- Create: `demo/src/mockData.js`

Os dados representam "Inverno 2026" em andamento (~60% comprado).

- [ ] **Step 1: Criar demo/src/mockData.js**

```js
export const colecoes = [
  { id: 1, nome: 'Inverno 2026', estacao: 'inverno', ano: 2026, status: 'em_compra' },
]

export const segmentacoes = [
  { id: 1, classificacao: 'AD', tipo_produto: 'CALCA',    classe: 'MASC', estacao: 'inverno' },
  { id: 2, classificacao: 'AD', tipo_produto: 'CALCA',    classe: 'FEM',  estacao: 'inverno' },
  { id: 3, classificacao: 'AD', tipo_produto: 'BLUSINHA', classe: 'FEM',  estacao: 'inverno' },
  { id: 4, classificacao: 'AD', tipo_produto: 'CALCADO',  classe: 'MASC', estacao: 'inverno' },
  { id: 5, classificacao: 'AD', tipo_produto: 'CALCADO',  classe: 'FEM',  estacao: 'inverno' },
  { id: 6, classificacao: 'EX', tipo_produto: 'CALCA',    classe: 'MASC', estacao: 'inverno' },
  { id: 7, classificacao: 'EX', tipo_produto: 'BLUSINHA', classe: 'FEM',  estacao: 'inverno' },
  { id: 8, classificacao: 'INF', tipo_produto: 'CALCA',   classe: 'INF',  estacao: 'inverno' },
]

export const fornecedores = [
  { id:  1, nome: 'GANGSTER',          contato: '' },
  { id:  2, nome: 'LUNENDER',          contato: '' },
  { id:  3, nome: 'HAVAIANAS',         contato: '' },
  { id:  4, nome: 'MOLEKINHO',         contato: '' },
  { id:  5, nome: 'MORMAII CONFECCAO', contato: '' },
  { id:  6, nome: 'BEIRA RIO',         contato: '' },
  { id:  7, nome: 'CROCKER',           contato: '' },
  { id:  8, nome: 'PEGADA',            contato: '' },
  { id:  9, nome: 'ALTENBURG',         contato: '' },
  { id: 10, nome: 'TEEZZ',             contato: '' },
  { id: 11, nome: 'FATTALY',           contato: '' },
  { id: 12, nome: 'JEITO FASHION',     contato: '' },
  { id: 13, nome: 'FATAL SUL',         contato: '' },
  { id: 14, nome: 'DECIZAO',           contato: '' },
  { id: 15, nome: 'RITA MODAS',        contato: '' },
]

// { segmentacao_id, colecao_id, tamanho, qtd_ajustada }
export const projecoes = [
  // seg 1 — AD CALCA MASC  (total 510)
  { segmentacao_id:1, colecao_id:1, tamanho:'PP', qtd_ajustada:60  },
  { segmentacao_id:1, colecao_id:1, tamanho:'P',  qtd_ajustada:120 },
  { segmentacao_id:1, colecao_id:1, tamanho:'M',  qtd_ajustada:150 },
  { segmentacao_id:1, colecao_id:1, tamanho:'G',  qtd_ajustada:120 },
  { segmentacao_id:1, colecao_id:1, tamanho:'GG', qtd_ajustada:60  },
  // seg 2 — AD CALCA FEM  (total 430)
  { segmentacao_id:2, colecao_id:1, tamanho:'PP', qtd_ajustada:50  },
  { segmentacao_id:2, colecao_id:1, tamanho:'P',  qtd_ajustada:100 },
  { segmentacao_id:2, colecao_id:1, tamanho:'M',  qtd_ajustada:130 },
  { segmentacao_id:2, colecao_id:1, tamanho:'G',  qtd_ajustada:100 },
  { segmentacao_id:2, colecao_id:1, tamanho:'GG', qtd_ajustada:50  },
  // seg 3 — AD BLUSINHA FEM  (total 560)
  { segmentacao_id:3, colecao_id:1, tamanho:'PP', qtd_ajustada:70  },
  { segmentacao_id:3, colecao_id:1, tamanho:'P',  qtd_ajustada:130 },
  { segmentacao_id:3, colecao_id:1, tamanho:'M',  qtd_ajustada:160 },
  { segmentacao_id:3, colecao_id:1, tamanho:'G',  qtd_ajustada:130 },
  { segmentacao_id:3, colecao_id:1, tamanho:'GG', qtd_ajustada:70  },
  // seg 4 — AD CALCADO MASC  (total 360)
  { segmentacao_id:4, colecao_id:1, tamanho:'37', qtd_ajustada:40 },
  { segmentacao_id:4, colecao_id:1, tamanho:'38', qtd_ajustada:60 },
  { segmentacao_id:4, colecao_id:1, tamanho:'39', qtd_ajustada:70 },
  { segmentacao_id:4, colecao_id:1, tamanho:'40', qtd_ajustada:70 },
  { segmentacao_id:4, colecao_id:1, tamanho:'41', qtd_ajustada:60 },
  { segmentacao_id:4, colecao_id:1, tamanho:'42', qtd_ajustada:40 },
  { segmentacao_id:4, colecao_id:1, tamanho:'43', qtd_ajustada:20 },
  // seg 5 — AD CALCADO FEM  (total 290)
  { segmentacao_id:5, colecao_id:1, tamanho:'34', qtd_ajustada:20 },
  { segmentacao_id:5, colecao_id:1, tamanho:'35', qtd_ajustada:40 },
  { segmentacao_id:5, colecao_id:1, tamanho:'36', qtd_ajustada:60 },
  { segmentacao_id:5, colecao_id:1, tamanho:'37', qtd_ajustada:70 },
  { segmentacao_id:5, colecao_id:1, tamanho:'38', qtd_ajustada:60 },
  { segmentacao_id:5, colecao_id:1, tamanho:'39', qtd_ajustada:40 },
  // seg 6 — EX CALCA MASC  (total 310)
  { segmentacao_id:6, colecao_id:1, tamanho:'PP', qtd_ajustada:40 },
  { segmentacao_id:6, colecao_id:1, tamanho:'P',  qtd_ajustada:70 },
  { segmentacao_id:6, colecao_id:1, tamanho:'M',  qtd_ajustada:90 },
  { segmentacao_id:6, colecao_id:1, tamanho:'G',  qtd_ajustada:70 },
  { segmentacao_id:6, colecao_id:1, tamanho:'GG', qtd_ajustada:40 },
  // seg 7 — EX BLUSINHA FEM  (total 390)
  { segmentacao_id:7, colecao_id:1, tamanho:'PP', qtd_ajustada:50  },
  { segmentacao_id:7, colecao_id:1, tamanho:'P',  qtd_ajustada:90  },
  { segmentacao_id:7, colecao_id:1, tamanho:'M',  qtd_ajustada:110 },
  { segmentacao_id:7, colecao_id:1, tamanho:'G',  qtd_ajustada:90  },
  { segmentacao_id:7, colecao_id:1, tamanho:'GG', qtd_ajustada:50  },
  // seg 8 — INF CALCA INF  (total 270)
  { segmentacao_id:8, colecao_id:1, tamanho:'6',  qtd_ajustada:40 },
  { segmentacao_id:8, colecao_id:1, tamanho:'8',  qtd_ajustada:60 },
  { segmentacao_id:8, colecao_id:1, tamanho:'10', qtd_ajustada:70 },
  { segmentacao_id:8, colecao_id:1, tamanho:'12', qtd_ajustada:60 },
  { segmentacao_id:8, colecao_id:1, tamanho:'14', qtd_ajustada:40 },
]

// Pedidos raw: ~60% of projeção comprado, distribuídos entre 15 fornecedores
// { fornecedor_id, colecao_id, segmentacao_id, data_pedido, tamanho, qtd_pedida, valor_unitario }
export const pedidosBase = [
  // --- GANGSTER → seg1 (AD CALCA MASC) PP+P+M+G
  { fornecedor_id:1, colecao_id:1, segmentacao_id:1, data_pedido:'2026-04-08', tamanho:'PP', qtd_pedida:35,  valor_unitario:89.90 },
  { fornecedor_id:1, colecao_id:1, segmentacao_id:1, data_pedido:'2026-04-08', tamanho:'P',  qtd_pedida:70,  valor_unitario:89.90 },
  { fornecedor_id:1, colecao_id:1, segmentacao_id:1, data_pedido:'2026-04-08', tamanho:'M',  qtd_pedida:90,  valor_unitario:89.90 },
  { fornecedor_id:1, colecao_id:1, segmentacao_id:1, data_pedido:'2026-04-08', tamanho:'G',  qtd_pedida:70,  valor_unitario:89.90 },
  // --- GANGSTER → seg6 (EX CALCA MASC) PP+P+M
  { fornecedor_id:1, colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-08', tamanho:'PP', qtd_pedida:24,  valor_unitario:79.90 },
  { fornecedor_id:1, colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-08', tamanho:'P',  qtd_pedida:42,  valor_unitario:79.90 },
  { fornecedor_id:1, colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-08', tamanho:'M',  qtd_pedida:54,  valor_unitario:79.90 },
  // --- CROCKER → seg1 GG
  { fornecedor_id:7, colecao_id:1, segmentacao_id:1, data_pedido:'2026-04-12', tamanho:'GG', qtd_pedida:36,  valor_unitario:92.00 },
  // --- DECIZAO → seg6 G+GG
  { fornecedor_id:14,colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-15', tamanho:'G',  qtd_pedida:42,  valor_unitario:82.00 },
  { fornecedor_id:14,colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-15', tamanho:'GG', qtd_pedida:24,  valor_unitario:82.00 },
  // --- LUNENDER → seg2 (AD CALCA FEM) PP+P+M+G+GG
  { fornecedor_id:2, colecao_id:1, segmentacao_id:2, data_pedido:'2026-04-10', tamanho:'PP', qtd_pedida:30,  valor_unitario:94.90 },
  { fornecedor_id:2, colecao_id:1, segmentacao_id:2, data_pedido:'2026-04-10', tamanho:'P',  qtd_pedida:60,  valor_unitario:94.90 },
  { fornecedor_id:2, colecao_id:1, segmentacao_id:2, data_pedido:'2026-04-10', tamanho:'M',  qtd_pedida:78,  valor_unitario:94.90 },
  { fornecedor_id:2, colecao_id:1, segmentacao_id:2, data_pedido:'2026-04-10', tamanho:'G',  qtd_pedida:60,  valor_unitario:94.90 },
  { fornecedor_id:2, colecao_id:1, segmentacao_id:2, data_pedido:'2026-04-10', tamanho:'GG', qtd_pedida:30,  valor_unitario:94.90 },
  // --- LUNENDER → seg7 (EX BLUSINHA FEM) PP+P+M
  { fornecedor_id:2, colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-10', tamanho:'PP', qtd_pedida:30,  valor_unitario:88.00 },
  { fornecedor_id:2, colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-10', tamanho:'P',  qtd_pedida:54,  valor_unitario:88.00 },
  { fornecedor_id:2, colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-10', tamanho:'M',  qtd_pedida:66,  valor_unitario:88.00 },
  // --- TEEZZ → seg2 (shares with LUNENDER, não pediu ainda — data futura)
  // seg2 ~60% já coberta pela LUNENDER
  // --- FATTALY → seg3 (AD BLUSINHA FEM) PP+P+M+G
  { fornecedor_id:11,colecao_id:1, segmentacao_id:3, data_pedido:'2026-04-14', tamanho:'PP', qtd_pedida:42,  valor_unitario:76.90 },
  { fornecedor_id:11,colecao_id:1, segmentacao_id:3, data_pedido:'2026-04-14', tamanho:'P',  qtd_pedida:78,  valor_unitario:76.90 },
  { fornecedor_id:11,colecao_id:1, segmentacao_id:3, data_pedido:'2026-04-14', tamanho:'M',  qtd_pedida:96,  valor_unitario:76.90 },
  { fornecedor_id:11,colecao_id:1, segmentacao_id:3, data_pedido:'2026-04-14', tamanho:'G',  qtd_pedida:78,  valor_unitario:76.90 },
  // --- ALTENBURG → seg3 GG
  { fornecedor_id:9, colecao_id:1, segmentacao_id:3, data_pedido:'2026-04-18', tamanho:'GG', qtd_pedida:42,  valor_unitario:79.00 },
  // --- RITA MODAS → seg7 G+GG
  { fornecedor_id:15,colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-20', tamanho:'G',  qtd_pedida:54,  valor_unitario:91.00 },
  { fornecedor_id:15,colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-20', tamanho:'GG', qtd_pedida:30,  valor_unitario:91.00 },
  // --- BEIRA RIO → seg7 (third brand, pequeno lote)
  { fornecedor_id:6, colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-22', tamanho:'P',  qtd_pedida:36,  valor_unitario:86.00 },
  // --- HAVAIANAS → seg4 (AD CALCADO MASC) 37-42
  { fornecedor_id:3, colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-09', tamanho:'37', qtd_pedida:24,  valor_unitario:149.90 },
  { fornecedor_id:3, colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-09', tamanho:'38', qtd_pedida:36,  valor_unitario:149.90 },
  { fornecedor_id:3, colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-09', tamanho:'39', qtd_pedida:42,  valor_unitario:149.90 },
  { fornecedor_id:3, colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-09', tamanho:'40', qtd_pedida:42,  valor_unitario:149.90 },
  { fornecedor_id:3, colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-09', tamanho:'41', qtd_pedida:36,  valor_unitario:149.90 },
  { fornecedor_id:3, colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-09', tamanho:'42', qtd_pedida:24,  valor_unitario:149.90 },
  // --- FATAL SUL → seg4 tamanho 43
  { fornecedor_id:13,colecao_id:1, segmentacao_id:4, data_pedido:'2026-04-16', tamanho:'43', qtd_pedida:12,  valor_unitario:155.00 },
  // --- HAVAIANAS → seg5 (AD CALCADO FEM) 35-38
  { fornecedor_id:3, colecao_id:1, segmentacao_id:5, data_pedido:'2026-04-09', tamanho:'35', qtd_pedida:24,  valor_unitario:139.90 },
  { fornecedor_id:3, colecao_id:1, segmentacao_id:5, data_pedido:'2026-04-09', tamanho:'36', qtd_pedida:36,  valor_unitario:139.90 },
  { fornecedor_id:3, colecao_id:1, segmentacao_id:5, data_pedido:'2026-04-09', tamanho:'37', qtd_pedida:42,  valor_unitario:139.90 },
  { fornecedor_id:3, colecao_id:1, segmentacao_id:5, data_pedido:'2026-04-09', tamanho:'38', qtd_pedida:36,  valor_unitario:139.90 },
  // --- PEGADA → seg5 34+39
  { fornecedor_id:8, colecao_id:1, segmentacao_id:5, data_pedido:'2026-04-17', tamanho:'34', qtd_pedida:12,  valor_unitario:135.00 },
  { fornecedor_id:8, colecao_id:1, segmentacao_id:5, data_pedido:'2026-04-17', tamanho:'39', qtd_pedida:24,  valor_unitario:135.00 },
  // --- MORMAII → seg6 (EX CALCA MASC — second brand beyond GANGSTER+DECIZAO)
  { fornecedor_id:5, colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-11', tamanho:'PP', qtd_pedida:16,  valor_unitario:99.90 },
  { fornecedor_id:5, colecao_id:1, segmentacao_id:6, data_pedido:'2026-04-11', tamanho:'P',  qtd_pedida:28,  valor_unitario:99.90 },
  // --- JEITO FASHION → seg7 (EX BLUSINHA FEM) — small lot M+G
  { fornecedor_id:12,colecao_id:1, segmentacao_id:7, data_pedido:'2026-04-23', tamanho:'M',  qtd_pedida:44,  valor_unitario:93.00 },
  // --- TEEZZ → seg2 (pequeno complemento)
  { fornecedor_id:10,colecao_id:1, segmentacao_id:2, data_pedido:'2026-04-25', tamanho:'M',  qtd_pedida:30,  valor_unitario:96.00 },
  // --- MOLEKINHO → seg8 (INF CALCA INF) todos os tamanhos
  { fornecedor_id:4, colecao_id:1, segmentacao_id:8, data_pedido:'2026-04-13', tamanho:'6',  qtd_pedida:24, valor_unitario:59.90 },
  { fornecedor_id:4, colecao_id:1, segmentacao_id:8, data_pedido:'2026-04-13', tamanho:'8',  qtd_pedida:36, valor_unitario:59.90 },
  { fornecedor_id:4, colecao_id:1, segmentacao_id:8, data_pedido:'2026-04-13', tamanho:'10', qtd_pedida:42, valor_unitario:59.90 },
  { fornecedor_id:4, colecao_id:1, segmentacao_id:8, data_pedido:'2026-04-13', tamanho:'12', qtd_pedida:36, valor_unitario:59.90 },
  { fornecedor_id:4, colecao_id:1, segmentacao_id:8, data_pedido:'2026-04-13', tamanho:'14', qtd_pedida:24, valor_unitario:59.90 },
]
```

- [ ] **Step 2: Commit**

```bash
git add demo/src/mockData.js
git commit -m "feat(demo): add realistic mock data (Inverno 2026, 15 fornecedores, 8 segs)"
```

---

### Task 3: Mock API

**Files:**
- Create: `demo/src/mockApi.js`

Implementa o mesmo contrato de `window.api`. Usa `pedidosBase` como estado mutável para suportar `pedidos.salvar`.

- [ ] **Step 1: Criar demo/src/mockApi.js**

```js
import { colecoes, segmentacoes, fornecedores, projecoes, pedidosBase } from './mockData.js'

// mutable in-memory pedidos array (resets on page reload — by design)
const pedidos = [...pedidosBase]

function resolve(value) {
  return Promise.resolve(value)
}

const mockApi = {
  colecoes: {
    list: () => resolve([...colecoes]),
    create: () => resolve(null),
  },

  segmentacoes: {
    list: () => resolve([...segmentacoes]),
    create: () => resolve(null),
  },

  fornecedores: {
    list: () => resolve([...fornecedores]),
    create: () => resolve(null),
  },

  pedidos: {
    salvar({ fornecedor_id, colecao_id, segmentacao_id, data_pedido, valor_unitario, itens }) {
      for (const item of itens) {
        if (item.qtd_pedida > 0) {
          pedidos.push({
            fornecedor_id, colecao_id, segmentacao_id, data_pedido,
            tamanho: item.tamanho, qtd_pedida: item.qtd_pedida, valor_unitario,
          })
        }
      }
      return resolve(null)
    },

    totaisPorFornecedor(colId, segId = null) {
      let filtered = pedidos.filter(p => p.colecao_id === colId)
      if (segId != null) filtered = filtered.filter(p => p.segmentacao_id === segId)

      const map = new Map()
      for (const p of filtered) {
        if (!map.has(p.fornecedor_id)) {
          const forn = fornecedores.find(f => f.id === p.fornecedor_id)
          map.set(p.fornecedor_id, {
            fornecedor_id: p.fornecedor_id,
            fornecedor_nome: forn.nome,
            segIds: new Set(),
            total_pecas: 0,
            total_valor: 0,
          })
        }
        const entry = map.get(p.fornecedor_id)
        entry.segIds.add(p.segmentacao_id)
        entry.total_pecas += p.qtd_pedida
        entry.total_valor += p.qtd_pedida * p.valor_unitario
      }

      const result = [...map.values()].map(e => ({
        fornecedor_id: e.fornecedor_id,
        fornecedor_nome: e.fornecedor_nome,
        num_skus: e.segIds.size,
        total_pecas: e.total_pecas,
        total_valor: e.total_valor,
      }))
      return resolve(result)
    },

    itensPorFornecedor(fornId, colId) {
      const filtered = pedidos.filter(p => p.fornecedor_id === fornId && p.colecao_id === colId)

      const map = new Map()
      for (const p of filtered) {
        if (!map.has(p.segmentacao_id)) {
          const seg = segmentacoes.find(s => s.id === p.segmentacao_id)
          map.set(p.segmentacao_id, {
            segmentacao_id: p.segmentacao_id,
            classificacao: seg.classificacao,
            tipo_produto: seg.tipo_produto,
            classe: seg.classe,
            total_comprado: 0,
          })
        }
        map.get(p.segmentacao_id).total_comprado += p.qtd_pedida
      }
      return resolve([...map.values()])
    },

    totaisPorTamanho(segId, colId) {
      const filtered = pedidos.filter(p => p.segmentacao_id === segId && p.colecao_id === colId)
      const map = new Map()
      for (const p of filtered) {
        map.set(p.tamanho, (map.get(p.tamanho) ?? 0) + p.qtd_pedida)
      }
      return resolve([...map.entries()].map(([tamanho, total_pedido]) => ({ tamanho, total_pedido })))
    },

    listarVisitas: () => resolve([]),
    listarPorColecao: () => resolve([]),
  },

  projecoes: {
    get(segId, colId) {
      return resolve(
        projecoes
          .filter(p => p.segmentacao_id === segId && p.colecao_id === colId)
          .map(p => ({ tamanho: p.tamanho, qtd_ajustada: p.qtd_ajustada }))
      )
    },
    calcular: () => resolve(null),
    salvar: () => resolve(null),
  },

  grades: {
    get: () => resolve([]),
  },
}

export default mockApi
```

- [ ] **Step 2: Commit**

```bash
git add demo/src/mockApi.js
git commit -m "feat(demo): implement mockApi with same window.api contract"
```

---

### Task 4: Infrastructure — styles, CollectionContext, utils, SegmentacaoSelect

**Files:**
- Create: `demo/src/styles/globals.css` (cópia exata de `src/renderer/src/styles/globals.css`)
- Create: `demo/src/contexts/CollectionContext.jsx` (cópia exata)
- Create: `demo/src/utils/dashboard.js` (cópia exata)
- Create: `demo/src/components/SegmentacaoSelect.jsx` (cópia exata)

- [ ] **Step 1: Criar demo/src/styles/globals.css**

Copiar o conteúdo exato de `src/renderer/src/styles/globals.css`:

```css
:root {
  --bg-primary:    #0f172a;
  --bg-secondary:  #1e293b;
  --bg-card:       #1e293b;
  --bg-hover:      rgba(255,255,255,0.05);
  --border:        rgba(255,255,255,0.08);
  --text-primary:  #e2e8f0;
  --text-secondary:#94a3b8;
  --text-muted:    #64748b;
  --accent:        #6366f1;
  --accent-light:  #a5b4fc;
  --green:         #86efac;
  --yellow:        #fcd34d;
  --orange:        #fb923c;
  --purple:        #c4b5fd;
  --red:           #f87171;
  --input-bg:      rgba(255,255,255,0.08);
  --input-border:  rgba(255,255,255,0.15);
}

:root.light {
  --bg-primary:    #f1f5f9;
  --bg-secondary:  #ffffff;
  --bg-card:       #ffffff;
  --bg-hover:      rgba(0,0,0,0.04);
  --border:        rgba(0,0,0,0.1);
  --text-primary:  #0f172a;
  --text-secondary:#475569;
  --text-muted:    #94a3b8;
  --input-bg:      #f8fafc;
  --input-border:  #cbd5e1;
  --accent:        #4f46e5;
  --accent-light:  #4338ca;
  --green:         #16a34a;
  --yellow:        #b45309;
  --orange:        #ea580c;
  --purple:        #7c3aed;
  --red:           #dc2626;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

button { cursor: pointer; font: inherit; }
select, input { font: inherit; }

select {
  appearance: none;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 4px;
  color: var(--text-primary);
  padding: 0.35rem 0.6rem;
  font-size: 0.85rem;
}
select:focus { outline: 1px solid var(--accent); }
select:disabled { opacity: 0.4; cursor: not-allowed; }

input[type="number"], input[type="text"], input[type="date"] {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 4px;
  color: var(--text-primary);
  padding: 0.35rem 0.6rem;
  font-size: 0.85rem;
}
input:focus { outline: 1px solid var(--accent); }

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; }
input[type="number"] { -moz-appearance: textfield; }
```

- [ ] **Step 2: Criar demo/src/contexts/CollectionContext.jsx**

Cópia exata (sem alteração — usa `window.api.colecoes.list()` que o mockApi provê):

```jsx
import { createContext, useContext, useState, useEffect } from 'react'

const CollectionContext = createContext(null)

export function CollectionProvider({ children }) {
  const [collections, setCollections] = useState([])
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    window.api.colecoes.list().then(list => {
      setCollections(list)
      if (list.length > 0) setActiveId(list[0].id)
    })
  }, [])

  const active = collections.find(c => c.id === activeId) ?? null

  return (
    <CollectionContext.Provider value={{ collections, setCollections, active, activeId, setActiveId }}>
      {children}
    </CollectionContext.Provider>
  )
}

export function useCollection() {
  const ctx = useContext(CollectionContext)
  if (!ctx) throw new Error('useCollection must be inside CollectionProvider')
  return ctx
}
```

- [ ] **Step 3: Criar demo/src/utils/dashboard.js**

```js
export function aggregateSegmentacao(projRows, pedidoTotais) {
  const projecao = projRows.reduce((s, r) => s + r.qtd_ajustada, 0)
  const comprado = pedidoTotais.reduce((s, r) => s + r.total_pedido, 0)
  const saldo = Math.max(0, projecao - comprado)
  const pct = projecao > 0 ? Math.min(100, Math.round((comprado / projecao) * 100)) : 0
  return { projecao, comprado, saldo, pct }
}

export function aggregateDashboard(rows) {
  const totalProjecao = rows.reduce((s, r) => s + r.projecao, 0)
  const totalComprado = rows.reduce((s, r) => s + r.comprado, 0)
  const totalSaldo = rows.reduce((s, r) => s + r.saldo, 0)
  const pctGeral = totalProjecao > 0 ? Math.min(100, Math.round((totalComprado / totalProjecao) * 100)) : 0
  return { totalProjecao, totalComprado, totalSaldo, pctGeral }
}
```

- [ ] **Step 4: Criar demo/src/components/SegmentacaoSelect.jsx**

Cópia exata:

```jsx
import { useState, useEffect } from 'react'

export default function SegmentacaoSelect({ segs, value, onChange }) {
  const selected = segs.find(s => s.id === value)

  const [selClass,  setSelClass]  = useState(selected?.classificacao ?? '')
  const [selTipo,   setSelTipo]   = useState(selected?.tipo_produto  ?? '')
  const [selClasse, setSelClasse] = useState(selected?.classe        ?? '')

  const classificacoes = [...new Set(segs.map(s => s.classificacao))].sort()
  const tipos  = [...new Set(segs.filter(s => s.classificacao === selClass).map(s => s.tipo_produto))].sort()
  const classes = [...new Set(segs.filter(s => s.classificacao === selClass && s.tipo_produto === selTipo).map(s => s.classe))].sort()

  useEffect(() => {
    const seg = segs.find(
      s => s.classificacao === selClass && s.tipo_produto === selTipo && s.classe === selClasse
    )
    onChange(seg?.id ?? null)
  }, [selClass, selTipo, selClasse, segs, onChange])

  function handleClass(v) { setSelClass(v); setSelTipo(''); setSelClasse('') }
  function handleTipo(v)  { setSelTipo(v);  setSelClasse('') }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <select value={selClass} onChange={e => handleClass(e.target.value)}>
        <option value="">Classificação</option>
        {classificacoes.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={selTipo} onChange={e => handleTipo(e.target.value)} disabled={!selClass}>
        <option value="">Tipo de produto</option>
        {tipos.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <select value={selClasse} onChange={e => setSelClasse(e.target.value)} disabled={!selTipo}>
        <option value="">Classe</option>
        {classes.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add demo/src/
git commit -m "feat(demo): add shared infrastructure (globals, CollectionContext, utils, SegmentacaoSelect)"
```

---

### Task 5: Sidebar adaptada para o demo

**Files:**
- Create: `demo/src/components/Sidebar.jsx`
- Create: `demo/src/components/Sidebar.module.css`

A sidebar do demo adiciona "← Voltar à apresentação" no topo e remove o toggle de tema (demo é sempre dark).

- [ ] **Step 1: Criar demo/src/components/Sidebar.jsx**

```jsx
import { Link } from 'react-router-dom'
import { useCollection } from '../contexts/CollectionContext'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: '◉' },
  { id: 'planejamento', label: 'Planejamento', icon: '🎯' },
  { id: 'compras',      label: 'Compras',      icon: '🛍️' },
  { id: 'relatorios',   label: 'Relatórios',   icon: '📊' },
]

export default function Sidebar({ current, onNavigate }) {
  const { collections, activeId, setActiveId } = useCollection()

  return (
    <aside className={styles.sidebar}>
      <Link to="/" className={styles.backLink}>← Apresentação</Link>

      <div className={styles.brand}>Solução Compras</div>

      <div className={styles.collectionSection}>
        <span className={styles.label}>Coleção ativa</span>
        <select
          className={styles.colSelect}
          value={activeId ?? ''}
          onChange={e => setActiveId(Number(e.target.value))}
        >
          {collections.length === 0 && <option value="">— nenhuma —</option>}
          {collections.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`${styles.navBtn} ${current === item.id ? styles.active : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.bottom}>
        <span className={styles.demoTag}>Modo demonstração</span>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Criar demo/src/components/Sidebar.module.css**

```css
.sidebar {
  width: 210px;
  min-height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.backLink {
  display: block;
  padding: 0.65rem 1rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  text-decoration: none;
  border-bottom: 1px solid var(--border);
  transition: color 0.12s;
}
.backLink:hover { color: var(--accent-light); }

.brand {
  padding: 1rem 1rem 0.8rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent-light);
  border-bottom: 1px solid var(--border);
  letter-spacing: 0.02em;
}

.collectionSection {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.label {
  display: block;
  font-size: 0.65rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 0.35rem;
}

.colSelect { width: 100%; }

.nav {
  flex: 1;
  padding: 0.4rem 0.5rem;
}

.navBtn {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.55rem 0.75rem;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-align: left;
  transition: background 0.12s, color 0.12s;
}
.navBtn:hover { background: var(--bg-hover); color: var(--text-primary); }
.active { background: rgba(99,102,241,0.15) !important; color: var(--accent-light) !important; }

.icon { font-size: 0.9rem; width: 1.2rem; text-align: center; }

.bottom {
  padding: 0.75rem;
  border-top: 1px solid var(--border);
}

.demoTag {
  display: block;
  font-size: 0.72rem;
  color: var(--text-muted);
  text-align: center;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
}
```

- [ ] **Step 3: Commit**

```bash
git add demo/src/components/Sidebar.jsx demo/src/components/Sidebar.module.css
git commit -m "feat(demo): add adapted Sidebar with back-to-landing link"
```

---

### Task 6: Screens — Dashboard, Compras, Planejamento placeholder, Relatórios

**Files:**
- Create: `demo/src/screens/Dashboard.jsx` (cópia exata + module.css)
- Create: `demo/src/screens/Compras.jsx` (cópia exata + module.css)
- Create: `demo/src/screens/Planejamento.jsx` (placeholder simples)
- Create: `demo/src/screens/Relatorios.jsx` (cópia exata + module.css)
- Create: `demo/src/screens/relatorios/PorFornecedor.jsx` (cópia exata + module.css)
- Create: `demo/src/screens/relatorios/PorSegmentacao.jsx` (cópia exata + module.css)

**Atenção:** os imports de `useCollection`, `SegmentacaoSelect`, e utils precisam apontar para `../contexts/`, `../components/`, `../utils/` — os mesmos relativos já usados no renderer original, então funcionam sem alteração.

- [ ] **Step 1: Criar demo/src/screens/Dashboard.jsx**

Cópia exata de `src/renderer/src/screens/Dashboard.jsx`. O import de `aggregateSegmentacao/aggregateDashboard` usa `../utils/dashboard` que existe em `demo/src/utils/dashboard.js`.

```jsx
import { useState, useEffect } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import { aggregateSegmentacao, aggregateDashboard } from '../utils/dashboard'
import styles from './Dashboard.module.css'

function ProgressBar({ pct, height = 8 }) {
  const safe = Math.min(100, Math.max(0, pct))
  const color = safe >= 100 ? 'var(--green)' : safe > 0 ? 'var(--accent)' : 'var(--red)'
  return (
    <div className={styles.bar} style={{ height }}>
      <div className={styles.barFill} style={{ width: `${safe}%`, background: color }} />
    </div>
  )
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardLabel}>{label}</div>
      <div className={styles.cardValue} style={{ color }}>{value}</div>
      {sub && <div className={styles.cardSub}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { active } = useCollection()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!active) { setRows([]); return }
    setLoading(true)
    loadData(active.id).finally(() => setLoading(false))
  }, [active?.id])

  async function loadData(colId) {
    const segs = await window.api.segmentacoes.list()
    const rowData = await Promise.all(
      segs.map(async seg => {
        const [proj, totais] = await Promise.all([
          window.api.projecoes.get(seg.id, colId),
          window.api.pedidos.totaisPorTamanho(seg.id, colId),
        ])
        return { seg, ...aggregateSegmentacao(proj, totais) }
      })
    )
    setRows(rowData.filter(r => r.projecao > 0))
  }

  if (!active) {
    return (
      <div className={styles.empty}>
        <span>Nenhuma coleção encontrada.</span>
      </div>
    )
  }

  const { totalProjecao, totalComprado, totalSaldo, pctGeral } = aggregateDashboard(rows)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{active.nome}</h1>
        <span className={styles.badge}>{active.status}</span>
      </div>

      <div className={styles.cards}>
        <MetricCard label="Projeção total"   value={totalProjecao.toLocaleString('pt-BR')} sub="peças"      color="var(--purple)" />
        <MetricCard label="Já comprado"      value={totalComprado.toLocaleString('pt-BR')} sub="peças"      color="var(--green)"  />
        <MetricCard label="Saldo a comprar"  value={totalSaldo.toLocaleString('pt-BR')}    sub="peças"      color="var(--yellow)" />
        <MetricCard label="Progresso"        value={`${pctGeral}%`}                         sub="da coleção" color="var(--accent-light)" />
      </div>

      <div className={styles.progressBox}>
        <div className={styles.progressLabel}>
          <span>Progresso geral da coleção</span>
          <span>{pctGeral}%</span>
        </div>
        <ProgressBar pct={pctGeral} height={10} />
      </div>

      <div className={styles.tableBox}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Segmentação</th>
              <th>Projeção</th>
              <th>Comprado</th>
              <th>Saldo</th>
              <th style={{ minWidth: 140 }}>Progresso</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className={styles.emptyRow}>Carregando…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={5} className={styles.emptyRow}>
                Nenhuma projeção cadastrada para esta coleção.
              </td></tr>
            )}
            {!loading && rows.map(({ seg, projecao, comprado, saldo, pct }) => (
              <tr
                key={seg.id}
                className={pct >= 100 ? styles.rowDone : pct === 0 ? styles.rowNone : ''}
              >
                <td>
                  <div className={styles.segCell}>
                    {pct >= 100 && <span className={styles.checkMark}>✓</span>}
                    <span>{seg.classificacao} · {seg.tipo_produto} · {seg.classe}</span>
                  </div>
                </td>
                <td className={styles.numCell}>{projecao.toLocaleString('pt-BR')}</td>
                <td className={styles.numCell}>{comprado.toLocaleString('pt-BR')}</td>
                <td className={styles.numCell}>{saldo.toLocaleString('pt-BR')}</td>
                <td>
                  <div className={styles.barCell}>
                    <div style={{ flex: 1 }}><ProgressBar pct={pct} /></div>
                    <span className={styles.pctText}>{pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Criar demo/src/screens/Dashboard.module.css**

Copiar o conteúdo exato de `src/renderer/src/screens/Dashboard.module.css`.

- [ ] **Step 3: Criar demo/src/screens/Compras.jsx**

Copiar o conteúdo exato de `src/renderer/src/screens/Compras.jsx` (já usa `window.api` e `SegmentacaoSelect` com imports relativos corretos).

- [ ] **Step 4: Criar demo/src/screens/Compras.module.css**

Copiar o conteúdo exato de `src/renderer/src/screens/Compras.module.css`.

- [ ] **Step 5: Criar demo/src/screens/Planejamento.jsx**

```jsx
import styles from './Planejamento.module.css'

export default function Planejamento() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Planejamento</h1>
      <div className={styles.notice}>
        <div className={styles.icon}>🔧</div>
        <p>Esta funcionalidade requer o histórico de coleções anteriores importado.</p>
        <p className={styles.sub}>Disponível na próxima fase do projeto.</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Criar demo/src/screens/Planejamento.module.css**

```css
.page {
  padding: 2rem;
}

.title {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2rem;
}

.notice {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  color: var(--text-secondary);
  max-width: 480px;
}

.icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.notice p {
  font-size: 0.95rem;
  line-height: 1.6;
}

.sub {
  margin-top: 0.5rem;
  color: var(--text-muted);
  font-size: 0.85rem !important;
}
```

- [ ] **Step 7: Criar demo/src/screens/Relatorios.jsx**

Copiar o conteúdo exato de `src/renderer/src/screens/Relatorios.jsx`.

- [ ] **Step 8: Criar demo/src/screens/Relatorios.module.css**

Copiar o conteúdo exato de `src/renderer/src/screens/Relatorios.module.css`.

- [ ] **Step 9: Criar demo/src/screens/relatorios/PorFornecedor.jsx**

Copiar o conteúdo exato de `src/renderer/src/screens/relatorios/PorFornecedor.jsx`.

- [ ] **Step 10: Criar demo/src/screens/relatorios/PorFornecedor.module.css**

Copiar o conteúdo exato de `src/renderer/src/screens/relatorios/PorFornecedor.module.css`.

- [ ] **Step 11: Criar demo/src/screens/relatorios/PorSegmentacao.jsx**

Copiar o conteúdo exato de `src/renderer/src/screens/relatorios/PorSegmentacao.jsx`.

- [ ] **Step 12: Criar demo/src/screens/relatorios/PorSegmentacao.module.css**

Copiar o conteúdo exato de `src/renderer/src/screens/relatorios/PorSegmentacao.module.css`.

- [ ] **Step 13: Commit**

```bash
git add demo/src/screens/
git commit -m "feat(demo): add all app screens (Dashboard, Compras, Planejamento placeholder, Relatorios)"
```

---

### Task 7: Landing page

**Files:**
- Create: `demo/src/Landing.jsx`
- Create: `demo/src/Landing.module.css`

- [ ] **Step 1: Criar demo/src/Landing.jsx**

```jsx
import { Link } from 'react-router-dom'
import styles from './Landing.module.css'

const steps = [
  {
    num: '01',
    title: 'Criar coleção',
    desc: 'Define a temporada: Inverno 2026, Verão 2027…',
  },
  {
    num: '02',
    title: 'Planejar projeções',
    desc: 'O sistema calcula baseado no histórico das 2 coleções equivalentes anteriores + produtos permanentes.',
  },
  {
    num: '03',
    title: 'Registrar pedidos',
    desc: 'A cada negociação fechada: fornecedor + segmentação + grade de tamanhos.',
  },
  {
    num: '04',
    title: 'Acompanhar relatórios',
    desc: 'Visão em tempo real: projeção vs comprado, por fornecedor e por segmentação.',
  },
]

const ready = [
  'Dashboard com progresso geral',
  'Planejamento com cálculo de projeção',
  'Registro de pedidos',
  'Relatórios: Por Fornecedor e Por Segmentação',
]

const building = [
  'Interface para criar coleções',
  'Importação automática do histórico (planilhas Excel)',
  'Cadastro dos ~150 fornecedores do ERP',
  'Refinamento visual',
]

export default function Landing() {
  return (
    <div className={styles.page}>
      <div className={styles.mobileBanner}>
        Esta demonstração foi otimizada para desktop. Para melhor experiência, acesse de um computador.
      </div>

      {/* Seção 1 — Problema */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Gestão de compras de moda<br />sem planilhas.</h1>
          <p className={styles.heroSub}>
            Hoje: 100 arquivos Excel, sem visão consolidada.<br />
            Depois: um sistema, uma tela.
          </p>
          <Link to="/app" className={styles.ctaBtn}>Explorar o app →</Link>
        </div>
      </section>

      {/* Seção 2 — Fluxo */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Como funciona</h2>
        <div className={styles.timeline}>
          {steps.map(s => (
            <div key={s.num} className={styles.step}>
              <div className={styles.stepNum}>{s.num}</div>
              <div className={styles.stepContent}>
                <div className={styles.stepTitle}>{s.title}</div>
                <div className={styles.stepDesc}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seção 3 — Status */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Status do projeto</h2>
        <div className={styles.statusGrid}>
          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <span className={styles.statusIcon}>✅</span>
              <span>Funcionando hoje</span>
            </div>
            <ul className={styles.statusList}>
              {ready.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <span className={styles.statusIcon}>🔧</span>
              <span>Em construção</span>
            </div>
            <ul className={styles.statusList}>
              {building.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
        <div className={styles.ctaRow}>
          <Link to="/app" className={styles.ctaBtn}>Explorar o app →</Link>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Criar demo/src/Landing.module.css**

```css
.page {
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
}

/* Mobile disclaimer */
.mobileBanner {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #b45309;
  color: #fff;
  text-align: center;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  line-height: 1.4;
}
@media (max-width: 1023px) {
  .mobileBanner { display: block; }
  .page { padding-top: 60px; }
}

/* Hero */
.hero {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  border-bottom: 1px solid var(--border);
}

.heroInner {
  max-width: 700px;
  text-align: center;
}

.heroTitle {
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.25rem;
  color: var(--text-primary);
}

.heroSub {
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 2.5rem;
}

/* CTA button */
.ctaBtn {
  display: inline-block;
  background: var(--accent);
  color: #fff;
  text-decoration: none;
  padding: 0.85rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.15s, transform 0.1s;
}
.ctaBtn:hover {
  background: #4f46e5;
  transform: translateY(-1px);
}

/* Sections */
.section {
  max-width: 900px;
  margin: 0 auto;
  padding: 4rem 2rem;
  border-bottom: 1px solid var(--border);
}

.sectionTitle {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2.5rem;
  color: var(--text-primary);
}

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.stepNum {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  min-width: 2.5rem;
}

.stepContent {
  flex: 1;
  padding-top: 0.25rem;
}

.stepTitle {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 0.3rem;
}

.stepDesc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Status grid */
.statusGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

@media (max-width: 640px) {
  .statusGrid { grid-template-columns: 1fr; }
}

.statusCard {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.5rem;
}

.statusHeader {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.statusIcon { font-size: 1.1rem; }

.statusList {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.statusList li {
  font-size: 0.875rem;
  color: var(--text-secondary);
  padding-left: 1rem;
  position: relative;
}
.statusList li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--text-muted);
}

.ctaRow {
  text-align: center;
}
```

- [ ] **Step 3: Commit**

```bash
git add demo/src/Landing.jsx demo/src/Landing.module.css
git commit -m "feat(demo): add landing page with 3 sections and mobile disclaimer"
```

---

### Task 8: App shell e entry point — main.jsx com router

**Files:**
- Create: `demo/src/AppShell.jsx`
- Create: `demo/src/AppShell.module.css`
- Create: `demo/src/main.jsx`

- [ ] **Step 1: Criar demo/src/AppShell.jsx**

```jsx
import { useState } from 'react'
import { CollectionProvider } from './contexts/CollectionContext'
import Sidebar from './components/Sidebar'
import Dashboard from './screens/Dashboard'
import Planejamento from './screens/Planejamento'
import Compras from './screens/Compras'
import Relatorios from './screens/Relatorios'
import styles from './AppShell.module.css'

const SCREENS = {
  dashboard:    () => <Dashboard />,
  planejamento: () => <Planejamento />,
  compras:      () => <Compras />,
  relatorios:   () => <Relatorios />,
}

export default function AppShell() {
  const [screen, setScreen] = useState('dashboard')
  const Screen = SCREENS[screen] ?? SCREENS.dashboard

  return (
    <CollectionProvider>
      <div className={styles.shell}>
        <Sidebar current={screen} onNavigate={setScreen} />
        <main className={styles.main}>
          <Screen />
        </main>
      </div>
    </CollectionProvider>
  )
}
```

- [ ] **Step 2: Criar demo/src/AppShell.module.css**

```css
.shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main {
  flex: 1;
  overflow: auto;
  background: var(--bg-primary);
}
```

- [ ] **Step 3: Criar demo/src/main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import mockApi from './mockApi.js'
import './styles/globals.css'
import Landing from './Landing.jsx'
import AppShell from './AppShell.jsx'

window.api = mockApi

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<AppShell />} />
        <Route path="/app/*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Step 4: Testar localmente**

```
cd demo && npm run dev
```

Abrir `http://localhost:5173` e verificar:
- Landing carrega com fundo escuro, 3 seções, botão "Explorar o app →"
- Botão navega para `/app` e abre o Dashboard com dados da coleção "Inverno 2026"
- Dashboard mostra 8 segmentações com progresso ~60%
- Compras funciona: selecionar segmentação mostra grade com projeções e pedidos
- Relatórios → Por Fornecedor: lista 15 fornecedores, clique abre detalhe com pills e tabela
- Relatórios → Por Segmentação: filtros em cascata, clique em fornecedor vai para detalhe pré-filtrado
- Sidebar: link "← Apresentação" navega de volta para `/`
- Planejamento mostra o aviso de "próxima fase"

- [ ] **Step 5: Commit**

```bash
git add demo/src/AppShell.jsx demo/src/AppShell.module.css demo/src/main.jsx
git commit -m "feat(demo): wire up router, mockApi injection, and AppShell"
```

---

### Task 9: Deploy no Vercel

- [ ] **Step 1: Build de validação**

```
cd demo && npm run build
```

Expected: `dist/` criado sem erros. Se houver erros de import, corrigir antes de prosseguir.

- [ ] **Step 2: Primeiro deploy manual**

```
cd demo && npx vercel --prod
```

Quando o CLI perguntar:
- "Set up and deploy?" → Y
- "Which scope?" → selecionar conta pessoal
- "Link to existing project?" → N
- "Project name?" → `solucao-compras-demo`
- "In which directory is your code located?" → `.` (já está em `demo/`)
- "Want to modify these settings?" → N

Aguardar o deploy. O CLI retorna a URL pública (ex: `https://solucao-compras-demo.vercel.app`).

- [ ] **Step 3: Testar URL pública**

Abrir a URL no navegador e repetir os checks do Task 8 Step 4.

- [ ] **Step 4: (Opcional) Conectar ao GitHub para deploy automático**

No dashboard do Vercel → Settings → Git → Connect Repository → selecionar `edukern/solucao-compras` → Root Directory: `demo`.

Após conectar, qualquer push na branch `main` faz redeploy automático.

- [ ] **Step 5: Commit final com URL**

Anotar a URL pública no `demo/README.md` (criar o arquivo):

```
# Demo — Solução Compras

URL pública: https://solucao-compras-demo.vercel.app

App interativo de demonstração para o gestor Samuel Backes.
Dados são mock (Inverno 2026 com 15 fornecedores reais).
Resets ao recarregar a página — sem persistência.
```

```bash
git add demo/README.md
git commit -m "docs(demo): add README with public URL"
git push origin main
```

---

## Self-Review

**Spec coverage:**
- ✅ Rota `/` — landing com 3 seções (Problema, Fluxo, Status)
- ✅ Rota `/app` — app interativo com Dashboard, Compras, Relatorios
- ✅ `window.api = mockApi` em `main.jsx` antes do render
- ✅ 15 fornecedores reais do ERP
- ✅ 8 segmentações com combinações AD/EX/INF × produto × classe
- ✅ ~60% do previsto comprado (pedidos distribuídos realisticamente)
- ✅ Sidebar com link "← Apresentação" de volta para `/`
- ✅ Planejamento com aviso de próxima fase
- ✅ Mobile disclaimer para < 1024px
- ✅ `vercel.json` com rewrite SPA
- ✅ Subprojeto isolado em `demo/` com package.json próprio

**Placeholder scan:** Nenhum TBD ou TODO encontrado.

**Type consistency:** `mockApi` implementa exatamente o contrato que os screens chamam — `totaisPorFornecedor(colId, segId)`, `itensPorFornecedor(fornId, colId)`, `totaisPorTamanho(segId, colId)`, `projecoes.get(segId, colId)`. Assinaturas verificadas contra cada screen.
