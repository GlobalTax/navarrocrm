
import { FileText, FolderOpen, Clock, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Case } from '@/features/cases'

interface CasesStatsProps {
  cases: Case[]
}

export function CasesStats({ cases }: CasesStatsProps) {
  const stats = {
    total: cases.length,
    open: cases.filter(c => c.status === 'open').length,
    closed: cases.filter(c => c.status === 'closed').length,
    on_hold: cases.filter(c => c.status === 'on_hold').length
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Expedientes</CardTitle>
          <FileText className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <p className="text-xs text-gray-500 mt-1">Todos los expedientes</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Activos</CardTitle>
          <FolderOpen className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">{stats.open}</div>
          <p className="text-xs text-gray-500 mt-1">En progreso</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">En Espera</CardTitle>
          <Clock className="h-5 w-5 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-700">{stats.on_hold}</div>
          <p className="text-xs text-gray-500 mt-1">Pausados</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Completados</CardTitle>
          <CheckCircle className="h-5 w-5 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-700">{stats.closed}</div>
          <p className="text-xs text-gray-500 mt-1">Finalizados</p>
        </CardContent>
      </Card>
    </div>
  )
}
