import { useState } from 'react'
import { CollectionProvider } from './contexts/CollectionContext'
import Sidebar from './components/Sidebar'
import Dashboard from './screens/Dashboard'
import Planejamento from './screens/Planejamento'
import Compras from './screens/Compras'
import Relatorios from './screens/Relatorios'
import Pendencias from './screens/Pendencias'
import styles from './AppShell.module.css'

const SCREENS = {
  dashboard:    () => <Dashboard />,
  planejamento: () => <Planejamento />,
  compras:      () => <Compras />,
  relatorios:   () => <Relatorios />,
  pendencias:   () => <Pendencias />,
}

export default function AppShell() {
  const [screen, setScreen] = useState('dashboard')
  const Screen = SCREENS[screen] ?? SCREENS.dashboard

  return (
    <CollectionProvider>
      <div className={styles.shell}>
        <Sidebar current={screen} onNavigate={setScreen} />
        <main className={styles.main}>
          <Screen />
        </main>
      </div>
    </CollectionProvider>
  )
}
