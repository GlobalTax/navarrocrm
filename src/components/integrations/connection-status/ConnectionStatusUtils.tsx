
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react'
import { ConnectionStatusType } from './types'

export const getStatusIcon = (status: ConnectionStatusType) => {
  switch (status) {
    case 'connected':
      return <CheckCircle className="h-5 w-5 text-green-600" />
    case 'not-configured':
    case 'not-connected':
    case 'token-expired':
      return <XCircle className="h-5 w-5 text-red-600" />
    case 'loading':
      return <RefreshCw className="h-5 w-5 animate-spin" />
    default:
      return <AlertTriangle className="h-5 w-5 text-gray-400" />
  }
}

export const getStatusColor = (status: ConnectionStatusType): string => {
  switch (status) {
    case 'connected':
      return 'text-green-600'
    case 'not-configured':
    case 'not-connected':
    case 'token-expired':
      return 'text-red-600'
    default:
      return 'text-gray-400'
  }
}

export const getStatusText = (status: ConnectionStatusType): string => {
  switch (status) {
    case 'loading':
      return 'Verificando conexión...'
    case 'connected':
      return 'Conectado y sincronizado'
    case 'not-configured':
      return 'Configuración pendiente'
    case 'not-connected':
      return 'Usuario no conectado'
    case 'token-expired':
      return 'Token expirado'
    default:
      return 'Estado desconocido'
  }
}
