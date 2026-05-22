import { useRef, useMemo } from 'react'
import './App.css'
import Layout from './components/Layout/Layout'
import Inbox from './components/Inbox'
import SideBar from './components/SideBar/SideBar'
import AppHeader from './components/AppHeader/AppHeader'
import PasswordGate from './components/PasswordGate'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import { useAppRouter } from './hooks/useAppRouter'

function App() {
  const { currentView, activeNav, handleNavSelect, navigateToInbox, navigateToMain } = useAppRouter()
  const openNewItemModalRef = useRef(null)
  const resetGraphRef = useRef(null)

  const headerTitle = useMemo(() => {
    if (currentView === 'inbox') return 'Inbox'
    if (activeNav === 'portfolio') return 'Portfolio Overview'
    const navTitles = {
      code: 'Code',
      map: 'Map',
      layers: 'Layers',
      data: 'Data Platform',
    }
    return navTitles[activeNav] ?? 'Portfolio Overview'
  }, [currentView, activeNav])

  return (
    <PasswordGate>
      <div className="relative min-h-screen">
        <AppHeader
          title={headerTitle}
          showResetView={currentView === 'main'}
          onResetView={() => resetGraphRef.current?.()}
          resetDisabled={currentView !== 'main'}
        />
        <SideBar
          onOpenNewItemModal={() => openNewItemModalRef.current?.()}
          onNavigateToMain={navigateToMain}
          onNavSelect={handleNavSelect}
          isMainView={currentView === 'main'}
          currentView={currentView}
          activeNav={currentView === 'inbox' ? 'inbox' : activeNav}
        />
        <div className={currentView === 'main' ? 'contents' : 'hidden'} aria-hidden={currentView !== 'main'}>
          <Layout
            activeNav={activeNav}
            registerOpenNewItemModal={(fn) => {
              openNewItemModalRef.current = fn
            }}
            registerResetGraph={(fn) => {
              resetGraphRef.current = fn
            }}
            onNavigateToInbox={navigateToInbox}
            onNavigateToMain={navigateToMain}
          />
        </div>
        {currentView === 'inbox' && <Inbox onNavigateBack={navigateToMain} />}
        <SpeedInsights />
        <Analytics />
      </div>
    </PasswordGate>
  )
}

export default App
