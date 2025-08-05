import React from 'react'
import { createRoot } from 'react-dom/client'
import CleanApp from './CleanApp'

console.log('🎯 CLEAN_MAIN: Starting clean application')
console.log('🎯 CLEAN_MAIN: React version check:', React.version)

// Clear any existing content
const container = document.getElementById("root")
if (container) {
  console.log('🎯 CLEAN_MAIN: Container found, clearing and creating root')
  container.innerHTML = '' // Clear any existing content
  
  const root = createRoot(container)
  console.log('🎯 CLEAN_MAIN: Root created successfully')
  
  root.render(<CleanApp />)
  console.log('✅ CLEAN_MAIN: Clean app rendered successfully')
} else {
  console.error('❌ CLEAN_MAIN: No root container found')
}