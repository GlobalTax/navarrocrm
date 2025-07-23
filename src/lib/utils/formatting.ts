
/**
 * Utilidades de formateo centralizadas
 */

export const formatCurrency = (amount: number, currency = '€'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency === '€' ? 'EUR' : 'EUR'
  }).format(amount)
}

export const formatNumber = (num: number, decimals = 2): string => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${formatNumber(value, decimals)}%`
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const formatName = (firstName?: string, lastName?: string): string => {
  const parts = [firstName, lastName].filter(Boolean)
  return parts.join(' ').trim()
}
