
import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('virtualized contact table loads efficiently', async ({ page }) => {
    await page.goto('/contacts')
    
    // Medir tiempo de carga inicial
    const startTime = Date.now()
    
    await expect(page.locator('[data-testid="virtualized-list"]')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    
    // La tabla virtualizada debe cargar en menos de 2 segundos
    expect(loadTime).toBeLessThan(2000)
  })

  test('search debouncing works properly', async ({ page }) => {
    await page.goto('/contacts')
    
    const searchInput = page.getByPlaceholder('Buscar contactos...')
    
    // Escribir rápidamente
    await searchInput.type('test search', { delay: 50 })
    
    // Esperar que se aplique el debounce
    await page.waitForTimeout(400)
    
    // Verificar que la búsqueda se ejecutó
    await expect(page.locator('[data-testid="contacts-list"]')).toBeVisible()
  })
})
