
import React, { useState } from 'react'
import { useAcademyQueries } from '@/hooks/academy/useAcademyQueries'
import { AcademiaHeader } from './AcademiaHeader'
import { CategoriesFilter } from './CategoriesFilter'
import { CourseCard } from './CourseCard'
import { CourseDetail } from './CourseDetail'
import { QuickActions } from './QuickActions'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'

export function RealAcademiaContent({ searchTerm, externalCategory }: { searchTerm?: string; externalCategory?: string | null } = {}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  
  const { usePublishedCategories, usePublishedCourses, useUserProgress } = useAcademyQueries()
  
  const activeCategory = externalCategory ?? selectedCategory
  
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = usePublishedCategories()
  const { data: courses, isLoading: coursesLoading, error: coursesError } = usePublishedCourses(activeCategory || undefined)
  const { data: userProgress, isLoading: progressLoading } = useUserProgress()

  // Debug removed - use React DevTools for component debugging

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

  // Filtrar cursos por término de búsqueda
  const filteredCourses = courses?.filter(c => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      c.title?.toLowerCase().includes(term) ||
      c.description?.toLowerCase().includes(term) ||
      c.academy_categories?.name?.toLowerCase().includes(term)
    )
  }) || []

  // Calcular estadísticas
  const coursesCount = filteredCourses.length
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
      {filteredCourses && filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
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

      {/* Quick Actions */}
      <QuickActions />
    </div>
  )
}
