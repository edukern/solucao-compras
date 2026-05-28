import { createContext, useContext, useState, useEffect } from 'react'
import { colecoes as colecoesService } from '../services/colecoes'

const CollectionContext = createContext(null)

export function CollectionProvider({ children }) {
  const [collections, setCollections] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    colecoesService.list().then(list => {
      setCollections(list)
      if (list.length > 0) setActiveId(list[0].id)
    }).catch(err => {
      console.error(err)
      setLoadError('Não foi possível carregar as coleções. Verifique sua conexão e tente novamente.')
    })
  }, [])

  const active = collections.find(c => c.id === activeId) ?? null

  if (loadError) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--red, #ef4444)', fontSize: '1rem', maxWidth: '32rem' }}>{loadError}</p>
        <button
          style={{ padding: '0.5rem 1.25rem', background: 'var(--accent, #6366f1)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    )
  }

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
