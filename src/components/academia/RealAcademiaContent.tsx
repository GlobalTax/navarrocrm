
import React, { useState, useMemo } from 'react'
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

  console.log('Academia Data:', { categories, courses, userProgress })

  // OPTIMIZACIÓN: Memoizar datos del curso seleccionado
  const selectedCourseData = useMemo(() => {
    if (!selectedCourse || !courses || !userProgress) return null
    
    const course = courses.find(c => c.id === selectedCourse)
    if (!course) return null

    const courseProgress = userProgress.find(p => p.course_id === selectedCourse)
    return { course, courseProgress }
  }, [selectedCourse, courses, userProgress])

  // OPTIMIZACIÓN: Memoizar estadísticas del header
  const headerStats = useMemo(() => {
    const coursesCount = courses?.length || 0
    const categoriesCount = categories?.length || 0
    const completedCount = userProgress?.filter(p => p.status === 'completed').length || 0
    const progressPercentage = userProgress?.length > 0 
      ? Math.round((completedCount / userProgress.length) * 100)
      : 0

    return {
      coursesCount,
      categoriesCount,
      completedCount,
      progressPercentage
    }
  }, [courses, categories, userProgress])


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
  if (selectedCourse && selectedCourseData) {
    return (
      <CourseDetail
        course={selectedCourseData.course}
        userProgress={selectedCourseData.courseProgress}
        onBack={() => setSelectedCourse(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <AcademiaHeader
        coursesCount={headerStats.coursesCount}
        categoriesCount={headerStats.categoriesCount}
        completedCount={headerStats.completedCount}
        progressPercentage={headerStats.progressPercentage}
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
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              userProgress={userProgress?.find(p => p.course_id === course.id)}
              onCourseSelect={setSelectedCourse}
            />
          ))}
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
