import React from 'react'
import { useOrgChart } from '@/hooks/useOrgChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, UserRound, ChevronRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function EmployeesOrgChart() {
  const { data, isLoading, error, restricted } = useOrgChart()
  const [search, setSearch] = React.useState('')
  const [deptFilter, setDeptFilter] = React.useState<string | 'all'>('all')

  const departments = React.useMemo(() => {
    let items = data
    if (deptFilter !== 'all') items = items.filter(d => d.department_id === deptFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(d =>
        d.department_name.toLowerCase().includes(q) ||
        (d.manager_name || '').toLowerCase().includes(q) ||
        d.teams?.some(t => t.name.toLowerCase().includes(q) || (t.team_lead_name || '').toLowerCase().includes(q))
      )
    }
    return items
  }, [data, deptFilter, search])

  const deptOptions = React.useMemo(() => (
    Array.from(new Map(data.map(d => [d.department_id, d.department_name])).entries())
      .map(([id, name]) => ({ id, name }))
  ), [data])

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive border border-destructive/20 rounded-md">
        Error cargando organigrama: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-4" data-testid="org-chart">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex-1">
          <Input
            placeholder="Buscar por departamento, responsable o equipo"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={deptFilter} onValueChange={(v) => setDeptFilter(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los departamentos</SelectItem>
              {deptOptions.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mensaje de permisos */}
      {restricted && data.length === 0 && !isLoading && (
        <div className="p-3 text-sm rounded-md border bg-muted">
          No tienes permisos para ver otros departamentos. Contacta con un manager si necesitas acceso.
        </div>
      )}

      {/* Grid de departamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-1/3 bg-muted rounded" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-24 bg-muted rounded-full" />
                  <div className="h-6 w-20 bg-muted rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          departments.map((dept) => (
            <Card key={dept.department_id} className="transition-transform hover:-translate-y-0.5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {dept.department_name}
                  </span>
                  <Badge variant="secondary">{dept.employees_count} empleados</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Responsable */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {dept.manager_avatar && <AvatarImage src={dept.manager_avatar} />}
                      <AvatarFallback>
                        <UserRound className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{dept.manager_name || 'Sin responsable'}</div>
                      <div className="text-xs text-muted-foreground">Responsable</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {dept.manager_user_id && (
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/users/${dept.manager_user_id}`}>Ver responsable</Link>
                      </Button>
                    )}
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/teams?department=${dept.department_id}`}>Ver equipos</Link>
                    </Button>
                  </div>
                </div>

                {/* Equipos */}
                {dept.teams?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {dept.teams.map(team => (
                      <Badge key={team.id} variant="outline" className="text-xs px-2 py-1 rounded-full">
                        {team.name}
                        {team.team_lead_name ? (
                          <span className="text-muted-foreground"> · Lead: {team.team_lead_name}</span>
                        ) : null}
                        <span className="text-muted-foreground"> · {team.members_count}</span>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">Sin equipos</div>
                )}

                {/* Acciones rápidas */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button asChild size="sm">
                    <Link to={`/teams/new?department=${dept.department_id}`} className="flex items-center gap-1">
                      <Plus className="h-4 w-4" /> Crear equipo
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm">
                    <Link to={`/teams?department=${dept.department_id}`} className="flex items-center gap-1">
                      Ver equipo <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
