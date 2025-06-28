
import React from 'react'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Button } from '@/components/ui/button'
import { Plus, Bot, BookOpen, FolderOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
    <div className="space-y-4">
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
      />
      
      {/* Metrics section as separate component */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border-0.5 border-black rounded-[10px] p-4 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cursos</p>
              <p className="text-2xl font-bold">{coursesCount}</p>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <Badge variant="secondary" className="text-green-600">
                +12%
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="bg-white border-0.5 border-black rounded-[10px] p-4 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categorías</p>
              <p className="text-2xl font-bold">{categoriesCount}</p>
            </div>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-green-600" />
              <Badge variant="secondary" className="text-green-600">
                +5%
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
