import { createContext, useContext, useState, useEffect } from 'react'
import { colecoes as colecoesService } from '../services/colecoes'

const CollectionContext = createContext(null)

export function CollectionProvider({ children }) {
  const [collections, setCollections] = useState([])
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    colecoesService.list().then(list => {
      setCollections(list)
      if (list.length > 0) setActiveId(list[0].id)
    }).catch(console.error)
  }, [])

  const active = collections.find(c => c.id === activeId) ?? null

  return (
    <CollectionContext.Provider value={{ collections, setCollections, active, activeId, setActiveId }}>
      {children}
    </CollectionContext.Provider>
  )
}

export function useCollection() {
  const ctx = useContext(CollectionContext)
  if (!ctx) throw new Error('useCollection must be inside CollectionProvider')
  return ctx
}
