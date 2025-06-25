
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Zap, Timer, Layout, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface WebVitalsData {
  lcp: {
    value: number
    distribution: { good: number; needsImprovement: number; poor: number }
    trend: number
    history: Array<{ date: string; value: number }>
  }
  fid: {
    value: number
    distribution: { good: number; needsImprovement: number; poor: number }
    trend: number
    history: Array<{ date: string; value: number }>
  }
  cls: {
    value: number
    distribution: { good: number; needsImprovement: number; poor: number }
    trend: number
    history: Array<{ date: string; value: number }>
  }
  overallScore: number
}

export const WebVitalsDisplay: React.FC = () => {
  const { user } = useApp()
  const [webVitalsData, setWebVitalsData] = useState<WebVitalsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')
  const [selectedMetric, setSelectedMetric] = useState<'lcp' | 'fid' | 'cls'>('lcp')

  useEffect(() => {
    fetchWebVitalsData()
  }, [user?.org_id, timeRange])

  const fetchWebVitalsData = async () => {
    if (!user?.org_id) return

    try {
      const now = new Date()
      const timeRanges = {
        '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
        '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }
      
      const startTime = timeRanges[timeRange as keyof typeof timeRanges]

      const { data: performanceData, error } = await supabase
        .from('analytics_performance')
        .select('*')
        .eq('org_id', user.org_id)
        .gte('timestamp', startTime.toISOString())
        .order('timestamp', { ascending: true })

      if (error) throw error

      if (!performanceData || performanceData.length === 0) {
        setWebVitalsData(null)
        setIsLoading(false)
        return
      }

      // Process LCP data
      const lcpValues = performanceData
        .filter(p => p.largest_contentful_paint !== null)
        .map(p => p.largest_contentful_paint as number)
      
      const fidValues = performanceData
        .filter(p => p.first_input_delay !== null)
        .map(p => p.first_input_delay as number)
      
      const clsValues = performanceData
        .filter(p => p.cumulative_layout_shift !== null)
        .map(p => p.cumulative_layout_shift as number)

      // Calculate averages
      const avgLcp = lcpValues.length > 0 ? lcpValues.reduce((a, b) => a + b, 0) / lcpValues.length : 0
      const avgFid = fidValues.length > 0 ? fidValues.reduce((a, b) => a + b, 0) / fidValues.length : 0
      const avgCls = clsValues.length > 0 ? clsValues.reduce((a, b) => a + b, 0) / clsValues.length : 0

      // Calculate distributions
      const calculateDistribution = (values: number[], thresholds: [number, number]) => {
        const good = values.filter(v => v <= thresholds[0]).length
        const needsImprovement = values.filter(v => v > thresholds[0] && v <= thresholds[1]).length
        const poor = values.filter(v => v > thresholds[1]).length
        const total = values.length || 1
        
        return {
          good: Math.round((good / total) * 100),
          needsImprovement: Math.round((needsImprovement / total) * 100),
          poor: Math.round((poor / total) * 100)
        }
      }

      // Create history data (group by hour/day depending on time range)
      const createHistory = (data: any[], metricField: string) => {
        const groupedData = new Map<string, number[]>()
        
        data.forEach(item => {
          if (item[metricField] !== null) {
            const date = new Date(item.timestamp)
            const key = timeRange === '24h' 
              ? `${date.getHours()}:00`
              : date.toLocaleDateString()
            
            if (!groupedData.has(key)) {
              groupedData.set(key, [])
            }
            groupedData.get(key)!.push(item[metricField])
          }
        })

        return Array.from(groupedData.entries()).map(([date, values]) => ({
          date,
          value: values.reduce((a, b) => a + b, 0) / values.length
        }))
      }

      // Calculate trends (comparing first half vs second half)
      const calculateTrend = (values: number[]) => {
        if (values.length < 2) return 0
        const midPoint = Math.floor(values.length / 2)
        const firstHalf = values.slice(0, midPoint)
        const secondHalf = values.slice(midPoint)
        
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
        
        return ((secondAvg - firstAvg) / firstAvg) * 100
      }

      const webVitals: WebVitalsData = {
        lcp: {
          value: avgLcp,
          distribution: calculateDistribution(lcpValues, [2500, 4000]),
          trend: calculateTrend(lcpValues),
          history: createHistory(performanceData, 'largest_contentful_paint')
        },
        fid: {
          value: avgFid,
          distribution: calculateDistribution(fidValues, [100, 300]),
          trend: calculateTrend(fidValues),
          history: createHistory(performanceData, 'first_input_delay')
        },
        cls: {
          value: avgCls,
          distribution: calculateDistribution(clsValues, [0.1, 0.25]),
          trend: calculateTrend(clsValues),
          history: createHistory(performanceData, 'cumulative_layout_shift')
        },
        overallScore: 0
      }

      // Calculate overall score
      const lcpScore = avgLcp <= 2500 ? 100 : avgLcp <= 4000 ? 50 : 0
      const fidScore = avgFid <= 100 ? 100 : avgFid <= 300 ? 50 : 0
      const clsScore = avgCls <= 0.1 ? 100 : avgCls <= 0.25 ? 50 : 0
      webVitals.overallScore = Math.round((lcpScore + fidScore + clsScore) / 3)

      setWebVitalsData(webVitals)
      setIsLoading(false)

    } catch (error) {
      console.error('Error fetching Web Vitals data:', error)
      setIsLoading(false)
    }
  }

  const getMetricStatus = (metric: 'lcp' | 'fid' | 'cls', value: number) => {
    const thresholds = {
      lcp: [2500, 4000],
      fid: [100, 300],
      cls: [0.1, 0.25]
    }
    
    const [good, poor] = thresholds[metric]
    return value <= good ? 'good' : value <= poor ? 'needs-improvement' : 'poor'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200'
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'poor': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatMetricValue = (metric: 'lcp' | 'fid' | 'cls', value: number) => {
    switch (metric) {
      case 'lcp':
      case 'fid':
        return `${Math.round(value)}ms`
      case 'cls':
        return value.toFixed(3)
      default:
        return value.toString()
    }
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-red-500" />
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-green-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const pieColors = ['#10b981', '#f59e0b', '#ef4444'] // green, yellow, red

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!webVitalsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay datos de Web Vitals disponibles para el período seleccionado
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentMetric = webVitalsData[selectedMetric]
  const distributionData = [
    { name: 'Bueno', value: currentMetric.distribution.good, color: pieColors[0] },
    { name: 'Mejorable', value: currentMetric.distribution.needsImprovement, color: pieColors[1] },
    { name: 'Pobre', value: currentMetric.distribution.poor, color: pieColors[2] }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Core Web Vitals</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24 horas</SelectItem>
            <SelectItem value="7d">7 días</SelectItem>
            <SelectItem value="30d">30 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Puntuación General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Progress value={webVitalsData.overallScore} className="h-3" />
            </div>
            <div className="text-2xl font-bold">{webVitalsData.overallScore}/100</div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`cursor-pointer transition-all ${selectedMetric === 'lcp' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedMetric('lcp')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Largest Contentful Paint</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMetricValue('lcp', webVitalsData.lcp.value)}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className={getStatusColor(getMetricStatus('lcp', webVitalsData.lcp.value))}>
                {getMetricStatus('lcp', webVitalsData.lcp.value)}
              </Badge>
              {getTrendIcon(webVitalsData.lcp.trend)}
              <span className="text-xs text-muted-foreground">
                {Math.abs(webVitalsData.lcp.trend).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer transition-all ${selectedMetric === 'fid' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedMetric('fid')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">First Input Delay</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMetricValue('fid', webVitalsData.fid.value)}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className={getStatusColor(getMetricStatus('fid', webVitalsData.fid.value))}>
                {getMetricStatus('fid', webVitalsData.fid.value)}
              </Badge>
              {getTrendIcon(webVitalsData.fid.trend)}
              <span className="text-xs text-muted-foreground">
                {Math.abs(webVitalsData.fid.trend).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer transition-all ${selectedMetric === 'cls' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedMetric('cls')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumulative Layout Shift</CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMetricValue('cls', webVitalsData.cls.value)}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className={getStatusColor(getMetricStatus('cls', webVitalsData.cls.value))}>
                {getMetricStatus('cls', webVitalsData.cls.value)}
              </Badge>
              {getTrendIcon(webVitalsData.cls.trend)}
              <span className="text-xs text-muted-foreground">
                {Math.abs(webVitalsData.cls.trend).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia - {selectedMetric.toUpperCase()}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentMetric.history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => `Fecha: ${label}`}
                  formatter={(value: number) => [formatMetricValue(selectedMetric, value), selectedMetric.toUpperCase()]}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución - {selectedMetric.toUpperCase()}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
