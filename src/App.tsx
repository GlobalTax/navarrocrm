
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/contexts/AppContext'
import { OnboardingProvider } from '@/components/onboarding'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Setup from '@/pages/Setup'
import Contacts from '@/pages/Contacts'
import Emails from '@/pages/Emails'
import NylasCallback from './pages/NylasCallback'

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AppProvider>
        <OnboardingProvider>
          <Router>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/setup" element={<Setup />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/emails/*" element={<Emails />} />
              <Route path="/nylas/callback" element={<NylasCallback />} />
            </Routes>
          </div>
        </Router>
        </OnboardingProvider>
      </AppProvider>
    </QueryClientProvider>
  )
}

export default App
