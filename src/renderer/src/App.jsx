import { useState, useEffect } from 'react'
import { CollectionProvider } from './contexts/CollectionContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Sidebar from './components/Sidebar'
import Dashboard from './screens/Dashboard'
import Planejamento from './screens/Planejamento'
import Compras from './screens/Compras'
import Relatorios from './screens/Relatorios'
import Configuracoes from './screens/Configuracoes'
import Login from './screens/Login'

const SCREENS = {
  dashboard:     () => <Dashboard />,
  planejamento:  () => <Planejamento />,
  compras:       () => <Compras />,
  relatorios:    () => <Relatorios />,
  configuracoes: () => <Configuracoes />,
}

function AppInner() {
  const { user } = useAuth()
  const [screen, setScreen] = useState('dashboard')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem('theme', theme)
  }, [theme])

  if (user === undefined) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      Carregando…
    </div>
  )
  if (user === null) return <Login />

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

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
