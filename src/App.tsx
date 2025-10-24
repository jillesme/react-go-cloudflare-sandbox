import { useState, useEffect } from 'react'
import CodeEditor from './components/CodeEditor'
import TestResults from './components/TestResults'
import './App.css'

function App() {
  const [sessionId, setSessionId] = useState('')
  const [goCode, setGoCode] = useState(`package main

import "fmt"

func Hello() string {
	return "Hello, Cloudflare Sandbox?"
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
      <h1 className="app-title">Go Code Evaluator</h1>

      <div className="app-card">
        <CodeEditor value={goCode} onChange={setGoCode} />

        <button className="run-button" onClick={runGoCode} disabled={loading}>
          {loading ? '📦 Running...' : '🚀 Run Go Code'}
        </button>

        {result && <TestResults result={result} />}
      </div>
    </>
  )
}

export default App
