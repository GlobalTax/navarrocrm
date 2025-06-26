
import { Navigate } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'
import Welcome from './Welcome'

const Index = () => {
  const { user, authLoading } = useApp()

  // Loading mientras se verifica la autenticación
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

  // Si hay usuario real, ir al dashboard
  if (user) {
    console.log('🏠 [Index] Usuario detectado, redirigiendo al dashboard')
    return <Navigate to="/dashboard" replace />
  }

  // Si no hay usuario, mostrar página de bienvenida
  console.log('🏠 [Index] No hay usuario, mostrando página de bienvenida')
  return <Welcome />
}

export default Index
