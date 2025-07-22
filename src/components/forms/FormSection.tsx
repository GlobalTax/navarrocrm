
import { ReactNode } from 'react'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  isValid?: boolean
  hasChanges?: boolean
  isValidating?: boolean
  errorCount?: number
  className?: string
}

export const FormSection = ({
  title,
  description,
  children,
  isValid,
  hasChanges,
  isValidating,
  errorCount = 0,
  className
}: FormSectionProps) => {
  const getStatusIcon = () => {
    if (isValidating) {
      return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
    }
    if (errorCount > 0) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    if (isValid && hasChanges) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return null
  }

  const getStatusText = () => {
    if (isValidating) return 'Validando...'
    if (errorCount > 0) return `${errorCount} error${errorCount > 1 ? 'es' : ''}`
    if (isValid && hasChanges) return 'Válido'
    return null
  }

  return (
    <div className={cn(
      "border rounded-lg bg-white transition-all duration-200",
      errorCount > 0 && "border-red-200 bg-red-50/30",
      isValid && hasChanges && "border-green-200 bg-green-50/30",
      isValidating && "border-blue-200 bg-blue-50/30",
      className
    )}>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusText() && (
              <span className={cn(
                "text-sm font-medium",
                isValidating && "text-blue-600",
                errorCount > 0 && "text-red-600",
                isValid && hasChanges && "text-green-600"
              )}>
                {getStatusText()}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}
