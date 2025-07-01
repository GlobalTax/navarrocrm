
import React from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { AcademiaAdminHeader } from './AcademiaAdminHeader'
import { CoursesSection } from './sections/CoursesSection'
import { CategoriesSection } from './sections/CategoriesSection'
import { CourseFormDialog } from './CourseFormDialog'
import { CategoryFormDialog } from './CategoryFormDialog'
import { LessonFormDialog } from './LessonFormDialog'
import { LessonsManagementDialog } from './LessonsManagementDialog'
import { EnhancedAICourseGeneratorDialog } from './EnhancedAICourseGeneratorDialog'
import { LoadingState } from '../LoadingState'
import { ErrorState } from '../ErrorState'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAcademyAdminQueries } from '@/hooks/academy/useAcademyAdminQueries'
import { useAcademyMutations } from '@/hooks/academy/useAcademyMutations'
import { useEnhancedAcademiaAdminState } from '@/hooks/academy/useEnhancedAcademiaAdminState'
import { toast } from 'sonner'

export default function AcademiaAdminPage() {
  const { useAllCategories, useAllCourses, useAdminStats } = useAcademyAdminQueries()
  const { deleteCourse, deleteCategory } = useAcademyMutations()
  const { state, actions } = useEnhancedAcademiaAdminState()

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
      try {
        actions.setDeletingCourse(true)
        await deleteCourse.mutateAsync(courseId)
        toast.success('Curso eliminado exitosamente')
      } catch (error) {
        console.error('Error deleting course:', error)
        actions.setError('Error al eliminar el curso')
      } finally {
        actions.setDeletingCourse(false)
      }
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        actions.setDeletingCategory(true)
        await deleteCategory.mutateAsync(categoryId)
        toast.success('Categoría eliminada exitosamente')
      } catch (error) {
        console.error('Error deleting category:', error)
        actions.setError('Error al eliminar la categoría')
      } finally {
        actions.setDeletingCategory(false)
      }
    }
  }

  const handleViewLessons = (courseId: string, courseTitle: string) => {
    actions.openLessonsManagementDialog(courseId, courseTitle)
  }

  const handleAddLesson = (courseId: string) => {
    actions.openLessonDialog(courseId)
  }

  const handleEditLesson = (lesson: any) => {
    actions.openLessonDialog(lesson.course_id, lesson)
  }

  const handleCourseGenerated = (courseId: string) => {
    console.log('Course generated:', courseId)
    actions.closeAIDialog()
    toast.success('Curso generado exitosamente con IA')
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
            onViewLessons={handleViewLessons}
            onAddLesson={handleAddLesson}
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

      {/* All Dialogs */}
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
        lesson={state.selectedLesson}
      />

      <LessonsManagementDialog
        open={state.lessonsManagementDialogOpen}
        onClose={actions.closeLessonsManagementDialog}
        courseId={state.selectedCourseForManagement?.id || ''}
        courseTitle={state.selectedCourseForManagement?.title || ''}
        onEditLesson={handleEditLesson}
        onCreateLesson={() => handleAddLesson(state.selectedCourseForManagement?.id || '')}
      />

      <EnhancedAICourseGeneratorDialog
        open={state.aiCourseDialogOpen}
        onClose={actions.closeAIDialog}
        categories={categories || []}
        onCourseGenerated={handleCourseGenerated}
        isGenerating={state.isGeneratingWithAI}
        onGeneratingChange={actions.setGeneratingWithAI}
      />
    </StandardPageContainer>
  )
}
