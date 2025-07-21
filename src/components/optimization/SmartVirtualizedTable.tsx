import React from 'react'
import { useVirtualizedData } from '@/hooks/performance/useVirtualizedData'
import { VirtualizedCaseTable } from '@/components/cases/VirtualizedCaseTable'
import { CaseTable } from '@/components/cases/CaseTable'
import { VirtualizedTasksList } from '@/components/tasks/VirtualizedTasksList'
import { TasksList } from '@/components/tasks/TasksList'
import { VirtualizedUserTable } from '@/components/users/VirtualizedUserTable'
import { UserTable } from '@/components/users/UserTable'
import { VirtualizedContactTableLegacy } from '@/components/contacts/VirtualizedContactTableLegacy'
import { ContactTable } from '@/components/contacts/ContactTable'

interface SmartVirtualizedTableProps {
  component: 'cases' | 'tasks' | 'users' | 'contacts'
  items: any[]
  [key: string]: any
}

export const SmartVirtualizedTable: React.FC<SmartVirtualizedTableProps> = ({
  component,
  items,
  ...props
}) => {
  const { shouldVirtualize } = useVirtualizedData(items, component)

  switch (component) {
    case 'cases':
      return shouldVirtualize ? (
        <VirtualizedCaseTable cases={items} {...(props as any)} />
      ) : (
        <CaseTable cases={items} {...(props as any)} />
      )
    
    case 'tasks':
      return shouldVirtualize ? (
        <VirtualizedTasksList tasks={items} {...(props as any)} />
      ) : (
        <TasksList tasks={items} {...(props as any)} />
      )
    
    case 'users':
      return shouldVirtualize ? (
        <VirtualizedUserTable users={items} {...(props as any)} />
      ) : (
        <UserTable users={items} {...(props as any)} />
      )
    
    case 'contacts':
      return shouldVirtualize ? (
        <VirtualizedContactTableLegacy contacts={items} {...(props as any)} />
      ) : (
        <ContactTable contacts={items} {...(props as any)} />
      )
    
    default:
      return null
  }
}