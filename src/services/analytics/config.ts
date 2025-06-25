
import { AnalyticsConfig } from './types'

export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  enabled: true,
  debug: import.meta.env.MODE === 'development',
  batchSize: 10,
  flushInterval: 5000, // 5 segundos
  maxRetries: 3,
  trackPerformance: true,
  trackErrors: true,
  trackInteractions: true,
  trackPageViews: true,
  enableRealtime: false
}

export const PERFORMANCE_THRESHOLDS = {
  LCP: 2500, // Good: < 2.5s
  FID: 100,  // Good: < 100ms
  CLS: 0.1,  // Good: < 0.1
  FCP: 1800, // Good: < 1.8s
  TTI: 3800  // Good: < 3.8s
}

export const ERROR_TYPES = {
  JS_ERROR: 'error',
  PROMISE_REJECTION: 'unhandledrejection',
  RESOURCE_ERROR: 'resource',
  NETWORK_ERROR: 'network'
} as const

export const INTERACTION_TYPES = {
  CLICK: 'click',
  SCROLL: 'scroll',
  INPUT: 'input',
  NAVIGATION: 'navigation',
  FORM_SUBMIT: 'form_submit'
} as const
