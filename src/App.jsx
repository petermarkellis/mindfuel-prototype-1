import { useState } from 'react'
import './App.css'

import React from 'react';

import Layout from './components/Layout/Layout'
import NodeGraph from './components/NodeGraph/NodeGraph'
import Inbox from './components/Inbox'
 


function App() {
  const [currentView, setCurrentView] = useState('main') // 'main' or 'inbox'

  const navigateToInbox = () => {
    setCurrentView('inbox')
  }

  const navigateToMain = () => {
    setCurrentView('main')
  }

  return (
    <div>
      {currentView === 'inbox' ? (
        <Inbox onNavigateBack={navigateToMain} />
      ) : (
        <Layout onNavigateToInbox={navigateToInbox} onNavigateToMain={navigateToMain}>
          
        </Layout>
      )}
    </div>
  )
}

export default App
