
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Plus } from 'lucide-react'

interface ClientsHeaderProps {
  onCreateClient: () => void
}

export const ClientsHeader = ({ onCreateClient }: ClientsHeaderProps) => {
  return (
    <StandardPageHeader
      title="Clientes"
      description="Gestiona tu cartera de clientes"
      primaryAction={{
        label: "Nuevo Cliente",
        onClick: onCreateClient
      }}
    />
  )
}
