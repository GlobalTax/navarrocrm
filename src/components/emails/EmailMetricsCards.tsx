import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail, MailOpen, Send, Clock } from 'lucide-react'
import { EmailMetrics } from '@/hooks/useEmailMetrics'

interface EmailMetricsCardsProps {
  metrics?: EmailMetrics
  isLoading: boolean
}

export function EmailMetricsCards({ metrics, isLoading }: EmailMetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-0.5 border-black rounded-[10px]">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Emails',
      value: metrics?.totalEmails || 0,
      icon: Mail,
      description: 'En el sistema',
      color: 'text-blue-600'
    },
    {
      title: 'Sin Leer',
      value: metrics?.unreadCount || 0,
      icon: MailOpen,
      description: 'Requieren atención',
      color: 'text-amber-600'
    },
    {
      title: 'Enviados Hoy',
      value: metrics?.sentToday || 0,
      icon: Send,
      description: 'Actividad de hoy',
      color: 'text-green-600'
    },
    {
      title: 'Tiempo Respuesta',
      value: `${Math.round((metrics?.averageResponseTime || 0) / 60)}h`,
      icon: Clock,
      description: 'Promedio',
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="border-0.5 border-black rounded-[10px]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {card.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </div>
                <Icon className={`h-8 w-8 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}