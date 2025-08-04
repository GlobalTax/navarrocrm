// Emergency Recovery App - Clean React Test
// No imports except React to avoid any conflicts

import React from 'react'

const EmergencyApp = () => {
  // Test basic React functionality
  const [status, setStatus] = React.useState('Initializing...')
  
  React.useEffect(() => {
    console.log('🚨 Emergency Recovery Mode - React hooks test')
    setStatus('React hooks are working!')
  }, [])
  
  return (
    <div style={{
      padding: '50px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: '1.6'
    }}>
      <div style={{
        backgroundColor: '#dc3545',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: '0 0 10px 0' }}>🚨 Emergency Recovery Mode</h1>
        <p style={{ margin: 0 }}>Navarro CRM - Testing React Core Functionality</p>
      </div>
      
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '2px solid #dee2e6',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2 style={{ marginTop: 0 }}>React Status Check</h2>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>React Version:</strong> {React.version}</p>
        <button 
          onClick={() => setStatus('Updated at ' + new Date().toLocaleTimeString())}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test React Update
        </button>
      </div>
      
      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        padding: '15px',
        borderRadius: '4px'
      }}>
        <strong>🔧 Recovery Instructions:</strong><br/>
        If this page loads and the button works, React is functional. 
        The previous errors were due to corrupted build cache.
      </div>
    </div>
  )
}

export default EmergencyApp