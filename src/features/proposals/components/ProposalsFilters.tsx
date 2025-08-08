import { StandardFilters } from '@/components/layout/StandardFilters'

interface ProposalsFiltersSectionProps {
  filters: any
  setFilters: (filters: any) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export const ProposalsFiltersSection = ({
  filters,
  setFilters,
  hasActiveFilters,
  onClearFilters
}: ProposalsFiltersSectionProps) => {
  const statusOptions = [
    { label: 'Todos los estados', value: 'all' },
    { label: 'Borrador', value: 'draft' },
    { label: 'Enviada', value: 'sent' },
    { label: 'Negociando', value: 'negotiating' },
    { label: 'Ganada', value: 'won' },
    { label: 'Perdida', value: 'lost' },
    { label: 'Expirada', value: 'expired' }
  ]

  const typeOptions = [
    { label: 'Todos los tipos', value: 'all' },
    { label: 'Recurrentes', value: 'recurring' },
    { label: 'Puntuales', value: 'oneTime' }
  ]

  return (
    <StandardFilters
      searchPlaceholder="Buscar propuestas..."
      searchValue={filters.search}
      onSearchChange={(value) => setFilters({ ...filters, search: value })}
      filters={[
        {
          placeholder: 'Estado',
          value: filters.status,
          onChange: (value) => setFilters({ ...filters, status: value }),
          options: statusOptions
        },
        {
          placeholder: 'Tipo',
          value: filters.type,
          onChange: (value) => setFilters({ ...filters, type: value }),
          options: typeOptions
        }
      ]}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={onClearFilters}
    />
  )
}