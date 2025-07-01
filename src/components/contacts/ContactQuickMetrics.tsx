
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, Building2, Phone, Mail } from 'lucide-react'
import { Contact } from '@/hooks/useContacts'

interface ContactQuickMetricsProps {
  contacts: Contact[]
}

export const ContactQuickMetrics = ({ contacts }: ContactQuickMetricsProps) => {
  // Calcular métricas
  const totalContacts = contacts.length
  const activeClients = contacts.filter(c => c.relationship_type === 'cliente').length
  const prospects = contacts.filter(c => c.relationship_type === 'prospecto').length
  const companies = contacts.filter(c => c.client_type === 'empresa').length
  const individuals = contacts.filter(c => c.client_type !== 'empresa').length
  
  // Contactos con email y teléfono
  const withEmail = contacts.filter(c => c.email).length
  const withPhone = contacts.filter(c => c.phone).length
  
  // Calcular tasas de contacto
  const emailRate = totalContacts > 0 ? Math.round((withEmail / totalContacts) * 100) : 0
  const phoneRate = totalContacts > 0 ? Math.round((withPhone / totalContacts) * 100) : 0

  const metrics = [
    {
      label: 'Total Contactos',
      value: totalContacts,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Clientes Activos',
      value: activeClients,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Prospectos',
      value: prospects,
      icon: TrendingDown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      label: 'Empresas',
      value: companies,
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Con Email',
      value: `${emailRate}%`,
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Con Teléfono',
      value: `${phoneRate}%`,
      icon: Phone,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="text-xl font-bold">{metric.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
