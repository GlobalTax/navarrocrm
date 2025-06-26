
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'
import Welcome from './Welcome'

const Index = () => {
  const { user, authLoading } = useApp()
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        console.log('🏠 [Index] Usuario detectado, redirigiendo al dashboard')
        navigate('/dashboard', { replace: true })
      }
    }
  }, [user, authLoading, navigate])

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

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo al dashboard...</p>
        </div>
      </div>
    )
  }

  return <Welcome />
}

export default Index
