
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, Building2, Phone, Mail, UserCheck } from 'lucide-react'
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
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600'
    },
    {
      label: 'Clientes Activos',
      value: activeClients,
      icon: UserCheck,
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-50',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600'
    },
    {
      label: 'Prospectos',
      value: prospects,
      icon: TrendingUp,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600'
    },
    {
      label: 'Empresas',
      value: companies,
      icon: Building2,
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50',
      iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600'
    },
    {
      label: 'Con Email',
      value: `${emailRate}%`,
      icon: Mail,
      gradient: 'from-pink-500 to-rose-600',
      bgGradient: 'from-pink-50 to-rose-50',
      iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600'
    },
    {
      label: 'Con Teléfono',
      value: `${phoneRate}%`,
      icon: Phone,
      gradient: 'from-indigo-500 to-blue-600',
      bgGradient: 'from-indigo-50 to-blue-50',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {metrics.map((metric, index) => (
        <Card 
          key={index} 
          className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-0 shadow-sm hover:shadow-xl overflow-hidden"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className={`p-6 bg-gradient-to-br ${metric.bgGradient} relative overflow-hidden`}>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`p-3 rounded-xl ${metric.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <metric.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">{metric.label}</p>
                <p className={`text-2xl font-bold bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`}>
                  {metric.value}
                </p>
              </div>
            </div>
            {/* Decorative gradient overlay */}
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
