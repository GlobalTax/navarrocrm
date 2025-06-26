
#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🎭 Configurando Playwright...');

try {
  console.log('📦 Instalando browsers de Playwright...');
  execSync('npx playwright install', { stdio: 'inherit' });
  
  console.log('✅ Playwright configurado correctamente!');
  console.log('');
  console.log('🚀 Para ejecutar los tests:');
  console.log('   npm run test:e2e');
  console.log('   npm run test:e2e:ui');
  console.log('');
  console.log('📋 Recuerda crear un usuario de test en Supabase:');
  console.log('   Email: admin@test.com');
  console.log('   Password: admin123');
  console.log('   Rol: admin');
  
} catch (error) {
  console.error('❌ Error configurando Playwright:', error.message);
  process.exit(1);
}
