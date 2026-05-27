# Histórico de Coleções — Extração, Carga e Analytics

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extrair dados de pedidos dos ~3.000 xlsx históricos (2015-1 a 2026-2), carregar no Supabase e construir telas de analytics com projeções por segmentação/loja.

**Architecture:** Script Node.js local lê xlsx → produz SQL → operador aplica no Supabase. UI React consome as tabelas `hist_*` e `projecoes` já existentes no schema.

**Tech Stack:** Node.js + xlsx npm, Supabase JS v2, React 18, CSS Modules.

---

## Contexto de negócio

Hoje as compradoras não têm previsibilidade: não sabem o que cada loja comprou em coleções passadas, não conseguem projetar quantidades. O histórico está todo em xlsx locais (2015 a 2026, ~22 coleções). Este plano gera:

1. **Histórico bruto** — o que cada comprador comprou de cada fornecedor, por coleção
2. **Histórico de grade** — distribuição de tamanhos por segmentação/coleção
3. **Projeções automáticas** — média ponderada das últimas N coleções, por tamanho

O schema `002_hist_tables.sql` já existe com as tabelas:
- `hist_grade(colecao_id TEXT, segmentacao_id, tamanho, qtd_total_comprada)`
- `hist_fornecedor(colecao_id, fornecedor_id, total_bruto, total_liquido, num_referencias)`
- `hist_comprador_fornecedor(colecao_id, comprador_id, fornecedor_id, total_bruto, total_liquido)`
- `hist_comprador_produto(colecao_id, comprador_id, segmentacao_id, qtd_total, valor_total)`

---

## Estrutura dos xlsx de coleções

Cada arquivo `.xlsx` em `Pedidos/<colecao>/` tem uma aba `PEDIDO` com:

```
Row 0: [Fornecedor:, NOME, , , Vendedor:, VENDEDOR]
Row 1: [Data:, DATA, , , Fone:, FONE]
Row 2: [Entrega:, DATA_ENTREGA]
Row 3: [Cond. Pag:, COND_PAG, , , Nota Fiscal:, NF_TIPO]
Row 4: [Frete, FRETE, , , Crédito:, ICMS_PCT]
Row 5: [Transportadora:, TRANSP]
Row 6: [Desc. %?, ...]       ← linha de desconto, ignorar
Row 7: (Obs ou vazia)
Row 8+: Lojas → uma linha com nomes de lojas (ex: BACKES, SAMUEL, PSM, ...)
Row N:  Cabeçalho item (Ref | Produto/Tipo | Grade | ...)
Row N+1...: Itens (ref, tipo, grade, classe, valor, qtds por loja...)
```

**Mapeamento de lojas** (texto no xlsx → comprador_id):

| Texto no xlsx          | comprador_id |
|------------------------|--------------|
| BACKES / IRMAOS        | 1            |
| SAMUEL / SAM           | 2            |
| PSM / PETERSON         | 3            |
| ALEXANDRE / ALEX       | 4 (→ ordem 6)|
| ELISANGELA / ELISA     | 5 (→ ordem 5)|
| RAFAEL / RAF           | 6 (→ ordem 4)|
| STREIT                 | 7            |
| FMV                    | 8            |

> **Atenção:** os nomes no xlsx são abreviações não padronizadas. O script precisa de um mapeamento fuzzy robusto. Preferir partial match case-insensitive; logar casos não mapeados para revisão manual.

---

## File Map

- **Create:** `docs/importar-historico.js` — script de extração principal
- **Create:** `docs/historico-seed.sql` — output gerado (não commitar, aplicar via MCP)
- **Modify:** `supabase/migrations/006_hist_indexes.sql` — índices para queries de analytics
- **Create:** `src/renderer/src/screens/Historico.jsx` — tela principal de analytics
- **Create:** `src/renderer/src/screens/Historico.module.css`
- **Create:** `src/renderer/src/screens/historico/GradeHistorica.jsx` — análise por tamanho
- **Create:** `src/renderer/src/screens/historico/TendenciasLoja.jsx` — análise por loja/coleção
- **Create:** `src/renderer/src/screens/historico/Projecoes.jsx` — tabela de projeção editável
- **Create:** `src/renderer/src/services/historico.js` — queries Supabase
- **Modify:** `src/renderer/src/components/Sidebar.jsx` — adicionar item "Histórico"

---

## Task 1: Investigar estrutura real dos xlsx

**Objetivo:** Confirmar exatamente em quais linhas ficam os nomes de lojas, o cabeçalho dos itens e os itens propriamente ditos.

