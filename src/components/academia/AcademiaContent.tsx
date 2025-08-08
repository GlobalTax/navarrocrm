
import React from 'react'
import { RealAcademiaContent } from './RealAcademiaContent'
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
  // Si hay un tema seleccionado, mostrar el contenido específico del tema
  if (selectedTopic) {
    return <AcademiaTopicContent topic={selectedTopic} />
  }

  // Si hay búsqueda, mostrar resultados de búsqueda
  if (searchTerm) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Resultados para "{searchTerm}"</h2>
        <p className="text-muted-foreground">Mostrando resultados relacionados con tu búsqueda...</p>
        {/* Aquí se podría implementar la lógica de búsqueda real */}
        <RealAcademiaContent searchTerm={searchTerm} externalCategory={selectedCategory} />
      </div>
    )
  }

  // Por defecto, mostrar el contenido principal de la academia
  return <RealAcademiaContent externalCategory={selectedCategory} />
}
