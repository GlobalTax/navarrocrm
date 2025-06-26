
import { useApp } from '@/contexts/AppContext'
import { Navigate } from 'react-router-dom'
import Welcome from './Welcome'

const Index = () => {
  const { user, authLoading } = useApp()
  
  // Mostrar loading mientras se verifica autenticación
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

  // Si el usuario está autenticado, redirigir al dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  // Si no está autenticado, mostrar la página de bienvenida
  return <Welcome />
}

export default Index
