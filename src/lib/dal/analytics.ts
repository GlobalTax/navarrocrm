import { BaseDAL } from './base'
import { QueryOptions } from './types'

export interface SecurityEvent {
  type: string
  details: Record<string, any>
}

export interface AnalyticsError {
  id: string
  org_id: string
  user_id?: string
  error_type: string
  error_message: string
  error_stack?: string
  session_id: string
  page_url: string
  user_agent?: string
  context_data?: Record<string, any>
  timestamp: string
  created_at: string
}

export interface CreateAnalyticsErrorData {
  error_type: string
  error_message: string
  error_stack?: string
  session_id: string
  page_url: string
  user_agent?: string
  context_data?: Record<string, any>
}

class AnalyticsDAL extends BaseDAL<AnalyticsError> {
  constructor() {
    super('analytics_errors')
  }

  async logSecurityEvent(event: SecurityEvent, orgId: string, userId: string) {
    const errorData: CreateAnalyticsErrorData = {
      error_type: 'security_event',
      error_message: event.type,
      session_id: crypto.randomUUID(),
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      context_data: {
        event_details: event.details,
        timestamp: new Date().toISOString(),
        severity: 'medium'
      }
    }

    return this.create({
      ...errorData,
      org_id: orgId,
      user_id: userId
    })
  }

  async logError(errorData: CreateAnalyticsErrorData, orgId: string, userId?: string) {
    return this.create({
      ...errorData,
      org_id: orgId,
      user_id: userId
    })
  }

  async getErrorsByType(errorType: string, options?: QueryOptions) {
    return this.findMany({
      ...options,
      filters: {
        ...options?.filters,
        error_type: errorType
      }
    })
  }

  async getErrorsBySession(sessionId: string, options?: QueryOptions) {
    return this.findMany({
      ...options,
      filters: {
        ...options?.filters,
        session_id: sessionId
      }
    })
  }
}

export const analyticsDAL = new AnalyticsDAL()