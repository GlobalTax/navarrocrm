
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Calendar, FolderOpen, Edit } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  created_at: string
}

interface Case {
  id: string
  title: string
  status: string
  created_at: string
}

interface ClientDetailDialogProps {
  client: Client | null
  open: boolean
  onClose: () => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-green-100 text-green-800'
    case 'closed':
      return 'bg-gray-100 text-gray-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-blue-100 text-blue-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'open':
      return 'Abierto'
    case 'closed':
      return 'Cerrado'
    case 'pending':
      return 'Pendiente'
    default:
      return status
  }
}

export const ClientDetailDialog = ({ client, open, onClose }: ClientDetailDialogProps) => {
  const { data: cases = [] } = useQuery({
    queryKey: ['client-cases', client?.id],
    queryFn: async () => {
      if (!client?.id) return []
      
      const { data, error } = await supabase
        .from('cases')
        .select('id, title, status, created_at')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching client cases:', error)
        return []
      }
      return data || []
    },
    enabled: !!client?.id,
  })

  if (!client) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalle del Cliente</span>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-2xl">{client.name}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                )}
                
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{client.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    Cliente desde {new Date(client.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Casos asociados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Casos ({cases.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cases.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay casos registrados para este cliente</p>
                  <Button className="mt-4" size="sm">
                    Crear primer caso
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cases.map((case_) => (
                    <div 
                      key={case_.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{case_.title}</h4>
                        <p className="text-sm text-gray-500">
                          Creado el {new Date(case_.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(case_.status)}>
                        {getStatusLabel(case_.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{cases.length}</div>
                <div className="text-sm text-gray-600">Casos Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {cases.filter(c => c.status === 'open').length}
                </div>
                <div className="text-sm text-gray-600">Casos Activos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {cases.filter(c => c.status === 'closed').length}
                </div>
                <div className="text-sm text-gray-600">Casos Cerrados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {cases.filter(c => c.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pendientes</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
