import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'sonner'
import { GlobalErrorBoundary } from '@/components/common/GlobalErrorBoundary'

// Test React hooks functionality first
const ReactHooksTest = () => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    console.log('✅ useEffect working, count:', count)
  }, [count])
  
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-2">React Hooks Test</h2>
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(c => c + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded mt-2"
      >
        Test useState & useEffect
      </button>
    </div>
  )
}

function App() {
  console.log('🚀 App rendering with React:', React.version)
  
  return (
    <GlobalErrorBoundary>
      <Router>
        <div className="min-h-screen bg-background text-foreground font-sans p-8">
          <h1 className="text-2xl font-bold mb-4">Navarro CRM - Progressive Testing</h1>
          <div className="space-y-4">
            <div>
              <strong>React Version:</strong> {React.version}
            </div>
            <ReactHooksTest />
            <div className="text-green-600">
              ✅ If you see this and can click the button above, React is working properly.
            </div>
          </div>
          <Toaster position="top-right" />
        </div>
      </Router>
    </GlobalErrorBoundary>
  )
}

export default App