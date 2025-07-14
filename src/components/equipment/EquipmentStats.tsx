import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Users, Wrench, AlertTriangle } from 'lucide-react'

export function EquipmentStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['equipment-stats'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('No authenticated user')

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.user.id)
        .single()

      if (!userData?.org_id) throw new Error('User not in organization')

      const { data, error } = await supabase.rpc('get_office_stats', {
        org_uuid: userData.org_id
      })

      if (error) throw error
      return data
    }
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statsData = stats as any

  const cards = [
    {
      title: "Total Equipos",
      value: statsData?.totalEquipment || 0,
      icon: Package,
      description: "Equipos registrados"
    },
    {
      title: "Disponibles",
      value: statsData?.availableEquipment || 0,
      icon: Users,
      description: "Equipos disponibles"
    },
    {
      title: "Asignados",
      value: (statsData?.totalEquipment || 0) - (statsData?.availableEquipment || 0),
      icon: Users,
      description: "Equipos en uso"
    },
    {
      title: "Mantenimiento",
      value: statsData?.pendingMaintenance || 0,
      icon: AlertTriangle,
      description: "Pendientes"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}