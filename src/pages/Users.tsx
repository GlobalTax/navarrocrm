
import { useState } from 'react'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users as UsersIcon, 
  UserPlus, 
  Search, 
  Mail,
  Shield,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'
import { UserFormDialog } from '@/components/users/UserFormDialog'
import { UserInviteDialog } from '@/components/users/UserInviteDialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const Users = () => {
  const { users, isLoading } = useUsers()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [showUserForm, setShowUserForm] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  const roles = ['all', 'partner', 'area_manager', 'senior', 'junior', 'finance']
  
  const getRoleLabel = (role: string) => {
    const labels = {
      partner: 'Partner',
      area_manager: 'Area Manager',
      senior: 'Senior',
      junior: 'Junior',
      finance: 'Finanzas'
    }
    return labels[role as keyof typeof labels] || role
  }

  const getRoleColor = (role: string) => {
    const colors = {
      partner: 'bg-purple-50 text-purple-700 border-purple-200',
      area_manager: 'bg-blue-50 text-blue-700 border-blue-200',
      senior: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      junior: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      finance: 'bg-orange-50 text-orange-700 border-orange-200'
    }
    return colors[role as keyof typeof colors] || 'bg-slate-50 text-slate-600 border-slate-200'
  }

  const getUserStats = () => {
    return {
      total: users.length,
      partners: users.filter(u => u.role === 'partner').length,
      managers: users.filter(u => u.role === 'area_manager').length,
      seniors: users.filter(u => u.role === 'senior').length,
      juniors: users.filter(u => u.role === 'junior').length,
      finance: users.filter(u => u.role === 'finance').length
    }
  }

  const stats = getUserStats()

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setShowUserForm(true)
  }

  const handleInviteUser = () => {
    setShowInviteDialog(true)
  }

  if (isLoading) {
    return (
      <StandardPageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      </StandardPageContainer>
    )
  }

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Gestión de Usuarios"
        description="Administra los usuarios de tu asesoría"
        primaryAction={{
          label: 'Invitar Usuario',
          onClick: handleInviteUser
        }}
      />

      {/* Métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600">Total</div>
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
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-orange-700">{stats.finance}</div>
            <div className="text-sm text-slate-600">Finanzas</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="border-slate-200 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar usuarios por email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {roles.map((role) => (
                <Button
                  key={role}
                  variant={selectedRole === role ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole(role)}
                  className={selectedRole === role ? 
                    "bg-slate-900 hover:bg-slate-800" : 
                    "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }
                >
                  {role === 'all' ? 'Todos' : getRoleLabel(role)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuarios */}
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Usuarios ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchTerm || selectedRole !== 'all' ? 'No se encontraron usuarios' : 'No hay usuarios'}
              </h3>
              <p className="text-slate-600 mb-4">
                {searchTerm || selectedRole !== 'all' ? 
                  'Intenta ajustar los filtros de búsqueda' : 
                  'Comienza invitando tu primer usuario'
                }
              </p>
              {!searchTerm && selectedRole === 'all' && (
                <Button onClick={handleInviteUser} className="bg-slate-900 hover:bg-slate-800">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invitar Usuario
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Mail className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900">{user.email}</h4>
                        <Badge className={`${getRoleColor(user.role)} text-xs font-medium border`}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {getRoleLabel(user.role)}
                        </div>
                        <span>Creado: {new Date(user.created_at).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-slate-600 hover:text-slate-900">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogos */}
      <UserFormDialog
        open={showUserForm}
        onOpenChange={setShowUserForm}
        user={selectedUser}
        onClose={() => {
          setShowUserForm(false)
          setSelectedUser(null)
        }}
      />

      <UserInviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onClose={() => setShowInviteDialog(false)}
      />
    </StandardPageContainer>
  )
}

export default Users
