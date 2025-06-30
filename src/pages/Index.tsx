
import { Navigate } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'

const Index = () => {
  const { session, user, isSetup, authLoading } = useApp()

  console.log('📍 [Index] Estado:', { session: !!session, user: !!user, isSetup, authLoading })

  // Mostrar loading solo brevemente
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si el sistema no está configurado, ir a setup
  if (isSetup === false) {
    console.log('📍 [Index] Sistema no configurado, redirigiendo a setup')
    return <Navigate to="/setup" replace />
  }

  // Si no hay sesión, ir a login
  if (!session && !user) {
    console.log('📍 [Index] Sin autenticación, redirigiendo a login')
    return <Navigate to="/login" replace />
  }

  // Si hay usuario autenticado, mostrar el dashboard directamente
  // En lugar de redirigir, importamos y renderizamos Dashboard
  console.log('📍 [Index] Usuario autenticado, mostrando dashboard')
  
  // Importar Dashboard dinámicamente para evitar dependencias circulares
  const Dashboard = require('./Dashboard').default
  return <Dashboard />
}

export default Index
