import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProposalsErrorBoundaryProps {
  children: React.ReactNode
  error?: Error | null
  onRetry?: () => void
}

export const ProposalsErrorBoundary: React.FC<ProposalsErrorBoundaryProps> = ({
  children,
  error,
  onRetry
}) => {
  if (error) {
    return (
      <div className="p-6 space-y-4">
        <Alert className="border-0.5 border-red-500 rounded-[10px]">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar las propuestas: {error.message}
          </AlertDescription>
        </Alert>
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
        )}
      </div>
    )
  }

  return <>{children}</>
}