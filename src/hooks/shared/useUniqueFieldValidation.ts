
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useUniqueFieldValidation')

interface UniqueValidationResult {
  isValid: boolean
  isChecking: boolean
  error?: string
  existingRecord?: any
}

interface UseUniqueFieldValidationOptions {
  fieldName: string
  tableName: string
  currentId?: string
  debounceMs?: number
  enabled?: boolean
  customMessage?: string
}

export const useUniqueFieldValidation = ({
  fieldName,
  tableName,
  currentId,
  debounceMs = 500,
  enabled = true,
  customMessage
}: UseUniqueFieldValidationOptions) => {
  const { user } = useApp()
  const [result, setResult] = useState<UniqueValidationResult>({
    isValid: true,
    isChecking: false
  })

  const checkUniqueness = useCallback(async (value: string) => {
    if (!value?.trim() || !enabled || !user?.org_id) {
      setResult({ isValid: true, isChecking: false })
      return
    }

    setResult(prev => ({ ...prev, isChecking: true }))

    try {
      logger.debug('Checking field uniqueness', {
        fieldName,
        tableName,
        value: value.substring(0, 10) + '...',
        currentId,
        orgId: user.org_id
      })

      let query = supabase
        .from(tableName as any)
        .select('id, ' + fieldName)
        .eq('org_id', user.org_id)
        .eq(fieldName, value)

      // Excluir el registro actual si estamos editando
      if (currentId) {
        query = query.neq('id', currentId)
      }

      const { data, error } = await query

      if (error) {
        logger.error('Error checking uniqueness', { error, fieldName, tableName })
        setResult({
          isValid: false,
          isChecking: false,
          error: 'Error al verificar disponibilidad'
        })
        return
      }

      const isUnique = !data || data.length === 0
      const defaultMessage = `Este ${fieldName} ya está registrado`

      setResult({
        isValid: isUnique,
        isChecking: false,
        error: isUnique ? undefined : (customMessage || defaultMessage),
        existingRecord: isUnique ? undefined : data[0]
      })

      logger.debug('Uniqueness check completed', {
        fieldName,
        value: value.substring(0, 10) + '...',
        isUnique,
        existingRecords: data?.length || 0
      })

    } catch (error) {
      logger.error('Unexpected error in uniqueness check', { error, fieldName, tableName })
      setResult({
        isValid: false,
        isChecking: false,
        error: 'Error inesperado al verificar disponibilidad'
      })
    }
  }, [fieldName, tableName, currentId, enabled, user?.org_id, customMessage])

  const debouncedCheck = useCallback(
    debounce(checkUniqueness, debounceMs),
    [checkUniqueness, debounceMs]
  )

  return {
    ...result,
    checkUniqueness: debouncedCheck
  }
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}
