
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

  // Redirecciones simplificadas y directas
  if (session || user) {
    console.log('📍 [Index] Usuario autenticado, redirigiendo al dashboard')
    return <Navigate to="/" replace />
  }

  if (isSetup === false) {
    console.log('📍 [Index] Sistema no configurado, redirigiendo a setup')
    return <Navigate to="/setup" replace />
  }

  console.log('📍 [Index] Sin autenticación, redirigiendo a login')
  return <Navigate to="/login" replace />
}

export default Index
