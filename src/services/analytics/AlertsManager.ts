
import { supabase } from '@/integrations/supabase/client'

export interface Alert {
  id: string
  type: 'performance' | 'error' | 'security' | 'business'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  data: Record<string, any>
  threshold: number
  currentValue: number
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
}

export interface AlertRule {
  id: string
  name: string
  type: string
  metric: string
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals'
  threshold: number
  severity: Alert['severity']
  isEnabled: boolean
  cooldownMinutes: number
}

class AlertsManager {
  private alerts: Alert[] = []
  private rules: AlertRule[] = []
  private listeners: Array<(alerts: Alert[]) => void> = []
  private lastAlertCheck = new Map<string, Date>()

  constructor() {
    this.initializeDefaultRules()
    this.startMonitoring()
  }

  private initializeDefaultRules() {
    this.rules = [
      {
        id: 'lcp-threshold',
        name: 'LCP Alto',
        type: 'performance',
        metric: 'largest_contentful_paint',
        condition: 'greater_than',
        threshold: 4000,
        severity: 'high',
        isEnabled: true,
        cooldownMinutes: 15
      },
      {
        id: 'fid-threshold',
        name: 'FID Alto',
        type: 'performance',
        metric: 'first_input_delay',
        condition: 'greater_than',
        threshold: 300,
        severity: 'medium',
        isEnabled: true,
        cooldownMinutes: 10
      },
      {
        id: 'cls-threshold',
        name: 'CLS Alto',
        type: 'performance',
        metric: 'cumulative_layout_shift',
        condition: 'greater_than',
        threshold: 0.25,
        severity: 'medium',
        isEnabled: true,
        cooldownMinutes: 10
      },
      {
        id: 'error-rate-threshold',
        name: 'Tasa de Error Alta',
        type: 'error',
        metric: 'error_rate',
        condition: 'greater_than',
        threshold: 5,
        severity: 'critical',
        isEnabled: true,
        cooldownMinutes: 5
      },
      {
        id: 'session-duration-low',
        name: 'Duración de Sesión Baja',
        type: 'business',
        metric: 'avg_session_duration',
        condition: 'less_than',
        threshold: 60000,
        severity: 'low',
        isEnabled: true,
        cooldownMinutes: 30
      }
    ]
  }

  private startMonitoring() {
    // Revisar alertas cada 30 segundos
    setInterval(() => {
      this.checkAlerts()
    }, 30000)
  }

  private async checkAlerts() {
    for (const rule of this.rules.filter(r => r.isEnabled)) {
      try {
        await this.evaluateRule(rule)
      } catch (error) {
        console.error('Error evaluating alert rule:', rule.name, error)
      }
    }
  }

  private async evaluateRule(rule: AlertRule) {
    // Verificar cooldown
    const lastAlert = this.lastAlertCheck.get(rule.id)
    if (lastAlert && Date.now() - lastAlert.getTime() < rule.cooldownMinutes * 60000) {
      return
    }

    const currentValue = await this.getMetricValue(rule.metric)
    if (currentValue === null) return

    const shouldAlert = this.evaluateCondition(currentValue, rule.condition, rule.threshold)

    if (shouldAlert) {
      const alert: Alert = {
        id: `${rule.id}-${Date.now()}`,
        type: rule.type as Alert['type'],
        severity: rule.severity,
        title: rule.name,
        description: this.generateAlertDescription(rule, currentValue),
        data: {
          metric: rule.metric,
          threshold: rule.threshold,
          condition: rule.condition,
          ruleId: rule.id
        },
        threshold: rule.threshold,
        currentValue,
        timestamp: new Date(),
        resolved: false
      }

      this.addAlert(alert)
      this.lastAlertCheck.set(rule.id, new Date())
    }
  }

