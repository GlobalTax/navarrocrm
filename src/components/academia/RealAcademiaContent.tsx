
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

export function RealAcademiaContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  
  const { usePublishedCategories, usePublishedCourses, useUserProgress } = useAcademyQueries()
  
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = usePublishedCategories()
  const { data: courses, isLoading: coursesLoading, error: coursesError } = usePublishedCourses(selectedCategory || undefined)
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

  // Calcular estadísticas
  const coursesCount = courses?.length || 0
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

      {/* Categories Filter */}
      <CategoriesFilter
        categories={categories || []}
        selectedCategory={selectedCategory}
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
          selectedCategory={selectedCategory}
          onClearCategory={() => setSelectedCategory(null)}
        />
      )}

      {/* Quick Actions */}
      <QuickActions />
    </div>
  )
}
