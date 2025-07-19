import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/contexts/AppContext'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/integrations/supabase/client'
import Home from '@/pages/Home'
import Organizations from '@/pages/Organizations'
import Departments from '@/pages/Departments'
import Employees from '@/pages/Employees'
import Employee from '@/pages/Employee'
import EmployeeOnboarding from '@/pages/EmployeeOnboarding'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Profile from '@/pages/Profile'
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
              <Route path="/" element={<Home />} />
              <Route path="/organizations" element={<Organizations />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/employees/:id" element={<Employee />} />
              <Route path="/onboarding/:token" element={<EmployeeOnboarding />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/emails/*" element={<Emails />} />
              
              {/* Añadir ruta para callback de Nylas */}
              <Route path="/nylas/callback" element={<NylasCallback />} />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  )
}

export default App
