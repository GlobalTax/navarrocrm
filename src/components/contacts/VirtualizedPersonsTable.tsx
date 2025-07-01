
import { forwardRef } from 'react'
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import { Person } from '@/hooks/usePersons'
import { PersonRow } from './PersonRow'
import { PersonTableHeader } from './PersonTableHeader'

interface VirtualizedPersonsTableProps {
  persons: Person[]
  onEditPerson: (person: Person) => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
}

export const VirtualizedPersonsTable = forwardRef<any, VirtualizedPersonsTableProps>(
  ({ persons, onEditPerson, hasNextPage, isFetchingNextPage, fetchNextPage }, ref) => {
    const itemCount = hasNextPage ? persons.length + 1 : persons.length
    const isItemLoaded = (index: number) => !!persons[index]

    return (
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        <PersonTableHeader />

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
              itemData={{ persons, onEditPerson }}
              onItemsRendered={onItemsRendered}
            >
              {PersonRow}
            </List>
          )}
        </InfiniteLoader>

        {/* Loading indicator */}
        {isFetchingNextPage && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-center">
              <div className="text-sm text-gray-600">Cargando más personas...</div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

VirtualizedPersonsTable.displayName = 'VirtualizedPersonsTable'
