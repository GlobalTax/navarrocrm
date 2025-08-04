import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🔧 [Main] Starting app with React:', React.version)

// Simple main.tsx without performance optimizations to test React
createRoot(document.getElementById("root")!).render(<App />)