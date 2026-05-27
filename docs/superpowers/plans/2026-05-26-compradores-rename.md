# Compradores — Rename, Reorder e Totais por Loja

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Renomear 5 compradores, definir ordem de exibição e adicionar relatório de total comprado por loja.

**Architecture:** Migration Supabase adiciona coluna `ordem` e atualiza dados; service e UI passam a ordenar por `ordem`; nova seção no Relatorios mostra totais por comprador/loja.

**Tech Stack:** Supabase (PostgreSQL via MCP mcp__1982d284), React 18 + Vite, Supabase JS v2.

---

## Contexto de negócio

A rede tem 8 compradores (lojas). Os IDs foram fixados via `supabase/seed.sql`. **Nunca alterar CNPJ nem cidade.** Apenas nome e ordem mudam.

| ID | Nome atual            | Nome novo              | Ordem nova |
|----|-----------------------|------------------------|------------|
| 1  | Irmãos Backes         | Backes Art. Vestuário  | 1          |
| 2  | Samuel Paulo Backes   | Backes Programação 1   | 2          |
| 3  | PSM Backes            | Backes Programação 2   | 3          |
| 6  | Rafael J. Backes      | Rafael J. Backes       | 4          |
| 5  | Elisangela M. Backes  | Rafael Filial 1        | 5          |
| 4  | Alexandre Backes      | Rafael Filial 2        | 6          |
| 7  | Streit Conf           | Streit Conf            | 7          |
| 8  | FMV Streit Conf       | FMV Streit Conf        | 8          |

---

## File Map

- **Modify:** `supabase/migrations/005_compradores_ordem.sql` — criar coluna + atualizar dados
- **Modify:** `src/renderer/src/services/compradores.js` — order('nome') → order('ordem')
- **Modify:** `supabase/seed.sql` — adicionar campo ordem no INSERT
- **Read-only ref:** `src/renderer/src/screens/SelecionarLoja.jsx` — já chama compradores.list(), ordenação corrigida no serviço basta
- **Read-only ref:** `src/renderer/src/screens/Compras.jsx` — idem (compradores passados como props)

---

## Task 1: Migration Supabase — coluna ordem + rename + reorder

**Files:**
- Create: `supabase/migrations/005_compradores_ordem.sql`

- [ ] **Step 1: Escrever migration**

```sql
-- supabase/migrations/005_compradores_ordem.sql
ALTER TABLE compradores
  ADD COLUMN IF NOT EXISTS ordem INTEGER NOT NULL DEFAULT 0;

-- Renomear os 5 que mudam de nome
UPDATE compradores SET nome = 'Backes Art. Vestuário'  WHERE id = 1;
UPDATE compradores SET nome = 'Backes Programação 1'   WHERE id = 2;
UPDATE compradores SET nome = 'Backes Programação 2'   WHERE id = 3;
UPDATE compradores SET nome = 'Rafael Filial 2'        WHERE id = 4;
UPDATE compradores SET nome = 'Rafael Filial 1'        WHERE id = 5;
-- IDs 6, 7, 8 mantêm nomes atuais

-- Definir ordem de exibição
UPDATE compradores SET ordem = 1 WHERE id = 1;
UPDATE compradores SET ordem = 2 WHERE id = 2;
UPDATE compradores SET ordem = 3 WHERE id = 3;
UPDATE compradores SET ordem = 4 WHERE id = 6;
UPDATE compradores SET ordem = 5 WHERE id = 5;
UPDATE compradores SET ordem = 6 WHERE id = 4;
UPDATE compradores SET ordem = 7 WHERE id = 7;
UPDATE compradores SET ordem = 8 WHERE id = 8;

CREATE INDEX IF NOT EXISTS compradores_ordem_idx ON compradores(ordem);
```

- [ ] **Step 2: Aplicar via Supabase MCP**

Usar ferramenta `mcp__1982d284__apply_migration` com:
- `project_id`: `bhxpkysueyoblizkvomb`
- `name`: `005_compradores_ordem`
- `query`: conteúdo do arquivo acima

- [ ] **Step 3: Verificar resultado**

Executar via `mcp__1982d284__execute_sql`:
```sql
SELECT id, nome, ordem FROM compradores ORDER BY ordem;
```

Resultado esperado (8 linhas na ordem correta).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/005_compradores_ordem.sql
git commit -m "feat: rename compradores + add ordem column"
```

---

## Task 2: Atualizar seed.sql + service

**Files:**
- Modify: `supabase/seed.sql`
- Modify: `src/renderer/src/services/compradores.js`

- [ ] **Step 1: Atualizar seed.sql com novos nomes e campo ordem**

Substituir o bloco INSERT de compradores por:

```sql
INSERT INTO compradores (nome, cnpj, cidade, role, ordem) VALUES
  ('Backes Art. Vestuário',  '08.889.201/0001-01', 'Três Coroas/RS',           'admin',     1),
  ('Backes Programação 1',   '15.563.106/0001-70', 'Três Coroas/RS',           'comprador', 2),
  ('Backes Programação 2',   '28.010.922/0001-07', 'Igrejinha/RS',             'comprador', 3),
  ('Rafael J. Backes',       '46.348.002/0001-77', 'Rolante/RS',               'comprador', 4),
  ('Rafael Filial 1',        '13.706.244/0001-36', 'Santa Maria do Herval/RS', 'comprador', 5),
  ('Rafael Filial 2',        '06.284.903/0001-28', '',                         'comprador', 6),
  ('Streit Conf',            '10.206.469/0001-35', 'Riozinho/RS',              'comprador', 7),
  ('FMV Streit Conf',        '20.354.516/0001-41', 'Rolante/RS',               'comprador', 8)
