import { useState, useEffect } from 'react'
import { CollectionProvider } from './contexts/CollectionContext'
import ErrorBoundary from './components/ErrorBoundary'
import Sidebar from './components/Sidebar'
import Dashboard from './screens/Dashboard'
import Planejamento from './screens/Planejamento'
import Compras from './screens/Compras'
import Relatorios from './screens/Relatorios'
import Configuracoes from './screens/Configuracoes'
import Pendencias from './screens/Pendencias'

const SCREENS = {
  dashboard:     () => <Dashboard />,
  planejamento:  () => <Planejamento />,
  compras:       () => <Compras />,
  relatorios:    () => <Relatorios />,
  configuracoes: () => <Configuracoes />,
  pendencias:    () => <Pendencias />,
}

const noApi = !window.api

export default function App() {
  const [screen, setScreen] = useState(noApi ? 'pendencias' : 'dashboard')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'light')
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem('theme', theme)
  }, [theme])

  // No Vercel: só mostra a tela de Pendências, sem CollectionProvider nem Sidebar
  if (noApi) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <Pendencias />
      </div>
    )
  }

  const Screen = SCREENS[screen] ?? SCREENS.dashboard

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
      </div>
    </CollectionProvider>
  )
}
