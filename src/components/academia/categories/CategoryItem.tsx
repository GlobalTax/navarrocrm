
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronRight, BookOpen } from 'lucide-react'
import { CourseItem } from './CourseItem'

interface Category {
  id: string
  name: string
  icon?: string
  color?: string
}

interface Course {
  id: string
  title: string
  category_id: string
  total_lessons: number
}

interface CategoryItemProps {
  category: Category
  courses: Course[]
  onCategorySelect: (categoryId: string) => void
  onTopicSelect: (topicId: string) => void
  getCategoryIcon: (iconName: string) => any
}

export function CategoryItem({ 
  category, 
  courses, 
  onCategorySelect, 
  onTopicSelect, 
  getCategoryIcon 
}: CategoryItemProps) {
  const Icon = getCategoryIcon(category.icon || 'BookOpen')
  const categoryCoursesCount = courses.filter(c => c.category_id === category.id).length

  return (
    <Collapsible key={category.id}>
      <CollapsibleTrigger 
        className="flex items-center justify-between w-full p-3 hover:bg-gray-50 text-left transition-colors"
        onClick={() => onCategorySelect(category.id)}
      >
        <div className="flex items-center min-w-0 flex-1">
          <Icon className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: category.color }} />
          <span className="text-sm font-medium truncate">{category.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            {categoryCoursesCount}
          </Badge>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="border-l-2 border-gray-100 ml-6">
        {courses
          .filter(course => course.category_id === category.id)
          .map((course) => (
            <CourseItem
              key={course.id}
              course={course}
              onTopicSelect={onTopicSelect}
            />
          ))}
        {categoryCoursesCount === 0 && (
          <div className="p-2 pl-4 text-xs text-gray-500">
            No hay cursos disponibles
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
