
import { AuthUser } from '@/contexts/types'

interface DashboardHeaderProps {
  user: AuthUser
}

export const DashboardHeader = ({ user }: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Bienvenido de nuevo, {user.email?.split('@')[0]}!
        </h1>
        <p className="text-gray-600">
          Aquí tienes un resumen de tu actividad de hoy
        </p>
      </div>
    </div>
  )
}
