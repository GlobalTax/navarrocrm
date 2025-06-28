
import React from 'react'
import { 
  Users, FolderOpen, CheckSquare, Calendar, Clock, FileText, 
  Repeat, Zap, Brain, Settings, ChevronRight, BookOpen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { useAcademyCategories, useAcademyCourses } from '@/hooks/useAcademy'

interface AcademiaCategoriesProps {
  selectedCategory: string | null
  onCategorySelect: (category: string) => void
  onTopicSelect: (topic: string) => void
}

export function AcademiaCategories({ 
  selectedCategory, 
  onCategorySelect, 
  onTopicSelect 
}: AcademiaCategoriesProps) {
  const { data: categories, isLoading: categoriesLoading } = useAcademyCategories()
  const { data: courses, isLoading: coursesLoading } = useAcademyCourses()

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users': return Users
      case 'FileText': return FileText
      case 'Brain': return Brain
      case 'Settings': return Settings
      default: return BookOpen
    }
  }

  if (categoriesLoading || coursesLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">No hay categorías disponibles</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">Categorías</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon || 'BookOpen')
            const categoryCoursesCount = courses?.filter(c => c.category_id === category.id).length || 0
            
            return (
              <Collapsible key={category.id}>
                <CollapsibleTrigger 
                  className="flex items-center justify-between w-full p-3 hover:bg-gray-50 text-left transition-colors"
                  onClick={() => onCategorySelect(category.id)}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <Icon className={`h-4 w-4 mr-2 flex-shrink-0`} style={{ color: category.color }} />
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
                    ?.filter(course => course.category_id === category.id)
                    .map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-2 pl-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => onTopicSelect(course.id)}
                      >
                        <span className="text-sm text-gray-700 flex-1 min-w-0 truncate pr-2">
                          {course.title}
                        </span>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {course.total_lessons}
                        </Badge>
                      </div>
                    ))}
                  {categoryCoursesCount === 0 && (
                    <div className="p-2 pl-4 text-xs text-gray-500">
                      No hay cursos disponibles
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
