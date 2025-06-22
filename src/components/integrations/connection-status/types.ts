
export interface ConnectionStatus {
  isConfigured: boolean
  isUserConnected: boolean
  hasValidToken: boolean
  lastSync?: string
  error?: string
}

export type ConnectionStatusType = 'loading' | 'not-configured' | 'not-connected' | 'token-expired' | 'connected'
