
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface AcademiaHeaderProps {
  coursesCount: number
  categoriesCount: number
  completedCount: number
  progressPercentage: number
}

export function AcademiaHeader({ 
  coursesCount, 
  categoriesCount, 
  completedCount, 
  progressPercentage 
}: AcademiaHeaderProps) {
  return (
    <Card className="border-0.5 border-black rounded-[10px] bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎓 Academia CRM Profesional
          </h1>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Domina todas las funcionalidades del CRM con cursos escritos por expertos, 
            ejercicios prácticos y certificaciones oficiales.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-academia">{coursesCount}</div>
              <div className="text-sm text-muted-foreground">Cursos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-academia-success">{categoriesCount}</div>
              <div className="text-sm text-muted-foreground">Categorías</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-academia-intermediate">{completedCount}</div>
              <div className="text-sm text-muted-foreground">Completados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-academia-warning">{progressPercentage}%</div>
              <div className="text-sm text-muted-foreground">Progreso</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
