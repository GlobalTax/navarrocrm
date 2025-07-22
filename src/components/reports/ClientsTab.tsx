
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, AlertTriangle } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { Badge } from '@/components/ui/badge'

export const ClientsTab = () => {
  const { clients } = useClients()

  const activeClients = clients.filter(c => (c.relationship_type as string) === 'cliente').length
  const prospects = clients.filter(c => (c.relationship_type as string) === 'prospecto').length
  const totalClients = clients.length

  // Análisis simple de clientes por sector
  const sectorAnalysis = clients.reduce((acc, client) => {
    const sector = client.business_sector || 'Sin definir'
    acc[sector] = (acc[sector] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topSectors = Object.entries(sectorAnalysis)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  // Clientes recientes
  const recentClients = clients
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900">{totalClients}</div>
            <div className="text-sm text-slate-600">Total Clientes</div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900">{activeClients}</div>
            <div className="text-sm text-slate-600">Clientes Activos</div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900">{prospects}</div>
            <div className="text-sm text-slate-600">Prospectos</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-slate-900">
              Clientes por Sector
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSectors.map(([sector, count]) => (
                <div key={sector} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-900">{sector}</span>
                  <Badge variant="secondary">{count} clientes</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-slate-900">
              Clientes Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentClients.map((client) => (
                <div key={client.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900">{client.name}</div>
                    <div className="text-sm text-slate-600">{client.business_sector || 'Sin sector'}</div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={client.status === 'activo' ? 'default' : 'secondary'}
                    >
                      {client.status}
                    </Badge>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(client.created_at).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