  private async getMetricValue(metric: string): Promise<number | null> {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    try {
      switch (metric) {
        case 'largest_contentful_paint':
        case 'first_input_delay':
        case 'cumulative_layout_shift':
          const { data: perfData } = await supabase
            .from('analytics_performance')
            .select(metric)
            .gte('timestamp', oneHourAgo.toISOString())
            .not(metric, 'is', null)

          if (!perfData || perfData.length === 0) return null
          const values = perfData.map(d => d[metric]).filter(v => v !== null)
          return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null

        case 'error_rate':
          const [{ data: errors }, { data: events }] = await Promise.all([
            supabase
              .from('analytics_errors')
              .select('id')
              .gte('timestamp', oneHourAgo.toISOString()),
            supabase
              .from('analytics_events')
              .select('id')
              .gte('timestamp', oneHourAgo.toISOString())
          ])

          const errorCount = errors?.length || 0
          const eventCount = events?.length || 1
          return (errorCount / eventCount) * 100

        case 'avg_session_duration':
          const { data: sessions } = await supabase
            .from('analytics_sessions')
            .select('start_time, end_time')
            .gte('start_time', oneHourAgo.toISOString())
            .not('end_time', 'is', null)

          if (!sessions || sessions.length === 0) return null
          
          const durations = sessions.map(s => 
            new Date(s.end_time).getTime() - new Date(s.start_time).getTime()
          )
          return durations.reduce((a, b) => a + b, 0) / durations.length

        default:
          return null
      }
    } catch (error) {
      console.error(`Error getting metric ${metric}:`, error)
      return null
    }
  }

  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'greater_than': return value > threshold
      case 'less_than': return value < threshold
      case 'equals': return value === threshold
      case 'not_equals': return value !== threshold
      default: return false
    }
  }

  private generateAlertDescription(rule: AlertRule, currentValue: number): string {
    const unit = this.getMetricUnit(rule.metric)
    return `${rule.name}: ${currentValue.toFixed(2)}${unit} (umbral: ${rule.threshold}${unit})`
  }

  private getMetricUnit(metric: string): string {
    switch (metric) {
      case 'largest_contentful_paint':
      case 'first_input_delay':
      case 'avg_session_duration':
        return 'ms'
      case 'error_rate':
        return '%'
      case 'cumulative_layout_shift':
        return ''
      default:
        return ''
    }
  }

  addAlert(alert: Alert) {
    this.alerts.unshift(alert)
    this.notifyListeners()
    
    // Enviar notificación push si es crítica
    if (alert.severity === 'critical') {
      this.sendPushNotification(alert)
    }
  }

  resolveAlert(alertId: string, resolvedBy?: string) {
    const alertIndex = this.alerts.findIndex(a => a.id === alertId)
    if (alertIndex !== -1) {
      this.alerts[alertIndex].resolved = true
      this.alerts[alertIndex].resolvedAt = new Date()
      this.alerts[alertIndex].resolvedBy = resolvedBy
      this.notifyListeners()
    }
  }

  getAlerts(filter?: { type?: string; severity?: string; resolved?: boolean }) {
    let filtered = [...this.alerts]
    
    if (filter) {
      if (filter.type) filtered = filtered.filter(a => a.type === filter.type)
      if (filter.severity) filtered = filtered.filter(a => a.severity === filter.severity)
      if (filter.resolved !== undefined) filtered = filtered.filter(a => a.resolved === filter.resolved)
    }
    
    return filtered
  }

  getActiveAlertsCount() {
    return this.alerts.filter(a => !a.resolved).length
  }

  getCriticalAlertsCount() {
    return this.alerts.filter(a => !a.resolved && a.severity === 'critical').length
  }

  subscribe(listener: (alerts: Alert[]) => void) {
    this.listeners.push(listener)
    listener(this.alerts) // Enviar estado inicial
    
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) this.listeners.splice(index, 1)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.alerts))
  }

  private sendPushNotification(alert: Alert) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`🚨 ${alert.title}`, {
        body: alert.description,
        icon: '/favicon.ico',
        tag: alert.id
      })
    }
  }

  updateRule(ruleId: string, updates: Partial<AlertRule>) {
    const ruleIndex = this.rules.findIndex(r => r.id === ruleId)
    if (ruleIndex !== -1) {
      this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates }
    }
  }

  getRules() {
    return [...this.rules]
  }

  addRule(rule: AlertRule) {
    this.rules.push(rule)
  }

  removeRule(ruleId: string) {
    this.rules = this.rules.filter(r => r.id !== ruleId)
  }
}

export const alertsManager = new AlertsManager()
