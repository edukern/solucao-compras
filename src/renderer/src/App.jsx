import { useState, useEffect } from 'react'
import { CollectionProvider } from './contexts/CollectionContext'
import Sidebar from './components/Sidebar'
import Dashboard from './screens/Dashboard'
import Planejamento from './screens/Planejamento'
import Compras from './screens/Compras'

const SCREENS = {
  dashboard:    () => <Dashboard />,
  planejamento: () => <Planejamento />,
  compras:      () => <Compras />,
}

export default function App() {
  const [screen, setScreen] = useState('dashboard')
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  const Screen = SCREENS[screen] ?? SCREENS.dashboard

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
          <Screen />
        </main>
      </div>
    </CollectionProvider>
  )
}
