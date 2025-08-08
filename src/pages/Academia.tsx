
import React, { useState, useEffect } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { AcademiaSearch } from '@/components/academia/AcademiaSearch'
import { AcademiaCategories } from '@/components/academia/AcademiaCategories'
import { AcademiaContent } from '@/components/academia/AcademiaContent'
import { AcademiaProgress } from '@/components/academia/AcademiaProgress'
import { AcademiaMobileSidebar } from '@/components/academia/AcademiaMobileSidebar'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { useAcademySetup } from '@/hooks/useAcademySetup'

export default function Academia() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const { setupAcademyData } = useAcademySetup()

  // Inicializar datos de la academia al cargar la página y SEO
  useEffect(() => {
    setupAcademyData()

    // SEO básico
    const title = 'Academia CRM: cursos y guías para formación'
    document.title = title

    const ensureTag = (selector: string, create: () => HTMLElement) => {
      let el = document.head.querySelector(selector) as HTMLElement | null
      if (!el) {
        el = create()
        document.head.appendChild(el)
      }
      return el
    }

    const metaDesc = ensureTag('meta[name="description"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('name', 'description')
      return m
    }) as HTMLMetaElement
    metaDesc.setAttribute('content', 'Academia del CRM: cursos, lecciones y certificaciones para dominar el sistema.')

    const canonical = ensureTag('link[rel="canonical"]', () => {
      const l = document.createElement('link')
      l.setAttribute('rel', 'canonical')
      return l
    }) as HTMLLinkElement
    const url = window.location.origin + '/academia'
    canonical.setAttribute('href', url)

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      url,
      description: 'Centro de aprendizaje del CRM con cursos y certificaciones.'
    }
    const script = ensureTag('script[type="application/ld+json"]#academia-jsonld', () => {
      const s = document.createElement('script')
      s.type = 'application/ld+json'
      s.id = 'academia-jsonld'
      return s
    }) as HTMLScriptElement
    script.textContent = JSON.stringify(jsonLd)
  }, [])

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Academia CRM"
        description="Centro de aprendizaje completo para dominar todas las funcionalidades del sistema"
        badges={[
          {
            label: 'Cursos disponibles',
            variant: 'outline',
            color: 'text-academia border-academia/20 bg-academia/10'
          },
          {
            label: 'Aprendizaje continuo',
            variant: 'outline',
            color: 'text-academia-success border-academia-success/20 bg-academia-success/10'
          },
          {
            label: 'Certificaciones',
            variant: 'outline',
            color: 'text-academia-warning border-academia-warning/20 bg-academia-warning/10'
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
