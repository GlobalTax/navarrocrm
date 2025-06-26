
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'

const Index: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            LegalFlow
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            CRM especializado para asesorías jurídicas. Gestiona expedientes, contactos y tiempo de forma eficiente.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link to="/login">
              <Button 
                size="lg" 
                className="border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200"
              >
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-[10px] border-0.5 border-black shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Gestión de Contactos</h3>
            <p className="text-gray-600">
              Mantén toda la información de tus clientes organizada y accesible.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-[10px] border-0.5 border-black shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Control de Expedientes</h3>
            <p className="text-gray-600">
              Gestiona todos tus casos legales desde un lugar centralizado.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-[10px] border-0.5 border-black shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Dashboard Intuitivo</h3>
            <p className="text-gray-600">
              Visualiza métricas importantes y el estado de tu práctica legal.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Index
