
import { UserRole } from '@/contexts/types'
import { DashboardData } from '@/types/dashboardTypes'

export interface MetricConfig {
  key: string
  title: string
  getValue: (data: DashboardData) => string | number
  subtitle?: string
  trend?: {
    value: string
    type: 'positive' | 'negative' | 'neutral'
  }
  className?: string
}

export const getMetricsForRole = (role?: UserRole, data?: DashboardData): MetricConfig[] => {
  if (!data) return []

  const baseMetrics: MetricConfig[] = [
    {
      key: 'today-hours',
      title: 'Horas Hoy',
      getValue: (data) => `${data.quickStats.todayHours}h`,
      subtitle: 'Tiempo registrado hoy',
      trend: {
        value: data.quickStats.todayHours >= 6 ? '+Bien' : 'Continúa',
        type: data.quickStats.todayHours >= 6 ? 'positive' : 'neutral'
      }
    },
    {
      key: 'week-hours',
      title: 'Horas Semana',
      getValue: (data) => `${data.quickStats.weekHours}h`,
      subtitle: 'Esta semana',
      trend: {
        value: data.quickStats.weekHours > 30 ? '+Excelente' : 'En progreso',
        type: data.quickStats.weekHours > 30 ? 'positive' : 'neutral'
      }
    },
    {
      key: 'month-hours',
      title: 'Horas Mes',
      getValue: (data) => `${data.quickStats.monthHours}h`,
      subtitle: 'Este mes'
    },
    {
      key: 'upcoming-tasks',
      title: 'Tareas Pendientes',
      getValue: (data) => data.upcomingTasks.length,
      subtitle: 'Por completar',
      trend: {
        value: data.upcomingTasks.length === 0 ? 'Al día' : `${data.upcomingTasks.length} pendientes`,
        type: data.upcomingTasks.length === 0 ? 'positive' : 'neutral'
      }
    }
  ]

  switch (role) {
    case 'junior':
      return baseMetrics

    case 'senior':
      return [
        ...baseMetrics,
        {
          key: 'active-clients',
          title: 'Clientes Activos',
          getValue: (data) => data.quickStats.activeClients,
          subtitle: 'Clientes del equipo'
        },
        {
          key: 'team-productivity',
          title: 'Productividad Equipo',
          getValue: () => '85%',
          subtitle: 'Rendimiento general',
          trend: {
            value: '+5% esta semana',
            type: 'positive'
          }
        }
      ]

    case 'finance':
      return [
        {
          key: 'monthly-revenue',
          title: 'Facturación Mensual',
          getValue: () => '€24,580',
          subtitle: 'Este mes',
          trend: {
            value: '+12% vs mes anterior',
            type: 'positive'
          }
        },
        {
          key: 'pending-invoices',
          title: 'Facturas Pendientes',
          getValue: () => '8',
          subtitle: 'Por cobrar',
          trend: {
            value: '€12,400 pendiente',
            type: 'neutral'
          }
        },
        {
          key: 'collection-rate',
          title: 'Tasa Cobro',
          getValue: () => '94%',
          subtitle: 'Últimos 30 días',
          trend: {
            value: '+2% mejora',
            type: 'positive'
          }
        },
        {
          key: 'avg-payment-time',
          title: 'Tiempo Medio Cobro',
          getValue: () => '28 días',
          subtitle: 'Promedio actual'
        }
      ]

    case 'partner':
    case 'area_manager':
    default:
      return [
        ...baseMetrics,
        {
          key: 'active-clients',
          title: 'Clientes Activos',
          getValue: (data) => data.quickStats.activeClients,
          subtitle: 'Total clientes'
        },
        {
          key: 'monthly-revenue',
          title: 'Facturación Mensual',
          getValue: () => '€24,580',
          subtitle: 'Este mes',
          trend: {
            value: '+12% vs anterior',
            type: 'positive'
          }
        },
        {
          key: 'utilization-rate',
          title: 'Tasa Utilización',
          getValue: () => '78%',
          subtitle: 'Equipo completo',
          trend: {
            value: '+5% esta semana',
            type: 'positive'
          }
        },
        {
          key: 'profit-margin',
          title: 'Margen Beneficio',
          getValue: () => '32%',
          subtitle: 'Este trimestre',
          trend: {
            value: 'Estable',
            type: 'neutral'
          }
        }
      ]
  }
}
