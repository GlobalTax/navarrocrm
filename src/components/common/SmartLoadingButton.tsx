import React from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useLoadingOptimization } from '@/hooks/useLoadingOptimization'

interface SmartLoadingButtonProps {
  children: React.ReactNode
  onClick: () => Promise<any>
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  disabled?: boolean
  loadingText?: string
  minLoadingTime?: number
  retryLimit?: number
}

export const SmartLoadingButton: React.FC<SmartLoadingButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  className,
  disabled = false,
  loadingText,
  minLoadingTime = 500,
  retryLimit = 3,
  ...props
}) => {
  const { isLoading, error, execute, retry, canRetry } = useLoadingOptimization(
    onClick,
    { minDuration: minLoadingTime, retryLimit }
  )

  const handleClick = () => {
    if (error && canRetry) {
      retry()
    } else {
      execute()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={disabled || isLoading}
        onClick={handleClick}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {isLoading ? (loadingText || 'Cargando...') : children}
      </Button>
      
      {error && (
        <div className="text-sm text-destructive">
          {error}
          {canRetry && (
            <button
              onClick={retry}
              className="ml-2 underline hover:no-underline"
            >
              Reintentar
            </button>
          )}
        </div>
      )}
    </div>
  )
}