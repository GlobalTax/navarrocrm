import { describe, it, expect } from 'vitest'

describe('Basic functionality tests', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true)
  })

  it('should handle string operations', () => {
    const text = 'Hello World'
    expect(text.toLowerCase()).toBe('hello world')
    expect(text.length).toBe(11)
  })

  it('should handle array operations', () => {
    const numbers = [1, 2, 3, 4, 5]
    const sum = numbers.reduce((a, b) => a + b, 0)
    expect(sum).toBe(15)
  })

  it('should handle object operations', () => {
    const user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    }
    
    expect(user.name).toBe('Test User')
    expect(Object.keys(user)).toHaveLength(3)
  })
})