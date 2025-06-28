
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useContacts, Contact } from '@/hooks/useContacts'
import { ContactFilters } from './ContactFilters'
import { ContactTable } from './ContactTable'
import { ContactEmptyState } from './ContactEmptyState'

interface ContactsListProps {
  onCreateContact: () => void
  onViewContact: (contact: Contact) => void
  onEditContact: (contact: Contact) => void
}

export const ContactsList = ({ onCreateContact, onViewContact, onEditContact }: ContactsListProps) => {
  const {
    filteredContacts,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    relationshipFilter,
    setRelationshipFilter
  } = useContacts()

  const handleRefresh = () => {
    refetch()
  }

  const hasFilters = Boolean(searchTerm || statusFilter !== 'all' || relationshipFilter !== 'all')

  return (
    <div className="space-y-6">
      <Card className="border-gray-100">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900 text-lg font-semibold">
                Contactos
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {filteredContacts.length} {filteredContacts.length === 1 ? 'contacto encontrado' : 'contactos encontrados'}
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
            <ContactFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              relationshipFilter={relationshipFilter}
              setRelationshipFilter={setRelationshipFilter}
            />
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {error && (
            <div className="text-center py-12">
              <div className="text-red-600 space-y-2">
                <p className="font-medium">Error al cargar contactos</p>
                <p className="text-sm text-gray-600">{error.message}</p>
                <Button variant="outline" onClick={handleRefresh} className="mt-4">
                  Reintentar
                </Button>
              </div>
            </div>
          )}
          
          {!error && isLoading && (
            <div className="flex justify-center py-12">
              <div className="text-gray-500">Cargando contactos...</div>
            </div>
          )}
          
          {!error && !isLoading && filteredContacts.length === 0 && (
            <ContactEmptyState
              hasFilters={hasFilters}
              onCreateContact={onCreateContact}
            />
          )}
          
          {!error && !isLoading && filteredContacts.length > 0 && (
            <ContactTable
              contacts={filteredContacts}
              onViewContact={onViewContact}
              onEditContact={onEditContact}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
