
import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { AcademiaSearch } from './AcademiaSearch'
import { AcademiaProgress } from './AcademiaProgress'
import { AcademiaCategories } from './AcademiaCategories'

interface AcademiaMobileSidebarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedCategory: string | null
  onCategorySelect: (category: string) => void
  onTopicSelect: (topic: string) => void
}

export function AcademiaMobileSidebar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  onTopicSelect
}: AcademiaMobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleCategorySelect = (category: string) => {
    onCategorySelect(category)
    setIsOpen(false)
  }

  const handleTopicSelect = (topic: string) => {
    onTopicSelect(topic)
    setIsOpen(false)
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Menu className="h-4 w-4 mr-2" />
          Explorar contenido
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[80vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Navegación Academia</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4 space-y-4 overflow-y-auto">
          <AcademiaSearch 
            searchTerm={searchTerm} 
            onSearchChange={onSearchChange} 
          />
          <AcademiaProgress />
          <AcademiaCategories 
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            onTopicSelect={handleTopicSelect}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
