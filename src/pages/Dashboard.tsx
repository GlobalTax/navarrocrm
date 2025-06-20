
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalTimeEntries: 0,
    totalBillableHours: 0,
    totalClients: 0,
    totalCases: 0,
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
      setStats({
        totalTimeEntries,
        totalBillableHours: Math.round(totalBillableHours * 100) / 100,
        totalClients: clients?.length || 0,
        totalCases: cases?.length || 0,
        loading: false,
        error: null
      })
    } catch (error: any) {
      console.error('❌ Error obteniendo estadísticas:', error)
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al cargar las estadísticas'
      }))
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error cerrando sesión:', error)
    }
  }

  // Mostrar loading si el usuario aún no está cargado
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard CRM Legal</h1>
            <p className="text-gray-600">
              Bienvenido, {user?.email} ({user?.role})
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Cerrar Sesión
          </Button>
        </div>

        {stats.error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-red-800">
                <p className="font-medium">Error al cargar estadísticas</p>
                <p className="text-sm">{stats.error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchStats}
                  className="mt-2"
                >
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.loading ? '...' : stats.totalClients}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de clientes registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Casos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.loading ? '...' : stats.totalCases}
              </div>
              <p className="text-xs text-muted-foreground">
                Expedientes activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horas Facturables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.loading ? '...' : `${stats.totalBillableHours}h`}
              </div>
              <p className="text-xs text-muted-foreground">
                Este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registros de Tiempo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.loading ? '...' : stats.totalTimeEntries}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de entradas
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Bienvenido al CRM Legal</CardTitle>
              <CardDescription>
                Sistema de gestión para asesorías multidisciplinares
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Este sistema te ayudará a gestionar clientes, casos, tiempo de trabajo y facturación 
                de manera eficiente. Las estadísticas se actualizarán automáticamente conforme uses el sistema.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Organización:</strong> {user?.org_id}</p>
                <p><strong>Rol:</strong> {user?.role}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximas Funcionalidades</CardTitle>
              <CardDescription>
                Características que se implementarán próximamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• Gestión completa de clientes</li>
                <li>• Creación y seguimiento de casos</li>
                <li>• Timer integrado para registro de tiempo</li>
                <li>• Sistema de facturación</li>
                <li>• Portal cliente</li>
                <li>• Alertas de plazos legales</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
