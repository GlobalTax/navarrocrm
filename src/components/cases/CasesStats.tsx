
import { FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Case } from '@/hooks/useCases'

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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Abiertos</CardTitle>
          <Badge className="bg-green-100 text-green-800">{stats.open}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.open}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En Espera</CardTitle>
          <Badge className="bg-yellow-100 text-yellow-800">{stats.on_hold}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.on_hold}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cerrados</CardTitle>
          <Badge className="bg-gray-100 text-gray-800">{stats.closed}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
        </CardContent>
      </Card>
    </div>
  )
}
