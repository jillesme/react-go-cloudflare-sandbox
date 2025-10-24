import './TestResults.css'

interface TestResultsProps {
  result: {
    stdout: string
    error: string
    exitCode: number
    success: boolean
  }
}

export default function TestResults({ result }: TestResultsProps) {
  return (
    <div className="test-results">
      <div className={`status-badge ${result.success ? 'success' : 'failure'}`}>
        {result.success ? '✓ TESTS PASSED' : '✗ TESTS FAILED'}
      </div>

      {result.stdout && (
        <div className="output-section">
          <strong className="output-label">Output:</strong>
          <pre className="output-content">{result.stdout}</pre>
        </div>
      )}

      {result.error && (
        <div className="error-section">
          <strong className="output-label">Error:</strong>
          <pre className="error-content">{result.error}</pre>
        </div>
      )}
    </div>
  )
}
