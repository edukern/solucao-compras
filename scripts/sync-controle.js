/**
 * sync-controle.js
 *
 * Lê dados históricos do banco "controle" (ERP Macle, PostgreSQL) e faz upsert
 * na tabela hist_empresa_grade do Supabase.
 *
 * Rodar no servidor controle (C:\sync-controle\):
 *   npm install pg @supabase/supabase-js
 *   cp sync-config.example.json sync-config.json   # editar antes de rodar
 *   node sync-controle.js
 *
 * Cron job (todo dia às 03:00, Windows Task Scheduler ou node-cron):
 *   0 3 * * * cd C:\sync-controle && node sync-controle.js >> sync.log 2>&1
 */

const { Client } = require('pg')
const { createClient } = require('@supabase/supabase-js')
const fs   = require('fs')
const path = require('path')

// ─── Config ────────────────────────────────────────────────────────────────

const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'sync-config.json'), 'utf8')
)

const { controle, supabase, grupos } = config

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const db = new Client(controle)
  await db.connect()
  console.log('[sync] Conectado ao banco controle')

  const supa = createClient(supabase.url, supabase.serviceRoleKey)

  let totalUpserted = 0

  for (const grupo of grupos) {
    const { comprador_id, codempresa_controle, sincronizacoes } = grupo

    console.log(`\n[sync] Grupo comprador_id=${comprador_id} | empresas Macle: [${codempresa_controle}]`)

    for (const sync of sincronizacoes) {
      const { colecao_id, codcolecao_controle, data_inicio, data_fim } = sync

      console.log(`  Coleção Supabase=${colecao_id} | Macle codcolecao=${codcolecao_controle} | ${data_inicio} → ${data_fim}`)

      const rows = await buscarHistorico(
        db,
        codempresa_controle,
        codcolecao_controle,
        data_inicio,
        data_fim
      )

      console.log(`  ${rows.length} combinações tipo_grade×tamanho encontradas`)

      if (rows.length === 0) continue

      const upserts = rows.map(row => ({
        comprador_id,
        colecao_id,
        tipo_grade:   row.tipo_grade,
        tamanho:      row.tamanho,
        qtd_comprada: Math.round(row.qtd_comprada ?? 0),
        qtd_vendida:  Math.round(row.qtd_vendida  ?? 0),
        qtd_estoque:  Math.round(row.qtd_estoque  ?? 0),
      }))

      for (let i = 0; i < upserts.length; i += 500) {
        const batch = upserts.slice(i, i + 500)
        const { error } = await supa
          .from('hist_empresa_grade')
          .upsert(batch, {
            onConflict:       'comprador_id,tipo_grade,colecao_id,tamanho',
            ignoreDuplicates: false,
          })
        if (error) throw new Error(`Erro no upsert: ${error.message}`)
        totalUpserted += batch.length
      }

      console.log(`  ${upserts.length} registros upsertados`)
    }
  }

  await db.end()
  console.log(`\n[sync] Concluído — ${totalUpserted} registros no total`)
  console.log(`[sync] ${new Date().toISOString()}`)
}

// ─── Query no banco controle ───────────────────────────────────────────────
//
// Tabelas usadas:
//   itemdoccompra  — itens das notas de compra (dtmovto, codempresa, qtd)
//   itemdocvenda   — itens das notas de venda  (dataemissao, codempresa, qtd, qtddevolv)
//   estoque        — estoque atual por empresa/item/tamanho
//   item           — catálogo de produtos (codgrade, codcolecao, nivel1-9)
//   gradetamanho   — nome da grade/classificação (AD, EX, PP, BB…)
//   tamanho        — nome e ordem de exibição do tamanho (P, M, G, GG…)
//
// Parâmetros:
//   $1 = int[]  — array de codempresa (ex: {1,11,12,13,99})
//   $2 = int    — codcolecao no Macle (ex: 20000014)
//   $3 = date   — data_inicio (compras e vendas)
//   $4 = date   — data_fim    (compras e vendas)
//   O estoque é sempre a posição atual (sem filtro de data).

