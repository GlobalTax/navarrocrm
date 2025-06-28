
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
              <div className="text-2xl font-bold text-blue-600">{coursesCount}</div>
              <div className="text-sm text-gray-600">Cursos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{categoriesCount}</div>
              <div className="text-sm text-gray-600">Categorías</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{completedCount}</div>
              <div className="text-sm text-gray-600">Completados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{progressPercentage}%</div>
              <div className="text-sm text-gray-600">Progreso</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
