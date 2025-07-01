
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useInfiniteCompanies } from '@/hooks/useInfiniteCompanies'
import { Company } from '@/hooks/useCompanies'
import { CompaniesFilters } from './CompaniesFilters'
import { VirtualizedCompaniesTable } from './VirtualizedCompaniesTable'
import { CompaniesEmptyState } from './CompaniesEmptyState'

interface CompaniesListProps {
  onCreateCompany: () => void
  onEditCompany: (company: Company) => void
}

export const CompaniesList = ({ onCreateCompany, onEditCompany }: CompaniesListProps) => {
  const {
    companies,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sectorFilter,
    setSectorFilter
  } = useInfiniteCompanies()

  const handleRefresh = () => {
    refetch()
  }

  const hasFilters = Boolean(searchTerm || statusFilter !== 'all' || sectorFilter !== 'all')

  return (
    <div className="space-y-6">
      <Card className="border-gray-100">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900 text-lg font-semibold">
                Empresas
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {companies.length} {companies.length === 1 ? 'empresa cargada' : 'empresas cargadas'}
                {hasNextPage && ' (cargando más según haces scroll)'}
              </p>
            </div>
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2 hover:bg-gray-50 border-gray-200 text-gray-700"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </Button>
            )}
          </div>
          
          <div className="pt-4">
            <CompaniesFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sectorFilter={sectorFilter}
              setSectorFilter={setSectorFilter}
            />
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {error && (
            <div className="text-center py-12">
              <div className="text-red-600 space-y-2">
                <p className="font-medium">Error al cargar empresas</p>
                <p className="text-sm text-gray-600">{error.message}</p>
                <Button variant="outline" onClick={handleRefresh} className="mt-4">
                  Reintentar
                </Button>
              </div>
            </div>
          )}
          
          {!error && isLoading && (
            <div className="flex justify-center py-12">
              <div className="text-gray-500">Cargando empresas...</div>
            </div>
          )}
          
          {!error && !isLoading && companies.length === 0 && (
            <CompaniesEmptyState
              hasFilters={hasFilters}
              onCreateCompany={onCreateCompany}
            />
          )}
          
          {!error && !isLoading && companies.length > 0 && (
            <VirtualizedCompaniesTable
              companies={companies}
              onEditCompany={onEditCompany}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
