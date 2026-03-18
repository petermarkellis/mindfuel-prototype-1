import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Disable StrictMode in development to prevent double-rendering issues
// React.StrictMode causes effects to run twice in dev, which can cause state sync issues
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
