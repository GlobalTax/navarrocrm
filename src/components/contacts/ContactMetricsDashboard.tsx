
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, Building, Calendar } from 'lucide-react'
import { Contact } from '@/hooks/useContacts'

interface ContactMetricsDashboardProps {
  contacts: Contact[]
}

export function ContactMetricsDashboard({ contacts }: ContactMetricsDashboardProps) {
  const totalContacts = contacts.length
  const activeContacts = contacts.filter(c => c.status === 'active').length
  const companies = contacts.filter(c => c.client_type === 'company').length
  const individuals = contacts.filter(c => c.client_type === 'individual').length
  
  const relationshipTypes = contacts.reduce((acc, contact) => {
    const type = contact.relationship_type || 'Sin especificar'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const businessSectors = contacts.reduce((acc, contact) => {
    const sector = contact.business_sector || 'Sin especificar'
    acc[sector] = (acc[sector] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contactos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContacts}</div>
            <p className="text-xs text-muted-foreground">
              {totalContacts > 0 ? Math.round((activeContacts / totalContacts) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies}</div>
            <p className="text-xs text-muted-foreground">
              {individuals} particulares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.filter(c => {
                const created = new Date(c.created_at)
                const now = new Date()
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Nuevos contactos</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por tipo de relación */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Tipo de Relación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(relationshipTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm">{type}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{count}</Badge>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(count / totalContacts) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribución por sector empresarial */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Sector Empresarial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(businessSectors).slice(0, 10).map(([sector, count]) => (
              <div key={sector} className="flex items-center justify-between">
                <span className="text-sm">{sector}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{count}</Badge>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(count / totalContacts) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
