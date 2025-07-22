
import { z } from 'zod'

// Esquema de validación avanzada para expedientes
export const matterFormSchema = z.object({
  title: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede superar los 200 caracteres'),
  
  description: z.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede superar los 2000 caracteres'),
  
  contact_id: z.string()
    .min(1, 'Debe seleccionar un cliente'),
  
  practice_area: z.string()
    .min(1, 'Debe seleccionar un área de práctica'),
  
  responsible_solicitor_id: z.string()
    .min(1, 'Debe asignar un abogado responsable'),
  
  originating_solicitor_id: z.string().optional(),
  
  billing_method: z.enum(['hourly', 'fixed', 'contingency', 'retainer'], {
    errorMap: () => ({ message: 'Debe seleccionar un método de facturación válido' })
  }),
  
  estimated_budget: z.coerce.number()
    .positive('El presupuesto debe ser mayor a 0')
    .max(1000000, 'El presupuesto no puede superar 1,000,000€')
    .optional(),
  
  matter_number: z.string()
    .regex(/^[A-Z]{2,3}-\d{4}-\d{3}$/, 'Formato inválido (ej: CIV-2024-001)')
    .optional(),
  
  date_opened: z.date()
    .max(new Date(), 'La fecha de apertura no puede ser futura'),
  
  date_closed: z.date().optional(),
  
  status: z.enum(['open', 'on_hold', 'closed'], {
    errorMap: () => ({ message: 'Estado inválido' })
  })
}).refine(
  (data) => {
    // Validación condicional: presupuesto requerido para método fixed
    if (data.billing_method === 'fixed' && !data.estimated_budget) {
      return false
    }
    return true
  },
  {
    message: 'El presupuesto es obligatorio para facturación fija',
    path: ['estimated_budget']
  }
).refine(
  (data) => {
    // Validación de fechas: apertura debe ser anterior al cierre
    if (data.date_closed && data.date_opened > data.date_closed) {
      return false
    }
    return true
  },
  {
    message: 'La fecha de cierre debe ser posterior a la apertura',
    path: ['date_closed']
  }
).refine(
  (data) => {
    // Validación: expediente cerrado debe tener fecha de cierre
    if (data.status === 'closed' && !data.date_closed) {
      return false
    }
    return true
  },
  {
    message: 'Los expedientes cerrados deben tener fecha de cierre',
    path: ['date_closed']
  }
)

export type MatterFormData = z.infer<typeof matterFormSchema>
