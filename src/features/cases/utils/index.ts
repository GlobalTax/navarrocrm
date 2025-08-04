/**
 * Cases Utils - Funciones utilitarias para casos
 */

import { Case, CaseStats, CaseStatus } from '../types'
import { CASE_STATUS_COLORS, CASE_PRIORITY_COLORS } from '../constants'

/**
 * Calcular estadísticas de casos
 */
export const calculateCaseStats = (cases: Case[]): CaseStats => {
  return {
    total: cases.length,
    open: cases.filter(c => c.status === 'open').length,
    closed: cases.filter(c => c.status === 'closed').length,
    on_hold: cases.filter(c => c.status === 'on_hold').length
  }
}

/**
 * Formatear estado de caso para mostrar
 */
export const formatCaseStatus = (status: CaseStatus): string => {
  const statusMap = {
    open: 'Abierto',
    on_hold: 'En espera',
    closed: 'Cerrado'
  }
  return statusMap[status] || status
}

/**
 * Obtener color CSS para el estado del caso
 */
export const getCaseStatusColor = (status: CaseStatus): string => {
  return CASE_STATUS_COLORS[status] || CASE_STATUS_COLORS.open
}

/**
 * Obtener color CSS para la prioridad del caso
 */
export const getCasePriorityColor = (priority: string): string => {
  return CASE_PRIORITY_COLORS[priority as keyof typeof CASE_PRIORITY_COLORS] || CASE_PRIORITY_COLORS.medium
}

/**
 * Generar número de expediente
 */
export const generateMatterNumber = (prefix: string = 'EXP'): string => {
  const year = new Date().getFullYear()
  const timestamp = Date.now().toString().slice(-6)
  return `${prefix}-${year}-${timestamp}`
}

/**
 * Validar datos de caso
 */
export const validateCaseData = (data: Partial<Case>): string[] => {
  const errors: string[] = []
  
  if (!data.title?.trim()) {
    errors.push('El título es requerido')
  }
  
  if (!data.contact_id) {
    errors.push('El cliente es requerido')
  }
  
  if (!data.billing_method) {
    errors.push('El método de facturación es requerido')
  }
  
  return errors
}

/**
 * Filtrar casos por texto de búsqueda
 */
export const filterCasesBySearch = (cases: Case[], searchTerm: string): Case[] => {
  if (!searchTerm.trim()) return cases
  
  const search = searchTerm.toLowerCase()
  return cases.filter(case_ => 
    case_.title.toLowerCase().includes(search) ||
    case_.description?.toLowerCase().includes(search) ||
    case_.matter_number?.toLowerCase().includes(search) ||
    case_.contact?.name?.toLowerCase().includes(search)
  )
}

/**
 * Ordenar casos por criterio
 */
export const sortCases = (cases: Case[], criteria: 'title' | 'created_at' | 'status', ascending = true): Case[] => {
  return [...cases].sort((a, b) => {
    let aVal: any, bVal: any
    
    switch (criteria) {
      case 'title':
        aVal = a.title.toLowerCase()
        bVal = b.title.toLowerCase()
        break
      case 'created_at':
        aVal = new Date(a.created_at)
        bVal = new Date(b.created_at)
        break
      case 'status':
        aVal = a.status
        bVal = b.status
        break
      default:
        return 0
    }
    
    if (aVal < bVal) return ascending ? -1 : 1
    if (aVal > bVal) return ascending ? 1 : -1
    return 0
  })
}