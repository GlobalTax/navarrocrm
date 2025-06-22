
import { supabase } from '@/integrations/supabase/client'

export const createOrganization = async () => {
  console.log('🏢 Verificando organizaciones existentes...')
  
  // First check if any organization already exists
  const { data: existingOrgs, error: checkError } = await supabase
    .from('organizations')
    .select('id, name')
    .limit(1)

  if (checkError) {
    console.error('❌ Error verificando organizaciones:', checkError)
    throw checkError
  }

  // If an organization exists, use it
  if (existingOrgs && existingOrgs.length > 0) {
    console.log('✅ Usando organización existente:', existingOrgs[0].name)
    return existingOrgs[0]
  }

  // If no organization exists, create a new one
  console.log('🆕 Creando nueva organización...')
  const { data: org, error: createError } = await supabase
    .from('organizations')
    .insert({
      name: 'Bufete García & Asociados'
    })
    .select()
    .single()

  if (createError) {
    console.error('❌ Error creando organización:', createError)
    throw createError
  }

  console.log('✅ Organización creada:', org.name)
  return org
}
