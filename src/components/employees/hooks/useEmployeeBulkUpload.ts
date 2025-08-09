import { supabase } from '@/integrations/supabase/client'
import { ValidationError } from '@/components/bulk-upload/BaseBulkUploadDialog'
import { toast } from 'sonner'

export interface EmployeeValidationData {
  name: string
  email: string
  position: string
  hire_date: string
  status: string
  department?: string
  contract_type?: string
  working_hours_per_week?: number
  salary?: number
  phone?: string
  employee_number?: string
  dni_nie?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  address_country?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  social_security_number?: string
  bank_account_iban?: string
  skills?: string
  languages?: string
  education_level?: string
  notes?: string
  row: number
}

interface RawEmployeeRow {
  name?: string
  email?: string
  position?: string
  hire_date?: string
  status?: string
  department?: string
  contract_type?: string
  working_hours_per_week?: string | number
  salary?: string | number
  phone?: string
  employee_number?: string
  dni_nie?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  address_country?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  social_security_number?: string
  bank_account_iban?: string
  skills?: string
  languages?: string
  education_level?: string
  notes?: string
}

export const useEmployeeBulkUpload = () => {
  // Plantilla de datos con todos los campos posibles
  const templateData = [
    {
      name: "Juan García López",
      email: "juan.garcia@empresa.com",
      position: "Desarrollador Senior",
      hire_date: "2024-01-15",
      status: "active",
      department: "Tecnología",
      contract_type: "permanent",
      working_hours_per_week: 40,
      salary: 45000,
      phone: "+34 600 123 456",
      employee_number: "EMP001",
      dni_nie: "12345678A",
      address_street: "Calle Mayor 123",
      address_city: "Madrid",
      address_postal_code: "28001",
      address_country: "España",
      emergency_contact_name: "María García",
      emergency_contact_phone: "+34 600 654 321",
      social_security_number: "281234567890",
      bank_account_iban: "ES9121000418450200051332",
      skills: "JavaScript;Python;React",
      languages: "Español;Inglés",
      education_level: "university",
      notes: "Empleado ejemplar con excelente rendimiento"
    },
    {
      name: "Ana Martín Ruiz",
      email: "ana.martin@empresa.com", 
      position: "Contable",
      hire_date: "2024-02-01",
      status: "active",
      department: "Finanzas",
      contract_type: "permanent",
      working_hours_per_week: 37.5,
      salary: 38000,
      phone: "+34 600 987 654",
      employee_number: "EMP002",
      dni_nie: "87654321B",
      address_street: "Avenida Libertad 45",
      address_city: "Barcelona",
      address_postal_code: "08001",
      address_country: "España",
      emergency_contact_name: "Carlos Martín",
      emergency_contact_phone: "+34 600 111 222",
      social_security_number: "081234567891",
      bank_account_iban: "ES9100491500051234567892",
      skills: "Excel;SAP;Contabilidad",
      languages: "Español;Catalán;Inglés",
      education_level: "university",
      notes: "Especialista en contabilidad fiscal"
    }
  ]

  // Validación de empleados
  const validateEmployee = (row: RawEmployeeRow, index: number): { data: EmployeeValidationData | null; errors: ValidationError[] } => {
    const errors: ValidationError[] = []
    
    // Validar campos obligatorios
    if (!row.name?.trim()) {
      errors.push({
        row: index + 1,
        field: 'name',
        message: 'El nombre es obligatorio',
        suggestion: 'Proporciona el nombre completo del empleado'
      })
    }

    if (!row.email?.trim()) {
      errors.push({
        row: index + 1,
        field: 'email',
        message: 'El email es obligatorio',
        suggestion: 'Proporciona un email válido del empleado'
      })
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push({
        row: index + 1,
        field: 'email',
        message: 'Formato de email inválido',
        suggestion: 'Usa el formato: nombre@dominio.com'
      })
    }

    if (!row.position?.trim()) {
      errors.push({
        row: index + 1,
        field: 'position',
        message: 'El puesto es obligatorio',
        suggestion: 'Especifica el puesto de trabajo'
      })
    }

    if (!row.hire_date?.trim()) {
      errors.push({
        row: index + 1,
        field: 'hire_date',
        message: 'La fecha de alta es obligatoria',
        suggestion: 'Usa el formato YYYY-MM-DD'
      })
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(row.hire_date)) {
      errors.push({
        row: index + 1,
        field: 'hire_date',
        message: 'Formato de fecha inválido',
        suggestion: 'Usa el formato YYYY-MM-DD (ej: 2024-01-15)'
      })
    } else {
      const date = new Date(row.hire_date)
      if (isNaN(date.getTime())) {
        errors.push({
          row: index + 1,
          field: 'hire_date',
          message: 'Fecha inválida',
          suggestion: 'Verifica que la fecha sea correcta'
        })
      }
    }

    // Validar campos opcionales con valores específicos
    const validStatuses = ['active', 'inactive', 'on_leave']
    const status = row.status?.trim() || 'active'
    if (!validStatuses.includes(status)) {
      errors.push({
        row: index + 1,
        field: 'status',
        message: `Estado debe ser: ${validStatuses.join(', ')}`,
        suggestion: 'Usar "active" por defecto'
      })
    }

    const validContractTypes = ['permanent', 'temporary', 'freelance', 'internship']
    if (row.contract_type && !validContractTypes.includes(row.contract_type)) {
      errors.push({
        row: index + 1,
        field: 'contract_type',
        message: `Tipo de contrato debe ser: ${validContractTypes.join(', ')}`,
        suggestion: 'Usar "permanent" por defecto'
      })
    }

    const validEducationLevels = ['primary', 'secondary', 'vocational', 'university', 'postgraduate']
    if (row.education_level && !validEducationLevels.includes(row.education_level)) {
      errors.push({
        row: index + 1,
        field: 'education_level',
        message: `Nivel de educación debe ser: ${validEducationLevels.join(', ')}`,
        suggestion: 'Usar "university" por defecto'
      })
    }

    // Validar tipos numéricos
    if (row.working_hours_per_week !== undefined && row.working_hours_per_week !== '') {
      const hours = Number(row.working_hours_per_week)
      if (isNaN(hours) || hours <= 0 || hours > 60) {
        errors.push({
          row: index + 1,
          field: 'working_hours_per_week',
          message: 'Las horas de trabajo deben ser un número entre 1 y 60',
          suggestion: 'Usar 40 por defecto para jornada completa'
        })
      }
    }

    if (row.salary !== undefined && row.salary !== '') {
      const salary = Number(row.salary)
      if (isNaN(salary) || salary < 0) {
        errors.push({
          row: index + 1,
          field: 'salary',
          message: 'El salario debe ser un número positivo',
          suggestion: 'Introducir salario bruto anual'
        })
      }
    }

    // Validar formato de teléfono
    if (row.phone && !/^[+]?[0-9\s-()]{9,15}$/.test(row.phone.replace(/\s/g, ''))) {
      errors.push({
        row: index + 1,
        field: 'phone',
        message: 'Formato de teléfono inválido',
        suggestion: 'Usar formato: +34 600 123 456'
      })
    }

    // Validar DNI/NIE básico (formato español)
    if (row.dni_nie) {
      const dniNie = row.dni_nie.toUpperCase().replace(/\s/g, '')
      if (!/^[0-9]{8}[A-Z]$/.test(dniNie) && !/^[XYZ][0-9]{7}[A-Z]$/.test(dniNie)) {
        errors.push({
          row: index + 1,
          field: 'dni_nie',
          message: 'Formato de DNI/NIE inválido',
          suggestion: 'Usar formato: 12345678A o X1234567A'
        })
      }
    }

    // Validar IBAN básico
    if (row.bank_account_iban) {
      const iban = row.bank_account_iban.replace(/\s/g, '').toUpperCase()
      if (!/^ES[0-9]{22}$/.test(iban)) {
        errors.push({
          row: index + 1,
          field: 'bank_account_iban',
          message: 'Formato de IBAN español inválido',
          suggestion: 'Usar formato: ES9121000418450200051332'
        })
      }
    }

    if (errors.length > 0) {
      return { data: null, errors }
    }

    // Crear objeto de empleado validado
    const employee: EmployeeValidationData = {
      name: row.name!.trim(),
      email: row.email!.trim().toLowerCase(),
      position: row.position!.trim(),
      hire_date: row.hire_date!.trim(),
      status: status,
      department: row.department?.trim(),
      contract_type: row.contract_type?.trim() || 'permanent',
      working_hours_per_week: row.working_hours_per_week ? Number(row.working_hours_per_week) : 40,
      salary: row.salary ? Number(row.salary) : undefined,
      phone: row.phone?.trim(),
      employee_number: row.employee_number?.trim(),
      dni_nie: row.dni_nie?.trim().toUpperCase(),
      address_street: row.address_street?.trim(),
      address_city: row.address_city?.trim(),
      address_postal_code: row.address_postal_code?.trim(),
      address_country: row.address_country?.trim() || 'España',
      emergency_contact_name: row.emergency_contact_name?.trim(),
      emergency_contact_phone: row.emergency_contact_phone?.trim(),
      social_security_number: row.social_security_number?.trim(),
      bank_account_iban: row.bank_account_iban?.trim().replace(/\s/g, '').toUpperCase(),
      skills: row.skills?.trim(),
      languages: row.languages?.trim(),
      education_level: row.education_level?.trim() || 'university',
      notes: row.notes?.trim(),
      row: index + 1
    }

    return { data: employee, errors: [] }
  }

  // Procesador de empleados
  const processEmployees = async (validatedData: EmployeeValidationData[], orgId: string): Promise<number> => {
    console.log('🚀 [processEmployees] Iniciando procesamiento de', validatedData.length, 'empleados')
    
    let successCount = 0
    const batchSize = 50
    
    // Verificar duplicados existentes
    const emails = validatedData.map(emp => emp.employee_number || emp.email)
    const { data: existingEmployees, error: checkError } = await supabase
      .from('simple_employees')
      .select('email, employee_number, dni_nie')
      .eq('org_id', orgId)
      .or(`email.in.(${validatedData.map(e => e.email).join(',')}),employee_number.in.(${validatedData.filter(e => e.employee_number).map(e => e.employee_number).join(',')}),dni_nie.in.(${validatedData.filter(e => e.dni_nie).map(e => e.dni_nie).join(',')})`)

    if (checkError) {
      console.error('❌ [processEmployees] Error verificando duplicados:', checkError)
    }

    const existingEmails = new Set(existingEmployees?.map(e => e.email) || [])
    const existingNumbers = new Set(existingEmployees?.map(e => e.employee_number).filter(Boolean) || [])
    const existingDNIs = new Set(existingEmployees?.map(e => e.dni_nie).filter(Boolean) || [])

    // Filtrar duplicados
    const newEmployees = validatedData.filter(emp => {
      if (existingEmails.has(emp.email)) {
        console.warn(`⚠️ Empleado duplicado por email: ${emp.email}`)
        return false
      }
      if (emp.employee_number && existingNumbers.has(emp.employee_number)) {
        console.warn(`⚠️ Empleado duplicado por número: ${emp.employee_number}`)
        return false
      }
      if (emp.dni_nie && existingDNIs.has(emp.dni_nie)) {
        console.warn(`⚠️ Empleado duplicado por DNI/NIE: ${emp.dni_nie}`)
        return false
      }
      return true
    })

    if (newEmployees.length < validatedData.length) {
      const duplicatesCount = validatedData.length - newEmployees.length
      toast.warning(`Se omitieron ${duplicatesCount} empleados duplicados`)
    }

    // Procesar en lotes
    for (let i = 0; i < newEmployees.length; i += batchSize) {
      const batch = newEmployees.slice(i, i + batchSize)
      
      try {
        const employeesToInsert = batch.map(emp => ({
          org_id: orgId,
          name: emp.name,
          email: emp.email,
          position: emp.position,
          hire_date: emp.hire_date,
          status: emp.status,
          department: emp.department,
          contract_type: emp.contract_type,
          working_hours_per_week: emp.working_hours_per_week,
          salary: emp.salary,
          phone: emp.phone,
          employee_number: emp.employee_number,
          dni_nie: emp.dni_nie,
          address_street: emp.address_street,
          address_city: emp.address_city,
          address_postal_code: emp.address_postal_code,
          address_country: emp.address_country,
          emergency_contact_name: emp.emergency_contact_name,
          emergency_contact_phone: emp.emergency_contact_phone,
          social_security_number: emp.social_security_number,
          bank_account_iban: emp.bank_account_iban,
          skills: emp.skills ? emp.skills.split(';').map(s => s.trim()).filter(Boolean) : null,
          languages: emp.languages ? emp.languages.split(';').map(l => l.trim()).filter(Boolean) : null,
          education_level: emp.education_level,
          notes: emp.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))

        const { data, error } = await supabase
          .from('simple_employees')
          .insert(employeesToInsert)
          .select('id')

        if (error) {
          console.error(`❌ [processEmployees] Error en lote ${i / batchSize + 1}:`, error)
          throw error
        }

        successCount += data?.length || 0
        console.log(`✅ [processEmployees] Lote ${i / batchSize + 1} completado: ${data?.length} empleados`)
        
      } catch (error) {
        console.error(`❌ [processEmployees] Error procesando lote ${i / batchSize + 1}:`, error)
        throw error
      }
    }

    console.log(`🎉 [processEmployees] Procesamiento completado: ${successCount} empleados insertados`)
    return successCount
  }

  return {
    validator: validateEmployee,
    processor: processEmployees,
    templateData
  }
}