ON CONFLICT DO NOTHING;
```

- [ ] **Step 2: Atualizar compradores.js — ordenar por ordem**

Em `src/renderer/src/services/compradores.js`, trocar:
```js
.order('nome')
```
por:
```js
.order('ordem')
```

- [ ] **Step 3: Verificar no browser**

Abrir `https://bolt-compras.pages.dev` (ou dev server local `npm run dev`) → tela "Selecionar loja" deve mostrar compradores na ordem correta.

- [ ] **Step 4: Commit**

```bash
git add supabase/seed.sql src/renderer/src/services/compradores.js
git commit -m "feat: order compradores by ordem column"
```

---

## Task 3: Relatório "Total por Loja"

**Contexto:** O sistema Excel antigo tinha arquivos "SOMA_PEDIDOS" mostrando total acumulado por loja. Implementar no Relatorios.jsx.

**Files:**
- Create: `src/renderer/src/screens/relatorios/PorLoja.jsx`
- Create: `src/renderer/src/screens/relatorios/PorLoja.module.css`
- Modify: `src/renderer/src/screens/Relatorios.jsx` — adicionar aba/seção
- Modify: `src/renderer/src/services/sessoes.js` (ou novo arquivo) — query totais por comprador

- [ ] **Step 1: Criar query de totais por comprador**

No arquivo `src/renderer/src/services/pedidos.js` (ou onde existir o serviço de pedidos), adicionar:

```js
async totaisPorComprador(colecaoId) {
  // pedidos → visitas → compradores, agrupado
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      visita_id,
      valor_unitario,
      itens,
      visitas!inner(
        comprador_id,
        sessao_id,
        compradores!inner(id, nome, ordem),
        sessoes!inner(colecao_id)
      )
    `)
    .eq('visitas.sessoes.colecao_id', colecaoId)
  if (error) throw error

  // Agrupar por comprador
  const mapa = new Map()
  for (const p of data ?? []) {
    const comp = p.visitas.compradores
    const qtdTotal = Object.values(p.itens ?? {}).reduce((s, v) => s + (parseInt(v) || 0), 0)
    const valorTotal = qtdTotal * (p.valor_unitario ?? 0)
    const cur = mapa.get(comp.id) ?? { id: comp.id, nome: comp.nome, ordem: comp.ordem, pecas: 0, valor: 0 }
    cur.pecas += qtdTotal
    cur.valor += valorTotal
    mapa.set(comp.id, cur)
  }
  return [...mapa.values()].sort((a, b) => a.ordem - b.ordem)
}
```

- [ ] **Step 2: Verificar schema de pedidos para ajustar a query**

Ler `supabase/migrations/001_schema_inicial.sql` e o serviço de pedidos existente para confirmar nomes de colunas e joins antes de escrever a query final.

- [ ] **Step 3: Criar PorLoja.jsx**

```jsx
// src/renderer/src/screens/relatorios/PorLoja.jsx
import { useState, useEffect } from 'react'
import { pedidos as pedidosService } from '../../services/pedidos'
import styles from './PorLoja.module.css'

export default function PorLoja({ colecaoId }) {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(false)
  const [erro,    setErro]    = useState(null)

  useEffect(() => {
    if (!colecaoId) return
    setLoading(true)
    pedidosService.totaisPorComprador(colecaoId)
      .then(setRows)
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }, [colecaoId])

  const totalPecas = rows.reduce((s, r) => s + r.pecas, 0)
  const totalValor = rows.reduce((s, r) => s + r.valor, 0)

  return (
    <div className={styles.wrap}>
      {loading && <p>Carregando…</p>}
      {erro    && <p className={styles.erro}>{erro}</p>}
      {!loading && rows.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Loja</th>
              <th className={styles.num}>Peças</th>
              <th className={styles.num}>Valor total</th>
              <th className={styles.num}>% valor</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.nome}</td>
                <td className={styles.num}>{r.pecas.toLocaleString('pt-BR')}</td>
                <td className={styles.num}>R$ {r.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className={styles.num}>{totalValor ? ((r.valor / totalValor) * 100).toFixed(1) + '%' : '—'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total</strong></td>
              <td className={styles.num}><strong>{totalPecas.toLocaleString('pt-BR')}</strong></td>
              <td className={styles.num}><strong>R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      )}
      {!loading && rows.length === 0 && !erro && (
        <p className={styles.vazio}>Nenhum dado para esta coleção.</p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Criar PorLoja.module.css**

```css
.wrap { padding: 1rem 0; }
.table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.table th, .table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border); text-align: left; }
.table thead th { font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; }
.table tbody tr:hover td { background: var(--bg-hover); }
.table tfoot td { border-top: 2px solid var(--border); border-bottom: none; }
.num { text-align: right !important; font-variant-numeric: tabular-nums; }
.erro { color: var(--red); }
.vazio { color: var(--text-muted); font-style: italic; }
```

- [ ] **Step 5: Adicionar aba em Relatorios.jsx**

Abrir `src/renderer/src/screens/Relatorios.jsx`. Seguir o padrão das abas existentes (PorFornecedor, PorSegmentacao):
- Importar `PorLoja`
- Adicionar botão de aba "Por Loja"
- Renderizar `<PorLoja colecaoId={colecaoId} />` quando aba ativa

- [ ] **Step 6: Confirmar funcionamento**

Com dev server rodando, abrir Relatórios → aba "Por Loja" → selecionar uma coleção que tenha dados. Verificar totais.

- [ ] **Step 7: Commit**

```bash
git add src/renderer/src/screens/relatorios/PorLoja.jsx
git add src/renderer/src/screens/relatorios/PorLoja.module.css
git add src/renderer/src/screens/Relatorios.jsx
git add src/renderer/src/services/pedidos.js
git commit -m "feat: relatório totais por loja"
```
