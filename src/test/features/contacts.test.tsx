import { describe, it, expect } from 'vitest'
import { renderWithProviders, createMockContact } from '@/test/testUtils'
import { screen } from '@testing-library/react'

describe('Contacts Feature', () => {
  it('should create mock contact data', () => {
    const contact = createMockContact({
      first_name: 'Jane',
      company: 'Test Corp'
    })
    
    expect(contact.first_name).toBe('Jane')
    expect(contact.company).toBe('Test Corp')
    expect(contact.email).toBe('john@example.com')
  })

  it('should render basic component', () => {
    const ContactComponent = () => {
      return <div data-testid="contact">Contact Item</div>
    }
    
    renderWithProviders(<ContactComponent />)
    expect(screen.getByTestId('contact')).toBeInTheDocument()
  })
})