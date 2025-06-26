
import { Navigate } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'
import Welcome from './Welcome'

const Index = () => {
  const { session, user, isSetup, authLoading } = useApp()

  // Mostrar loading durante la inicialización
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

  // Si el setup no está configurado, ir al setup
  if (isSetup === false) {
    return <Navigate to="/setup" replace />
  }

  // Si hay usuario real (no temporal), ir al dashboard
  if (user && !user.app_metadata?.temp_user) {
    console.log('🏠 [Index] Usuario real detectado, redirigiendo al dashboard')
    return <Navigate to="/dashboard" replace />
  }

  // Si hay usuario temporal, permitir ir al dashboard también
  if (user && user.app_metadata?.temp_user) {
    console.log('🏠 [Index] Usuario temporal detectado, mostrando página de bienvenida')
    return <Welcome />
  }

  // Si no hay usuario, mostrar página de bienvenida
  return <Welcome />
}

export default Index
