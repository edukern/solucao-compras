const { test } = require('node:test')
const assert = require('node:assert')
const { detectarGrade } = require('./grades')

test('detecta INF pelo conjunto de tamanhos', () => {
  const r = detectarGrade(['2', '4', '6', '8', '10', '12'])
  assert.equal(r.tipo_grade, 'INF')
  assert.equal(r.classificacao, 'INF')
})

test('detecta AD pelos tamanhos de letra', () => {
  const r = detectarGrade(['PP', 'P', 'M', 'G', 'GG', 'XG'])
  assert.equal(r.tipo_grade, 'AD')
  assert.equal(r.classificacao, 'AD')
})

test('AD1 e AD2 colapsam para classificacao AD', () => {
  assert.equal(detectarGrade(['34','36','38','40']).classificacao, 'AD')
  assert.equal(detectarGrade(['1','2','3','4','5']).classificacao, 'AD')
})

test('tamanhos desconhecidos retornam null sem lançar', () => {
  assert.equal(detectarGrade(['XYZ']).tipo_grade, null)
})
