
import { useEffect, useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { 
  Clock, 
  Users, 
  FolderOpen, 
  DollarSign,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import { MetricWidget } from '@/components/dashboard/MetricWidget'
import { TodayAgenda } from '@/components/dashboard/TodayAgenda'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { PerformanceChart } from '@/components/dashboard/PerformanceChart'
import { ActiveTimer } from '@/components/dashboard/ActiveTimer'
import { RecentActivity } from '@/components/dashboard/RecentActivity'

export default function Dashboard() {
  const { user } = useApp()
  const [stats, setStats] = useState({
    totalTimeEntries: 0,
    totalBillableHours: 0,
    totalClients: 0,
    totalCases: 0,
    pendingInvoices: 5, // Mock data
    hoursThisWeek: 32, // Mock data
    utilizationRate: 78, // Mock data
    loading: true,
    error: null as string | null
  })

  useEffect(() => {
    if (user?.org_id) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    if (!user?.org_id) {
      console.log('📊 No org_id disponible, omitiendo fetch de estadísticas')
      return
    }

    try {
      console.log('📊 Obteniendo estadísticas para org:', user.org_id)
      setStats(prev => ({ ...prev, loading: true, error: null }))

      // Obtener estadísticas de entradas de tiempo
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('duration_minutes, is_billable')

      if (timeError) {
        console.error('❌ Error obteniendo time_entries:', timeError)
        throw timeError
      }

      const totalTimeEntries = timeEntries?.length || 0
      const totalBillableHours = timeEntries
        ?.filter(entry => entry.is_billable)
        .reduce((acc, entry) => acc + (entry.duration_minutes || 0), 0) / 60 || 0

      // Obtener estadísticas de clientes
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id')

      if (clientsError) {
        console.error('❌ Error obteniendo clients:', clientsError)
        throw clientsError
      }

      // Obtener estadísticas de casos
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('id')

      if (casesError) {
        console.error('❌ Error obteniendo cases:', casesError)
        throw casesError
      }

      console.log('✅ Estadísticas obtenidas exitosamente')
      setStats(prev => ({
        ...prev,
        totalTimeEntries,
        totalBillableHours: Math.round(totalBillableHours * 100) / 100,
        totalClients: clients?.length || 0,
        totalCases: cases?.length || 0,
        loading: false,
        error: null
      }))
    } catch (error: any) {
      console.error('❌ Error obteniendo estadísticas:', error)
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al cargar las estadísticas'
      }))
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header with welcome message */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Bienvenido de nuevo, {user.email?.split('@')[0]}!
            </h1>
            <p className="text-gray-600">
              Aquí tienes un resumen de tu actividad de hoy
            </p>
          </div>
        </div>

        {/* Timer activo */}
        <ActiveTimer />

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricWidget
            title="Clientes Activos"
            value={stats.loading ? '...' : stats.totalClients}
            change="+2 este mes"
            changeType="positive"
            icon={Users}
            description="Total de clientes registrados"
          />
          
          <MetricWidget
            title="Casos Abiertos"
            value={stats.loading ? '...' : stats.totalCases}
            change="3 nuevos esta semana"
            changeType="positive"
            icon={FolderOpen}
            description="Expedientes en curso"
          />
          
          <MetricWidget
            title="Horas Facturables"
            value={stats.loading ? '...' : `${stats.totalBillableHours}h`}
            change={`${stats.hoursThisWeek}h esta semana`}
            changeType="positive"
            icon={Clock}
            progress={stats.utilizationRate}
            description="Este mes"
          />
          
          <MetricWidget
            title="Facturas Pendientes"
            value={stats.pendingInvoices}
            change="2 vencen pronto"
            changeType="negative"
            icon={AlertTriangle}
            description="Requieren atención"
            className="border-orange-200"
          />
        </div>

        {/* Layout principal con 3 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna izquierda - Agenda */}
          <div className="lg:col-span-4 space-y-6">
            <TodayAgenda />
            <QuickActions />
          </div>
          
          {/* Columna central - Gráficos */}
          <div className="lg:col-span-5 space-y-6">
            <PerformanceChart />
            
            {/* Métricas adicionales */}
            <div className="grid grid-cols-2 gap-4">
              <MetricWidget
                title="Tasa Utilización"
                value={`${stats.utilizationRate}%`}
                change="+5% vs mes anterior"
                changeType="positive"
                icon={TrendingUp}
                progress={stats.utilizationRate}
              />
              
              <MetricWidget
                title="Ingresos Mes"
                value="€12,480"
                change="+8.2%"
                changeType="positive"
                icon={DollarSign}
                description="Facturación actual"
              />
            </div>
          </div>
          
          {/* Columna derecha - Actividad reciente */}
          <div className="lg:col-span-3">
            <RecentActivity />
          </div>
        </div>

        {/* Error state */}
        {stats.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">
              <p className="font-medium">Error al cargar estadísticas</p>
              <p className="text-sm">{stats.error}</p>
              <button 
                onClick={fetchStats}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
