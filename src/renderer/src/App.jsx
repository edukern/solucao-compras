import { useState, useEffect, useCallback } from 'react'
import { CollectionProvider } from './contexts/CollectionContext'
import ErrorBoundary from './components/ErrorBoundary'
import Sidebar from './components/Sidebar'
import Dashboard from './screens/Dashboard'
import Planejamento from './screens/Planejamento'
import Compras from './screens/Compras'
import Relatorios from './screens/Relatorios'
import Configuracoes from './screens/Configuracoes'

const SCREENS = {
  dashboard:    () => <Dashboard />,
  planejamento: () => <Planejamento />,
  compras:      () => <Compras />,
  relatorios:   () => <Relatorios />,
  configuracoes: () => <Configuracoes />,
}

const noApi = !window.api

export default function App() {
  const [screen, setScreen] = useState('dashboard')
  const [theme, setTheme] = useState('dark')
  const [updateStatus, setUpdateStatus] = useState(null)

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  useEffect(() => {
    if (!window.api?.updater) return
    return window.api.updater.onStatus(setUpdateStatus)
  }, [])

  const Screen = SCREENS[screen] ?? SCREENS.dashboard

  if (noApi) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem', color: '#888', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '2rem' }}>💻</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#aaa' }}>Solução Compras</div>
        <div style={{ fontSize: '0.9rem' }}>Disponível apenas no app desktop.</div>
      </div>
    )
  }

  return (
    <CollectionProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar
            current={screen}
            onNavigate={setScreen}
            theme={theme}
            onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          />
          <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)' }}>
            <ErrorBoundary key={screen}>
              <Screen />
            </ErrorBoundary>
          </main>
        </div>
        {updateStatus && updateStatus.type !== 'error' && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.4rem 1rem', fontSize: '0.8rem', flexShrink: 0,
            background: updateStatus.type === 'ready' ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.12)',
            borderTop: '1px solid var(--border)',
            color: updateStatus.type === 'ready' ? 'var(--green)' : 'var(--accent-light)',
          }}>
            <span>
              {updateStatus.type === 'available'   && `Versão ${updateStatus.version} disponível — baixando em segundo plano…`}
              {updateStatus.type === 'downloading' && `Baixando atualização… ${updateStatus.percent}%`}
              {updateStatus.type === 'ready'       && 'Atualização pronta para instalar.'}
            </span>
            {updateStatus.type === 'ready' && (
              <button
                onClick={() => window.api.updater.install()}
                style={{
                  background: 'var(--green)', color: '#fff', border: 'none',
                  borderRadius: '4px', padding: '0.25rem 0.75rem',
                  fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600,
                }}
              >
                Reiniciar agora
              </button>
            )}
          </div>
        )}
      </div>
    </CollectionProvider>
  )
}
