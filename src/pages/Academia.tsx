
import React, { useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { AcademiaSearch } from '@/components/academia/AcademiaSearch'
import { AcademiaCategories } from '@/components/academia/AcademiaCategories'
import { AcademiaContent } from '@/components/academia/AcademiaContent'
import { AcademiaProgress } from '@/components/academia/AcademiaProgress'
import { AcademiaMobileSidebar } from '@/components/academia/AcademiaMobileSidebar'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'

export default function Academia() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const isMobile = useIsMobile()

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Academia CRM"
        description="Centro de aprendizaje completo para dominar todas las funcionalidades del sistema"
        badges={[
          {
            label: 'Tutoriales: 24',
            variant: 'outline',
            color: 'text-blue-600 border-blue-200 bg-blue-50'
          },
          {
            label: 'Certificaciones: 8',
            variant: 'outline',
            color: 'text-green-600 border-green-200 bg-green-50'
          },
          {
            label: 'Completados: 89%',
            variant: 'outline',
            color: 'text-orange-600 border-orange-200 bg-orange-50'
          }
        ]}
      />
      
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
    </StandardPageContainer>
  )
}
