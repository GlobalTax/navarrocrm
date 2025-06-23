
import React, { useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { AcademiaHeader } from '@/components/academia/AcademiaHeader'
import { AcademiaSearch } from '@/components/academia/AcademiaSearch'
import { AcademiaCategories } from '@/components/academia/AcademiaCategories'
import { AcademiaContent } from '@/components/academia/AcademiaContent'
import { AcademiaProgress } from '@/components/academia/AcademiaProgress'
import { AcademiaMobileSidebar } from '@/components/academia/AcademiaMobileSidebar'

export default function Academia() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const isMobile = useIsMobile()

  return (
    <div className="space-y-6">
      <AcademiaHeader />
      
      {isMobile ? (
        // Mobile Layout
        <div className="space-y-4">
          <AcademiaMobileSidebar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            onTopicSelect={setSelectedTopic}
          />
          <AcademiaContent 
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            selectedTopic={selectedTopic}
          />
        </div>
      ) : (
        // Desktop Layout
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <AcademiaSearch 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm} 
            />
            <AcademiaProgress />
            <AcademiaCategories 
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              onTopicSelect={setSelectedTopic}
            />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <AcademiaContent 
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              selectedTopic={selectedTopic}
            />
          </div>
        </div>
      )}
    </div>
  )
}
