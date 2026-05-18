export function makeGrades(db) {
  const upsert = db.prepare(`
    INSERT INTO grade_historica (segmentacao_id, colecao_id, tamanho, ordem, qtd_comprada, qtd_vendida, qtd_estoque)
    VALUES (@segmentacao_id, @colecao_id, @tamanho, @ordem, @qtd_comprada, @qtd_vendida, @qtd_estoque)
    ON CONFLICT(segmentacao_id, colecao_id, tamanho) DO UPDATE SET
      ordem = excluded.ordem,
      qtd_comprada = excluded.qtd_comprada,
      qtd_vendida = excluded.qtd_vendida,
      qtd_estoque = excluded.qtd_estoque
  `)

  const saveMany = db.transaction((segId, colId, rows) => {
    for (const r of rows) {
      upsert.run({ segmentacao_id: segId, colecao_id: colId, ...r })
    }
  })

  const bySegCol = db.prepare(
    `SELECT * FROM grade_historica WHERE segmentacao_id = ? AND colecao_id = ? ORDER BY ordem`
  )

  const importBatchTx = db.transaction((items) => {
    for (const { segmentacao_id, colecao_id, rows } of items) {
      for (const r of rows) {
        upsert.run({ segmentacao_id, colecao_id, ...r })
      }
    }
  })

  return {
    saveGrade(segId, colId, rows) {
      saveMany(segId, colId, rows)
    },
    getGrade(segId, colId) {
      return bySegCol.all(segId, colId)
    },
    importBatch(items) {
      importBatchTx(items)
    },
  }
}
