
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

    // 1. Crear organización de ejemplo
    const org = await createOrganization()

    // 2. Crear usuarios del despacho
    const createdUsers = await createUsers(org.id)

    // 3. Crear áreas de práctica
    await createPracticeAreas(org.id)

    // 4. Crear clientes ficticios
    const createdClients = await createClients(org.id)

    // 5. Crear casos legales
    const createdCases = await createCases(org.id, createdClients)

    // 6. Crear tareas legales diversas
    const createdTasks = await createTasks(org.id, createdCases, createdClients, createdUsers)

    // 7. Asignar tareas a usuarios
    await createTaskAssignments(createdTasks, createdUsers)

    // 8. Crear entradas de tiempo
    await createTimeEntries(org.id, createdUsers, createdCases)

    // 9. Crear eventos de calendario
    await createCalendarEvents(org.id, createdClients, createdCases, createdUsers)

    // 10. Crear notas de clientes
    await createClientNotes(org.id, createdClients, createdUsers)

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
    return { success: false, error }
  }
}
