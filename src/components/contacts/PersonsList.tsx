
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { usePersons, Person } from '@/hooks/usePersons'
import { PersonsFilters } from './PersonsFilters'
import { PersonsTable } from './PersonsTable'
import { PersonsEmptyState } from './PersonsEmptyState'

interface PersonsListProps {
  onCreatePerson: () => void
  onViewPerson: (person: Person) => void
  onEditPerson: (person: Person) => void
}

export const PersonsList = ({ onCreatePerson, onViewPerson, onEditPerson }: PersonsListProps) => {
  const {
    filteredPersons,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter
  } = usePersons()

  const handleRefresh = () => {
    refetch()
  }

  const hasFilters = Boolean(searchTerm || statusFilter !== 'all' || typeFilter !== 'all')

  return (
    <div className="space-y-6">
      <Card className="border-gray-100">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900 text-lg font-semibold">
                Personas Físicas
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {filteredPersons.length} {filteredPersons.length === 1 ? 'persona encontrada' : 'personas encontradas'}
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
            <PersonsFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
            />
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {error && (
            <div className="text-center py-12">
              <div className="text-red-600 space-y-2">
                <p className="font-medium">Error al cargar personas</p>
                <p className="text-sm text-gray-600">{error.message}</p>
                <Button variant="outline" onClick={handleRefresh} className="mt-4">
                  Reintentar
                </Button>
              </div>
            </div>
          )}
          
          {!error && isLoading && (
            <div className="flex justify-center py-12">
              <div className="text-gray-500">Cargando personas...</div>
            </div>
          )}
          
          {!error && !isLoading && filteredPersons.length === 0 && (
            <PersonsEmptyState
              hasFilters={hasFilters}
              onCreatePerson={onCreatePerson}
            />
          )}
          
          {!error && !isLoading && filteredPersons.length > 0 && (
            <PersonsTable
              persons={filteredPersons}
              onViewPerson={onViewPerson}
              onEditPerson={onEditPerson}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
