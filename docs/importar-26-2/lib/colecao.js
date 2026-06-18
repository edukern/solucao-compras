// colecao.js — fonte única do alvo de importação 26/2.
//
// Histórico: a coleção 26/2 era `colecao_id = 1` (rotulada por engano "27/1").
// Em 18/06/2026 a migração docs/migracao-27-1-para-26-2.sql moveu todas as
// sessões da id 1 para a id 17 (que já era a 26/2 de verdade) e apagou a id 1.
// Por isso o alvo dos scripts passou a ser 17. Centralizado aqui para que a
// próxima troca de coleção seja edição de UM lugar, não dos ~6 scripts.
//
// Override opcional por ambiente: IMPORT_COLECAO_ID=17 node apply.js ...
const COLECAO_ID = Number(process.env.IMPORT_COLECAO_ID || 17)

module.exports = { COLECAO_ID }
