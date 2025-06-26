
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Configurar datos de test si es necesario
  console.log('🚀 Configuración global de tests E2E iniciada');
  
  await browser.close();
}

export default globalSetup;
