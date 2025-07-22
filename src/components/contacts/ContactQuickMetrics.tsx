
import { Card, CardContent } from '@/components/ui/card'
import { Users, Building2, Phone, Mail, UserCheck, Target } from 'lucide-react'
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
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-100',
      cardBg: 'bg-white',
      borderColor: 'border-slate-200'
    },
    {
      label: 'Clientes Activos',
      value: activeClients,
      icon: UserCheck,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      cardBg: 'bg-white',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Prospectos',
      value: prospects,
      icon: Target,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      cardBg: 'bg-white',
      borderColor: 'border-amber-200'
    },
    {
      label: 'Empresas',
      value: companies,
      icon: Building2,
      iconColor: 'text-gray-600',
      iconBg: 'bg-gray-50',
      cardBg: 'bg-white',
      borderColor: 'border-gray-200'
    },
    {
      label: 'Con Email',
      value: `${emailRate}%`,
      icon: Mail,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
      cardBg: 'bg-white',
      borderColor: 'border-green-200'
    },
    {
      label: 'Con Teléfono',
      value: `${phoneRate}%`,
      icon: Phone,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      cardBg: 'bg-white',
      borderColor: 'border-purple-200'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {metrics.map((metric, index) => (
        <Card 
          key={index} 
          className={`group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${metric.cardBg} ${metric.borderColor} border shadow-sm hover:shadow-xl`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`p-3 rounded-xl ${metric.iconBg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
