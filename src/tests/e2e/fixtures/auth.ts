
import { test as base } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: any;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Login automático para tests que requieren autenticación
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'admin@test.com');
    await page.fill('[data-testid="password"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    
    // Esperar a que la autenticación sea exitosa
    await page.waitForURL('/dashboard');
    
    await use(page);
  },
});

export { expect } from '@playwright/test';
