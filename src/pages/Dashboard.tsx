
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MainLayout } from '@/components/layout/MainLayout'
import { Clock, DollarSign, FolderOpen, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardStats {
  billableHoursThisMonth: number
  revenueThisMonth: number
  openCases: number
  totalClients: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    billableHoursThisMonth: 0,
    revenueThisMonth: 0,
    openCases: 0,
    totalClients: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [user?.org_id])

  const fetchDashboardStats = async () => {
    if (!user?.org_id) return

    try {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      // Get billable hours this month
      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('duration_minutes')
        .eq('org_id', user.org_id)
        .eq('is_billable', true)
        .gte('created_at', startOfMonth.toISOString())

      const billableMinutes = timeEntries?.reduce((acc, entry) => acc + entry.duration_minutes, 0) || 0
      const billableHours = Math.round(billableMinutes / 60 * 100) / 100

      // Get open cases
      const { count: openCasesCount } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', user.org_id)
        .in('status', ['open', 'in_progress'])

      // Get total clients
      const { count: clientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', user.org_id)

      setStats({
        billableHoursThisMonth: billableHours,
        revenueThisMonth: billableHours * 150, // Assuming 150€/hour average
        openCases: openCasesCount || 0,
        totalClients: clientsCount || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Horas Facturables',
      value: loading ? '...' : `${stats.billableHoursThisMonth}h`,
      description: 'Este mes',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      title: 'Ingresos Estimados',
      value: loading ? '...' : `${stats.revenueThisMonth.toLocaleString()}€`,
      description: 'Este mes',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Casos Abiertos',
      value: loading ? '...' : stats.openCases.toString(),
      description: 'En progreso',
      icon: FolderOpen,
      color: 'text-orange-600'
    },
    {
      title: 'Total Clientes',
      value: loading ? '...' : stats.totalClients.toString(),
      description: 'Activos',
      icon: Users,
      color: 'text-purple-600'
    }
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Casos Recientes</CardTitle>
              <CardDescription>
                Últimos casos creados en tu organización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Caso de ejemplo</p>
                    <p className="text-sm text-gray-500">Cliente: Empresa XYZ</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    En progreso
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actividad del Equipo</CardTitle>
              <CardDescription>
                Resumen de la actividad reciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tiempo registrado hoy</p>
                    <p className="text-xs text-gray-500">Pendiente de implementar</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
