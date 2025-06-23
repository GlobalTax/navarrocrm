
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface ClientsHeaderProps {
  onCreateClient: () => void
}

export const ClientsHeader = ({ onCreateClient }: ClientsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-600">Gestiona tu cartera de clientes</p>
      </div>
      <Button onClick={onCreateClient} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Nuevo Cliente
      </Button>
    </div>
  )
}
