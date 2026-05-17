import { useState, useEffect } from 'react'
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

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

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
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
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
    </CollectionProvider>
  )
}
