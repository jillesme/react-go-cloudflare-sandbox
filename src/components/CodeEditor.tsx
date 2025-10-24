import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-go'
import 'prismjs/themes/prism-tomorrow.css'
import './CodeEditor.css'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function CodeEditor({ value, onChange }: CodeEditorProps) {
  return (
    <Editor
      value={value}
      onValueChange={onChange}
      highlight={(code) => highlight(code, languages.go, 'go')}
      padding={8}
      className="code-editor"
    />
  )
}
