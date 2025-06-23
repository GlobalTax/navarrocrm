
import React from 'react'
import { AcademiaOverview } from './content/AcademiaOverview'
import { AcademiaTopicContent } from './content/AcademiaTopicContent'

interface AcademiaContentProps {
  searchTerm: string
  selectedCategory: string | null
  selectedTopic: string | null
}

export function AcademiaContent({ 
  searchTerm, 
  selectedCategory, 
  selectedTopic 
}: AcademiaContentProps) {
  if (selectedTopic) {
    return <AcademiaTopicContent topic={selectedTopic} />
  }

  if (searchTerm) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Resultados para "{searchTerm}"</h2>
        {/* Implementar resultados de búsqueda */}
        <p className="text-gray-600">Mostrando resultados relacionados con tu búsqueda...</p>
      </div>
    )
  }

  return <AcademiaOverview selectedCategory={selectedCategory} />
}
