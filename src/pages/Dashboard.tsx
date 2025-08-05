import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Briefcase, Mail, TrendingUp } from 'lucide-react'

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Vista general de tu asesoría legal
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">254</div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Casos Activos
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              +3 nuevos esta semana
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Emails Pendientes
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              -5 desde ayer
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos del Mes
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€32,450</div>
            <p className="text-xs text-muted-foreground">
              +18% vs mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-4"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Nuevo cliente registrado</p>
                  <p className="text-xs text-muted-foreground">María González - hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-4"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Caso cerrado exitosamente</p>
                  <p className="text-xs text-muted-foreground">Divorcio express - hace 4 horas</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-4"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Recordatorio de pago</p>
                  <p className="text-xs text-muted-foreground">Cliente ABC S.L. - hace 1 día</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Casos por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">En progreso</span>
                <span className="text-sm font-medium">28</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pendiente revisión</span>
                <span className="text-sm font-medium">14</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cerrados</span>
                <span className="text-sm font-medium">86</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard