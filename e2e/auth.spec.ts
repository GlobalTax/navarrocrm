
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can access login page', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.locator('h1')).toContainText('CRM Legal')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Contraseña')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible()
  })

  test('login form validation works', async ({ page }) => {
    await page.goto('/login')
    
    const loginButton = page.getByRole('button', { name: 'Iniciar Sesión' })
    
    // El botón debe estar deshabilitado sin datos
    await expect(loginButton).toBeDisabled()
    
    // Llenar solo email
    await page.getByLabel('Email').fill('test@example.com')
    await expect(loginButton).toBeDisabled()
    
    // Llenar también la contraseña
    await page.getByLabel('Contraseña').fill('password123')
    await expect(loginButton).toBeEnabled()
  })

  test('handles invalid login credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByLabel('Email').fill('invalid@example.com')
    await page.getByLabel('Contraseña').fill('wrongpassword')
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
    
    // Esperar mensaje de error
    await expect(page.locator('[data-sonner-toast]')).toContainText('Email o contraseña incorrectos')
  })
})
