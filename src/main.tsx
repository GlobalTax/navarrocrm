import React from 'react'
import { createRoot } from 'react-dom/client'
import MinimalApp from './App.tsx'

// Clean main.tsx for recovery
console.log('🔧 [Recovery] Starting Navarro CRM in minimal mode...')
console.log('🔧 [Recovery] React version:', React.version)

const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error('Root element not found')
}

const root = createRoot(rootElement)
root.render(React.createElement(MinimalApp))