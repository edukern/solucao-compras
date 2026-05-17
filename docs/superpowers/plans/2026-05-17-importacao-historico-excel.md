# Solução Compras — Sessão 5: Importação do Histórico Excel

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Importar o histórico de compras das coleções anteriores a partir dos arquivos Excel (~100 arquivos PE_I/1.xlsx a PE_I/100.xlsx). Isso desbloqueia o Planejamento — sem histórico, o sistema não consegue calcular projeção por média das últimas 2 coleções equivalentes.

**Contexto crítico:**
- Os arquivos têm a grade de compras por segmentação/tamanho
- O campo "Fornecedor:" está em **branco** nos arquivos — a marca vem do ERP (do nome do arquivo ou de outra fonte)
- O resultado importado alimenta a tabela `grade_historica` (qtd_comprada por tamanho)
- Para o Planejamento funcionar: precisamos de pelo menos 2 coleções equivalentes (ex: Inverno 2024 + Inverno 2025)

**Architecture:** Script Node.js standalone (`scripts/import-historico.cjs`) que processa os arquivos Excel e popula `grade_historica`. A UI pode vir depois — a prioridade é ter os dados no banco.

---

## IMPORTANTE — Dados de entrada

**Esta sessão começa com análise dos arquivos antes de qualquer código.**

O usuário deve fornecer (ou o agente deve solicitar):
1. Caminho da pasta com os arquivos: ex. `C:\Users\eduke\PE_I\`
2. Um ou dois arquivos de exemplo para análise da estrutura
3. Como mapear arquivo → fornecedor (nome do arquivo? planilha separada?)
4. Como mapear arquivo → segmentação (classificacao/tipo_produto/classe)?
5. Qual coleção esses arquivos representam (Inverno 2024? Verão 2025?)

**Perguntas a responder antes de implementar:**
- Os arquivos têm a segmentação em algum lugar (nome do arquivo, célula, aba)?
- A grade de tamanhos está em qual formato? (linhas = tamanhos, colunas = empresas?)
- Os arquivos têm qtd vendida além de qtd comprada?

---

## Schema de destino

```sql
grade_historica:
  segmentacao_id  INTEGER REFERENCES segmentacoes(id),
  colecao_id      INTEGER REFERENCES colecoes(id),
  tamanho         TEXT,   -- ex: 'P', 'M', '36', '2'
  ordem           INTEGER,
  qtd_comprada    INTEGER,
  qtd_vendida     INTEGER,
  qtd_estoque     INTEGER,
  UNIQUE(segmentacao_id, colecao_id, tamanho)
```

---

## File Map

| File | Action |
|---|---|
| `scripts/import-historico.cjs` | Create — script principal |
| `scripts/analyze-excel.cjs` | Create — helper para inspecionar estrutura dos arquivos |

---

## Task 1: Análise dos arquivos (PRIMEIRO PASSO)

- [ ] **Step 1: Criar script de análise**

```js
// scripts/analyze-excel.cjs
const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')

const FOLDER = process.argv[2] || '.'
const files = fs.readdirSync(FOLDER).filter(f => f.endsWith('.xlsx')).slice(0, 3)

files.forEach(file => {
  console.log('\n=== ' + file + ' ===')
  const wb = XLSX.readFile(path.join(FOLDER, file))
  wb.SheetNames.forEach(name => {
    console.log('  Aba:', name)
    const ws = wb.Sheets[name]
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1')
    // Mostrar primeiras 10 linhas brutas
    for (let r = range.s.r; r <= Math.min(range.s.r + 9, range.e.r); r++) {
      const row = []
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c })]
        row.push(cell ? cell.v : '')
      }
      console.log('  Linha', r, ':', JSON.stringify(row))
    }
  })
})
```

- [ ] **Step 2: Rodar contra os arquivos reais**

```
node scripts/analyze-excel.cjs "C:\caminho\para\PE_I"
```

- [ ] **Step 3: Documentar a estrutura encontrada no início de import-historico.cjs**

---

## Task 2: Script de importação

**IMPLEMENTAR APENAS APÓS ENTENDER A ESTRUTURA DOS ARQUIVOS**

- [ ] **Step 1: Definir mapeamento arquivo → coleção + segmentação**

Baseado na análise, definir:
```js
// Exemplo — adaptar conforme estrutura real
const COLECAO_MAP = {
  'PE_I': { estacao: 'inverno', ano: 2024 }, // ajustar por pasta/nome
}

