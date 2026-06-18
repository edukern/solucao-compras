import { useEffect } from 'react'

// Avisa o usuário ao tentar fechar/recarregar a aba enquanto `when` for true.
export function useBeforeUnload(when) {
  useEffect(() => {
    if (!when) return
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [when])
}
