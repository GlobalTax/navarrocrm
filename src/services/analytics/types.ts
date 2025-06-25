
export interface AnalyticsEvent {
  eventType: string
  eventName: string
  eventData?: Record<string, any>
  pageUrl: string
  pageTitle?: string
  timestamp: number
  sessionId: string
  userId?: string
  orgId?: string
}

export interface PerformanceMetric {
  pageUrl: string
  loadTime?: number
  domContentLoaded?: number
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  firstInputDelay?: number
  cumulativeLayoutShift?: number
  timeToInteractive?: number
  timestamp: number
  sessionId: string
  userId?: string
  orgId?: string
}

export interface ErrorEvent {
  errorMessage: string
  errorStack?: string
  errorType: 'error' | 'unhandledrejection' | 'resource' | 'network'
  pageUrl: string
  contextData?: Record<string, any>
  timestamp: number
  sessionId: string
  userId?: string
  orgId?: string
}

export interface UserInteraction {
  interactionType: 'click' | 'scroll' | 'input' | 'navigation' | 'form_submit'
  elementPath?: string
  pageUrl: string
  interactionData?: Record<string, any>
  timestamp: number
  sessionId: string
  userId?: string
  orgId?: string
}

export interface AnalyticsSession {
  sessionId: string
  startTime: number
  endTime?: number
  pageViews: number
  eventsCount: number
  errorsCount: number
  userAgent: string
  userId?: string
  orgId?: string
}

export interface AnalyticsConfig {
  enabled: boolean
  debug: boolean
  batchSize: number
  flushInterval: number
  maxRetries: number
  trackPerformance: boolean
  trackErrors: boolean
  trackInteractions: boolean
  trackPageViews: boolean
  enableRealtime: boolean
}

export interface QueuedData {
  events: AnalyticsEvent[]
  performance: PerformanceMetric[]
  errors: ErrorEvent[]
  interactions: UserInteraction[]
  session?: Partial<AnalyticsSession>
}
