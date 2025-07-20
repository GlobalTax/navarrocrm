
import { useState } from 'react'

export const useNifValidation = (initialNif: string = '') => {
  const [nif, setNif] = useState<string>(initialNif)

  const formatNif = (value: string): void => {
    // Formato automático del NIF/CIF mientras se escribe
    const cleaned = value.replace(/[\s-]/g, '').toUpperCase()
    if (cleaned.length <= 9) {
      setNif(cleaned)
    }
  }

  const isValidFormat = (nif: string): boolean => {
    const cleanNif = nif.replace(/[\s-]/g, '').toUpperCase()
    const nifRegex = /^[0-9]{8}[A-Z]$/
    const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
    
    return nifRegex.test(cleanNif) || cifRegex.test(cleanNif) || nieRegex.test(cleanNif)
  }

  const getValidationMessage = (): string | null => {
    if (!nif) return null
    if (!isValidFormat(nif)) {
      return 'Formato no válido. Ejemplos: B12345678, 12345678Z, X1234567L'
    }
    return null
  }

  return {
    nif,
    setNif,
    formatNif,
    isValidFormat,
    getValidationMessage
  }
}
