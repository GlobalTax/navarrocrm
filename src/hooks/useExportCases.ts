
import { toast } from 'sonner'
import Papa from 'papaparse'
import type { Case } from '@/hooks/useCases'

export const useExportCases = () => {
  const exportCasesToCSV = (cases: Case[], filename: string = 'expedientes') => {
    try {
      if (!cases || cases.length === 0) {
        toast.error('No hay expedientes para exportar')
        return
      }

      // Preparar datos para exportación
      const exportData = cases.map(case_ => ({
        'ID': case_.id || '',
        'Título': case_.title || '',
        'Cliente': case_.contact?.name || '',
        'Email Cliente': case_.contact?.email || '',
        'Teléfono Cliente': case_.contact?.phone || '',
        'Estado': case_.status || '',
        'Área de Práctica': case_.practice_area || '',
        'Método de Facturación': case_.billing_method || '',
        'Presupuesto Estimado': case_.estimated_budget || '',
        'Fecha Creación': case_.created_at ? new Date(case_.created_at).toLocaleDateString('es-ES') : '',
        'Fecha Actualización': case_.updated_at ? new Date(case_.updated_at).toLocaleDateString('es-ES') : '',
        'Descripción': case_.description || ''
      }))

      // Convertir a CSV
      const csv = Papa.unparse(exportData, {
        delimiter: ',',
        header: true
      })

      // Crear y descargar archivo
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
      toast.success(`Expedientes exportados correctamente (${cases.length} registros)`)
    } catch (error) {
      console.error('Error exporting cases:', error)
      toast.error('Error al exportar los expedientes')
    }
  }

  return {
    exportCasesToCSV
  }
}
