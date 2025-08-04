// Ultra minimal React test - bypassing all existing infrastructure
console.log('🔧 ULTRA_MINIMAL: Starting ultra minimal test')

// Test 1: Can we access React at all?
try {
  const React = require('react')
  console.log('✅ ULTRA_MINIMAL: React accessible via require:', !!React)
  console.log('✅ ULTRA_MINIMAL: React.useState exists:', !!React.useState)
} catch (e) {
  console.error('❌ ULTRA_MINIMAL: React require failed:', e)
}

// Test 2: Can we import React ES6 style?
import * as React from 'react'
console.log('✅ ULTRA_MINIMAL: React imported via ES6:', !!React)
console.log('✅ ULTRA_MINIMAL: React.useState via ES6:', !!React.useState)

// Test 3: Direct named import
import { useState, createElement } from 'react'
console.log('✅ ULTRA_MINIMAL: useState named import:', !!useState)
console.log('✅ ULTRA_MINIMAL: createElement named import:', !!createElement)

// Test 4: Create a simple component without JSX
const TestComponent = () => {
  console.log('🔧 ULTRA_MINIMAL: TestComponent called')
  
  try {
    const [test, setTest] = useState('working')
    console.log('✅ ULTRA_MINIMAL: useState works:', test)
    
    return createElement('div', {
      style: {
        padding: '20px',
        background: '#00ff00',
        color: '#000',
        fontFamily: 'system-ui'
      }
    }, `Ultra Minimal Test: ${test} - React ${React.version}`)
  } catch (e) {
    console.error('❌ ULTRA_MINIMAL: useState failed:', e)
    return createElement('div', {
      style: {
        padding: '20px',
        background: '#ff0000',
        color: '#fff',
        fontFamily: 'system-ui'
      }
    }, `FAILED: ${e.message}`)
  }
}

export default TestComponent