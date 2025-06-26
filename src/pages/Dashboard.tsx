
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, Clock, TrendingUp } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const Dashboard: React.FC = () => {
  const { user } = useAuth()

  const stats = [
    {
      title: 'Contactos',
      value: '0',
      description: 'Total de contactos',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Expedientes',
      value: '0',
      description: 'Casos activos',
      icon: FileText,
      color: 'text-green-600',
    },
    {
      title: 'Horas',
      value: '0',
      description: 'Horas registradas',
      icon: Clock,
      color: 'text-purple-600',
    },
    {
      title: 'Progreso',
      value: '100%',
      description: 'Sistema operativo',
      icon: TrendingUp,
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bienvenido de vuelta, {user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas acciones en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              No hay actividad reciente
            </div>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
          <CardHeader>
            <CardTitle>Próximas Tareas</CardTitle>
            <CardDescription>
              Tareas pendientes por completar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              No hay tareas pendientes
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
