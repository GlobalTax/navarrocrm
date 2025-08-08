
import React from 'react'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'

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
  const statsContent = (
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
  )

  return (
    <StandardPageHeader
      title="🎓 Academia CRM Profesional"
      description="Domina todas las funcionalidades del CRM con cursos escritos por expertos, ejercicios prácticos y certificaciones oficiales."
      variant="gradient"
      customContent={statsContent}
    />
  )
}
