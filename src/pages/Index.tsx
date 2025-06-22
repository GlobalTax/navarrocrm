
import { Navigate } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'

const Index = () => {
  const { session, user, isSetup, authLoading } = useApp()

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

  // Redirecciones simplificadas y directas
  if (session || user) {
    return <Navigate to="/dashboard" replace />
  }

  if (isSetup === false) {
    return <Navigate to="/setup" replace />
  }

  return <Navigate to="/login" replace />
}

export default Index
