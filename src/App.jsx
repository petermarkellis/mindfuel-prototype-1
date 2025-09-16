import { useState } from 'react'
import './App.css'

import React from 'react';

import Layout from './components/Layout/Layout'
import Inbox from './components/Inbox'
import PasswordGate from './components/PasswordGate'
 


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
      </div>
    </PasswordGate>
  )
}

export default App
