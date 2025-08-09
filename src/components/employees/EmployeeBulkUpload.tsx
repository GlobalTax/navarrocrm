import { useState } from 'react'
import { BaseBulkUploadDialog, BulkUploadConfig, ValidationError } from '@/components/bulk-upload/BaseBulkUploadDialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { useEmployeeBulkUpload } from './hooks/useEmployeeBulkUpload'

interface EmployeeBulkUploadProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EmployeeBulkUpload({ open, onClose, onSuccess }: EmployeeBulkUploadProps) {
  const { validator, processor, templateData } = useEmployeeBulkUpload()

  const config: BulkUploadConfig = {
    dataType: 'empleados',
    title: 'Carga Masiva de Empleados',
    tableName: 'simple_employees',
    batchSize: 50,
    templateData,
    validator,
    processor
  }

  const customValidationDisplay = (errors: ValidationError[]) => {
    const errorsByType = errors.reduce((acc, error) => {
      const type = error.field === 'email' ? 'email' : 
                   error.field === 'dni_nie' ? 'dni' :
                   error.field === 'employee_number' ? 'numero' : 'otros'
      if (!acc[type]) acc[type] = []
      acc[type].push(error)
      return acc
    }, {} as Record<string, ValidationError[]>)

    return (
      <div className="space-y-4">
        <Alert variant="destructive" className="border-0.5 border-red-300 rounded-[10px]">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">Se encontraron {errors.length} errores que deben corregirse:</span>
                <Badge variant="destructive">{errors.length}</Badge>
              </div>
              
              {Object.entries(errorsByType).map(([type, typeErrors]) => (
                <div key={type} className="space-y-2">
                  <h4 className="font-medium capitalize">
                    {type === 'email' ? 'Errores de Email' :
                     type === 'dni' ? 'Errores de DNI/NIE' :
                     type === 'numero' ? 'Errores de Número de Empleado' : 'Otros Errores'}
                    <Badge variant="outline" className="ml-2">{typeErrors.length}</Badge>
                  </h4>
                  <div className="max-h-32 overflow-y-auto bg-red-50 p-2 rounded border">
                    {typeErrors.slice(0, 5).map((error, index) => (
                      <p key={index} className="text-sm text-red-800">
                        <strong>Fila {error.row}:</strong> {error.message}
                        {error.suggestion && (
                          <span className="text-red-600 italic"> ({error.suggestion})</span>
                        )}
                      </p>
                    ))}
                    {typeErrors.length > 5 && (
                      <p className="text-sm text-red-600 font-medium">
                        ... y {typeErrors.length - 5} errores más de este tipo
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const customPreviewDisplay = (data: any[]) => {
    const stats = {
      activos: data.filter(emp => emp.status === 'active').length,
      inactivos: data.filter(emp => emp.status === 'inactive').length,
      baja: data.filter(emp => emp.status === 'on_leave').length,
      departamentos: new Set(data.map(emp => emp.department).filter(Boolean)).size
    }

    return (
      <div className="space-y-4">
        <Alert className="border-0.5 border-green-300 rounded-[10px]">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <p className="font-medium">
                Archivo procesado correctamente. {data.length} empleados listos para importar.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-green-50 p-2 rounded border">
                  <p className="text-sm font-medium text-green-800">Activos</p>
                  <p className="text-lg font-bold text-green-900">{stats.activos}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded border">
                  <p className="text-sm font-medium text-gray-600">Inactivos</p>
                  <p className="text-lg font-bold text-gray-700">{stats.inactivos}</p>
                </div>
                <div className="bg-yellow-50 p-2 rounded border">
                  <p className="text-sm font-medium text-yellow-600">De Baja</p>
                  <p className="text-lg font-bold text-yellow-700">{stats.baja}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded border">
                  <p className="text-sm font-medium text-blue-600">Departamentos</p>
                  <p className="text-lg font-bold text-blue-700">{stats.departamentos}</p>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-[10px] p-4">
          <h4 className="font-medium mb-3">Vista previa de empleados:</h4>
          <div className="space-y-2">
            {data.slice(0, 5).map((emp, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                <div className="flex items-center gap-3">
                  <Badge variant={emp.status === 'active' ? 'default' : 'secondary'}>
                    {emp.status === 'active' ? 'Activo' : 
                     emp.status === 'inactive' ? 'Inactivo' : 'De Baja'}
                  </Badge>
                  <span className="font-medium">{emp.name}</span>
                  <span className="text-sm text-gray-600">{emp.email}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{emp.position}</p>
                  <p className="text-xs text-gray-500">{emp.department}</p>
                </div>
              </div>
            ))}
          </div>
          {data.length > 5 && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              ... y {data.length - 5} empleados más
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <BaseBulkUploadDialog
      open={open}
      onClose={onClose}
      onSuccess={onSuccess}
      config={config}
      customValidationDisplay={customValidationDisplay}
      customPreviewDisplay={customPreviewDisplay}
    >
      <div className="space-y-4">
        <Alert className="border-0.5 border-blue-300 rounded-[10px]">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Información sobre la carga masiva:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Campos obligatorios: <strong>name, email, position, hire_date</strong></li>
                <li>Formato de fecha: <strong>YYYY-MM-DD</strong> (ej: 2024-01-15)</li>
                <li>Estados válidos: <strong>active, inactive, on_leave</strong></li>
                <li>Se detectarán duplicados por: <strong>email, dni_nie, employee_number</strong></li>
                <li>Máximo 200 empleados por archivo</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </BaseBulkUploadDialog>
  )
}