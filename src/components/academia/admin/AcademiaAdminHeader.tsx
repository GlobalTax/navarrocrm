
import React, { useState } from 'react'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Button } from '@/components/ui/button'
import { Plus, Bot, BookOpen, FolderOpen } from 'lucide-react'

interface AcademiaAdminHeaderProps {
  coursesCount: number
  categoriesCount: number
  onNewCourse: () => void
  onNewCategory: () => void
  onGenerateCourseWithAI: () => void
}

export function AcademiaAdminHeader({ 
  coursesCount, 
  categoriesCount, 
  onNewCourse, 
  onNewCategory,
  onGenerateCourseWithAI
}: AcademiaAdminHeaderProps) {
  return (
    <StandardPageHeader
      title="Administración de Academia"
      description="Gestiona cursos, categorías y contenido educativo"
      actions={
        <div className="flex gap-3">
          <Button
            onClick={onGenerateCourseWithAI}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Bot className="h-4 w-4 mr-2" />
            Generar con IA
          </Button>
          <Button onClick={onNewCourse} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Curso
          </Button>
          <Button onClick={onNewCategory} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>
      }
      metrics={[
        {
          label: 'Cursos',
          value: coursesCount.toString(),
          icon: BookOpen,
          trend: { value: 12, isPositive: true }
        },
        {
          label: 'Categorías',
          value: categoriesCount.toString(),
          icon: FolderOpen,
          trend: { value: 5, isPositive: true }
        }
      ]}
    />
  )
}
