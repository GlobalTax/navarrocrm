
import { ENV_CONFIG } from '@/config/environment'

export const DEFAULT_ANALYTICS_CONFIG = {
  enabled: ENV_CONFIG.analytics.enabled,
  debug: ENV_CONFIG.development.debug,
  batchSize: ENV_CONFIG.analytics.batchSize,
  flushInterval: ENV_CONFIG.analytics.flushInterval,
  maxRetries: 3,
  trackPerformance: true,
  trackErrors: true,
  trackInteractions: true,
  trackPageViews: true,
  enableRealtime: false,
  endpoint: ENV_CONFIG.analytics.endpoint
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
