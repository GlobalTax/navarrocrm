import { test, expect } from '@playwright/test'

// E2E: Organigrama - render y navegación básica
test.describe('Organigrama de Empleados', () => {
  test('el tab Organigrama aparece y renderiza el contenedor', async ({ page }) => {
    await page.goto('/employees')

    // Debe existir la pestaña
    await expect(page.getByRole('tab', { name: 'Organigrama' })).toBeVisible()

    // Cambiar al tab
    await page.getByRole('tab', { name: 'Organigrama' }).click()

    // Debe renderizar el contenedor del organigrama (aunque sea vacío)
    await expect(page.getByTestId('org-chart')).toBeVisible()
  })
})
