
import React from 'react'
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
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users': return Users
      case 'FileText': return FileText
      case 'Brain': return Brain
      case 'Settings': return Settings
      default: return BookOpen
    }
  }

  if (!categories || categories.length === 0) {
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
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon || 'BookOpen')
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => onCategorySelect(category.id)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {category.name}
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
