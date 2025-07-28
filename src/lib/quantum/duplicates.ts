/**
 * Detección de duplicados mejorada con algoritmo de Levenshtein
 */

import { distance } from 'fastest-levenshtein'
import { normalizeText, normalizeNif, normalizeEmail, normalizePhone } from './normalization'
import type { ExistingContact } from '@/hooks/useExistingContacts'

export interface DuplicateInfo {
  isDuplicate: boolean
  reason: string
  existingContact?: ExistingContact
  similarity?: number
}

/**
 * Calcula similitud de nombres usando algoritmo de Levenshtein
 */
export const calculateNameSimilarity = (name1: string, name2: string): number => {
  const n1 = normalizeText(name1)
  const n2 = normalizeText(name2)
  
  if (n1 === n2) return 1
  if (!n1 || !n2) return 0
  
  const maxLen = Math.max(n1.length, n2.length)
  if (maxLen === 0) return 1
  
  const dist = distance(n1, n2)
  return (maxLen - dist) / maxLen
}

/**
 * Detecta duplicados usando múltiples criterios con prioridades
 */
export const detectDuplicate = (
  quantumCustomer: any, 
  existingContacts: ExistingContact[]
): DuplicateInfo => {
  // Normalizar datos del customer
  const customerEmail = normalizeEmail(quantumCustomer.email || '')
  const customerNif = normalizeNif(quantumCustomer.nif || '')
  const customerPhone = normalizePhone(quantumCustomer.phone || '')
  const customerName = normalizeText(quantumCustomer.name || '')
  const customerQuantumId = quantumCustomer.customerId

  for (const contact of existingContacts) {
    // PRIORIDAD 1: quantum_customer_id (más confiable)
    if (customerQuantumId && (contact as any).quantum_customer_id === customerQuantumId) {
      return {
        isDuplicate: true,
        reason: 'ID de Quantum idéntico',
        existingContact: contact,
        similarity: 1
      }
    }

    // PRIORIDAD 2: DNI/NIF exacto (muy confiable)
    if (customerNif && contact.dni_nif) {
      const contactNif = normalizeNif(contact.dni_nif)
      if (customerNif === contactNif && customerNif.length > 3) {
        return {
          isDuplicate: true,
          reason: 'DNI/NIF idéntico',
          existingContact: contact,
          similarity: 1
        }
      }
    }

    // PRIORIDAD 3: Email exacto (muy confiable)
    if (customerEmail && contact.email) {
      const contactEmail = normalizeEmail(contact.email)
      if (customerEmail === contactEmail && customerEmail.length > 5) {
        return {
          isDuplicate: true,
          reason: 'Email idéntico',
          existingContact: contact,
          similarity: 1
        }
      }
    }

    // PRIORIDAD 4: Nombre similar + teléfono (moderadamente confiable)
    if (customerPhone && contact.phone && customerName && contact.name) {
      const contactPhone = normalizePhone(contact.phone)
      const nameSimilarity = calculateNameSimilarity(customerName, contact.name)
      
      if (customerPhone === contactPhone && 
          customerPhone.length >= 9 && 
          nameSimilarity > 0.8) {
        return {
          isDuplicate: true,
          reason: 'Nombre similar + teléfono idéntico',
          existingContact: contact,
          similarity: nameSimilarity
        }
      }
    }

    // PRIORIDAD 5: Nombre muy similar (umbral alto para evitar falsos positivos)
    if (customerName && contact.name) {
      const nameSimilarity = calculateNameSimilarity(customerName, contact.name)
      if (nameSimilarity > 0.95 && customerName.length > 5) {
        return {
          isDuplicate: true,
          reason: 'Nombre prácticamente idéntico',
          existingContact: contact,
          similarity: nameSimilarity
        }
      }
    }
  }

  return {
    isDuplicate: false,
    reason: 'No se encontraron duplicados'
  }
}

/**
 * Detecta duplicados usando criterios específicos para Edge Function
 */
export const detectDuplicateForSync = (
  quantumCustomer: any,
  existingContacts: any[]
): boolean => {
  const customerEmail = normalizeEmail(quantumCustomer.email || '')
  const customerNif = normalizeNif(quantumCustomer.nif || '')
  const customerPhone = normalizePhone(quantumCustomer.phone || '')
  const customerName = normalizeText(quantumCustomer.name || '')
  const customerQuantumId = quantumCustomer.customerId

  return existingContacts.some(contact => {
    // 1. Quantum Customer ID exacto
    if (customerQuantumId && contact.quantum_customer_id === customerQuantumId) {
      return true
    }
    
    // 2. DNI/NIF exacto
    if (customerNif && contact.dni_nif) {
      const contactNif = normalizeNif(contact.dni_nif)
      if (customerNif === contactNif && customerNif.length > 3) {
        return true
      }
    }
    
    // 3. Email exacto
    if (customerEmail && contact.email) {
      const contactEmail = normalizeEmail(contact.email)
      if (customerEmail === contactEmail && customerEmail.length > 5) {
        return true
      }
    }
    
    // 4. Nombre exacto + teléfono
    if (customerPhone && contact.phone && customerName && contact.name) {
      const contactPhone = normalizePhone(contact.phone)
      const contactName = normalizeText(contact.name)
      
      if (customerPhone === contactPhone && 
          customerName === contactName && 
          customerPhone.length >= 9 && 
          customerName.length > 3) {
        return true
      }
    }
    
    return false
  })
}