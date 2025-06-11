import { useState } from 'react'
import './App.css'

import React from 'react';

import Layout from './components/Layout/Layout'
import NodeGraph from './components/NodeGraph/NodeGraph'
 


function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Layout>
        
      </Layout>
    </div>
  )
}

export default App
