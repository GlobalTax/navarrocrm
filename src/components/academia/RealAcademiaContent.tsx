
import React, { useState, useEffect } from 'react'
import { useAcademyQueries } from '@/hooks/academy/useAcademyQueries'
import { AcademiaHeader } from './AcademiaHeader'
import { CategoriesFilter } from './CategoriesFilter'
import { CourseCard } from './CourseCard'
import { CourseDetail } from './CourseDetail'
import { QuickActions } from './QuickActions'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'
import { Button } from '@/components/ui/button'

export function RealAcademiaContent({ searchTerm, externalCategory }: { searchTerm?: string; externalCategory?: string | null } = {}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)
  const pageSize = 12
  
  const { usePublishedCategories, usePublishedCoursesPaginated, useUserProgress } = useAcademyQueries()
  
  const activeCategory = externalCategory ?? selectedCategory
  
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = usePublishedCategories()
  const { data: paginated, isLoading: coursesLoading, error: coursesError } = usePublishedCoursesPaginated(activeCategory || undefined, page, pageSize, searchTerm)
  const { data: userProgress, isLoading: progressLoading } = useUserProgress()
  // Datos paginados
  const courses = paginated?.items || []
  const total = paginated?.count || 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  // Resetear a página 1 al cambiar filtros/búsqueda
  useEffect(() => {
    setPage(1)
  }, [activeCategory, searchTerm])

  // Mostrar estado de carga
  if (categoriesLoading || coursesLoading || progressLoading) {
    return <LoadingState />
  }

  // Mostrar errores
  if (categoriesError || coursesError) {
    return (
      <ErrorState 
        error={categoriesError?.message || coursesError?.message || 'Error desconocido'} 
      />
    )
  }

  // Si hay un curso seleccionado, mostrar detalles
  if (selectedCourse && courses) {
    const course = courses.find(c => c.id === selectedCourse)
    if (!course) return null

    const courseProgress = userProgress?.find(p => p.course_id === selectedCourse)

    return (
      <CourseDetail
        course={course}
        userProgress={courseProgress}
        onBack={() => setSelectedCourse(null)}
      />
    )
  }

  // Calcular estadísticas
  const coursesCount = total
  const categoriesCount = categories?.length || 0
  const completedCount = userProgress?.filter(p => p.status === 'completed').length || 0
  const progressPercentage = userProgress?.length > 0 
    ? Math.round((completedCount / userProgress.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <AcademiaHeader
        coursesCount={coursesCount}
        categoriesCount={categoriesCount}
        completedCount={completedCount}
        progressPercentage={progressPercentage}
      />

      <CategoriesFilter
        categories={categories || []}
        selectedCategory={activeCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Courses Grid */}
      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => {
            const courseProgress = userProgress?.find(p => p.course_id === course.id)
            
            return (
              <CourseCard
                key={course.id}
                course={course}
                userProgress={courseProgress}
                onCourseSelect={setSelectedCourse}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState
          selectedCategory={activeCategory}
          onClearCategory={() => setSelectedCategory(null)}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} de {total}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions />
    </div>
  )
}
