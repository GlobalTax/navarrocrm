
import { supabase } from '@/integrations/supabase/client'
import type { SeedResult } from './types'
import { createOrganization } from './organizationData'
import { createUsers } from './userData'
import { createPracticeAreas } from './practiceAreaData'
import { createClients } from './clientData'
import { createCases } from './caseData'
import { createTasks, createTaskAssignments } from './taskData'
import { createTimeEntries } from './timeEntryData'
import { createCalendarEvents } from './calendarData'
import { createClientNotes } from './clientNotesData'

export const seedLegalFirmData = async (): Promise<SeedResult> => {
  try {
    console.log('🌱 Iniciando población de datos ficticios...')

    // 1. Get or create organization
    const org = await createOrganization()
    console.log(`📋 Organización seleccionada: ${org.name} (ID: ${org.id})`)

    // Check if data already exists for this organization
    console.log('🔍 Verificando datos existentes...')
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .eq('org_id', org.id)
      .limit(1)

    if (existingUsers && existingUsers.length > 0) {
      console.log('⚠️ Ya existen datos para esta organización. Saltando creación de datos ficticios.')
      return { 
        success: true, 
        orgId: org.id,
        message: 'Datos ya existentes - no se crearon nuevos datos ficticios'
      }
    }

    // 2. Create users for the firm
    console.log('👥 Creando usuarios del despacho...')
    const createdUsers = await createUsers(org.id)
    console.log(`✅ Usuarios creados: ${createdUsers.length}`)

    // 3. Create practice areas
    console.log('⚖️ Creando áreas de práctica...')
    await createPracticeAreas(org.id)
    console.log('✅ Áreas de práctica creadas')

    // 4. Create fictional clients
    console.log('👤 Creando clientes ficticios...')
    const createdClients = await createClients(org.id)
    console.log(`✅ Clientes creados: ${createdClients.length}`)

    // 5. Create legal cases
    console.log('📁 Creando casos legales...')
    const createdCases = await createCases(org.id, createdClients)
    console.log(`✅ Casos creados: ${createdCases.length}`)

    // 6. Create diverse legal tasks
    console.log('📋 Creando tareas legales...')
    const createdTasks = await createTasks(org.id, createdCases, createdClients, createdUsers)
    console.log(`✅ Tareas creadas: ${createdTasks.length}`)

    // 7. Assign tasks to users
    console.log('🔗 Asignando tareas a usuarios...')
    await createTaskAssignments(createdTasks, createdUsers)
    console.log('✅ Asignaciones de tareas creadas')

    // 8. Create time entries
    console.log('⏱️ Creando entradas de tiempo...')
    await createTimeEntries(org.id, createdUsers, createdCases)
    console.log('✅ Entradas de tiempo creadas')

    // 9. Create calendar events
    console.log('📅 Creando eventos de calendario...')
    await createCalendarEvents(org.id, createdClients, createdCases, createdUsers)
    console.log('✅ Eventos de calendario creados')

    // 10. Create client notes
    console.log('📝 Creando notas de clientes...')
    await createClientNotes(org.id, createdClients, createdUsers)
    console.log('✅ Notas de clientes creadas')

    console.log('✅ Datos ficticios creados exitosamente!')
    console.log(`📊 Resumen:`)
    console.log(`   • Organización: ${org.name}`)
    console.log(`   • Usuarios: ${createdUsers.length}`)
    console.log(`   • Clientes: ${createdClients.length}`)
    console.log(`   • Casos: ${createdCases.length}`)
    console.log(`   • Tareas legales: ${createdTasks.length}`)

    return { success: true, orgId: org.id }

  } catch (error) {
    console.error('❌ Error creando datos ficticios:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Error desconocido'
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error)
    }
    
    return { 
      success: false, 
      error: errorMessage,
      details: error 
    }
  }
}
