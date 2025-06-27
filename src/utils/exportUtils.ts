
import { Case } from '@/hooks/useCases'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const exportCasesToCSV = (cases: Case[], filename: string = 'expedientes') => {
  try {
    // Definir las columnas que queremos exportar
    const headers = [
      'ID',
      'Título',
      'Estado',
      'Área de Práctica',
      'Fecha de Creación',
      'Fecha de Actualización',
      'Presupuesto Estimado',
      'Método de Facturación',
      'Descripción'
    ]

    // Convertir los casos a filas CSV
    const rows = cases.map(case_ => [
      case_.id.slice(0, 8),
      case_.title || '',
      case_.status || '',
      case_.practice_area || '',
      case_.created_at ? format(new Date(case_.created_at), 'dd/MM/yyyy', { locale: es }) : '',
      case_.updated_at ? format(new Date(case_.updated_at), 'dd/MM/yyyy', { locale: es }) : '',
      case_.estimated_budget ? `€${case_.estimated_budget.toLocaleString()}` : '',
      case_.billing_method || '',
      case_.description || ''
    ])

    // Combinar headers y rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(','))
      .join('\n')

    // Crear y descargar el archivo
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return true
  } catch (error) {
    console.error('Error exportando expedientes:', error)
    return false
  }
}
