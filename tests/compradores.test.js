import { describe, it, expect, beforeEach } from 'vitest'
import { makeDb } from './setup.js'
import { makeCompradores } from '../electron/main/db/compradores.js'

let db, comp

beforeEach(() => {
  db = makeDb()
  comp = makeCompradores(db)
})

describe('compradores', () => {
  it('update changes comprador fields', () => {
    const c = comp.create({ nome: 'Irmãos Backes', cnpj: '00.000.000/0001-00', cidade: 'SC' })
    comp.update(c.id, { nome: 'Irmãos Backes Ltda', cnpj: '00.000.000/0001-00', cidade: 'Chapecó' })
    expect(comp.list()[0].nome).toBe('Irmãos Backes Ltda')
  })

  it('remove deletes comprador', () => {
    const c = comp.create({ nome: 'PSM Backes', cnpj: '', cidade: '' })
    comp.remove(c.id)
    expect(comp.list()).toHaveLength(0)
  })
})
