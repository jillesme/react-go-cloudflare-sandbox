import { useState, useEffect } from 'react'
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-go'
import 'prismjs/themes/prism-tomorrow.css'
import './App.css'

function App() {
  const [sessionId, setSessionId] = useState('')
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

  // Initialize or retrieve session ID from localStorage
  useEffect(() => {
    let storedSessionId = localStorage.getItem('goSessionId')
    if (!storedSessionId) {
      storedSessionId = Math.random().toString(36).substring(2, 15)
      localStorage.setItem('goSessionId', storedSessionId)
    }
    setSessionId(storedSessionId)
  }, [])

  const runGoCode = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('code', goCode)

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
      <h1 style={{ margin: '10px 0', fontSize: '24px' }}>Go Code Evaluator</h1>

      <div className='card' style={{ padding: '10px' }}>
        <Editor
          value={goCode}
          onValueChange={setGoCode}
          highlight={(code) => highlight(code, languages.go, 'go')}
          padding={8}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 13,
            marginBottom: '8px',
            border: '1px solid #444',
            borderRadius: '4px',
            minHeight: '280px'
          }}
        />
        <button onClick={runGoCode} disabled={loading} style={{ marginBottom: '10px' }}>
          {loading ? '📦 Running...' : '🚀 Run Go Code'}
        </button>

        {result && (
          <div style={{ marginTop: '10px', textAlign: 'left' }}>
            <div style={{
              marginBottom: '10px',
              padding: '10px 16px',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px',
              textAlign: 'center',
              backgroundColor: result.success ? '#00ff00' : '#ff0000',
              color: '#000'
            }}>
              {result.success ? '✓ TESTS PASSED' : '✗ TESTS FAILED'}
            </div>
            {result.stdout && (
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ fontSize: '14px' }}>Output:</strong>
                <pre style={{
                  background: '#1e1e1e',
                  padding: '10px',
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap',
                  margin: '4px 0',
                  color: '#e0e0e0',
                  fontSize: '12px',
                  lineHeight: '1.4',
                  border: '1px solid #333'
                }}>
                  {result.stdout}
                </pre>
              </div>
            )}
            {result.error && (
              <div>
                <strong style={{ fontSize: '14px' }}>Error:</strong>
                <pre style={{
                  background: '#2d1e1e',
                  padding: '10px',
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap',
                  margin: '4px 0',
                  color: '#ff6b6b',
                  fontSize: '12px',
                  lineHeight: '1.4',
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
