
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EnhancedAIUsageStats } from '@/hooks/useEnhancedAIUsage'

interface AITopUsersTableProps {
  stats: EnhancedAIUsageStats
  isLoading: boolean
}

export function AITopUsersTable({ stats, isLoading }: AITopUsersTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Usuarios</CardTitle>
        <CardDescription>
          Usuarios con mayor actividad en servicios de IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-right">Llamadas</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">Costo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.topUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No hay datos de usuarios disponibles
                </TableCell>
              </TableRow>
            ) : (
              stats.topUsers.map((user, index) => (
                <TableRow key={user.userId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={index < 3 ? 'default' : 'secondary'}>
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{user.userEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {user.calls.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {(user.tokens / 1000).toFixed(1)}k
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    €{user.cost.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
