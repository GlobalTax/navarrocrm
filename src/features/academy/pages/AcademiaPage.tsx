import React from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Button } from '@/components/ui/button'
import { GraduationCap, BookOpen, PlayCircle } from 'lucide-react'

export default function AcademiaPage() {
  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Academia"
        description="Centro de formación y recursos educativos"
        primaryAction={{
          label: 'Explorar Cursos',
          onClick: () => {
            // TODO: Navegar a catálogo de cursos
          }
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[10px] border-0.5 border-black p-6 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold">Mis Cursos</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Accede a tus cursos matriculados y continúa tu formación
          </p>
          <Button className="w-full" variant="outline">
            Ver Mis Cursos
          </Button>
        </div>

        <div className="bg-white rounded-[10px] border-0.5 border-black p-6 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold">Catálogo</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Explora todos los cursos disponibles y encuentra nuevas oportunidades de aprendizaje
          </p>
          <Button className="w-full" variant="outline">
            Explorar Catálogo
          </Button>
        </div>

        <div className="bg-white rounded-[10px] border-0.5 border-black p-6 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <PlayCircle className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold">Mi Progreso</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Revisa tu progreso de aprendizaje y certificaciones obtenidas
          </p>
          <Button className="w-full" variant="outline">
            Ver Progreso
          </Button>
        </div>
      </div>

      {/* Cursos Destacados */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Cursos Destacados</h2>
        <div className="bg-white rounded-[10px] border-0.5 border-black p-6 shadow-sm">
          <p className="text-gray-600 text-center">
            Los cursos destacados aparecerán aquí próximamente...
          </p>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
        <div className="bg-white rounded-[10px] border-0.5 border-black p-6 shadow-sm">
          <p className="text-gray-600 text-center">
            Tu actividad de aprendizaje reciente aparecerá aquí...
          </p>
        </div>
      </div>
    </StandardPageContainer>
  )
}