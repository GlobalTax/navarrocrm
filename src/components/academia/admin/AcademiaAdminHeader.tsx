
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
              className="bg-academia text-academia-foreground hover:bg-academia/90"
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
      
      {/* Enhanced metrics section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border-0.5 border-black rounded-[10px] p-4 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cursos Totales</p>
              <p className="text-2xl font-bold">{coursesCount}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs text-academia-success">
                  Publicados: 12
                </Badge>
                <Badge variant="secondary" className="text-xs text-academia-warning">
                  Borradores: 3
                </Badge>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <BookOpen className="h-5 w-5 text-academia" />
              <Badge variant="secondary" className="text-academia-success text-xs">
                85%
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="bg-white border-0.5 border-black rounded-[10px] p-4 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categorías</p>
              <p className="text-2xl font-bold">{categoriesCount}</p>
              <div className="flex gap-1 mt-2">
                <Badge variant="secondary" className="text-xs text-academia-success">
                  Activas: {categoriesCount}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <FolderOpen className="h-5 w-5 text-academia-success" />
              <Badge variant="secondary" className="text-academia-success text-xs">
                100%
              </Badge>
            </div>
          </div>
        </div>

        <div className="bg-white border-0.5 border-black rounded-[10px] p-4 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Por Nivel</p>
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex justify-between text-sm">
                  <span className="text-academia-beginner">Principiante</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-academia-intermediate">Intermedio</span>
                  <span className="font-medium">7</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-academia-advanced">Avanzado</span>
                  <span className="font-medium">3</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-academia-beginner to-academia-advanced flex items-center justify-center">
                <span className="text-xs font-bold text-white">N</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-0.5 border-black rounded-[10px] p-4 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actividad</p>
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs bg-academia/10 text-academia">
                    2 Nuevos
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs bg-academia-intermediate/10 text-academia-intermediate">
                    3 Actualizados
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Última semana
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-academia to-academia-intermediate flex items-center justify-center">
                <span className="text-xs font-bold text-white">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
