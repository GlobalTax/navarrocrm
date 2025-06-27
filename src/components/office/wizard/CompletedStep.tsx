
import { CheckCircle } from 'lucide-react'

export const CompletedStep = () => {
  return (
    <div className="text-center space-y-3">
      <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
      <p>¡Perfecto! Tu sistema de gestión de oficina está listo para usar.</p>
      <p className="text-sm text-gray-600">
        Ahora puedes empezar a crear reservas, gestionar equipos y administrar tu oficina.
      </p>
    </div>
  )
}
