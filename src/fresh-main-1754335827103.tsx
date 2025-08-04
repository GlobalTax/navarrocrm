import { createRoot } from 'react-dom/client'
import FreshApp from './FreshApp.tsx'
import './index.css'

console.log('🔧 FRESH_MAIN: Starting fresh app with progressive provider testing')

createRoot(document.getElementById("root")!).render(<FreshApp />)