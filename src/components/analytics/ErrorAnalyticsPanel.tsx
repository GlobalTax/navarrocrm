
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { AlertTriangle, Bug, Wifi, FileX, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

interface ErrorData {
  id: string
  errorMessage: string
  errorType: string
  pageUrl: string
  timestamp: string
  contextData: any
  userAgent: string
}

interface ErrorStats {
  totalErrors: number
  errorRate: number
  topErrors: Array<{ message: string; count: number; type: string }>
  errorsByType: Array<{ type: string; count: number; color: string }>
  errorsByPage: Array<{ page: string; count: number }>
  errorTrend: Array<{ time: string; count: number }>
  criticalErrors: ErrorData[]
}

export const ErrorAnalyticsPanel: React.FC = () => {
  const { user } = useApp()
  const [errorStats, setErrorStats] = useState<ErrorStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')
  const [selectedErrorType, setSelectedErrorType] = useState<string>('all')

  useEffect(() => {
    fetchErrorData()
  }, [user?.org_id, timeRange, selectedErrorType])

  const fetchErrorData = async () => {
    if (!user?.org_id) return

    try {
      const now = new Date()
      const timeRanges = {
        '1h': new Date(now.getTime() - 60 * 60 * 1000),
        '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
        '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }
      
      const startTime = timeRanges[timeRange as keyof typeof timeRanges]

      // Fetch errors
      let query = supabase
        .from('analytics_errors')
        .select('*')
        .eq('org_id', user.org_id)
        .gte('timestamp', startTime.toISOString())
        .order('timestamp', { ascending: false })

      if (selectedErrorType !== 'all') {
        query = query.eq('error_type', selectedErrorType)
      }

      const { data: errors, error } = await query

      if (error) throw error

      // Also fetch total events for error rate calculation
      const { data: events } = await supabase
        .from('analytics_events')
        .select('id')
        .eq('org_id', user.org_id)
        .gte('timestamp', startTime.toISOString())

      if (!errors) {
        setErrorStats(null)
        setIsLoading(false)
        return
      }

      // Process error statistics
      const totalErrors = errors.length
      const totalEvents = events?.length || 1
      const errorRate = (totalErrors / totalEvents) * 100

      // Group errors by message
      const errorMessages = new Map<string, { count: number; type: string; latest: ErrorData }>()
      errors.forEach(error => {
        const key = error.error_message
        if (errorMessages.has(key)) {
          errorMessages.get(key)!.count += 1
        } else {
          errorMessages.set(key, { count: 1, type: error.error_type, latest: error })
        }
      })

      const topErrors = Array.from(errorMessages.entries())
        .map(([message, data]) => ({ message, count: data.count, type: data.type }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Group errors by type
      const errorTypeMap = new Map<string, number>()
      errors.forEach(error => {
        errorTypeMap.set(error.error_type, (errorTypeMap.get(error.error_type) || 0) + 1)
      })

      const typeColors = {
        'error': '#ef4444',
        'unhandledrejection': '#f97316',
        'resource': '#eab308',
        'network': '#06b6d4'
      }

      const errorsByType = Array.from(errorTypeMap.entries()).map(([type, count]) => ({
        type,
        count,
        color: typeColors[type as keyof typeof typeColors] || '#6b7280'
      }))

      // Group errors by page
      const pageErrorMap = new Map<string, number>()
      errors.forEach(error => {
        try {
          const url = new URL(error.page_url)
          const page = url.pathname
          pageErrorMap.set(page, (pageErrorMap.get(page) || 0) + 1)
        } catch {
          pageErrorMap.set(error.page_url, (pageErrorMap.get(error.page_url) || 0) + 1)
        }
      })

      const errorsByPage = Array.from(pageErrorMap.entries())
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Create error trend (group by hour or day)
      const trendMap = new Map<string, number>()
      errors.forEach(error => {
        const date = new Date(error.timestamp)
        const key = timeRange === '1h' || timeRange === '24h'
          ? `${date.getHours()}:00`
          : date.toLocaleDateString()
        
        trendMap.set(key, (trendMap.get(key) || 0) + 1)
      })

      const errorTrend = Array.from(trendMap.entries())
        .map(([time, count]) => ({ time, count }))
        .sort((a, b) => a.time.localeCompare(b.time))

      // Identify critical errors (high frequency or specific types)
      const criticalErrorMessages = topErrors.slice(0, 5).map(e => e.message)
      const criticalErrors = errors
        .filter(error => 
          criticalErrorMessages.includes(error.error_message) ||
          error.error_type === 'unhandledrejection'
        )
        .slice(0, 20)

      const stats: ErrorStats = {
        totalErrors,
        errorRate,
        topErrors,
        errorsByType,
        errorsByPage,
        errorTrend,
        criticalErrors
      }

      setErrorStats(stats)
      setIsLoading(false)

    } catch (error) {
      console.error('Error fetching error analytics:', error)
      setIsLoading(false)
    }
  }

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'error': return <Bug className="h-4 w-4" />
      case 'unhandledrejection': return <AlertTriangle className="h-4 w-4" />
      case 'resource': return <FileX className="h-4 w-4" />
      case 'network': return <Wifi className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getErrorTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-500 text-white'
      case 'unhandledrejection': return 'bg-orange-500 text-white'
      case 'resource': return 'bg-yellow-500 text-white'
      case 'network': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const errorTime = new Date(timestamp)
    const diffMs = now.getTime() - errorTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
    if (diffHours > 0) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    if (diffMins > 0) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
    return 'hace un momento'
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!errorStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Errores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay datos de errores para el período seleccionado
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Análisis de Errores</h2>
        <div className="flex space-x-2">
          <Select value={selectedErrorType} onValueChange={setSelectedErrorType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="error">JavaScript</SelectItem>
              <SelectItem value="unhandledrejection">Promise</SelectItem>
              <SelectItem value="resource">Recursos</SelectItem>
              <SelectItem value="network">Red</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hora</SelectItem>
              <SelectItem value="24h">24 horas</SelectItem>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errores</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorStats.totalErrors}</div>
            <p className="text-xs text-muted-foreground">
              últimas {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Error</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorStats.errorRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              errores/eventos totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos de Error</CardTitle>
            <Bug className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorStats.errorsByType.length}</div>
            <p className="text-xs text-muted-foreground">
              categorías diferentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errores Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorStats.criticalErrors.length}</div>
            <p className="text-xs text-muted-foreground">
              requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Errores</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={errorStats.errorTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Errors by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Errores por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={errorStats.errorsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count }) => `${type}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {errorStats.errorsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Errors */}
        <Card>
          <CardHeader>
            <CardTitle>Errores Más Frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {errorStats.topErrors.slice(0, 8).map((error, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getErrorIcon(error.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{error.message}</p>
                      <Badge className={`text-xs ${getErrorTypeColor(error.type)}`}>
                        {error.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{error.count}</p>
                    <p className="text-xs text-muted-foreground">ocurrencias</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Errors by Page */}
        <Card>
          <CardHeader>
            <CardTitle>Páginas con Más Errores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {errorStats.errorsByPage.slice(0, 8).map((page, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{page.page}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{page.count}</p>
                    <p className="text-xs text-muted-foreground">errores</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Errors */}
      <Card>
        <CardHeader>
          <CardTitle>Errores Críticos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {errorStats.criticalErrors.slice(0, 10).map((error, index) => (
              <div key={error.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getErrorIcon(error.errorType)}
                    <Badge className={getErrorTypeColor(error.errorType)}>
                      {error.errorType}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(error.timestamp)}
                    </span>
                  </div>
                  <Badge variant="destructive">CRÍTICO</Badge>
                </div>
                <p className="font-medium text-sm">{error.errorMessage}</p>
                <p className="text-xs text-muted-foreground">
                  Página: {error.pageUrl}
                </p>
                {error.contextData && Object.keys(error.contextData).length > 0 && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground">
                      Ver detalles técnicos
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                      {JSON.stringify(error.contextData, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
