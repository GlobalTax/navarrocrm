import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar } from 'lucide-react'

export const Cases = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Casos</h2>
          <p className="text-muted-foreground">
            Gestiona todos tus expedientes legales
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Caso
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">casos activos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">necesitan atención</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cerrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86</div>
            <p className="text-xs text-muted-foreground">este mes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Casos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { 
                id: 'CAS-2025-001', 
                title: 'Divorcio Express', 
                client: 'Ana Martínez', 
                status: 'En progreso',
                date: '15/01/2025'
              },
              { 
                id: 'CAS-2025-002', 
                title: 'Constitución SL', 
                client: 'Carlos Ruiz', 
                status: 'Pendiente',
                date: '14/01/2025'
              },
              { 
                id: 'CAS-2025-003', 
                title: 'Reclamación Laboral', 
                client: 'María González', 
                status: 'En progreso',
                date: '13/01/2025'
              },
            ].map((case_item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium">{case_item.title}</h3>
                      <p className="text-sm text-muted-foreground">{case_item.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{case_item.client}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {case_item.date}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    case_item.status === 'En progreso' 
                      ? 'bg-blue-100 text-blue-800'
                      : case_item.status === 'Pendiente'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {case_item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}