
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Users, Plus, UserPlus } from 'lucide-react'
import { useTeams } from '@/hooks/useTeams'
import { useApp } from '@/contexts/AppContext'

export const TeamsManagement = () => {
  const { user } = useApp()
  const { departments, teams, isLoading, createDepartment, createTeam } = useTeams()
  const [isCreatingDept, setIsCreatingDept] = useState(false)
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  
  // Department form state
  const [deptForm, setDeptForm] = useState({
    name: '',
    description: '',
    color: '#6366f1'
  })
  
  // Team form state
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    department_id: '',
    color: '#10b981'
  })

  const handleCreateDepartment = async () => {
    if (!user?.org_id || !deptForm.name.trim()) return
    
    try {
      await createDepartment({
        org_id: user.org_id,
        name: deptForm.name.trim(),
        description: deptForm.description.trim() || null,
        color: deptForm.color,
        is_active: true
      })
      
      setDeptForm({ name: '', description: '', color: '#6366f1' })
      setIsCreatingDept(false)
    } catch (error) {
      console.error('Error creating department:', error)
    }
  }

  const handleCreateTeam = async () => {
    if (!user?.org_id || !teamForm.name.trim()) return
    
    try {
      await createTeam({
        org_id: user.org_id,
        name: teamForm.name.trim(),
        description: teamForm.description.trim() || null,
        department_id: teamForm.department_id || null,
        color: teamForm.color,
        is_active: true
      })
      
      setTeamForm({ name: '', description: '', department_id: '', color: '#10b981' })
      setIsCreatingTeam(false)
    } catch (error) {
      console.error('Error creating team:', error)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Cargando equipos...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Equipos</h2>
          <p className="text-gray-600">Organiza tu firma por departamentos y equipos</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreatingDept} onOpenChange={setIsCreatingDept}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Building2 className="h-4 w-4 mr-2" />
                Nuevo Departamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Departamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dept-name">Nombre</Label>
                  <Input
                    id="dept-name"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ej. Legal, Administrativo, Fiscal"
                  />
                </div>
                <div>
                  <Label htmlFor="dept-desc">Descripción</Label>
                  <Input
                    id="dept-desc"
                    value={deptForm.description}
                    onChange={(e) => setDeptForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción del departamento"
                  />
                </div>
                <div>
                  <Label htmlFor="dept-color">Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="dept-color"
                      value={deptForm.color}
                      onChange={(e) => setDeptForm(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 rounded border"
                    />
                    <Input value={deptForm.color} readOnly />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreatingDept(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateDepartment}>
                    Crear Departamento
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreatingTeam} onOpenChange={setIsCreatingTeam}>
            <DialogTrigger asChild>
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Nuevo Equipo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Equipo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="team-name">Nombre</Label>
                  <Input
                    id="team-name"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ej. Equipo Mercantil, Equipo Penal"
                  />
                </div>
                <div>
                  <Label htmlFor="team-dept">Departamento</Label>
                  <Select 
                    value={teamForm.department_id} 
                    onValueChange={(value) => setTeamForm(prev => ({ ...prev, department_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="team-desc">Descripción</Label>
                  <Input
                    id="team-desc"
                    value={teamForm.description}
                    onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción del equipo"
                  />
                </div>
                <div>
                  <Label htmlFor="team-color">Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="team-color"
                      value={teamForm.color}
                      onChange={(e) => setTeamForm(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 rounded border"
                    />
                    <Input value={teamForm.color} readOnly />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreatingTeam(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTeam}>
                    Crear Equipo
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Departments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Departamentos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(dept => (
            <Card key={dept.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: dept.color }}
                  />
                  {dept.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{dept.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {teams.filter(t => t.department_id === dept.id).length} equipos
                  </Badge>
                  <Button size="sm" variant="ghost">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Teams */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Equipos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <Card key={team.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: team.color }}
                  />
                  {team.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{team.description}</p>
                {team.department && (
                  <Badge variant="outline" className="mb-3">
                    {team.department.name}
                  </Badge>
                )}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {team.members_count || 0} miembros
                  </Badge>
                  <Button size="sm" variant="ghost">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
