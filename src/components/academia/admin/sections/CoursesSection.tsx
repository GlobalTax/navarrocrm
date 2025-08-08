
import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CoursesTable } from '../CoursesTable'
import type { AcademyCourse } from '@/types/academy'
import { CourseFilters, type CourseFiltersState } from '../filters/CourseFilters'

interface CoursesSectionProps {
  courses: AcademyCourse[]
  onEdit: (course: AcademyCourse) => void
  onDelete: (courseId: string) => void
  onViewLessons: (course: AcademyCourse) => void
  onAddLesson: (courseId: string) => void
  onTogglePublish: (courseId: string, isPublished: boolean) => void
  isLoading?: boolean
}

export function CoursesSection({
  courses,
  onEdit,
  onDelete,
  onViewLessons,
  onAddLesson,
  onTogglePublish,
  isLoading = false
}: CoursesSectionProps) {
  const [filters, setFilters] = useState<CourseFiltersState>({
    search: '',
    status: 'all',
    categoryId: 'all',
    level: 'all'
  })

  const categoryOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; color?: string }>()
    courses?.forEach((c) => {
      if (c.category_id) {
        const name = c.academy_categories?.name || 'Sin categoría'
        const color = c.academy_categories?.color
        map.set(c.category_id, { id: c.category_id, name, color })
      }
    })
    return Array.from(map.values())
  }, [courses])

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase()
    return (courses || []).filter((c) => {
      const matchesSearch = term
        ? `${c.title} ${c.description ?? ''}`.toLowerCase().includes(term)
        : true
      const matchesStatus =
        filters.status === 'all' ||
        (filters.status === 'published' && c.is_published) ||
        (filters.status === 'draft' && !c.is_published)
      const matchesCategory = filters.categoryId === 'all' || c.category_id === filters.categoryId
      const matchesLevel = filters.level === 'all' || c.level === filters.level
      return matchesSearch && matchesStatus && matchesCategory && matchesLevel
    })
  }, [courses, filters])

  if (isLoading) {
    return (
      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle>Gestión de Cursos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0.5 border-black rounded-[10px]">
      <CardHeader>
        <CardTitle>Gestión de Cursos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CourseFilters
          filters={filters}
          categories={categoryOptions}
          onChange={setFilters}
        />

        {filtered && filtered.length > 0 ? (
          <CoursesTable
            courses={filtered}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewLessons={onViewLessons}
            onAddLesson={onAddLesson}
            onTogglePublish={onTogglePublish}
          />
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No hay cursos que coincidan</h3>
            <p className="text-gray-600 mb-4">
              Ajusta los filtros o limpia para ver todos los cursos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
