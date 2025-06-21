
import { AuthUser } from '../types'

// Setup cache
export const setupCache = {
  isSetup: null as boolean | null,
  timestamp: 0,
  CACHE_DURATION: 60000 // 1 minuto
}

// Profile cache
export const profileCache = new Map<string, { user: AuthUser, timestamp: number }>()

export const clearAuthCaches = () => {
  profileCache.clear()
  setupCache.isSetup = null
  setupCache.timestamp = 0
}
