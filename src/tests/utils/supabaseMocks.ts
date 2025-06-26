
// Mock de respuesta de Supabase exitosa
export const createSupabaseSuccessResponse = <T>(data: T) => ({
  data,
  error: null,
  status: 200,
  statusText: 'OK',
})

// Mock de respuesta de Supabase con error
export const createSupabaseErrorResponse = (message: string, code?: string) => ({
  data: null,
  error: {
    message,
    code,
    details: null,
    hint: null,
  },
  status: 400,
  statusText: 'Bad Request',
})
