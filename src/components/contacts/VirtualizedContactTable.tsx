
import { forwardRef, memo, useCallback, useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import { Contact } from '@/hooks/useContacts'
import { ContactRow } from './ContactRow'
import { ContactTableHeader } from './ContactTableHeader'

interface VirtualizedContactTableProps {
  contacts: Contact[]
  onEditContact: (contact: Contact) => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
}

export const VirtualizedContactTable = memo(forwardRef<any, VirtualizedContactTableProps>(
  ({ contacts, onEditContact, hasNextPage, isFetchingNextPage, fetchNextPage }, ref) => {
    const itemCount = useMemo(() => 
      hasNextPage ? contacts.length + 1 : contacts.length, 
      [hasNextPage, contacts.length]
    )
    
    const isItemLoaded = useCallback((index: number) => !!contacts[index], [contacts])
    
    const itemData = useMemo(() => 
      ({ contacts, onEditContact }), 
      [contacts, onEditContact]
    )

    return (
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        <ContactTableHeader />

        {/* Virtualized List */}
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={fetchNextPage || (() => Promise.resolve())}
        >
          {({ onItemsRendered, ref: loaderRef }) => (
            <List
              ref={(list) => {
                loaderRef(list)
                if (ref) {
                  if (typeof ref === 'function') {
                    ref(list)
                  } else {
                    ref.current = list
                  }
                }
              }}
              height={600}
              width="100%"
              itemCount={itemCount}
              itemSize={80}
              itemData={itemData}
              onItemsRendered={onItemsRendered}
            >
              {ContactRow}
            </List>
          )}
        </InfiniteLoader>

        {/* Loading indicator */}
        {isFetchingNextPage && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-center">
              <div className="text-sm text-gray-600">Cargando más contactos...</div>
            </div>
          </div>
        )}
      </div>
    )
  }
))

VirtualizedContactTable.displayName = 'VirtualizedContactTable'
