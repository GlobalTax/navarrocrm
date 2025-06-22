
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { TestResult } from './types'

interface TestResultCardProps {
  result: TestResult
}

export const TestResultCard = ({ result }: TestResultCardProps) => {
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      case 'warning':
        return 'secondary'
      case 'pending':
        return 'outline'
    }
  }

  return (
    <div className="flex items-center justify-between p-3 border rounded">
      <div className="flex items-center gap-3">
        {getStatusIcon(result.status)}
        <div>
          <div className="font-medium">{result.name}</div>
          <div className="text-sm text-gray-600">{result.message}</div>
          {result.details && (
            <div className="text-xs text-gray-500 mt-1">{result.details}</div>
          )}
        </div>
      </div>
      <Badge variant={getStatusColor(result.status) as any}>
        {result.status.toUpperCase()}
      </Badge>
    </div>
  )
}
