
import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, FileText, Brain, Settings } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon?: string
}

interface CategoriesFilterProps {
  categories: Category[]
  selectedCategory: string | null
  onCategorySelect: (categoryId: string | null) => void
}

export function CategoriesFilter({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: CategoriesFilterProps) {
  // Memoizar el mapeo de iconos
  const iconMap = useMemo(() => ({
    'Users': Users,
    'FileText': FileText,
    'Brain': Brain,
    'Settings': Settings,
    'BookOpen': BookOpen
  }), [])

  // Memoizar la función getCategoryIcon
  const getCategoryIcon = useMemo(() => (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || iconMap.BookOpen
  }, [iconMap])

  // Memoizar la verificación de categorías vacías
  const hasCategories = useMemo(() => {
    return categories && categories.length > 0
  }, [categories])

  // Memoizar la lista de botones de categorías
  const categoryButtons = useMemo(() => {
    if (!hasCategories) return []
    
    return categories.map((category) => {
      const Icon = getCategoryIcon(category.icon || 'BookOpen')
      return {
        id: category.id,
        name: category.name,
        Icon,
        isSelected: selectedCategory === category.id
      }
    })
  }, [categories, selectedCategory, getCategoryIcon, hasCategories])

  if (!hasCategories) {
    return null
  }

  return (
    <Card className="border-0.5 border-black rounded-[10px]">
      <CardHeader>
        <CardTitle>Filtrar por categoría</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => onCategorySelect(null)}
          >
            Todas las categorías
          </Button>
          {categoryButtons.map((categoryButton) => {
            const { id, name, Icon, isSelected } = categoryButton
            return (
              <Button
                key={id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onCategorySelect(id)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {name}
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
