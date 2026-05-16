// electron/main/db/projecoes.js
export function makeProjecoes(db) {
  const upsert = db.prepare(`
    INSERT INTO projecoes (segmentacao_id, colecao_id, tamanho, ordem, qtd_projetada, qtd_ajustada, metodo)
    VALUES (@segmentacao_id, @colecao_id, @tamanho, @ordem, @qtd_projetada, @qtd_ajustada, @metodo)
    ON CONFLICT(segmentacao_id, colecao_id, tamanho) DO UPDATE SET
      qtd_projetada = excluded.qtd_projetada,
      qtd_ajustada  = excluded.qtd_ajustada,
      metodo        = excluded.metodo
  `)

  const updateAjustada = db.prepare(`
    UPDATE projecoes SET qtd_ajustada = ?
    WHERE segmentacao_id = ? AND colecao_id = ? AND tamanho = ?
  `)

  const resetAjustada = db.prepare(`
    UPDATE projecoes SET qtd_ajustada = qtd_projetada
    WHERE segmentacao_id = ? AND colecao_id = ? AND tamanho = ?
  `)

  const bySegCol = db.prepare(`
    SELECT * FROM projecoes WHERE segmentacao_id = ? AND colecao_id = ? ORDER BY ordem
  `)

  const gradeBySegCol = db.prepare(`
    SELECT tamanho, ordem, qtd_comprada FROM grade_historica
    WHERE segmentacao_id = ? AND colecao_id = ? ORDER BY ordem
  `)

  const saveMany = db.transaction((segId, colId, rows, metodo) => {
    for (const r of rows) {
      upsert.run({ segmentacao_id: segId, colecao_id: colId, metodo, ...r })
    }
  })

  return {
    calcular(segId, targetColId, baseColIds, metodo) {
      const [idN2, idN1] = baseColIds
      const gradeN2 = gradeBySegCol.all(segId, idN2)
      const gradeN1 = gradeBySegCol.all(segId, idN1)

      const mapN1 = Object.fromEntries(gradeN1.map(r => [r.tamanho, r]))
      const mapN2 = Object.fromEntries(gradeN2.map(r => [r.tamanho, r]))
      const allTamanhos = [...new Set([...gradeN2.map(r => r.tamanho), ...gradeN1.map(r => r.tamanho)])]

      return allTamanhos.map(tamanho => {
        const n2 = mapN2[tamanho]?.qtd_comprada ?? 0
        const n1 = mapN1[tamanho]?.qtd_comprada ?? 0
        const ordem = mapN1[tamanho]?.ordem ?? mapN2[tamanho]?.ordem ?? 0

        let qtd_projetada
        if (metodo === 'media_ponderada') {
          qtd_projetada = Math.round(n2 * 0.4 + n1 * 0.6)
        } else {
          qtd_projetada = Math.round((n2 + n1) / 2)
        }

        return { tamanho, ordem, qtd_projetada, qtd_ajustada: qtd_projetada }
      })
    },

    salvar(segId, colId, rows, metodo) {
      saveMany(segId, colId, rows, metodo)
    },

    getProjecao(segId, colId) {
      return bySegCol.all(segId, colId)
    },

    ajustar(segId, colId, tamanho, novaQtd) {
      updateAjustada.run(novaQtd, segId, colId, tamanho)
    },

    restaurar(segId, colId, tamanho) {
      resetAjustada.run(segId, colId, tamanho)
    }
  }
}