**Files:**
- Create: `docs/debug-xlsx-estrutura.js`

- [ ] **Step 1: Escrever script de diagnóstico**

```js
// docs/debug-xlsx-estrutura.js
const xlsx = require('xlsx')
const path = require('path')

// Usar 3 arquivos de coleções diferentes para validar estrutura
const SAMPLES = [
  'Pedidos/2025-2/Biogas 27-05-25.xlsx',
  'Pedidos/2023-2/BIOGAS 22-06-23.xlsx',
  'Pedidos/2019-1/Biogas 31-01-19.xlsx',
]

const BASE = 'C:\\Users\\eduke\\Solução Compras\\'

for (const rel of SAMPLES) {
  try {
    const wb = xlsx.readFile(path.join(BASE, rel), { cellDates: false })
    const sheetName = wb.SheetNames.find(n => /^pedido$/i.test(n)) ?? wb.SheetNames[0]
    const ws = wb.Sheets[sheetName]
    const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' })
    console.log(`\n=== ${rel} ===`)
    for (let i = 0; i < Math.min(25, rows.length); i++) {
      const nonEmpty = rows[i].filter(c => String(c).trim() !== '')
      if (nonEmpty.length > 0) console.log(`Row ${i}:`, JSON.stringify(rows[i].slice(0, 15)))
    }
  } catch (e) { console.error(rel, e.message) }
}
```

- [ ] **Step 2: Rodar o diagnóstico**

```bash
node docs/debug-xlsx-estrutura.js
```

- [ ] **Step 3: Documentar o padrão observado**

Com base no output, confirmar:
- Em qual linha ficam os nomes de loja
- Em qual linha fica o cabeçalho de itens (Ref | Tipo | Grade...)
- Quais colunas são para quais lojas
- Como identificar o final dos itens (linha vazia? linha de total?)

Registrar as conclusões como comentários no topo do `importar-historico.js` antes de escrever.

---

## Task 2: Script de extração — importar-historico.js

**Files:**
- Create: `docs/importar-historico.js`

- [ ] **Step 1: Escrever o script de extração**

O script deve:
1. Varrer todas as 22 coleções (2015-1 a 2026-2)
2. Para cada xlsx: extrair fornecedor, coleção, e dados de itens por loja
3. Mapear nomes de loja → comprador_id (com log de não-mapeados)
4. Agregar `hist_comprador_produto` (qtd por comprador/segmentação/coleção) e `hist_grade` (qtd por tamanho/segmentação/coleção)
5. Gerar SQL com `INSERT ... ON CONFLICT DO UPDATE` idempotente

```js
// docs/importar-historico.js
// Roda localmente: node docs/importar-historico.js > docs/historico-seed.sql

const xlsx = require('xlsx')
const fs   = require('fs')
const path = require('path')

const BASE = 'C:\\Users\\eduke\\Solução Compras\\Pedidos'

const COLECOES = [
  '2015-1','2015-2','2016-1','2016-2','2017-1','2017-2',
  '2018-1','2018-2','2019-1','2019-2','2020-1','2020-2',
  '2021-1','2021-2','2022-1','2022-2','2023-1','2023-2',
  '2024-1','2024-2','2025-1','2025-2','2026-1','2026-2',
]

// Mapeamento nome-coluna → comprador_id (ajustar após Task 1)
const LOJA_MAP = [
  { id: 1, patterns: [/backes/i, /irm[aã]os/i, /ib/i] },
  { id: 2, patterns: [/samuel/i, /sam\b/i] },
  { id: 3, patterns: [/psm/i, /peterson/i] },
  { id: 4, patterns: [/alexandre/i, /\balex\b/i] },
  { id: 5, patterns: [/elisangela/i, /elisa/i] },
  { id: 6, patterns: [/^rafael/i, /\braf\b/i] },
  { id: 7, patterns: [/streit/i] },
  { id: 8, patterns: [/fmv/i] },
]

function mapLoja(nome) {
  const n = String(nome ?? '').trim()
  for (const { id, patterns } of LOJA_MAP)
    if (patterns.some(p => p.test(n))) return id
  return null
}

// ... (lógica de extração de items e geração de SQL)
// Expandir após confirmar estrutura dos xlsx na Task 1
```

**Nota:** Escrever a lógica completa de extração de itens DEPOIS de confirmar a estrutura dos xlsx na Task 1. O esqueleto acima é o ponto de partida.

