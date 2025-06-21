
import { Navigate } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'

const Index = () => {
  const { session, user, isSetup, isInitializing } = useApp()

  // Mostrar loading mientras se inicializa
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando aplicación...</p>
        </div>
      </div>
    )
  }

  // 1. Si el sistema no está configurado, ir a setup
  if (isSetup === false) {
    console.log('🔧 [Index] Sistema no configurado → /setup')
    return <Navigate to="/setup" replace />
  }

  // 2. Si hay sesión válida, ir al dashboard
  if (session || user) {
    console.log('✅ [Index] Usuario autenticado → /dashboard')
    return <Navigate to="/dashboard" replace />
  }

  // 3. Sin autenticación, ir al login
  console.log('🔐 [Index] Usuario no autenticado → /login')
  return <Navigate to="/login" replace />
}

export default Index
