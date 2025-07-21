
import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Download, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AIUsageLog } from '@/hooks/useAIUsage'

interface AIUsageTableProps {
  logs: AIUsageLog[]
  isLoading?: boolean
}

export const AIUsageTable = ({ logs, isLoading }: AIUsageTableProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [orgFilter, setOrgFilter] = useState<string>('all')

  // OPTIMIZACIÓN: Memoizar filtrado costoso
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = searchTerm === '' || 
        log.function_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.model_used?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'success' && log.success) ||
        (statusFilter === 'error' && !log.success)
      
      const matchesOrg = orgFilter === 'all' || log.org_id === orgFilter
      
      return matchesSearch && matchesStatus && matchesOrg
    })
  }, [logs, searchTerm, statusFilter, orgFilter])

  // OPTIMIZACIÓN: Memoizar organizaciones únicas
  const uniqueOrgs = useMemo(() => 
    Array.from(new Set(logs.map(log => log.org_id))),
    [logs]
  )

  // OPTIMIZACIÓN: Memoizar datos CSV
  const csvData = useMemo(() => {
    const headers = [
      'Fecha',
      'Organización',
      'Usuario',
      'Función',
      'Modelo',
      'Tokens',
      'Costo',
      'Duración (ms)',
      'Estado',
      'Error'
    ]

    const data = filteredLogs.map(log => [
      format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      log.org_id,
      log.user_id,
      log.function_name,
      log.model_used || 'N/A',
      log.total_tokens || 0,
      log.estimated_cost || 0,
      log.duration_ms || 0,
      log.success ? 'Éxito' : 'Error',
      log.error_message || ''
    ])

    return [headers, ...data]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }, [filteredLogs])

  const exportToCSV = () => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `ai-usage-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Logs de Uso de IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Logs de Uso de IA</span>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </CardTitle>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por función o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="success">Éxito</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>

          <Select value={orgFilter} onValueChange={setOrgFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Organización" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {uniqueOrgs.map(orgId => (
                <SelectItem key={orgId} value={orgId}>
                  {orgId.substring(0, 8)}...
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Función</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron logs que coincidan con los filtros
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.function_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {log.model_used || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {log.total_tokens?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${(log.estimated_cost || 0).toFixed(6)}
                    </TableCell>
                    <TableCell className="text-right">
                      {log.duration_ms || 0}ms
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={log.success ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {log.success ? 'Éxito' : 'Error'}
                      </Badge>
                      {!log.success && log.error_message && (
                        <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]" 
                             title={log.error_message}>
                          {log.error_message}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredLogs.length > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>
              Mostrando {filteredLogs.length} de {logs.length} registros
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
