import { describe, it, expect } from 'vitest'
import { measurePerformance, getMemoryUsage } from '@/test/testUtils'

describe('Performance Tests', () => {
  it('should measure execution time', async () => {
    const time = await measurePerformance(async () => {
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 10))
    })
    
    expect(time).toBeGreaterThan(0)
    expect(time).toBeLessThan(100)
  })

  it('should track memory usage', () => {
    const memoryInfo = getMemoryUsage()
    
    if (memoryInfo) {
      expect(memoryInfo.used).toBeGreaterThan(0)
      expect(memoryInfo.total).toBeGreaterThan(0)
      expect(memoryInfo.limit).toBeGreaterThan(0)
    }
  })

  it('should handle performance measurements', async () => {
    const results = []
    
    for (let i = 0; i < 5; i++) {
      const time = await measurePerformance(async () => {
        Math.random() * 1000
      })
      results.push(time)
    }
    
    expect(results).toHaveLength(5)
    expect(results.every(time => time >= 0)).toBe(true)
  })
})