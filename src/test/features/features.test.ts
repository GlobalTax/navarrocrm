import { describe, it, expect } from 'vitest'
import { createMockContact, createMockCase, createMockTask } from '@/test/testUtils'

describe('Feature Data Tests', () => {
  describe('Contact Management', () => {
    it('should create mock contact with defaults', () => {
      const contact = createMockContact()
      
      expect(contact.id).toBe('1')
      expect(contact.first_name).toBe('John')
      expect(contact.last_name).toBe('Doe')
      expect(contact.email).toBe('john@example.com')
    })

    it('should create mock contact with overrides', () => {
      const contact = createMockContact({
        first_name: 'Jane',
        company: 'Test Corp'
      })
      
      expect(contact.first_name).toBe('Jane')
      expect(contact.company).toBe('Test Corp')
      expect(contact.email).toBe('john@example.com')
    })
  })

  describe('Case Management', () => {
    it('should create mock case with defaults', () => {
      const testCase = createMockCase()
      
      expect(testCase.id).toBe('1')
      expect(testCase.title).toBe('Test Case')
      expect(testCase.status).toBe('active')
      expect(testCase.priority).toBe('high')
    })

    it('should create mock case with overrides', () => {
      const testCase = createMockCase({
        title: 'Custom Case',
        status: 'completed',
        priority: 'low'
      })
      
      expect(testCase.title).toBe('Custom Case')
      expect(testCase.status).toBe('completed')
      expect(testCase.priority).toBe('low')
    })
  })

  describe('Task Management', () => {
    it('should create mock task with defaults', () => {
      const task = createMockTask()
      
      expect(task.id).toBe('1')
      expect(task.title).toBe('Test Task')
      expect(task.status).toBe('pending')
      expect(task.priority).toBe('medium')
    })

    it('should create mock task with overrides', () => {
      const task = createMockTask({
        title: 'Custom Task',
        status: 'completed',
        priority: 'high'
      })
      
      expect(task.title).toBe('Custom Task')
      expect(task.status).toBe('completed')
      expect(task.priority).toBe('high')
    })
  })
})