- [ ] **Step 2: Rodar e verificar output**

```bash
node docs/importar-historico.js > docs/historico-seed.sql 2>docs/historico-log.txt
head -50 docs/historico-seed.sql
cat docs/historico-log.txt  # ver lojas não mapeadas
```

- [ ] **Step 3: Verificar não-mapeadas e ajustar LOJA_MAP**

Abrir `docs/historico-log.txt`, ver quais nomes de coluna não foram identificados. Atualizar `LOJA_MAP` e re-rodar até o log de não-mapeadas estar vazio ou com casos conhecidos (ex: "TOTAL", "Ref", etc.).

---

## Task 3: Adicionar índices no schema Supabase

**Files:**
- Create: `supabase/migrations/006_hist_indexes.sql`

- [ ] **Step 1: Escrever migration de índices**

```sql
-- supabase/migrations/006_hist_indexes.sql
-- Índices para acelerar queries de analytics no histórico

CREATE INDEX IF NOT EXISTS hist_grade_colecao
  ON hist_grade(colecao_id);

CREATE INDEX IF NOT EXISTS hist_grade_seg
  ON hist_grade(segmentacao_id, colecao_id);

CREATE INDEX IF NOT EXISTS hist_comp_prod_colecao
  ON hist_comprador_produto(colecao_id, comprador_id);

CREATE INDEX IF NOT EXISTS hist_comp_forn_colecao
  ON hist_comprador_fornecedor(colecao_id, comprador_id);
```

- [ ] **Step 2: Aplicar via Supabase MCP**

Usar `mcp__1982d284__apply_migration` com project_id `bhxpkysueyoblizkvomb`.

- [ ] **Step 3: Aplicar o SQL de dados gerado**

Após validar `docs/historico-seed.sql`, executar via `mcp__1982d284__execute_sql` (em lotes se o arquivo for grande, 500 registros por vez).

- [ ] **Step 4: Verificar contagens**

```sql
SELECT 'hist_grade' t, COUNT(*) FROM hist_grade
UNION ALL SELECT 'hist_comprador_produto', COUNT(*) FROM hist_comprador_produto
UNION ALL SELECT 'hist_comprador_fornecedor', COUNT(*) FROM hist_comprador_fornecedor;
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/006_hist_indexes.sql docs/importar-historico.js
git commit -m "feat: script extração histórico + índices analytics"
```

---

## Task 4: Service de histórico + projeções

**Files:**
- Create: `src/renderer/src/services/historico.js`

- [ ] **Step 1: Implementar service**

```js
// src/renderer/src/services/historico.js
import { supabase } from '../lib/supabase'

export const historico = {
  // Retorna qtd comprada por tamanho, por coleção, para uma segmentação
  async gradeHistorica(segmentacaoId, limit = 8) {
    const { data, error } = await supabase
      .from('hist_grade')
      .select('colecao_id, tamanho, qtd_total_comprada')
      .eq('segmentacao_id', segmentacaoId)
      .order('colecao_id', { ascending: false })
      .limit(limit * 20)  // multiplicar pois há N tamanhos por coleção
    if (error) throw error
    return data ?? []
  },

  // Retorna total comprado por comprador nas últimas N coleções
  async totaisPorComprador(colecaoIds) {
    const { data, error } = await supabase
      .from('hist_comprador_produto')
      .select(`
        colecao_id, qtd_total, valor_total,
        compradores(id, nome, ordem),
        segmentacoes(tipo_produto, classe, tipo_grade)
      `)
      .in('colecao_id', colecaoIds)
      .order('colecao_id', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  // Calcula projeção por tamanho: média das últimas N coleções
  async projecaoGrade(segmentacaoId, colecaoAlvoId, nColecoes = 4) {
    // 1. Buscar histórico das últimas nColecoes
    const hist = await this.gradeHistorica(segmentacaoId, nColecoes)
    // 2. Agrupar por tamanho
    const mapa = new Map()
    for (const r of hist) {
      const cur = mapa.get(r.tamanho) ?? { tamanho: r.tamanho, qtds: [] }
      cur.qtds.push(r.qtd_total_comprada)
      mapa.set(r.tamanho, cur)
    }
    // 3. Calcular média simples por tamanho
    return [...mapa.values()].map(({ tamanho, qtds }) => ({
      tamanho,
      qtd_projetada: Math.round(qtds.reduce((a, b) => a + b, 0) / qtds.length),
      colecoes_base: qtds.length,
    }))
  },
}
```

