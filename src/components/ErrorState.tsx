import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, X } from 'lucide-react'
import { AppError } from '@/utils/errorHandler'

interface ErrorStateProps {
  error: AppError
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  onRetry, 
  onDismiss, 
  className = '' 
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 border-red-200 bg-red-50'
      case 'high': return 'text-orange-600 border-orange-200 bg-orange-50'
      case 'medium': return 'text-yellow-600 border-yellow-200 bg-yellow-50'
      default: return 'text-blue-600 border-blue-200 bg-blue-50'
    }
  }

  const getSeverityIcon = (severity: string) => {
    return <AlertTriangle className="h-5 w-5" />
  }

  return (
    <Card className={`${getSeverityColor(error.severity)} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {getSeverityIcon(error.severity)}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm">
              {error.userMessage}
            </h3>
            
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs mt-1 opacity-75 font-mono">
                {error.technicalMessage}
              </p>
            )}
            
            <p className="text-xs mt-1 opacity-60">
              {error.timestamp.toLocaleTimeString()}
            </p>
          </div>

          <div className="flex gap-1">
            {error.retryable && onRetry && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onRetry}
                className="h-6 px-2 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reintentar
              </Button>
            )}
            
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="h-6 px-1"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ErrorListProps {
  errors: AppError[]
  onRetry?: (error: AppError) => void
  onDismiss?: (error: AppError) => void
  maxVisible?: number
}

export const ErrorList: React.FC<ErrorListProps> = ({
  errors,
  onRetry,
  onDismiss,
  maxVisible = 3
}) => {
  const visibleErrors = errors.slice(0, maxVisible)
  const hiddenCount = Math.max(0, errors.length - maxVisible)

  if (errors.length === 0) return null

  return (
    <div className="space-y-2">
      {visibleErrors.map((error, index) => (
        <ErrorState
          key={`${error.timestamp.getTime()}-${index}`}
          error={error}
          onRetry={() => onRetry?.(error)}
          onDismiss={() => onDismiss?.(error)}
        />
      ))}
      
      {hiddenCount > 0 && (
        <div className="text-xs text-muted-foreground text-center py-1">
          +{hiddenCount} errores adicionales
        </div>
      )}
    </div>
  )
}