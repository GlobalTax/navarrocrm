import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

// Interface mínima para detección de duplicados
export interface ExistingContact {
  id: string
  name: string
  email: string | null
  phone: string | null
  dni_nif: string | null
  org_id: string
}

export const useExistingContacts = () => {
  return useQuery({
    queryKey: ['existing-contacts'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Usuario no autenticado')
      }

      const { data: userProfile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userData.user.id)
        .single()

      if (!userProfile?.org_id) {
        throw new Error('No se pudo obtener la organización del usuario')
      }

      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, email, phone, dni_nif, org_id')
        .eq('org_id', userProfile.org_id)

      if (error) throw error

      return (data || []) as ExistingContact[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Función para normalizar texto para comparación
const normalizeText = (text: string): string => {
  return text?.toLowerCase().trim().replace(/\s+/g, ' ') || ''
}

// Función para calcular similaridad de nombres (simple)
const calculateNameSimilarity = (name1: string, name2: string): number => {
  const n1 = normalizeText(name1)
  const n2 = normalizeText(name2)
  
  if (n1 === n2) return 1
  
  // Similaridad básica usando coincidencias de palabras
  const words1 = n1.split(' ')
  const words2 = n2.split(' ')
  
  let matches = 0
  for (const word1 of words1) {
    if (words2.some(word2 => word1.includes(word2) || word2.includes(word1))) {
      matches++
    }
  }
  
  return matches / Math.max(words1.length, words2.length)
}

// Función para detectar duplicados
export interface DuplicateInfo {
  isDuplicate: boolean
  reason: string
  existingContact?: ExistingContact
  similarity?: number
}

export const detectDuplicate = (
  quantumCustomer: any, 
  existingContacts: ExistingContact[]
): DuplicateInfo => {
  const customerEmail = quantumCustomer.email?.toLowerCase().trim()
  const customerNif = quantumCustomer.nif?.toLowerCase().trim()
  const customerPhone = quantumCustomer.phone?.trim()
  const customerName = quantumCustomer.name

  for (const contact of existingContacts) {
    // 1. Verificar email exacto (más confiable)
    if (customerEmail && contact.email && 
        normalizeText(customerEmail) === normalizeText(contact.email)) {
      return {
        isDuplicate: true,
        reason: 'Email idéntico',
        existingContact: contact,
        similarity: 1
      }
    }

    // 2. Verificar DNI/NIF exacto (muy confiable)
    if (customerNif && contact.dni_nif && 
        normalizeText(customerNif) === normalizeText(contact.dni_nif)) {
      return {
        isDuplicate: true,
        reason: 'DNI/NIF idéntico',
        existingContact: contact,
        similarity: 1
      }
    }

    // 3. Verificar nombre similar + teléfono (para casos sin email/DNI)
    if (customerPhone && contact.phone) {
      const phoneSimilar = normalizeText(customerPhone) === normalizeText(contact.phone)
      const nameSimilarity = calculateNameSimilarity(customerName, contact.name)
      
      if (phoneSimilar && nameSimilarity > 0.8) {
        return {
          isDuplicate: true,
          reason: 'Nombre similar + teléfono idéntico',
          existingContact: contact,
          similarity: nameSimilarity
        }
      }
    }

    // 4. Verificar solo nombre muy similar (umbral alto para evitar falsos positivos)
    const nameSimilarity = calculateNameSimilarity(customerName, contact.name)
    if (nameSimilarity > 0.95) {
      return {
        isDuplicate: true,
        reason: 'Nombre muy similar',
        existingContact: contact,
        similarity: nameSimilarity
      }
    }
  }

  return {
    isDuplicate: false,
    reason: 'No se encontraron duplicados'
  }
}