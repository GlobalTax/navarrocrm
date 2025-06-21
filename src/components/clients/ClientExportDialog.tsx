
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Table } from 'lucide-react'
import { Client } from '@/hooks/useClients'
import { toast } from 'sonner'
import Papa from 'papaparse'

interface ClientExportDialogProps {
  open: boolean
  onClose: () => void
  clients: Client[]
}

const EXPORT_FIELDS = {
  name: 'Nombre',
  email: 'Email',
  phone: 'Teléfono',
  dni_nif: 'DNI/NIF/CIF',
  client_type: 'Tipo de Cliente',
  status: 'Estado',
  business_sector: 'Sector',
  address_street: 'Dirección',
  address_city: 'Ciudad',
  address_postal_code: 'Código Postal',
  address_country: 'País',
  legal_representative: 'Representante Legal',
  contact_preference: 'Preferencia de Contacto',
  preferred_language: 'Idioma Preferido',
  hourly_rate: 'Tarifa por Hora',
  payment_method: 'Método de Pago',
  how_found_us: 'Cómo nos conoció',
  tags: 'Etiquetas',
  internal_notes: 'Notas Internas',
  created_at: 'Fecha de Creación',
  last_contact_date: 'Último Contacto'
}

export const ClientExportDialog = ({ open, onClose, clients }: ClientExportDialogProps) => {
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'name', 'email', 'phone', 'client_type', 'status', 'created_at'
  ])
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredClients = statusFilter === 'all' 
    ? clients 
    : clients.filter(client => client.status === statusFilter)

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    )
  }

  const selectAllFields = () => {
    setSelectedFields(Object.keys(EXPORT_FIELDS))
  }

  const selectEssentialFields = () => {
    setSelectedFields(['name', 'email', 'phone', 'client_type', 'status', 'created_at'])
  }

  const clearAllFields = () => {
    setSelectedFields([])
  }

  const formatFieldValue = (client: Client, field: string): string => {
    const value = client[field as keyof Client]
    
    if (value === null || value === undefined) return ''
    
    if (field === 'tags' && Array.isArray(value)) {
      return value.join(', ')
    }
    
    if (field === 'created_at' || field === 'last_contact_date') {
      return value ? new Date(value as string).toLocaleDateString() : ''
    }
    
    if (field === 'hourly_rate') {
      return value ? `${value}€` : ''
    }
    
    return String(value)
  }

  const exportData = () => {
    if (selectedFields.length === 0) {
      toast.error('Selecciona al menos un campo para exportar')
      return
    }

    const exportData = filteredClients.map(client => {
      const row: Record<string, string> = {}
      selectedFields.forEach(field => {
        row[EXPORT_FIELDS[field as keyof typeof EXPORT_FIELDS]] = formatFieldValue(client, field)
      })
      return row
    })

    if (exportFormat === 'csv') {
      const csv = Papa.unparse(exportData)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } else {
      const json = JSON.stringify(exportData, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.json`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }

    toast.success(`${filteredClients.length} clientes exportados exitosamente`)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Clientes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configuración de exportación */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Formato de Exportación</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={exportFormat} onValueChange={(value: 'csv' | 'json') => setExportFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <Table className="h-4 w-4" />
                        CSV (Excel compatible)
                      </div>
                    </SelectItem>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        JSON
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Filtrar por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="activo">Solo activos</SelectItem>
                    <SelectItem value="prospecto">Solo prospectos</SelectItem>
                    <SelectItem value="inactivo">Solo inactivos</SelectItem>
                    <SelectItem value="bloqueado">Solo bloqueados</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Resumen de exportación */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge className="bg-blue-100 text-blue-800">
                    {filteredClients.length} clientes
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    {selectedFields.length} campos
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  Formato: {exportFormat.toUpperCase()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selección de campos */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Campos a Exportar</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectEssentialFields}>
                    Esenciales
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectAllFields}>
                    Todos
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAllFields}>
                    Limpiar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {Object.entries(EXPORT_FIELDS).map(([field, label]) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={selectedFields.includes(field)}
                      onCheckedChange={() => handleFieldToggle(field)}
                    />
                    <label
                      htmlFor={field}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={exportData}
              disabled={selectedFields.length === 0 || filteredClients.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar {filteredClients.length} Cliente{filteredClients.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
