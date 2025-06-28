
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Target, BookOpen } from 'lucide-react'

export function QuickActions() {
  return (
    <Card className="border-0.5 border-black rounded-[10px]">
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto p-4 flex-col">
            <Trophy className="h-6 w-6 mb-2" />
            <div className="font-medium">Ver Certificados</div>
            <div className="text-xs text-gray-600">Descarga tus logros</div>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex-col">
            <Target className="h-6 w-6 mb-2" />
            <div className="font-medium">Mi Progreso</div>
            <div className="text-xs text-gray-600">Seguimiento detallado</div>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex-col">
            <BookOpen className="h-6 w-6 mb-2" />
            <div className="font-medium">Biblioteca</div>
            <div className="text-xs text-gray-600">Recursos adicionales</div>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
