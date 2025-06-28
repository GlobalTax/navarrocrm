
import React, { useState } from 'react'
import { useAcademyCategories, useAcademyCourses } from '@/hooks/useAcademy'
import { useAcademyCategoriesMutation, useAcademyCoursesMutation } from '@/hooks/useAcademyAdmin'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { AcademiaAdminHeader } from '@/components/academia/admin/AcademiaAdminHeader'
import { CourseFormDialog } from '@/components/academia/admin/CourseFormDialog'
import { CategoryFormDialog } from '@/components/academia/admin/CategoryFormDialog'
import { LessonFormDialog } from '@/components/academia/admin/LessonFormDialog'
import { CoursesTable } from '@/components/academia/admin/CoursesTable'
import { LoadingState } from '@/components/academia/LoadingState'
import { ErrorState } from '@/components/academia/ErrorState'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AcademiaAdmin() {
  const [courseDialogOpen, setCourseDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState<string>('')

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useAcademyCategories()
  const { data: courses, isLoading: coursesLoading, error: coursesError } = useAcademyCourses()
  const { deleteCourse } = useAcademyCoursesMutation()
  const { deleteCategory } = useAcademyCategoriesMutation()

  if (categoriesLoading || coursesLoading) {
    return <LoadingState />
  }

  if (categoriesError || coursesError) {
    return (
      <ErrorState 
        error={categoriesError?.message || coursesError?.message || 'Error desconocido'} 
      />
    )
  }

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course)
    setCourseDialogOpen(true)
  }

  const handleNewCourse = () => {
    setSelectedCourse(null)
    setCourseDialogOpen(true)
  }

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category)
    setCategoryDialogOpen(true)
  }

  const handleNewCategory = () => {
    setSelectedCategory(null)
    setCategoryDialogOpen(true)
  }

  const handleAddLesson = (courseId: string) => {
    setSelectedCourseForLesson(courseId)
    setLessonDialogOpen(true)
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.')) {
      await deleteCourse.mutateAsync(courseId)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.')) {
      await deleteCategory.mutateAsync(categoryId)
    }
  }

  return (
    <StandardPageContainer>
      <AcademiaAdminHeader
        coursesCount={courses?.length || 0}
        categoriesCount={categories?.length || 0}
        onNewCourse={handleNewCourse}
        onNewCategory={handleNewCategory}
      />

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <Card className="border-0.5 border-black rounded-[10px]">
            <CardHeader>
              <CardTitle>Gestión de Cursos</CardTitle>
            </CardHeader>
            <CardContent>
              {courses && courses.length > 0 ? (
                <CoursesTable
                  courses={courses}
                  onEdit={handleEditCourse}
                  onDelete={handleDeleteCourse}
                  onViewLessons={(courseId) => console.log('View lessons:', courseId)}
                  onAddLesson={handleAddLesson}
                />
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">No hay cursos creados</h3>
                  <p className="text-gray-600 mb-4">
                    Comienza creando tu primer curso para la academia
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card className="border-0.5 border-black rounded-[10px]">
            <CardHeader>
              <CardTitle>Gestión de Categorías</CardTitle>
            </CardHeader>
            <CardContent>
              {categories && categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <Card key={category.id} className="border-0.5 border-black rounded-[10px]">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                        <h3 className="font-semibold">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        )}
                        <div className="mt-2 text-xs text-gray-500">
                          Orden: {category.sort_order} | {category.is_active ? 'Activa' : 'Inactiva'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">No hay categorías creadas</h3>
                  <p className="text-gray-600 mb-4">
                    Crea categorías para organizar mejor tus cursos
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CourseFormDialog
        open={courseDialogOpen}
        onClose={() => {
          setCourseDialogOpen(false)
          setSelectedCourse(null)
        }}
        course={selectedCourse}
        categories={categories || []}
      />

      <CategoryFormDialog
        open={categoryDialogOpen}
        onClose={() => {
          setCategoryDialogOpen(false)
          setSelectedCategory(null)
        }}
        category={selectedCategory}
      />

      <LessonFormDialog
        open={lessonDialogOpen}
        onClose={() => {
          setLessonDialogOpen(false)
          setSelectedCourseForLesson('')
        }}
        courseId={selectedCourseForLesson}
      />
    </StandardPageContainer>
  )
}
