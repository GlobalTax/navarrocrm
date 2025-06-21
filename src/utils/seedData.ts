
import { supabase } from '@/integrations/supabase/client'

export const seedLegalFirmData = async () => {
  try {
    console.log('🌱 Iniciando población de datos ficticios...')

    // 1. Crear organización de ejemplo
    const { data: org } = await supabase
      .from('organizations')
      .insert({
        name: 'Bufete García & Asociados'
      })
      .select()
      .single()

    if (!org) throw new Error('No se pudo crear la organización')

    // 2. Crear usuarios del despacho
    const users = [
      { id: crypto.randomUUID(), email: 'partner@garcia-asociados.com', role: 'partner' },
      { id: crypto.randomUUID(), email: 'senior@garcia-asociados.com', role: 'senior' },
      { id: crypto.randomUUID(), email: 'junior@garcia-asociados.com', role: 'junior' },
      { id: crypto.randomUUID(), email: 'admin@garcia-asociados.com', role: 'admin' }
    ]

    const { data: createdUsers } = await supabase
      .from('users')
      .insert(users.map(user => ({ ...user, org_id: org.id })))
      .select()

    // 3. Crear áreas de práctica
    const practiceAreas = [
      { name: 'Derecho Civil', description: 'Contratos, responsabilidad civil, derecho de familia' },
      { name: 'Derecho Mercantil', description: 'Sociedades, concursos, derecho comercial' },
      { name: 'Derecho Laboral', description: 'Contratos laborales, despidos, seguridad social' },
      { name: 'Derecho Penal', description: 'Defensa penal, procedimientos penales' },
      { name: 'Derecho Tributario', description: 'Asesoría fiscal, procedimientos tributarios' }
    ]

    await supabase
      .from('practice_areas')
      .insert(practiceAreas.map(area => ({ ...area, org_id: org.id })))

    // 4. Crear clientes ficticios
    const clients = [
      {
        name: 'Constructora Mediterráneo S.L.',
        email: 'contacto@construcciones-med.com',
        phone: '+34 965 123 456',
        dni_nif: 'B12345678',
        client_type: 'empresa',
        address_street: 'Av. de la Construcción, 45',
        address_city: 'Valencia',
        address_postal_code: '46001',
        business_sector: 'Construcción',
        status: 'activo',
        hourly_rate: 180
      },
      {
        name: 'María Carmen López Ruiz',
        email: 'mcarmen.lopez@email.com',
        phone: '+34 678 901 234',
        dni_nif: '12345678A',
        client_type: 'particular',
        address_street: 'Calle Mayor, 123, 3º B',
        address_city: 'Madrid',
        address_postal_code: '28001',
        status: 'activo',
        hourly_rate: 120
      },
      {
        name: 'Restaurantes Gourmet Group S.A.',
        email: 'legal@gourmetgroup.es',
        phone: '+34 913 456 789',
        dni_nif: 'A87654321',
        client_type: 'empresa',
        address_street: 'Paseo de la Castellana, 200',
        address_city: 'Madrid',
        address_postal_code: '28046',
        business_sector: 'Hostelería',
        status: 'activo',
        hourly_rate: 200
      },
      {
        name: 'José Antonio Fernández García',
        email: 'ja.fernandez@email.com',
        phone: '+34 654 321 098',
        dni_nif: '87654321B',
        client_type: 'particular',
        address_street: 'Plaza del Carmen, 8, 2º A',
        address_city: 'Sevilla',
        address_postal_code: '41001',
        status: 'activo',
        hourly_rate: 140
      },
      {
        name: 'TechStart Solutions S.L.',
        email: 'legal@techstart.com',
        phone: '+34 932 567 890',
        dni_nif: 'B98765432',
        client_type: 'empresa',
        address_street: 'Rambla de Catalunya, 85',
        address_city: 'Barcelona',
        address_postal_code: '08008',
        business_sector: 'Tecnología',
        status: 'activo',
        hourly_rate: 160
      }
    ]

    const { data: createdClients } = await supabase
      .from('clients')
      .insert(clients.map(client => ({ ...client, org_id: org.id })))
      .select()

    // 5. Crear casos legales
    const cases = [
      {
        title: 'Reclamación contractual - Constructora Mediterráneo',
        description: 'Incumplimiento de contrato de obra pública. Reclamación de daños y perjuicios por retraso en la entrega.',
        client_id: createdClients![0].id,
        practice_area: 'Derecho Civil',
        status: 'open',
        matter_number: 'CV-2024-001',
        estimated_budget: 15000,
        billing_method: 'hourly'
      },
      {
        title: 'Divorcio contencioso - María Carmen López',
        description: 'Procedimiento de divorcio con custodia compartida y liquidación de bienes gananciales.',
        client_id: createdClients![1].id,
        practice_area: 'Derecho Civil',
        status: 'open',
        matter_number: 'CV-2024-002',
        estimated_budget: 8000,
        billing_method: 'fixed'
      },
      {
        title: 'Constitución sociedad - Gourmet Group',
        description: 'Constitución de nueva filial y reestructuración societaria del grupo empresarial.',
        client_id: createdClients![2].id,
        practice_area: 'Derecho Mercantil',
        status: 'open',
        matter_number: 'MC-2024-001',
        estimated_budget: 12000,
        billing_method: 'hourly'
      },
      {
        title: 'Despido improcedente - José Antonio Fernández',
        description: 'Demanda por despido improcedente. Reclamación de indemnización y salarios de tramitación.',
        client_id: createdClients![3].id,
        practice_area: 'Derecho Laboral',
        status: 'open',
        matter_number: 'LB-2024-001',
        estimated_budget: 5000,
        billing_method: 'success_fee'
      },
      {
        title: 'Asesoría fiscal integral - TechStart',
        description: 'Planificación fiscal, revisión de contratos y cumplimiento normativo para startup tecnológica.',
        client_id: createdClients![4].id,
        practice_area: 'Derecho Tributario',
        status: 'open',
        matter_number: 'TR-2024-001',
        estimated_budget: 18000,
        billing_method: 'retainer'
      }
    ]

    const { data: createdCases } = await supabase
      .from('cases')
      .insert(cases.map(caseItem => ({ ...caseItem, org_id: org.id })))
      .select()

    // 6. Crear tareas legales diversas
    const legalTasks = [
      // Tareas para el caso de construcción
      {
        title: 'Revisión contrato de obra principal',
        description: 'Análisis detallado de cláusulas contractuales y identificación de incumplimientos por parte del contratista principal.',
        case_id: createdCases![0].id,
        client_id: createdClients![0].id,
        status: 'completed',
        priority: 'high',
        due_date: '2024-06-15T00:00:00Z',
        estimated_hours: 8,
        created_by: createdUsers![0].id
      },
      {
        title: 'Redacción escrito de demanda',
        description: 'Preparación de demanda por incumplimiento contractual y reclamación de daños por importe de 250.000€.',
        case_id: createdCases![0].id,
        client_id: createdClients![0].id,
        status: 'drafting',
        priority: 'urgent',
        due_date: '2024-06-25T00:00:00Z',
        estimated_hours: 12,
        created_by: createdUsers![0].id
      },
      {
        title: 'Presentación demanda en Juzgado',
        description: 'Presentación de demanda en el Juzgado de Primera Instancia nº 3 de Valencia.',
        case_id: createdCases![0].id,
        client_id: createdClients![0].id,
        status: 'pending',
        priority: 'urgent',
        due_date: '2024-06-30T00:00:00Z',
        estimated_hours: 2,
        created_by: createdUsers![0].id
      },

      // Tareas para el divorcio
      {
        title: 'Inventario bienes gananciales',
        description: 'Elaboración de inventario completo de bienes gananciales para la liquidación del régimen económico matrimonial.',
        case_id: createdCases![1].id,
        client_id: createdClients![1].id,
        status: 'investigation',
        priority: 'medium',
        due_date: '2024-07-10T00:00:00Z',
        estimated_hours: 6,
        created_by: createdUsers![1].id
      },
      {
        title: 'Propuesta convenio regulador',
        description: 'Redacción de propuesta de convenio regulador incluyendo custodia compartida y uso de vivienda familiar.',
        case_id: createdCases![1].id,
        client_id: createdClients![1].id,
        status: 'drafting',
        priority: 'high',
        due_date: '2024-07-05T00:00:00Z',
        estimated_hours: 10,
        created_by: createdUsers![1].id
      },

      // Tareas mercantiles
      {
        title: 'Due diligence societario',
        description: 'Revisión completa de la estructura societaria actual y identificación de contingencias legales.',
        case_id: createdCases![2].id,
        client_id: createdClients![2].id,
        status: 'investigation',
        priority: 'high',
        due_date: '2024-07-20T00:00:00Z',
        estimated_hours: 15,
        created_by: createdUsers![0].id
      },
      {
        title: 'Redacción estatutos nueva sociedad',
        description: 'Preparación de estatutos sociales para la nueva filial del grupo, adaptados a la actividad específica.',
        case_id: createdCases![2].id,
        client_id: createdClients![2].id,
        status: 'pending',
        priority: 'medium',
        due_date: '2024-07-25T00:00:00Z',
        estimated_hours: 8,
        created_by: createdUsers![1].id
      },

      // Tareas laborales  
      {
        title: 'Análisis expediente disciplinario',
        description: 'Revisión del expediente disciplinario y evaluación de las causas alegadas para el despido.',
        case_id: createdCases![3].id,
        client_id: createdClients![3].id,
        status: 'completed',
        priority: 'urgent',
        due_date: '2024-06-10T00:00:00Z',
        estimated_hours: 4,
        created_by: createdUsers![2].id
      },
      {
        title: 'Demanda ante Juzgado Social',
        description: 'Presentación de demanda por despido improcedente ante el Juzgado de lo Social nº 2 de Sevilla.',
        case_id: createdCases![3].id,
        client_id: createdClients![3].id,
        status: 'filing',
        priority: 'urgent',
        due_date: '2024-06-28T00:00:00Z',
        estimated_hours: 3,
        created_by: createdUsers![2].id
      },
      
      // Tareas tributarias
      {
        title: 'Planificación fiscal 2024',
        description: 'Desarrollo de estrategia fiscal integral para optimización tributaria de la startup tecnológica.',
        case_id: createdCases![4].id,
        client_id: createdClients![4].id,
        status: 'review',
        priority: 'medium',
        due_date: '2024-08-15T00:00:00Z',
        estimated_hours: 20,
        created_by: createdUsers![0].id
      },
      {
        title: 'Revisión contratos proveedores',
        description: 'Análisis fiscal de contratos con proveedores tecnológicos internacionales y implicaciones del IVA.',
        case_id: createdCases![4].id,
        client_id: createdClients![4].id,
        status: 'pending',
        priority: 'low',
        due_date: '2024-08-30T00:00:00Z',
        estimated_hours: 12,
        created_by: createdUsers![1].id
      },

      // Tareas urgentes y críticas
      {
        title: 'Vista oral Audiencia Provincial',
        description: 'URGENTE: Comparecencia en vista de apelación el próximo lunes. Preparación de alegatos orales.',
        case_id: createdCases![0].id,
        client_id: createdClients![0].id,
        status: 'hearing',
        priority: 'urgent',
        due_date: '2024-06-24T00:00:00Z',
        estimated_hours: 6,
        created_by: createdUsers![0].id
      },
      {
        title: 'Recurso contencioso-administrativo',
        description: 'PLAZO CRÍTICO: Presentación de recurso contra resolución sancionadora. Vence el viernes.',
        case_id: createdCases![4].id,
        client_id: createdClients![4].id,
        status: 'drafting',
        priority: 'urgent',
        due_date: '2024-06-21T00:00:00Z',
        estimated_hours: 8,
        created_by: createdUsers![0].id
      }
    ]

    const { data: createdTasks } = await supabase
      .from('tasks')
      .insert(legalTasks.map(task => ({ ...task, org_id: org.id })))
      .select()

    // 7. Asignar tareas a usuarios
    if (createdTasks && createdUsers) {
      const taskAssignments = createdTasks.map((task, index) => ({
        task_id: task.id,
        user_id: createdUsers[index % createdUsers.length].id,
        assigned_by: createdUsers[0].id,
        role: 'assignee'
      }))

      await supabase
        .from('task_assignments')
        .insert(taskAssignments)
    }

    // 8. Crear entradas de tiempo
    const timeEntries = [
      {
        user_id: createdUsers![0].id,
        case_id: createdCases![0].id,
        duration_minutes: 480, // 8 horas
        description: 'Revisión completa del contrato principal y análisis de cláusulas',
        is_billable: true
      },
      {
        user_id: createdUsers![1].id,
        case_id: createdCases![1].id,
        duration_minutes: 360, // 6 horas
        description: 'Reunión con cliente y preparación documentación divorcio',
        is_billable: true
      },
      {
        user_id: createdUsers![2].id,
        case_id: createdCases![3].id,
        duration_minutes: 240, // 4 horas
        description: 'Análisis expediente disciplinario y jurisprudencia aplicable',
        is_billable: true
      },
      {
        user_id: createdUsers![0].id,
        case_id: createdCases![2].id,
        duration_minutes: 600, // 10 horas
        description: 'Due diligence societario - Revisión de contratos y estatutos',
        is_billable: true
      },
      {
        user_id: createdUsers![1].id,
        case_id: createdCases![4].id,
        duration_minutes: 420, // 7 horas
        description: 'Planificación fiscal y reunión con asesor fiscal',
        is_billable: true
      }
    ]

    await supabase
      .from('time_entries')
      .insert(timeEntries.map(entry => ({ ...entry, org_id: org.id })))

    // 9. Crear eventos de calendario
    const calendarEvents = [
      {
        title: 'Vista oral - Constructora Mediterráneo',
        description: 'Comparecencia en Audiencia Provincial de Valencia - Sala 2ª',
        start_datetime: '2024-06-24T10:00:00Z',
        end_datetime: '2024-06-24T12:00:00Z',
        event_type: 'hearing',
        location: 'Audiencia Provincial de Valencia, Sala 2ª',
        client_id: createdClients![0].id,
        case_id: createdCases![0].id,
        created_by: createdUsers![0].id,
        reminder_minutes: 60
      },
      {
        title: 'Reunión cliente - Divorcio López',
        description: 'Revisión propuesta convenio regulador y documentación',
        start_datetime: '2024-06-26T16:00:00Z',
        end_datetime: '2024-06-26T17:30:00Z',
        event_type: 'meeting',
        location: 'Despacho - Sala de reuniones',
        client_id: createdClients![1].id,
        case_id: createdCases![1].id,
        created_by: createdUsers![1].id,
        reminder_minutes: 30
      },
      {
        title: 'Junta General - Gourmet Group',
        description: 'Asistencia a Junta General Extraordinaria para reestructuración',
        start_datetime: '2024-07-15T11:00:00Z',
        end_datetime: '2024-07-15T13:00:00Z',
        event_type: 'meeting',
        location: 'Sede social del cliente',
        client_id: createdClients![2].id,
        case_id: createdCases![2].id,
        created_by: createdUsers![0].id,
        reminder_minutes: 120
      },
      {
        title: 'Juicio - Despido Fernández',
        description: 'Acto de juicio por despido improcedente',
        start_datetime: '2024-07-08T09:30:00Z',
        end_datetime: '2024-07-08T11:00:00Z',
        event_type: 'hearing',
        location: 'Juzgado de lo Social nº 2 - Sevilla',
        client_id: createdClients![3].id,
        case_id: createdCases![3].id,
        created_by: createdUsers![2].id,
        reminder_minutes: 90
      }
    ]

    await supabase
      .from('calendar_events')
      .insert(calendarEvents.map(event => ({ ...event, org_id: org.id })))

    // 10. Crear notas de clientes
    const clientNotes = [
      {
        client_id: createdClients![0].id,
        title: 'Perfil empresarial',
        content: 'Empresa familiar en segunda generación. Muy orientados al detalle y cumplimiento de plazos. Prefieren comunicación por email. Facturación mensual.',
        note_type: 'business',
        user_id: createdUsers![0].id,
        is_private: false
      },
      {
        client_id: createdClients![1].id,
        title: 'Situación personal',
        content: 'Cliente muy afectada por el proceso. Necesita explicaciones detalladas y acompañamiento emocional. Hijos menores de 8 y 12 años.',
        note_type: 'personal',
        user_id: createdUsers![1].id,
        is_private: true
      },
      {
        client_id: createdClients![2].id,
        title: 'Estructura corporativa',
        content: 'Grupo empresarial complejo con múltiples participadas. CEO muy involucrado en decisiones legales. Presupuestos amplios para asesoramiento.',
        note_type: 'business',
        user_id: createdUsers![0].id,
        is_private: false
      }
    ]

    await supabase
      .from('client_notes')
      .insert(clientNotes.map(note => ({ ...note, org_id: org.id })))

    console.log('✅ Datos ficticios creados exitosamente!')
    console.log(`📊 Resumen:`)
    console.log(`   • Organización: ${org.name}`)
    console.log(`   • Usuarios: ${users.length}`)
    console.log(`   • Clientes: ${clients.length}`)
    console.log(`   • Casos: ${cases.length}`)
    console.log(`   • Tareas legales: ${legalTasks.length}`)
    console.log(`   • Entradas de tiempo: ${timeEntries.length}`)
    console.log(`   • Eventos calendario: ${calendarEvents.length}`)

    return { success: true, orgId: org.id }

  } catch (error) {
    console.error('❌ Error creando datos ficticios:', error)
    return { success: false, error }
  }
}
