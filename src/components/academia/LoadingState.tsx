
import React from 'react'
import { Loader } from 'lucide-react'

export function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Cargando contenido de la academia...</p>
      </div>
    </div>
  )
}
