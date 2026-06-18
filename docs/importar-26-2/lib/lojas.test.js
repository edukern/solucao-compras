const { test } = require('node:test')
const assert = require('node:assert')
const { mapAba, ABAS_EXTRAS, isExtra } = require('./lojas')

test('Formato A: nome de aba mapeia direto', () => {
  assert.equal(mapAba('BACKES_ART'), 1)
  assert.equal(mapAba('FMV_STREIT_CONF'), 8)
  assert.equal(mapAba('RAFAEL_FILIAL_1'), 5)
})

test('Formato B: nomes de pessoa mapeiam para a loja certa', () => {
  assert.equal(mapAba('CD'), 1)            // Backes Art
  assert.equal(mapAba('CD Prog 1'), 2)
  assert.equal(mapAba('Cd Prog 1'), 2)     // variação de caixa (Mormaii Calçados)
  assert.equal(mapAba('Elisangela'), 5)    // Rafael Filial 1
  assert.equal(mapAba('Alexandre'), 6)     // Rafael Filial 2
  assert.equal(mapAba('Rafael'), 4)        // Rafael J. Backes
  assert.equal(mapAba('Streit'), 7)
  assert.equal(mapAba('FMV'), 8)
})

test('abas não-loja e extras não viram comprador', () => {
  assert.equal(mapAba('Pedido'), null)
  assert.equal(mapAba('CAD_GRADE'), null)
  assert.equal(mapAba('SOMA_IB'), null)
  assert.equal(mapAba('Dados'), null)
  assert.equal(mapAba('Nilson'), null)
  assert.ok(isExtra('Nilson'))
  assert.ok(ABAS_EXTRAS.includes('Paulinho'))
})
