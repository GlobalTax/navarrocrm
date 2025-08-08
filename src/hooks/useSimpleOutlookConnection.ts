import { useOutlookConnectionStatus } from './useOutlookConnectionStatus'
import { useOutlookAuth } from './useOutlookAuth'

export function useSimpleOutlookConnection() {
  const { status, isConnected } = useOutlookConnectionStatus()
  const { startConnection } = useOutlookAuth()
  
  return {
    connectionStatus: status?.status || 'not_connected',
    isConnected,
    connection: status?.connectionData || null,
    error: status?.error || null,
    lastSync: status?.lastSync || null,
    connect: startConnection
  }
}