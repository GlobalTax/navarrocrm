
import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Eye, Plus, Globe, FileX } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { StatusBadge } from './components/StatusBadge'

interface Course {
  id: string
  title: string
  description?: string
  level: 'beginner' | 'intermediate' | 'advanced'
  total_lessons: number
  estimated_duration?: number
  is_published: boolean
  created_at: string
  updated_at?: string
  academy_categories?: {
    name: string
    color: string
  }
}

interface CoursesTableProps {
  courses: Course[]
  onEdit: (course: Course) => void
  onDelete: (courseId: string) => void
  onViewLessons: (course: Course) => void
  onAddLesson: (courseId: string) => void
  onTogglePublish: (courseId: string, isPublished: boolean) => void
}

const levelLabels = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado'
}

const levelColors = {
  beginner: 'bg-academia-beginner-soft text-academia-beginner',
  intermediate: 'bg-academia-intermediate-soft text-academia-intermediate',
  advanced: 'bg-academia-advanced-soft text-academia-advanced'
}

export function CoursesTable({ 
  courses, 
  onEdit, 
  onDelete, 
  onViewLessons, 
  onAddLesson,
  onTogglePublish
}: CoursesTableProps) {
  // Helper functions for activity indicators
  const isNewCourse = (createdAt: string) => {
    const created = new Date(createdAt)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return created > sevenDaysAgo
  }

  const isRecentlyUpdated = (createdAt: string, updatedAt?: string) => {
    if (!updatedAt) return false
    const updated = new Date(updatedAt)
    const created = new Date(createdAt)
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    return updated > threeDaysAgo && updated > created
  }

  const isPopular = (totalLessons: number) => totalLessons >= 8
  const isComplete = (totalLessons: number) => totalLessons >= 5

  return (
    <div className="border border-0.5 border-black rounded-[10px] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Curso</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Nivel</TableHead>
            <TableHead>Lecciones</TableHead>
            <TableHead>Duración</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{course.title}</span>
                    <div className="flex gap-1">
                      {isNewCourse(course.created_at) && (
                        <StatusBadge status="new" size="sm" />
                      )}
                      {isRecentlyUpdated(course.created_at, course.updated_at) && (
                        <StatusBadge status="updated" size="sm" />
                      )}
                      {isPopular(course.total_lessons) && (
                        <StatusBadge status="popular" size="sm" />
                      )}
                    </div>
                  </div>
                  {course.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {course.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {course.academy_categories && (
                  <Badge 
                    variant="outline" 
                    style={{ 
                      borderColor: course.academy_categories.color,
                      color: course.academy_categories.color 
                    }}
                  >
                    {course.academy_categories.name}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={levelColors[course.level]}
                >
                  {levelLabels[course.level]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{course.total_lessons}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onAddLesson(course.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                {course.estimated_duration ? (
                  <span>{Math.round(course.estimated_duration / 60)}h {course.estimated_duration % 60}m</span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StatusBadge 
                    status={course.is_published ? "published" : "draft"} 
                  />
                  <StatusBadge 
                    status={isComplete(course.total_lessons) ? "complete" : "incomplete"} 
                    size="sm"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onTogglePublish(course.id, !course.is_published)}
                    className="h-6 w-6 p-0"
                    title={course.is_published ? 'Despublicar curso' : 'Publicar curso'}
                  >
                    {course.is_published ? (
                      <FileX className="h-3 w-3 text-academia-warning" />
                    ) : (
                      <Globe className="h-3 w-3 text-academia-success" />
                    )}
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(course.created_at), { 
                    addSuffix: true,
                    locale: es 
                  })}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewLessons(course)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(course)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(course.id)}
                    className="h-8 w-8 p-0 text-academia-error hover:text-academia-error/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
