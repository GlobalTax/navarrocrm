import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useContactsList } from '../hooks'
import { Contact } from '@/hooks/useContacts'
import { ContactFilters } from './ContactFilters'
import { VirtualizedContactTable } from './VirtualizedContactTable'
import { ContactEmptyState } from './ContactEmptyState'

interface ContactsListProps {
  onCreateContact: () => void
  onEditContact: (contact: Contact) => void
}

export const ContactsList = ({ onCreateContact, onEditContact }: ContactsListProps) => {
  const {
    contacts,
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
    relationshipFilter,
    setRelationshipFilter
  } = useContactsList()

  const handleRefresh = () => {
    refetch()
  }

  const hasFilters = Boolean(searchTerm || statusFilter !== 'all' || relationshipFilter !== 'all')

  return (
    <Card>
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Contactos</CardTitle>
          <div className="flex items-center gap-2">
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            )}
          </div>
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

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Cargando contactos...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-600 mb-2">Error al cargar contactos</div>
              <Button variant="outline" onClick={handleRefresh}>
                Reintentar
              </Button>
            </div>
          </div>
        ) : contacts.length === 0 ? (
          <ContactEmptyState 
            hasFilters={hasFilters}
            onCreateContact={onCreateContact}
          />
        ) : (
          <VirtualizedContactTable
            contacts={contacts}
            onEditContact={onEditContact}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        )}
      </CardContent>
    </Card>
  )
}