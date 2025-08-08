
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
      <Card className="bg-background border-[0.5px] border-border rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Expedientes</CardTitle>
          <FileText className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">Todos los expedientes</p>
        </CardContent>
      </Card>

      <Card className="bg-background border-[0.5px] border-border rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Activos</CardTitle>
          <FolderOpen className="h-5 w-5 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{stats.open}</div>
          <p className="text-xs text-muted-foreground mt-1">En progreso</p>
        </CardContent>
      </Card>

      <Card className="bg-background border-[0.5px] border-border rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">En Espera</CardTitle>
          <Clock className="h-5 w-5 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{stats.on_hold}</div>
          <p className="text-xs text-muted-foreground mt-1">Pausados</p>
        </CardContent>
      </Card>

      <Card className="bg-background border-[0.5px] border-border rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Completados</CardTitle>
          <CheckCircle className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-muted-foreground">{stats.closed}</div>
          <p className="text-xs text-muted-foreground mt-1">Finalizados</p>
        </CardContent>
      </Card>
    </div>
  )
}
