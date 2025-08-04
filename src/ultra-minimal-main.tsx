// Ultra minimal entry point - bypass all existing infrastructure
console.log('🔧 ULTRA_MINIMAL_MAIN: Starting ultra minimal main')

import { createRoot } from 'react-dom/client'
import TestComponent from './ultra-minimal-test'

console.log('🔧 ULTRA_MINIMAL_MAIN: Imports successful')

const container = document.getElementById("root")
if (container) {
  console.log('🔧 ULTRA_MINIMAL_MAIN: Container found, creating root')
  const root = createRoot(container)
  console.log('🔧 ULTRA_MINIMAL_MAIN: Root created, rendering component')
  root.render(TestComponent())
  console.log('✅ ULTRA_MINIMAL_MAIN: Render complete')
} else {
  console.error('❌ ULTRA_MINIMAL_MAIN: No root container found')
}