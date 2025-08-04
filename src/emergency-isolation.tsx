// EMERGENCY ISOLATION TEST - Unique filename to bypass cache
import React from 'react'
import { createRoot } from 'react-dom/client'

// Completely isolated React component - no external dependencies
const EmergencyIsolationTest = () => {
  const [test, setTest] = React.useState('Starting React isolation test...')
  const [counter, setCounter] = React.useState(0)

  React.useEffect(() => {
    console.log('🚨 EMERGENCY ISOLATION: React hooks working!')
    console.log('🚨 EMERGENCY ISOLATION: React version:', React.version)
    setTest('✅ React hooks and state working!')
  }, [])

  return React.createElement('div', {
    style: {
      padding: '50px',
      fontFamily: 'system-ui',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#f0f8ff'
    }
  }, [
    React.createElement('div', {
      key: 'header',
      style: {
        background: '#dc3545',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }
    }, [
      React.createElement('h1', { 
        key: 'title',
        style: { margin: '0 0 10px 0' }
      }, '🚨 EMERGENCY ISOLATION TEST'),
      React.createElement('p', { 
        key: 'status',
        style: { margin: 0 }
      }, test)
    ]),
    
    React.createElement('div', {
      key: 'content',
      style: {
        background: '#ffffff',
        border: '2px solid #dc3545',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }
    }, [
      React.createElement('h2', { 
        key: 'test-title',
        style: { marginTop: 0 }
      }, 'React Core Functionality'),
      React.createElement('p', { key: 'version' }, `React Version: ${React.version}`),
      React.createElement('p', { key: 'timestamp' }, `Cache Break: ${Date.now()}`),
      React.createElement('p', { key: 'counter' }, `Counter: ${counter}`),
      React.createElement('button', {
        key: 'test-button',
        onClick: () => setCounter(c => c + 1),
        style: {
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '10px'
        }
      }, 'Test Counter'),
      React.createElement('button', {
        key: 'status-button',
        onClick: () => setTest(`Status updated: ${new Date().toLocaleTimeString()}`),
        style: {
          background: '#28a745',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer'
        }
      }, 'Test Status Update')
    ]),
    
    React.createElement('div', {
      key: 'instructions',
      style: {
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        padding: '20px',
        borderRadius: '4px'
      }
    }, [
      React.createElement('strong', { key: 'title' }, '🔧 Emergency Isolation:'),
      React.createElement('br', { key: 'br1' }),
      React.createElement('br', { key: 'br2' }),
      'This tests React core functionality without ANY external dependencies.',
      React.createElement('br', { key: 'br3' }),
      'If this works, the issue is in providers/routing. If not, React itself is corrupted.'
    ])
  ])
}

// Emergency bootstrap with unique timestamp
const EMERGENCY_ID = `EMERGENCY_${Date.now()}`
console.log(`🚨 ${EMERGENCY_ID}: Starting emergency isolation test`)

try {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }

  // Clear any existing content
  rootElement.innerHTML = ''
  
  const root = createRoot(rootElement)
  root.render(React.createElement(EmergencyIsolationTest))
  
  console.log(`✅ ${EMERGENCY_ID}: Emergency isolation mounted successfully`)
} catch (error) {
  console.error(`🚨 ${EMERGENCY_ID}: Emergency isolation failed:`, error)
  
  // Last resort - direct DOM manipulation
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 50px; font-family: system-ui; color: red; background: #fff;">
        <h1>🚨 CRITICAL REACT FAILURE</h1>
        <p><strong>Emergency ID:</strong> ${EMERGENCY_ID}</p>
        <p><strong>Error:</strong> ${error.message}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p>React core is completely non-functional. This requires deep system intervention.</p>
      </div>
    `
  }
}