async function buscarHistorico(db, codEmpresas, codColecao, dataInicio, dataFim) {
  const sql = `
    WITH compras AS (
      SELECT
        gt.descricao                  AS tipo_grade,
        t.descricao                   AS tamanho,
        t.ordem                       AS tamanho_ordem,
        SUM(idc.qtd)                  AS qtd_comprada
      FROM itemdoccompra idc
      JOIN item i
        ON  i.codempitem = idc.codempitem
        AND i.coditem    = idc.coditem
      JOIN gradetamanho gt ON gt.codgrade   = i.codgrade
      JOIN tamanho      t  ON t.codtamanho  = idc.codtamanho
      WHERE idc.codempresa = ANY($1::int[])
        AND i.codcolecao   = $2
        AND idc.dtmovto    BETWEEN $3 AND $4
      GROUP BY gt.descricao, t.descricao, t.ordem
    ),
    vendas AS (
      SELECT
        gt.descricao                                        AS tipo_grade,
        t.descricao                                         AS tamanho,
        t.ordem                                             AS tamanho_ordem,
        SUM(idv.qtd - COALESCE(idv.qtddevolv, 0))          AS qtd_vendida
      FROM itemdocvenda idv
      JOIN item i
        ON  i.codempitem = idv.codempitem
        AND i.coditem    = idv.coditem
      JOIN gradetamanho gt ON gt.codgrade   = i.codgrade
      JOIN tamanho      t  ON t.codtamanho  = idv.codtamanho
      WHERE idv.codempresa = ANY($1::int[])
        AND i.codcolecao   = $2
        AND idv.dataemissao BETWEEN $3 AND $4
        AND COALESCE(idv.estornado, 'N') <> 'S'
      GROUP BY gt.descricao, t.descricao, t.ordem
    ),
    saldo AS (
      SELECT
        gt.descricao   AS tipo_grade,
        t.descricao    AS tamanho,
        t.ordem        AS tamanho_ordem,
        SUM(e.qtd)     AS qtd_estoque
      FROM estoque e
      JOIN item i
        ON  i.codempitem = e.codempitem
        AND i.coditem    = e.coditem
      JOIN gradetamanho gt ON gt.codgrade   = i.codgrade
      JOIN tamanho      t  ON t.codtamanho  = e.codtamanho
      WHERE e.codempresa = ANY($1::int[])
        AND i.codcolecao = $2
      GROUP BY gt.descricao, t.descricao, t.ordem
    )
    SELECT
      COALESCE(c.tipo_grade,     v.tipo_grade,     s.tipo_grade)      AS tipo_grade,
      COALESCE(c.tamanho,        v.tamanho,        s.tamanho)         AS tamanho,
      COALESCE(c.tamanho_ordem,  v.tamanho_ordem,  s.tamanho_ordem)   AS tamanho_ordem,
      COALESCE(c.qtd_comprada,  0)  AS qtd_comprada,
      COALESCE(v.qtd_vendida,   0)  AS qtd_vendida,
      COALESCE(s.qtd_estoque,   0)  AS qtd_estoque
    FROM      compras c
    FULL OUTER JOIN vendas v
      ON  c.tipo_grade = v.tipo_grade
      AND c.tamanho    = v.tamanho
    FULL OUTER JOIN saldo s
      ON  COALESCE(c.tipo_grade, v.tipo_grade) = s.tipo_grade
      AND COALESCE(c.tamanho,    v.tamanho)    = s.tamanho
    ORDER BY tipo_grade, tamanho_ordem NULLS LAST, tamanho
  `

  const { rows } = await db.query(sql, [codEmpresas, codColecao, dataInicio, dataFim])
  return rows
}

// ─── Run ───────────────────────────────────────────────────────────────────

main().catch(err => {
  console.error('[sync] ERRO:', err.message)
  process.exit(1)
})
