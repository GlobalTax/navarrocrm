
import { ReactNode } from 'react'

interface StandardPageContainerProps {
  children: ReactNode
}

export function StandardPageContainer({ children }: StandardPageContainerProps) {
  return (
    <div className="space-y-6">
      {children}
    </div>
  )
}
