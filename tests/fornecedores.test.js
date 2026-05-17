import { describe, it, expect, beforeEach } from 'vitest'
import { makeDb } from './setup.js'
import { makeFornecedores } from '../electron/main/db/fornecedores.js'

let db, forn
beforeEach(() => { db = makeDb(); forn = makeFornecedores(db) })

describe('fornecedores', () => {
  it('creates and retrieves supplier', () => {
    const supplier = forn.create({ nome: 'ABC Confecções', contato: '(47) 99999-0000' })
    expect(forn.getById(supplier.id).nome).toBe('ABC Confecções')
  })

  it('lists all suppliers', () => {
    forn.create({ nome: 'ABC', contato: '' })
    forn.create({ nome: 'XYZ', contato: '' })
    expect(forn.list()).toHaveLength(2)
  })

  it('updates supplier', () => {
    const supplier = forn.create({ nome: 'ABC', contato: '' })
    forn.update(supplier.id, { nome: 'ABC Ltda', contato: '99' })
    expect(forn.getById(supplier.id).nome).toBe('ABC Ltda')
  })
})
