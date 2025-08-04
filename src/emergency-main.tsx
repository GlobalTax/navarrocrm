// EMERGENCY REACT RECOVERY - New entry point
import React from 'react'
import { createRoot } from 'react-dom/client'

// Inline component to avoid any import issues
const RecoveryComponent = () => {
  const [status, setStatus] = React.useState('🚨 Emergency Recovery Mode Active')
  const [test, setTest] = React.useState(0)
  
  React.useEffect(() => {
    console.log('✅ EMERGENCY: React hooks working!')
    setStatus('✅ React Successfully Recovered!')
    
    // Hide loading message
    const loading = document.getElementById('loading')
    if (loading) loading.style.display = 'none'
  }, [])
  
  return React.createElement('div', {
    style: {
      padding: '50px',
      fontFamily: 'system-ui',
      maxWidth: '800px',
      margin: '0 auto'
    }
  }, [
    React.createElement('div', {
      key: 'header',
      style: {
        background: '#28a745',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }
    }, [
      React.createElement('h1', { 
        key: 'title',
        style: { margin: '0 0 10px 0' }
      }, '🔧 Navarro CRM - System Recovery'),
      React.createElement('p', { 
        key: 'status',
        style: { margin: 0 }
      }, status)
    ]),
    
    React.createElement('div', {
      key: 'content',
      style: {
        background: '#f8f9fa',
        border: '2px solid #28a745',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }
    }, [
      React.createElement('h2', { 
        key: 'test-title',
        style: { marginTop: 0 }
      }, 'React Functionality Test'),
      React.createElement('p', { key: 'version' }, `React Version: ${React.version}`),
      React.createElement('p', { key: 'test-counter' }, `Test Counter: ${test}`),
      React.createElement('button', {
        key: 'test-button',
        onClick: () => setTest(t => t + 1),
        style: {
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '10px'
        }
      }, 'Test React State'),
      React.createElement('button', {
        key: 'recovery-button',
        onClick: () => {
          setStatus(`🔄 Recovery Test ${Date.now()}`)
        },
        style: {
          background: '#28a745',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer'
        }
      }, 'Test Recovery')
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
      React.createElement('strong', { key: 'title' }, '🚀 Recovery Success!'),
      React.createElement('br', { key: 'br1' }),
      React.createElement('br', { key: 'br2' }),
      'If both buttons work, React is fully functional. The previous errors were due to severe build cache corruption.',
      React.createElement('br', { key: 'br3' }),
      React.createElement('br', { key: 'br4' }),
      React.createElement('strong', { key: 'next' }, 'Next Step: '),
      'We can now safely rebuild the full application architecture.'
    ])
  ])
}

// Emergency bootstrap
const EMERGENCY_TIMESTAMP = Date.now()
console.log(`🚨 EMERGENCY RECOVERY STARTING - ${EMERGENCY_TIMESTAMP}`)
console.log(`🚨 React Version: ${React.version}`)

try {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }
  
  const root = createRoot(rootElement)
  root.render(React.createElement(RecoveryComponent))
  
  console.log('✅ EMERGENCY RECOVERY: React mounted successfully')
} catch (error) {
  console.error('🚨 EMERGENCY RECOVERY FAILED:', error)
  
  // Last resort - direct DOM manipulation
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 50px; font-family: system-ui; color: red;">
        <h1>🚨 CRITICAL SYSTEM FAILURE</h1>
        <p>React failed to initialize completely.</p>
        <p>Error: ${error.message}</p>
        <p>This requires manual intervention - please contact system administrator.</p>
      </div>
    `
  }
}