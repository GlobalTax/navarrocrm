
import { TestContactsButton } from '@/components/proposals/TestContactsButton'

interface ProposalsEmptyClientsBannerProps {
  clientsCount: number
}

export const ProposalsEmptyClientsBanner = ({ clientsCount }: ProposalsEmptyClientsBannerProps) => {
  if (clientsCount > 0) return null

  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-yellow-800">No hay clientes disponibles</h3>
          <p className="text-sm text-yellow-700">
            Para crear propuestas necesitas tener al menos un cliente. Puedes crear algunos contactos de prueba o ir a la página de Contactos.
          </p>
        </div>
        <TestContactsButton />
      </div>
    </div>
  )
}
