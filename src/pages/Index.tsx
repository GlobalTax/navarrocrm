
import { Navigate } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'
import { useRef, useEffect, useState } from 'react'
import Welcome from './Welcome'

const Index = () => {
  const { user, authLoading } = useApp()
  
  // Control de redirección para evitar bucles
  const redirectCheckedRef = useRef(false)
  const [shouldNavigate, setShouldNavigate] = useState(false)
  
  // Resetear estado cuando cambia el usuario
  useEffect(() => {
    redirectCheckedRef.current = false
    setShouldNavigate(false)
  }, [user?.id])

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

  // Si hay usuario válido y no hemos procesado la redirección
  if (user && !redirectCheckedRef.current) {
    console.log('🏠 [Index] Usuario detectado, preparando redirección al dashboard')
    redirectCheckedRef.current = true
    
    // Delay pequeño para evitar bucles de renderizado
    setTimeout(() => {
      setShouldNavigate(true)
    }, 100)
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Accediendo al dashboard...</p>
        </div>
      </div>
    )
  }

  // Ejecutar navegación si está marcada
  if (shouldNavigate && user) {
    return <Navigate to="/dashboard" replace />
  }

  // Si no hay usuario, mostrar página de bienvenida
  if (!user) {
    console.log('🏠 [Index] No hay usuario autenticado, mostrando página de bienvenida')
    return <Welcome />
  }

  // Fallback: mostrar loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}

export default Index
