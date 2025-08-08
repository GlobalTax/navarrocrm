
import React from 'react'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'

interface ErrorStateProps {
  error: string
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-academia-error mb-4">
        <BookOpen className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Error cargando la academia</h3>
        <p className="text-sm">{error}</p>
      </div>
      <Button onClick={() => window.location.reload()}>
        Intentar de nuevo
      </Button>
    </div>
  )
}
