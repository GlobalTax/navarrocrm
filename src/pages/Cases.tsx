
import { useCases } from '@/hooks/useCases'
import { PremiumPageHeader } from '@/components/layout/PremiumPageHeader'
import { PremiumFilters } from '@/components/layout/PremiumFilters'
import { CasesPageContainer } from '@/components/cases/CasesPageContainer'

export default function Cases() {
  const { 
    cases, 
    isLoading, 
    selectedCases, 
    handleSelectCase, 
    handleSelectAll,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    practiceAreaFilter,
    setPracticeAreaFilter
  } = useCases()

  const statusOptions = [
    { label: 'Todos los estados', value: 'all' },
    { label: 'Abiertos', value: 'open' },
    { label: 'Cerrados', value: 'closed' },
    { label: 'En espera', value: 'on_hold' }
  ]

  const practiceAreaOptions = [
    { label: 'Todas las áreas', value: 'all' },
    { label: 'Civil', value: 'civil' },
    { label: 'Penal', value: 'penal' },
    { label: 'Mercantil', value: 'mercantil' },
    { label: 'Laboral', value: 'laboral' }
  ]

  const hasActiveFilters = Boolean(
    searchTerm || 
    statusFilter !== 'all' || 
    practiceAreaFilter !== 'all'
  )

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPracticeAreaFilter('all')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="premium-animate-in">
          <div className="text-premium-secondary">Cargando expedientes...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-premium-gray-5 p-6">
      <div className="max-w-7xl mx-auto premium-spacing-xl">
        <PremiumPageHeader
          title="Expedientes"
          description="Gestiona todos los casos y expedientes del despacho"
          badges={[
            { label: `${cases.length} expedientes`, variant: 'primary' },
            { label: `${selectedCases.length} seleccionados`, variant: 'secondary' }
          ]}
          primaryAction={{
            label: 'Nuevo Expediente',
            onClick: () => console.log('Crear expediente')
          }}
        />

        <div className="premium-spacing-lg">
          <PremiumFilters
            searchPlaceholder="Buscar expedientes..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filters={[
              {
                placeholder: 'Estado',
                value: statusFilter,
                onChange: setStatusFilter,
                options: statusOptions
              },
              {
                placeholder: 'Área de Práctica',
                value: practiceAreaFilter,
                onChange: setPracticeAreaFilter,
                options: practiceAreaOptions
              }
            ]}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />

          <div className="mt-6">
            <CasesPageContainer />
          </div>
        </div>
      </div>
    </div>
  )
}
