/**
 * explorar-schema-controle.js
 *
 * Roda no servidor controle e lista as tabelas do banco que provavelmente
 * contêm dados de movimentos, estoque, itens e empresas.
 * Objetivo: descobrir os nomes reais das tabelas para montar a query de sync.
 *
 * Rodar:
 *   node explorar-schema-controle.js > schema.txt
 */

const { Client } = require('pg')

const db = new Client({
  host:     '10.0.0.1',
  port:     5432,
  database: 'controle',
  user:     'postgres',
  password: 'masterkey',
})

async function main() {
  await db.connect()
  console.log('=== TABELAS DO BANCO controle ===\n')

  // Lista todas as tabelas (não-sistema)
  const { rows: tabelas } = await db.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `)

  console.log(`Total de tabelas: ${tabelas.length}\n`)
  tabelas.forEach(t => console.log(' -', t.table_name))

  // Palavras-chave para filtrar tabelas relevantes
  const keywords = ['mov', 'item', 'prod', 'esto', 'vend', 'comp', 'nf', 'nota',
                    'saida', 'entrada', 'estac', 'grade', 'tamanho', 'classe',
                    'classif', 'emp', 'empresa', 'colec', 'pedid']

  const relevantes = tabelas.filter(t =>
    keywords.some(k => t.table_name.toLowerCase().includes(k))
  )

  console.log(`\n=== TABELAS POSSIVELMENTE RELEVANTES (${relevantes.length}) ===\n`)

  for (const t of relevantes) {
    const { rows: colunas } = await db.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position
    `, [t.table_name])

    console.log(`\n[ ${t.table_name} ] — ${colunas.length} colunas`)
    colunas.forEach(c => console.log(`   ${c.column_name} (${c.data_type})`))
  }

  await db.end()
  console.log('\n=== FIM ===')
}

main().catch(err => {
  console.error('ERRO:', err.message)
  process.exit(1)
})
