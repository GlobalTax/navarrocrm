#!/usr/bin/env node

// Performance audit script
const fs = require('fs')
const path = require('path')

console.log('🔍 Running Performance Audit...')

// Bundle Analysis
const analyzeBundle = () => {
  const distPath = path.join(process.cwd(), 'dist')
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ Build not found. Run npm run build first.')
    return
  }

  const jsFiles = fs.readdirSync(path.join(distPath, 'assets'))
    .filter(file => file.endsWith('.js'))
  
  let totalSize = 0
  const bundles = []

  jsFiles.forEach(file => {
    const filePath = path.join(distPath, 'assets', file)
    const stats = fs.statSync(filePath)
    const sizeKB = Math.round(stats.size / 1024)
    
    totalSize += sizeKB
    bundles.push({ file, size: sizeKB })
  })

  console.log('📦 Bundle Analysis:')
  console.log(`Total Size: ${totalSize}KB`)
  console.log(`Chunk Count: ${jsFiles.length}`)
  
  bundles.forEach(bundle => {
    console.log(`  ${bundle.file}: ${bundle.size}KB`)
  })

  // Performance warnings
  if (totalSize > 2000) {
    console.log('⚠️  Bundle size exceeds 2MB')
  }
  
  if (jsFiles.length > 20) {
    console.log('⚠️  Too many chunks (>20)')
  }
}

// Core Web Vitals check
const checkWebVitals = () => {
  console.log('\n🚀 Core Web Vitals Guidelines:')
  console.log('FCP: < 1.8s')
  console.log('LCP: < 2.5s') 
  console.log('FID: < 100ms')
  console.log('CLS: < 0.1')
}

// Run audit
analyzeBundle()
checkWebVitals()

console.log('\n✅ Performance audit complete!')