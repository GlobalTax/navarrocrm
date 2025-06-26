
import { Navigate } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'
import Welcome from './Welcome'

const Index = () => {
  const { session, user, isSetup, authLoading } = useApp()

  // Mostrar loading muy brevemente
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

  // Si hay usuario (real o temporal), ir directamente al dashboard
  if (user) {
    console.log('🏠 [Index] Usuario disponible, redirigiendo al dashboard')
    return <Navigate to="/dashboard" replace />
  }

  // Si el setup no está configurado, ir al setup
  if (isSetup === false) {
    return <Navigate to="/setup" replace />
  }

  // Mostrar página de bienvenida como fallback
  return <Welcome />
}

export default Index
