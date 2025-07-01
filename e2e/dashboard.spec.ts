
import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Debe redirigir a login
    await expect(page).toHaveURL('/login')
  })

  test('displays dashboard when authenticated', async ({ page }) => {
    // Mock authentication state
    await page.goto('/dashboard')
    
    // Si hay autenticación válida, debe mostrar el dashboard
    await expect(page.locator('h1')).toContainText('Bienvenido')
  })
})
