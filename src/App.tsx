import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/contexts/AppContext'
import Login from '@/pages/Login'
import Contacts from '@/pages/Contacts'
import Emails from '@/pages/Emails'
import NylasCallback from './pages/NylasCallback'

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/emails/*" element={<Emails />} />
              <Route path="/nylas/callback" element={<NylasCallback />} />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  )
}

export default App