- [ ] **Step 2: Verificar no browser (console)**

Abrir dev tools → console → executar:
```js
import { historico } from './src/renderer/src/services/historico.js'
historico.gradeHistorica(1).then(console.log)
```

Verificar que retorna dados.

---

## Task 5: Tela Histórico — visão geral por fornecedor/coleção

**Files:**
- Create: `src/renderer/src/screens/Historico.jsx`
- Create: `src/renderer/src/screens/Historico.module.css`
- Modify: `src/renderer/src/components/Sidebar.jsx`

- [ ] **Step 1: Criar Historico.jsx**

A tela principal deve ter 3 abas:
- **Grade Histórica** — dado um fornecedor/segmentação, mostra distribuição de tamanhos por coleção
- **Tendências por Loja** — dado um fornecedor, mostra totais por comprador ao longo das coleções
- **Projeções** — tabela editável com projeção por tamanho para a próxima coleção

```jsx
// src/renderer/src/screens/Historico.jsx
import { useState } from 'react'
import GradeHistorica from './historico/GradeHistorica'
import TendenciasLoja from './historico/TendenciasLoja'
import ProjecoesView from './historico/Projecoes'
import styles from './Historico.module.css'

const ABAS = [
  { id: 'grade',     label: 'Grade por coleção' },
  { id: 'tendencias',label: 'Tendências por loja' },
  { id: 'projecoes', label: 'Projeções' },
]

export default function Historico({ colecaoAtual }) {
  const [aba, setAba] = useState('grade')
  return (
    <div className={styles.wrap}>
      <h2 className={styles.titulo}>Histórico de Coleções</h2>
      <div className={styles.abas}>
        {ABAS.map(a => (
          <button key={a.id} className={aba === a.id ? styles.abaAtiva : styles.aba}
            onClick={() => setAba(a.id)}>{a.label}</button>
        ))}
      </div>
      {aba === 'grade'      && <GradeHistorica />}
      {aba === 'tendencias' && <TendenciasLoja />}
      {aba === 'projecoes'  && <ProjecoesView colecaoId={colecaoAtual} />}
    </div>
  )
}
```

- [ ] **Step 2: Criar GradeHistorica.jsx**

Permite selecionar um tipo_produto + classe + tipo_grade → exibe tabela com colunas = tamanhos, linhas = coleções, células = qtd comprada.

```jsx
// src/renderer/src/screens/historico/GradeHistorica.jsx
// Interface: filtros (tipo_produto, classe, tipo_grade) → tabela cruzada colecao x tamanho
```

- [ ] **Step 3: Criar TendenciasLoja.jsx**

Exibe para cada comprador, uma linha por coleção com: peças totais, valor total.
Permite filtrar por fornecedor ou segmentação.

- [ ] **Step 4: Criar Projecoes.jsx**

Mostra a projeção calculada para a coleção alvo (via `historico.projecaoGrade()`). Permite editar manualmente as projeções (salva na tabela `projecoes` do Supabase).

- [ ] **Step 5: Adicionar no Sidebar**

Em `src/renderer/src/components/Sidebar.jsx`, adicionar botão "Histórico" (ícone 📈 ou 🕐) no menu de navegação, antes de Relatórios.

- [ ] **Step 6: Adicionar rota em App.jsx**

Seguir o padrão das outras telas. Adicionar `case 'historico': return <Historico colecaoAtual={colecaoId} />` no switch de telas.

- [ ] **Step 7: Commit**

```bash
git add src/renderer/src/screens/Historico.jsx src/renderer/src/screens/Historico.module.css
git add src/renderer/src/screens/historico/
git add src/renderer/src/services/historico.js
git add src/renderer/src/components/Sidebar.jsx src/renderer/src/screens/App.jsx
git commit -m "feat: tela de histórico de coleções + analytics"
```

---

## Notas de implementação

- **Coleção ID em `hist_*`** é TEXT (ex: `"2025-2"`), não FK — isso permite referenciar coleções históricas sem inserir todas no Supabase.
- **Lojas não mapeadas** no xlsx devem ser logadas (stderr) mas não devem interromper o script.
- **Re-execução do script** é segura: `ON CONFLICT DO UPDATE` sobrescreve.
- **Volume esperado:** ~3.000 xlsx × ~20 itens = ~60.000 linhas. Aplicar em lotes de 500.
- **Projeções salvas** ficam em `projecoes(segmentacao_id, colecao_id, tamanho, qtd_ajustada)` — tabela já existe no schema.
