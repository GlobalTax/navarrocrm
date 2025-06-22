
import { ReactNode } from 'react'

interface CasesPageContainerProps {
  children: ReactNode
}

export function CasesPageContainer({ children }: CasesPageContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {children}
      </div>
    </div>
  )
}
