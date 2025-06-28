
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAcademyCategories, useAcademyCourses } from '@/hooks/useAcademy'
import { CategoryItem } from './categories/CategoryItem'
import { CategoriesLoadingState } from './categories/CategoriesLoadingState'
import { CategoriesEmptyState } from './categories/CategoriesEmptyState'
import { getCategoryIcon } from './categories/CategoryIconUtils'

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

  if (categoriesLoading || coursesLoading) {
    return <CategoriesLoadingState />
  }

  if (!categories || categories.length === 0) {
    return <CategoriesEmptyState />
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">Categorías</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              courses={courses || []}
              onCategorySelect={onCategorySelect}
              onTopicSelect={onTopicSelect}
              getCategoryIcon={getCategoryIcon}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
