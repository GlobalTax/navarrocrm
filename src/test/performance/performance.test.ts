import { describe, it, expect } from 'vitest'
import { measurePerformance } from '@/test/testUtils'
import { render } from '@testing-library/react'

const TestComponent = () => <div data-testid="test">Test</div>

describe('Performance Tests', () => {
  it('should render quickly', async () => {
    const time = await measurePerformance(async () => {
      render(<TestComponent />)
    })
    expect(time).toBeLessThan(100)
  })
})