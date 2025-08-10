
import { Button } from '@/components/ui/button'
import { Settings, RefreshCw } from 'lucide-react'
import { ConnectionStatusType } from './types'
import { Link } from 'react-router-dom'

interface ActionButtonProps {
  status: ConnectionStatusType
  onRefresh: () => void
}

export const ActionButton = ({ status, onRefresh }: ActionButtonProps) => {
  switch (status) {
    case 'not-configured':
      return (
        <Button size="sm" variant="outline" asChild>
          <Link to="/integrations">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Link>
        </Button>
      )
    case 'not-connected':
    case 'token-expired':
      return (
        <Button size="sm" variant="outline" asChild>
          <Link to="/integrations">
            <RefreshCw className="h-4 w-4 mr-2" />
            Conectar
          </Link>
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