function inferirSegmentacao(nomeArquivo, conteudo) {
  // Extrair classificacao, tipo_produto, classe do nome do arquivo ou células
}
```

- [ ] **Step 2: Implementar o parser principal**

```js
// scripts/import-historico.cjs
const XLSX = require('xlsx')
const Database = require('better-sqlite3')
const fs = require('fs')
const path = require('path')
const os = require('os')

const DB_PATH = path.join(os.homedir(), 'AppData', 'Roaming', 'solucao-compras', 'solucao-compras.db')
const FOLDER = process.argv[2]

const db = new Database(DB_PATH)
db.pragma('foreign_keys = ON')

// Buscar ou criar coleção
function getOrCreateColecao(nome, estacao, ano) {
  const existing = db.prepare(`SELECT id FROM colecoes WHERE estacao = ? AND ano = ?`).get(estacao, ano)
  if (existing) return existing.id
  return db.prepare(`INSERT INTO colecoes (nome, estacao, ano, status) VALUES (?, ?, ?, 'finalizada')`).run(nome, estacao, ano).lastInsertRowid
}

// Buscar ou criar segmentacao
function getOrCreateSegmentacao(classificacao, tipo_produto, classe, tipo_grade, estacao) {
  const existing = db.prepare(`SELECT id FROM segmentacoes WHERE classificacao=? AND tipo_produto=? AND classe=? AND tipo_grade=?`)
    .get(classificacao, tipo_produto, classe, tipo_grade)
  if (existing) return existing.id
  return db.prepare(`INSERT INTO segmentacoes (classificacao, tipo_produto, classe, tipo_grade, estacao) VALUES (?,?,?,?,?)`)
    .run(classificacao, tipo_produto, classe, tipo_grade, estacao).lastInsertRowid
}

// Upsert grade_historica
const upsertGrade = db.prepare(`
  INSERT INTO grade_historica (segmentacao_id, colecao_id, tamanho, ordem, qtd_comprada, qtd_vendida, qtd_estoque)
  VALUES (@segId, @colId, @tamanho, @ordem, @qtdComprada, @qtdVendida, @qtdEstoque)
  ON CONFLICT(segmentacao_id, colecao_id, tamanho) DO UPDATE SET
    qtd_comprada = excluded.qtd_comprada,
    qtd_vendida  = excluded.qtd_vendida,
    qtd_estoque  = excluded.qtd_estoque
`)

// ... processar arquivos
```

- [ ] **Step 3: Testar com 5 arquivos**

```
node scripts/import-historico.cjs "C:\caminho\para\PE_I"
```

Verificar no banco: `SELECT * FROM grade_historica LIMIT 20`

- [ ] **Step 4: Rodar contra todos os arquivos**

- [ ] **Step 5: Verificar que o Planejamento consegue calcular projeções**

Abrir o app, selecionar uma coleção atual, ir em Planejamento, verificar que os números aparecem.

- [ ] **Step 6: Commit**

```
git commit -m "feat(scripts): add import-historico.cjs for Excel history import"
```

---

## Critérios de aceitação

- `grade_historica` tem dados de pelo menos 2 coleções equivalentes (ex: Inverno 2024 + Inverno 2025)
- A tela Planejamento consegue calcular e exibir projeções para a coleção atual
- Re-rodar o script não duplica dados (upsert idempotente)
