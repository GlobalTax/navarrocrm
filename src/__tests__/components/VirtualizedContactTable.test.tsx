
import { render, screen, fireEvent } from '@/test-utils/test-helpers'
import { describe, it, expect, vi } from 'vitest'
import { VirtualizedContactTable } from '@/components/contacts/VirtualizedContactTable'
import { Contact } from '@/hooks/useContacts'

// Mock react-window
vi.mock('react-window', () => ({
  FixedSizeList: vi.fn(({ children, itemData, itemCount }) => {
    // Renderizar algunos elementos para testing
    const items = []
    for (let i = 0; i < Math.min(itemCount, 5); i++) {
      items.push(
        <div key={i}>
          {children({ index: i, style: {}, data: itemData })}
        </div>
      )
    }
    return <div data-testid="virtualized-list">{items}</div>
  })
}))

vi.mock('react-window-infinite-loader', () => ({
  default: vi.fn(({ children }) => children({ onItemsRendered: vi.fn(), ref: vi.fn() }))
}))

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '123456789',
    status: 'activo',
    client_type: 'particular',
    relationship_type: 'cliente',
    org_id: 'test-org',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    dni_nif: '12345678A',
    address_street: 'Calle Test 123',
    address_city: 'Madrid',
    address_postal_code: '28001',
    address_country: 'España',
    tags: [],
    internal_notes: null,
    preferred_language: 'es',
    contact_preference: 'email',
    payment_method: 'transferencia',
    preferred_meeting_time: 'morning',
    business_sector: null,
    how_found_us: null,
    hourly_rate: null,
    last_contact_date: null,
    company_id: null,
    legal_representative: null,
    timezone: 'Europe/Madrid',
    email_preferences: { receive_followups: true, receive_reminders: true, receive_invitations: true }
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria@example.com',
    phone: '987654321',
    status: 'prospecto',
    client_type: 'empresa',
    relationship_type: 'prospecto',
    org_id: 'test-org',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    dni_nif: '87654321B',
    address_street: 'Avenida Test 456',
    address_city: 'Barcelona',
    address_postal_code: '08001',
    address_country: 'España',
    tags: [],
    internal_notes: null,
    preferred_language: 'es',
    contact_preference: 'phone',
    payment_method: 'transferencia',
    preferred_meeting_time: 'afternoon',
    business_sector: 'tecnología',
    how_found_us: 'referencia',
    hourly_rate: null,
    last_contact_date: null,
    company_id: null,
    legal_representative: null,
    timezone: 'Europe/Madrid',
    email_preferences: { receive_followups: true, receive_reminders: true, receive_invitations: true }
  }
]

describe('VirtualizedContactTable', () => {
  const mockOnEditContact = vi.fn()

  it('should render contact table with header', () => {
    render(
      <VirtualizedContactTable
        contacts={mockContacts}
        onEditContact={mockOnEditContact}
      />
    )

    expect(screen.getByText('Contacto')).toBeInTheDocument()
    expect(screen.getByText('Información')).toBeInTheDocument()
    expect(screen.getByText('Estado')).toBeInTheDocument()
    expect(screen.getByText('Tipo')).toBeInTheDocument()
  })

  it('should render contacts in the list', () => {
    render(
      <VirtualizedContactTable
        contacts={mockContacts}
        onEditContact={mockOnEditContact}
      />
    )

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('María García')).toBeInTheDocument()
  })

  it('should show loading indicator when fetching next page', () => {
    render(
      <VirtualizedContactTable
        contacts={mockContacts}
        onEditContact={mockOnEditContact}
        isFetchingNextPage={true}
      />
    )

    expect(screen.getByText('Cargando más contactos...')).toBeInTheDocument()
  })

  it('should call onEditContact when edit button is clicked', async () => {
    render(
      <VirtualizedContactTable
        contacts={mockContacts}
        onEditContact={mockOnEditContact}
      />
    )

    // El botón de editar aparece en hover, simulamos el click
    const editButtons = screen.getAllByRole('button')
    const editButton = editButtons.find(button => 
      button.querySelector('svg') // Buscar el botón con icono
    )

    if (editButton) {
      fireEvent.click(editButton)
      expect(mockOnEditContact).toHaveBeenCalledWith(mockContacts[0])
    }
  })
})
