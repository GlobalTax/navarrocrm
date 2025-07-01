
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock para autenticación de Supabase
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        role: 'authenticated',
      }
    })
  }),

  // Mock para obtener sesión
  http.get('*/auth/v1/user', () => {
    return HttpResponse.json({
      id: 'mock-user-id',
      email: 'test@example.com',
      role: 'authenticated',
    })
  }),

  // Mock para contactos
  http.get('*/rest/v1/contacts', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Test Contact',
        email: 'test@contact.com',
        phone: '123456789',
        status: 'activo',
        client_type: 'particular',
        relationship_type: 'cliente',
        org_id: 'test-org-id'
      }
    ])
  }),

  // Mock para casos
  http.get('*/rest/v1/cases', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Test Case',
        description: 'Test case description',
        status: 'active',
        client_id: '1',
        org_id: 'test-org-id'
      }
    ])
  }),
]
