import { useState } from 'react'
import './App.css'

function App() {
  const [name, setName] = useState('unknown')
  const [goCode, setGoCode] = useState(`package main

import "fmt"

func Hello() string {
	return "Hello, Cloudflare Sandbox!"
}

func main() {
	fmt.Println(Hello())
}`)
  const [result, setResult] = useState<{
    stdout: string
    error: string
    exitCode: number
    success: boolean
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const runGoCode = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('code', goCode)

      const sessionId = Math.random().toString(36).substring(7)
      const response = await fetch(`/run/${sessionId}`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error running Go code:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1>Go Code Evaluator</h1>

      <div className='card'>
        <button
          onClick={() => {
            fetch('/api/')
              .then((res) => res.json() as Promise<{ name: string }>)
              .then((data) => setName(data.name))
          }}
          aria-label='get name'
        >
          Name from API is: {name}
        </button>
        <p>
          Edit <code>worker/index.ts</code> to change the name
        </p>
      </div>

      <div className='card'>
        <textarea
          value={goCode}
          onChange={(e) => setGoCode(e.target.value)}
          rows={15}
          style={{ width: '100%', fontFamily: 'monospace', padding: '10px' }}
        />
        <button onClick={runGoCode} disabled={loading}>
          {loading ? 'Running...' : 'Run Go Code'}
        </button>

        {result && (
          <div style={{ marginTop: '20px', textAlign: 'left' }}>
            <h3>Result:</h3>
            <div style={{ marginBottom: '10px' }}>
              <strong>Exit Code:</strong> {result.exitCode} | <strong>Success:</strong> {result.success ? 'Yes' : 'No'}
            </div>
            {result.stdout && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Output:</strong>
                <pre style={{
                  background: '#1e1e1e',
                  padding: '15px',
                  borderRadius: '5px',
                  whiteSpace: 'pre-wrap',
                  margin: '5px 0',
                  color: '#e0e0e0',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  border: '1px solid #333'
                }}>
                  {result.stdout}
                </pre>
              </div>
            )}
            {result.error && (
              <div>
                <strong>Error:</strong>
                <pre style={{
                  background: '#2d1e1e',
                  padding: '15px',
                  borderRadius: '5px',
                  whiteSpace: 'pre-wrap',
                  margin: '5px 0',
                  color: '#ff6b6b',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  border: '1px solid #5a3333'
                }}>
                  {result.error}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default App
