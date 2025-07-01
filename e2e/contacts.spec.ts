
import { test, expect } from '@playwright/test'

test.describe('Contacts Management', () => {
  test.beforeEach(async ({ page }) => {
    // Simular autenticación antes de cada prueba
    await page.goto('/login')
    // Aquí normalmente harías login real o mock
  })

  test('can navigate to contacts page', async ({ page }) => {
    await page.goto('/contacts')
    
    await expect(page.locator('h1')).toContainText('Contactos')
    await expect(page.getByText('Nuevo Contacto')).toBeVisible()
  })

  test('contact search functionality works', async ({ page }) => {
    await page.goto('/contacts')
    
    const searchInput = page.getByPlaceholder('Buscar contactos...')
    await expect(searchInput).toBeVisible()
    
    await searchInput.fill('Juan')
    // Verificar que se filtra la lista
    await expect(page.locator('[data-testid="contacts-list"]')).toBeVisible()
  })

  test('contact creation dialog opens', async ({ page }) => {
    await page.goto('/contacts')
    
    await page.getByText('Nuevo Contacto').click()
    
    await expect(page.getByText('Crear Contacto')).toBeVisible()
    await expect(page.getByLabel('Nombre')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
  })
})
