
import { Button } from '@/components/ui/button'
import { Settings, RefreshCw } from 'lucide-react'
import { ConnectionStatusType } from './types'

interface ActionButtonProps {
  status: ConnectionStatusType
  onRefresh: () => void
}

export const ActionButton = ({ status, onRefresh }: ActionButtonProps) => {
  switch (status) {
    case 'not-configured':
      return (
        <Button size="sm" variant="outline" asChild>
          <a href="/integrations">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </a>
        </Button>
      )
    case 'not-connected':
    case 'token-expired':
      return (
        <Button size="sm" variant="outline" asChild>
          <a href="/integrations">
            <RefreshCw className="h-4 w-4 mr-2" />
            Conectar
          </a>
        </Button>
      )
    case 'connected':
      return (
        <Button size="sm" variant="ghost" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      )
    default:
      return null
  }
}
