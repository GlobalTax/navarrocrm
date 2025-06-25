
import { supabase } from '@/integrations/supabase/client'
import {
  AnalyticsEvent,
  PerformanceMetric,
  ErrorEvent,
  UserInteraction,
  AnalyticsSession,
  AnalyticsConfig,
  QueuedData
} from './types'
import { DEFAULT_ANALYTICS_CONFIG, PERFORMANCE_THRESHOLDS } from './config'

export class AdvancedAnalytics {
  private config: AnalyticsConfig
  private sessionId: string
  private userId?: string
  private orgId?: string
  private queue: QueuedData
  private flushTimer?: number
  private performanceObserver?: PerformanceObserver
  private isInitialized = false
  private retryCount = 0

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...DEFAULT_ANALYTICS_CONFIG, ...config }
    this.sessionId = this.generateSessionId()
    this.queue = {
      events: [],
      performance: [],
      errors: [],
      interactions: []
    }

    if (this.config.enabled) {
      this.initialize()
    }
  }

  private initialize() {
    if (this.isInitialized || typeof window === 'undefined') return

    this.log('🚀 Inicializando Advanced Analytics...')

    // Inicializar sesión
    this.initializeSession()

    // Configurar observadores
    if (this.config.trackPerformance) {
      this.setupPerformanceObservers()
    }

    if (this.config.trackErrors) {
      this.setupErrorHandlers()
    }

    if (this.config.trackInteractions) {
      this.setupInteractionTracking()
    }

    if (this.config.trackPageViews) {
      this.trackPageView()
    }

    // Configurar flush automático
    this.setupAutoFlush()

    // Manejar visibilidad de página
    this.setupVisibilityHandlers()

    this.isInitialized = true
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeSession() {
    const session: AnalyticsSession = {
      sessionId: this.sessionId,
      startTime: Date.now(),
      pageViews: 0,
      eventsCount: 0,
      errorsCount: 0,
      userAgent: navigator.userAgent,
      userId: this.userId,
      orgId: this.orgId
    }

    this.queue.session = session
    this.log('📊 Sesión inicializada:', session)
  }

  private setupPerformanceObservers() {
    // Observador para Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // LCP Observer
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          if (lastEntry) {
            this.trackPerformanceMetric({
              pageUrl: window.location.href,
              largestContentfulPaint: lastEntry.startTime,
              timestamp: Date.now(),
              sessionId: this.sessionId,
              userId: this.userId,
              orgId: this.orgId
            })
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // FID Observer
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            this.trackPerformanceMetric({
              pageUrl: window.location.href,
              firstInputDelay: entry.processingStart - entry.startTime,
              timestamp: Date.now(),
              sessionId: this.sessionId,
              userId: this.userId,
              orgId: this.orgId
            })
          })
        }).observe({ entryTypes: ['first-input'] })

        // CLS Observer
        new PerformanceObserver((list) => {
          let clsValue = 0
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          
          if (clsValue > 0) {
            this.trackPerformanceMetric({
              pageUrl: window.location.href,
              cumulativeLayoutShift: clsValue,
              timestamp: Date.now(),
              sessionId: this.sessionId,
              userId: this.userId,
              orgId: this.orgId
            })
          }
        }).observe({ entryTypes: ['layout-shift'] })

        // Navigation Timing
        window.addEventListener('load', () => {
          setTimeout(() => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
            if (navigation) {
              this.trackPerformanceMetric({
                pageUrl: window.location.href,
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                firstContentfulPaint: this.getFirstContentfulPaint(),
                timeToInteractive: this.estimateTimeToInteractive(),
                timestamp: Date.now(),
                sessionId: this.sessionId,
                userId: this.userId,
                orgId: this.orgId
              })
            }
          }, 100)
        })

      } catch (error) {
        this.log('❌ Error configurando observadores de performance:', error)
      }
    }
  }

  private getFirstContentfulPaint(): number | undefined {
    const entries = performance.getEntriesByType('paint')
    const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
    return fcpEntry?.startTime
  }

  private estimateTimeToInteractive(): number | undefined {
    // Estimación básica del TTI
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigation ? navigation.domInteractive - navigation.navigationStart : undefined
  }

  private setupErrorHandlers() {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError({
        errorMessage: event.message,
        errorStack: event.error?.stack,
        errorType: 'error',
        pageUrl: window.location.href,
        contextData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        },
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId,
        orgId: this.orgId
      })
    })

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        errorMessage: event.reason?.message || String(event.reason),
        errorStack: event.reason?.stack,
        errorType: 'unhandledrejection',
        pageUrl: window.location.href,
        contextData: {
          reason: event.reason
        },
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId,
        orgId: this.orgId
      })
    })

    // Resource errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.trackError({
          errorMessage: `Resource failed to load: ${(event.target as any)?.src || (event.target as any)?.href}`,
          errorType: 'resource',
          pageUrl: window.location.href,
          contextData: {
            element: event.target?.tagName,
            source: (event.target as any)?.src || (event.target as any)?.href
          },
          timestamp: Date.now(),
          sessionId: this.sessionId,
          userId: this.userId,
          orgId: this.orgId
        })
      }
    }, true)
  }

  private setupInteractionTracking() {
    // Click tracking
    document.addEventListener('click', (event) => {
      const element = event.target as HTMLElement
      this.trackInteraction({
        interactionType: 'click',
        elementPath: this.getElementPath(element),
        pageUrl: window.location.href,
        interactionData: {
          tagName: element.tagName,
          className: element.className,
          id: element.id,
          text: element.textContent?.slice(0, 100)
        },
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId,
        orgId: this.orgId
      })
    }, { passive: true })

    // Scroll tracking (throttled)
    let scrollTimeout: number
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = window.setTimeout(() => {
        this.trackInteraction({
          interactionType: 'scroll',
          pageUrl: window.location.href,
          interactionData: {
            scrollY: window.scrollY,
            scrollX: window.scrollX,
            documentHeight: document.documentElement.scrollHeight,
            viewportHeight: window.innerHeight
          },
          timestamp: Date.now(),
          sessionId: this.sessionId,
          userId: this.userId,
          orgId: this.orgId
        })
      }, 150)
    }, { passive: true })

    // Form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      this.trackInteraction({
        interactionType: 'form_submit',
        elementPath: this.getElementPath(form),
        pageUrl: window.location.href,
        interactionData: {
          formId: form.id,
          formName: form.name,
          action: form.action,
          method: form.method
        },
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId,
        orgId: this.orgId
      })
    })
  }

  private getElementPath(element: HTMLElement): string {
    const path = []
    let current = element

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase()
      
      if (current.id) {
        selector += `#${current.id}`
      } else if (current.className) {
        selector += `.${current.className.split(' ').join('.')}`
      }
      
      path.unshift(selector)
      current = current.parentElement!
    }

    return path.join(' > ')
  }

  private setupAutoFlush() {
    this.flushTimer = window.setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }

  private setupVisibilityHandlers() {
    // Flush cuando la página se oculta
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush()
        this.endSession()
      }
    })

    // Flush antes de que la página se descargue
    window.addEventListener('beforeunload', () => {
      this.flush()
      this.endSession()
    })
  }

  // Métodos públicos
  public setUser(userId: string, orgId: string) {
    this.userId = userId
    this.orgId = orgId
    
    if (this.queue.session) {
      this.queue.session.userId = userId
      this.queue.session.orgId = orgId
    }

    this.log('👤 Usuario configurado:', { userId, orgId })
  }

  public trackEvent(event: Omit<AnalyticsEvent, 'sessionId' | 'timestamp'>) {
    const fullEvent: AnalyticsEvent = {
      ...event,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      userId: this.userId,
      orgId: this.orgId
    }

    this.queue.events.push(fullEvent)
    this.incrementSessionCounter('eventsCount')
    
    this.log('📊 Evento tracked:', fullEvent)

    if (this.shouldFlush()) {
      this.flush()
    }
  }

  public trackPageView(url?: string, title?: string) {
    const pageUrl = url || window.location.href
    const pageTitle = title || document.title

    this.trackEvent({
      eventType: 'navigation',
      eventName: 'page_view',
      pageUrl,
      pageTitle,
      eventData: {
        referrer: document.referrer,
        timestamp: Date.now()
      }
    })

    this.incrementSessionCounter('pageViews')
  }

  private trackPerformanceMetric(metric: PerformanceMetric) {
    this.queue.performance.push(metric)
    
    this.log('⚡ Performance metric:', metric)

    if (this.shouldFlush()) {
      this.flush()
    }
  }

  private trackError(error: ErrorEvent) {
    this.queue.errors.push(error)
    this.incrementSessionCounter('errorsCount')
    
    this.log('❌ Error tracked:', error)

    // Flush immediately for errors
    this.flush()
  }

  private trackInteraction(interaction: UserInteraction) {
    this.queue.interactions.push(interaction)
    
    if (this.shouldFlush()) {
      this.flush()
    }
  }

  private incrementSessionCounter(counter: keyof Pick<AnalyticsSession, 'pageViews' | 'eventsCount' | 'errorsCount'>) {
    if (this.queue.session) {
      this.queue.session[counter] = (this.queue.session[counter] || 0) + 1
    }
  }

  private shouldFlush(): boolean {
    const totalItems = this.queue.events.length + 
                      this.queue.performance.length + 
                      this.queue.errors.length + 
                      this.queue.interactions.length

    return totalItems >= this.config.batchSize
  }

  public async flush(): Promise<void> {
    if (!this.hasDataToFlush()) return

    const dataToSend = { ...this.queue }
    
    // Limpiar cola
    this.queue = {
      events: [],
      performance: [],
      errors: [],
      interactions: []
    }

    try {
      this.log('🚀 Enviando datos analytics:', dataToSend)
      
      const { error } = await supabase.functions.invoke('analytics-collector', {
        body: dataToSend
      })

      if (error) {
        throw error
      }

      this.retryCount = 0
      this.log('✅ Datos enviados exitosamente')

    } catch (error) {
      this.log('❌ Error enviando analytics:', error)
      
      if (this.retryCount < this.config.maxRetries) {
        // Reagregar datos a la cola para retry
        this.queue.events.unshift(...dataToSend.events)
        this.queue.performance.unshift(...dataToSend.performance)
        this.queue.errors.unshift(...dataToSend.errors)
        this.queue.interactions.unshift(...dataToSend.interactions)
        
        this.retryCount++
        
        // Retry con backoff exponencial
        setTimeout(() => this.flush(), Math.pow(2, this.retryCount) * 1000)
      }
    }
  }

  private hasDataToFlush(): boolean {
    return this.queue.events.length > 0 || 
           this.queue.performance.length > 0 || 
           this.queue.errors.length > 0 || 
           this.queue.interactions.length > 0 ||
           !!this.queue.session
  }

  private endSession() {
    if (this.queue.session) {
      this.queue.session.endTime = Date.now()
    }
  }

  public destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
    }

    this.flush()
    this.endSession()
    
    this.log('🔥 Advanced Analytics destroyed')
  }

  private log(...args: any[]) {
    if (this.config.debug) {
      console.log('[AdvancedAnalytics]', ...args)
    }
  }
}
