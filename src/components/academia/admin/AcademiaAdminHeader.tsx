
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, BookOpen, Users, Trophy } from 'lucide-react'

interface AcademiaAdminHeaderProps {
  coursesCount: number
  categoriesCount: number
  onNewCourse: () => void
  onNewCategory: () => void
}

export function AcademiaAdminHeader({ 
  coursesCount, 
  categoriesCount, 
  onNewCourse, 
  onNewCategory 
}: AcademiaAdminHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administrar Academia</h1>
          <p className="text-gray-600 mt-2">
            Gestiona cursos, lecciones y categorías de tu academia
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onNewCategory} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
          <Button onClick={onNewCourse}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Curso
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesCount}</div>
            <p className="text-xs text-muted-foreground">
              Cursos publicados y borradores
            </p>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoriesCount}</div>
            <p className="text-xs text-muted-foreground">
              Categorías activas
            </p>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Desarrollo</CardTitle>
            <Trophy className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Sistema de Certificaciones</div>
            <p className="text-xs text-muted-foreground">
              Próximamente disponible
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
