// Emergency Recovery Main - Force Cache Break
import React from 'react'
import { createRoot } from 'react-dom/client'
import EmergencyApp from './EmergencyApp.tsx'

// Force cache break with timestamp
const CACHE_BREAK = Date.now()
console.log('🚨 [EMERGENCY RECOVERY] Cache break:', CACHE_BREAK)
console.log('🚨 [EMERGENCY RECOVERY] React version:', React.version)

// Get root element
const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error('🚨 Root element not found - DOM issue')
}

// Create React root and render
try {
  const root = createRoot(rootElement)
  root.render(React.createElement(EmergencyApp))
  console.log('✅ [EMERGENCY RECOVERY] React app mounted successfully')
} catch (error) {
  console.error('🚨 [EMERGENCY RECOVERY] Failed to mount React app:', error)
  // Fallback to innerHTML if React fails completely
  rootElement.innerHTML = `
    <div style="padding: 50px; font-family: system-ui;">
      <h1 style="color: red;">🚨 CRITICAL ERROR</h1>
      <p>React failed to initialize. This indicates a fundamental issue with the React installation.</p>
      <p>Error: ${error}</p>
    </div>
  `
}