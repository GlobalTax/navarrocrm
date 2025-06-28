
import React from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { AcademiaAdminHeader } from './AcademiaAdminHeader'
import { CoursesSection } from './sections/CoursesSection'
import { CategoriesSection } from './sections/CategoriesSection'
import { CourseFormDialog } from './CourseFormDialog'
import { CategoryFormDialog } from './CategoryFormDialog'
import { LessonFormDialog } from './LessonFormDialog'
import { AICourseGeneratorDialog } from './AICourseGeneratorDialog'
import { LoadingState } from '../LoadingState'
import { ErrorState } from '../ErrorState'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAcademyAdminQueries } from '@/hooks/academy/useAcademyAdminQueries'
import { useAcademyMutations } from '@/hooks/academy/useAcademyMutations'
import { useAcademiaAdminState } from '@/hooks/academy/useAcademiaAdminState'

export default function AcademiaAdminPage() {
  const { useAllCategories, useAllCourses, useAdminStats } = useAcademyAdminQueries()
  const { deleteCourse, deleteCategory } = useAcademyMutations()
  const { state, actions } = useAcademiaAdminState()

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useAllCategories()
  const { data: courses, isLoading: coursesLoading, error: coursesError } = useAllCourses()
  const { data: stats, isLoading: statsLoading } = useAdminStats()

  // Loading state
  if (categoriesLoading || coursesLoading || statsLoading) {
    return <LoadingState />
  }

  // Error state
  if (categoriesError || coursesError) {
    return (
      <ErrorState 
        error={categoriesError?.message || coursesError?.message || 'Error desconocido'} 
      />
    )
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.')) {
      await deleteCourse.mutateAsync(courseId)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    await deleteCategory.mutateAsync(categoryId)
  }

  const handleCourseGenerated = (courseId: string) => {
    console.log('Course generated:', courseId)
    actions.closeAIDialog()
  }

  return (
    <StandardPageContainer>
      <AcademiaAdminHeader
        coursesCount={stats?.totalCourses || 0}
        categoriesCount={stats?.totalCategories || 0}
        onNewCourse={() => actions.openCourseDialog()}
        onNewCategory={() => actions.openCategoryDialog()}
        onGenerateCourseWithAI={actions.openAIDialog}
      />

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <CoursesSection
            courses={courses || []}
            onEdit={actions.openCourseDialog}
            onDelete={handleDeleteCourse}
            onViewLessons={(courseId) => console.log('View lessons:', courseId)}
            onAddLesson={actions.openLessonDialog}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <CategoriesSection
            categories={categories || []}
            onEdit={actions.openCategoryDialog}
            onDelete={handleDeleteCategory}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CourseFormDialog
        open={state.courseDialogOpen}
        onClose={actions.closeCourseDialog}
        course={state.selectedCourse}
        categories={categories || []}
      />

      <CategoryFormDialog
        open={state.categoryDialogOpen}
        onClose={actions.closeCategoryDialog}
        category={state.selectedCategory}
      />

      <LessonFormDialog
        open={state.lessonDialogOpen}
        onClose={actions.closeLessonDialog}
        courseId={state.selectedCourseForLesson}
      />

      <AICourseGeneratorDialog
        open={state.aiCourseDialogOpen}
        onClose={actions.closeAIDialog}
        categories={categories || []}
        onCourseGenerated={handleCourseGenerated}
      />
    </StandardPageContainer>
  )
}
