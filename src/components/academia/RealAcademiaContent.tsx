
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, Clock, CheckCircle, Play, FileText, 
  Users, Target, Brain, Settings, ChevronRight,
  Trophy, Star, Loader
} from 'lucide-react'
import { useAcademyCategories, useAcademyCourses, useUserProgress } from '@/hooks/useAcademy'

export function RealAcademiaContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useAcademyCategories()
  const { data: courses, isLoading: coursesLoading, error: coursesError } = useAcademyCourses(selectedCategory || undefined)
  const { data: userProgress, isLoading: progressLoading } = useUserProgress()

  console.log('Academia Data:', { categories, courses, userProgress })

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users': return Users
      case 'FileText': return FileText
      case 'Brain': return Brain
      case 'Settings': return Settings
      default: return BookOpen
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Principiante'
      case 'intermediate': return 'Intermedio'
      case 'advanced': return 'Avanzado'
      default: return 'Sin definir'
    }
  }

  // Mostrar estado de carga
  if (categoriesLoading || coursesLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando contenido de la academia...</p>
        </div>
      </div>
    )
  }

  // Mostrar errores
  if (categoriesError || coursesError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <BookOpen className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Error cargando la academia</h3>
          <p className="text-sm">
            {categoriesError?.message || coursesError?.message || 'Error desconocido'}
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Intentar de nuevo
        </Button>
      </div>
    )
  }

  // Si hay un curso seleccionado, mostrar detalles
  if (selectedCourse && courses) {
    const course = courses.find(c => c.id === selectedCourse)
    if (!course) return null

    const courseProgress = userProgress?.find(p => p.course_id === selectedCourse)
    const progressPercentage = courseProgress?.progress_percentage || 0

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedCourse(null)}
            size="sm"
          >
            ← Volver a cursos
          </Button>
          <div className="text-sm text-gray-600">
            {course.academy_categories?.name} / {course.title}
          </div>
        </div>

        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📚</div>
                <div>
                  <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.total_lessons} lecciones
                    </div>
                    {course.estimated_duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.estimated_duration} min
                      </div>
                    )}
                    <Badge className={getLevelColor(course.level)}>
                      {getLevelText(course.level)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Progreso</div>
                <div className="text-2xl font-bold mb-2">{progressPercentage}%</div>
                <Progress value={progressPercentage} className="w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-8 flex gap-4">
              <Button size="lg" className="bg-black hover:bg-gray-800">
                <Play className="h-5 w-5 mr-2" />
                Comenzar Curso
              </Button>
              <Button variant="outline" size="lg">
                <BookOpen className="h-5 w-5 mr-2" />
                Ver Lecciones
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
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
                <div className="text-2xl font-bold text-blue-600">{courses?.length || 0}</div>
                <div className="text-sm text-gray-600">Cursos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{categories?.length || 0}</div>
                <div className="text-sm text-gray-600">Categorías</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {userProgress?.filter(p => p.status === 'completed').length || 0}
                </div>
                <div className="text-sm text-gray-600">Completados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {userProgress?.length > 0 
                    ? Math.round((userProgress.filter(p => p.status === 'completed').length / userProgress.length) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">Progreso</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Filter */}
      {categories && categories.length > 0 && (
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader>
            <CardTitle>Filtrar por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Todas las categorías
              </Button>
              {categories.map((category) => {
                const Icon = getCategoryIcon(category.icon || 'BookOpen')
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courses Grid */}
      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => {
            const courseProgress = userProgress?.find(p => p.course_id === course.id)
            const progressPercentage = courseProgress?.progress_percentage || 0
            
            return (
              <Card 
                key={course.id} 
                className="border-0.5 border-black rounded-[10px] hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
                onClick={() => setSelectedCourse(course.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">📚</div>
                    <Badge className={getLevelColor(course.level)}>
                      {getLevelText(course.level)}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-3">{course.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {course.total_lessons} lecciones
                      </div>
                      {course.estimated_duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.estimated_duration} min
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progreso</span>
                        <span className="font-medium">{progressPercentage}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {course.academy_categories?.name || 'Sin categoría'}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No hay cursos disponibles</h3>
            <p className="text-gray-600 mb-4">
              {selectedCategory 
                ? 'No se encontraron cursos en esta categoría.' 
                : 'Aún no hay cursos creados en la academia.'}
            </p>
            {selectedCategory && (
              <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                Ver todos los cursos
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
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
    </div>
  )
}
