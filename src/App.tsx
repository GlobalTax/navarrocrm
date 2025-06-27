
import React from 'react'
import { ErrorBoundary } from '@/components/errors'
import { AppRouter } from '@/components/routing/AppRouter'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </div>
  )
}

export default App
