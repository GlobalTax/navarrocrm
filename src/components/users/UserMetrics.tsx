
import { Card, CardContent } from '@/components/ui/card'

interface UserStats {
  total: number
  active: number
  partners: number
  managers: number
  seniors: number
  juniors: number
}

interface UserMetricsProps {
  stats: UserStats
}

export const UserMetrics = ({ stats }: UserMetricsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      <Card className="border-slate-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-semibold text-slate-900">{stats.total}</div>
          <div className="text-sm text-slate-600">Total</div>
        </CardContent>
      </Card>
      <Card className="border-slate-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-semibold text-green-700">{stats.active}</div>
          <div className="text-sm text-slate-600">Activos</div>
        </CardContent>
      </Card>
      <Card className="border-slate-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-semibold text-purple-700">{stats.partners}</div>
          <div className="text-sm text-slate-600">Partners</div>
        </CardContent>
      </Card>
      <Card className="border-slate-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-semibold text-blue-700">{stats.managers}</div>
          <div className="text-sm text-slate-600">Managers</div>
        </CardContent>
      </Card>
      <Card className="border-slate-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-semibold text-emerald-700">{stats.seniors}</div>
          <div className="text-sm text-slate-600">Seniors</div>
        </CardContent>
      </Card>
      <Card className="border-slate-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-semibold text-yellow-700">{stats.juniors}</div>
          <div className="text-sm text-slate-600">Juniors</div>
        </CardContent>
      </Card>
    </div>
  )
}
