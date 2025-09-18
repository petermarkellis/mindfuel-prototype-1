import { useState } from 'react'
import './App.css'
import Layout from './components/Layout/Layout'
import Inbox from './components/Inbox'
import PasswordGate from './components/PasswordGate'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'


function App() {
  const [currentView, setCurrentView] = useState('main') // 'main' or 'inbox'

  const navigateToInbox = () => {
    setCurrentView('inbox')
  }

  const navigateToMain = () => {
    setCurrentView('main')
  }

  return (
    <PasswordGate>
      <div>
        {currentView === 'inbox' ? (
          <Inbox onNavigateBack={navigateToMain} />
        ) : (
          <Layout onNavigateToInbox={navigateToInbox} onNavigateToMain={navigateToMain}>
            
          </Layout>
        )}
        <SpeedInsights />
        <Analytics />
      </div>
    </PasswordGate>
  )
}

export default App
