
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, TrendingUp, Calendar, Euro, Building, User, Mail, Phone } from 'lucide-react'
import { Client } from '@/hooks/useClients'

interface ClientMetricsDashboardProps {
  clients: Client[]
}

export const ClientMetricsDashboard = ({ clients }: ClientMetricsDashboardProps) => {
  // OPTIMIZACIÓN: Memoizar estadísticas costosas
  const stats = useMemo(() => {
    const clientsWithRate = clients.filter(c => c.hourly_rate)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    return {
      total: clients.length,
      active: clients.filter(c => c.status === 'activo').length,
      prospects: clients.filter(c => c.status === 'prospecto').length,
      companies: clients.filter(c => c.client_type === 'empresa').length,
      individuals: clients.filter(c => c.client_type === 'particular').length,
      withEmail: clients.filter(c => c.email).length,
      withPhone: clients.filter(c => c.phone).length,
      avgHourlyRate: clientsWithRate.length > 0 
        ? clientsWithRate.reduce((sum, c) => sum + (c.hourly_rate || 0), 0) / clientsWithRate.length
        : 0,
      recentClients: clients.filter(c => {
        const createdDate = new Date(c.created_at)
        return createdDate >= thirtyDaysAgo
      }).length
    }
  }, [clients])

  // OPTIMIZACIÓN: Memoizar agrupación por sectores
  const sectors = useMemo(() => 
    clients.reduce((acc, client) => {
      if (client.business_sector) {
        acc[client.business_sector] = (acc[client.business_sector] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>),
    [clients]
  )

  // OPTIMIZACIÓN: Memoizar top sectores
  const topSectors = useMemo(() => 
    Object.entries(sectors)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5),
    [sectors]
  )

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-green-100 text-green-800 text-xs">
                +{stats.recentClients} últimos 30d
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Clientes Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-500 mt-1">
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% del total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Prospectos</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.prospects}</div>
            <div className="text-sm text-gray-500 mt-1">
              Oportunidades activas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tarifa Promedio</CardTitle>
            <Euro className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.avgHourlyRate > 0 ? `${Math.round(stats.avgHourlyRate)}€/h` : 'N/A'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Por hora facturada
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por tipo y sectores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribución por Tipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-blue-600" />
                <span>Empresas</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">{stats.companies}</Badge>
                <span className="text-sm text-gray-500">
                  {stats.total > 0 ? Math.round((stats.companies / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                <span>Particulares</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">{stats.individuals}</Badge>
                <span className="text-sm text-gray-500">
                  {stats.total > 0 ? Math.round((stats.individuals / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-600" />
                <span>Con Email</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-800">{stats.withEmail}</Badge>
                <span className="text-sm text-gray-500">
                  {stats.total > 0 ? Math.round((stats.withEmail / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-600" />
                <span>Con Teléfono</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-100 text-orange-800">{stats.withPhone}</Badge>
                <span className="text-sm text-gray-500">
                  {stats.total > 0 ? Math.round((stats.withPhone / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Sectores</CardTitle>
          </CardHeader>
          <CardContent>
            {topSectors.length > 0 ? (
              <div className="space-y-3">
                {topSectors.map(([sector, count]) => (
                  <div key={sector} className="flex items-center justify-between">
                    <span className="font-medium">{sector}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{count}</Badge>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(count / Math.max(...topSectors.map(([, c]) => c))) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Building className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No hay datos de sectores disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
