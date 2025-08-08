
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { AuthUser } from '@/contexts/types'

interface DashboardHeaderProps {
  user: AuthUser
}

export const DashboardHeader = ({ user }: DashboardHeaderProps) => {
  return (
    <StandardPageHeader
      title={`¡Bienvenido de nuevo, ${user.email?.split('@')[0]}!`}
      description="Aquí tienes un resumen de tu actividad de hoy"
    />
  )
}
