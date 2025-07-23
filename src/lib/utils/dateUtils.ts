
import { format, parseISO, isValid, differenceInDays, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Utilidades de fecha centralizadas usando date-fns
 */

export const formatDate = (date: string | Date, formatStr = 'dd/MM/yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return 'Fecha inválida'
    return format(dateObj, formatStr, { locale: es })
  } catch {
    return 'Fecha inválida'
  }
}

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

export const formatTimeAgo = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const daysDiff = differenceInDays(new Date(), dateObj)
    
    if (daysDiff === 0) return 'Hoy'
    if (daysDiff === 1) return 'Ayer'
    if (daysDiff < 7) return `Hace ${daysDiff} días`
    if (daysDiff < 30) return `Hace ${Math.floor(daysDiff / 7)} semanas`
    if (daysDiff < 365) return `Hace ${Math.floor(daysDiff / 30)} meses`
    return `Hace ${Math.floor(daysDiff / 365)} años`
  } catch {
    return 'Fecha inválida'
  }
}

export const isOverdue = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return differenceInDays(dateObj, new Date()) < 0
  } catch {
    return false
  }
}

export const addBusinessDays = (date: Date, days: number): Date => {
  let result = new Date(date)
  let addedDays = 0
  
  while (addedDays < days) {
    result = addDays(result, 1)
    if (result.getDay() !== 0 && result.getDay() !== 6) { // No es domingo (0) ni sábado (6)
      addedDays++
    }
  }
  
  return result
}
