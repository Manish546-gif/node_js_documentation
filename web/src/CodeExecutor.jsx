import { useState } from 'react'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import {
  mockFs,
  mockEvents,
  mockPath,
  mockUtil,
  mockHttp,
  mockCrypto,
  mockBuffer,
} from './mockFs'
import CodeCorrector from './CodeCorrector'
import './CodeExecutor.css'

const defaultCode = `// Try running fs functions here!
var fs = require('fs');
var path = require('path');

// Example 1: Read a file
fs.readFile('/tmp/hello', 'utf8', function (err, data) {
  if (err) {
    console.log('Error:', err.message);
  } else {
    console.log('Content:', data);
    console.log('Path:', path.resolve(data));
  }
});

// Example 2: Write a file
fs.writeFile('/tmp/test.txt', 'Hello!', function (err) {
  if (err) {
    console.log('Error:', err.message);
  } else {
    console.log('File written successfully');
  }
});
`

const createFakeRequire = () => {
  return (moduleName) => {
    const modules = {
      fs: mockFs,
      path: mockPath,
      util: mockUtil,
      events: mockEvents,
      http: mockHttp,
      crypto: mockCrypto,
      buffer: mockBuffer,
    }

    if (modules[moduleName]) {
      return modules[moduleName]
    }

    throw new Error(`Module '${moduleName}' not available in sandbox`)
  }
}

export default function CodeExecutor({ isOpen, onClose }) {
  const [code, setCode] = useState(defaultCode)
  const [output, setOutput] = useState([])
  const [isRunning, setIsRunning] = useState(false)

  const captureConsole = () => {
    const logs = []
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn

    console.log = (...args) => {
      logs.push({ type: 'log', message: args.map((a) => String(a)).join(' ') })
      originalLog(...args)
    }
    console.error = (...args) => {
      logs.push({ type: 'error', message: args.map((a) => String(a)).join(' ') })
      originalError(...args)
    }
    console.warn = (...args) => {
      logs.push({ type: 'warn', message: args.map((a) => String(a)).join(' ') })
      originalWarn(...args)
    }

    return () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
      return logs
    }
  }

  const runCode = async () => {
    setIsRunning(true)
    setOutput([{ type: 'log', message: 'Running...' }])

    const restore = captureConsole()

    try {
      // Create isolated context
      const require = createFakeRequire()

      // eslint-disable-next-line no-new-func
      const userFunction = new Function('require', 'console', code)
      const result = await Promise.race([
        new Promise((resolve) => {
          userFunction(require, console)
          // Give async callbacks time to run
          setTimeout(resolve, 2000)
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Execution timeout (2s)')), 2100),
        ),
      ])
    } catch (err) {
      console.error('Error:', err.message)
    } finally {
      const logs = restore()
      setOutput(logs.length > 0 ? logs : [{ type: 'log', message: 'No output' }])
      setIsRunning(false)
    }
  }

  const clearOutput = () => {
    setOutput([])
  }

  const resetCode = () => {
    setCode(defaultCode)
    setOutput([])
  }

  const highlightCode = () => {
    try {
      return hljs.highlight(code, { language: 'javascript', ignoreIllegals: true })
        .value
    } catch {
      return code
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="executor-overlay" onClick={onClose} />
      <div className="code-executor-slider">
        <div className="executor-header">
          <h2>Code Executor</h2>
          <button className="close-btn" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <div className="executor-container">
          <div className="editor-section">
            <h3>Code Editor</h3>
            <div className="code-editor-wrapper">
              <pre className="code-highlight">
                <code
                  dangerouslySetInnerHTML={{
                    __html: highlightCode(),
                  }}
                />
              </pre>
              <textarea
                className="code-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your fs code here..."
                disabled={isRunning}
              />
            </div>
            <div className="executor-actions">
              <button className="btn-primary" onClick={runCode} disabled={isRunning}>
                {isRunning ? 'Running...' : '▶ Run Code'}
              </button>
              <button className="btn-secondary" onClick={resetCode} disabled={isRunning}>
                ↺ Reset
              </button>
              <button
                className="btn-secondary"
                onClick={() => setCode(CodeCorrector.autoCorrect(code))}
                disabled={isRunning}
                title="Auto-correct code errors"
              >
                ✓ Auto-Correct
              </button>
            </div>
          </div>

          <div className="output-section">
            <div className="output-header">
              <h3>Output Console</h3>
              <button className="btn-small" onClick={clearOutput} disabled={isRunning}>
                Clear
              </button>
            </div>

            {/* Code Analysis Section */}
            {code.trim() && (
              <div className="code-analysis">
                <div className="analysis-header">
                  <h4>📝 Code Analysis</h4>
                </div>
                {CodeCorrector.analyzeCode(code).length > 0 ? (
                  <div className="analysis-items">
                    {CodeCorrector.analyzeCode(code).map((err, idx) => (
                      <div key={idx} className={`analysis-item analysis-${err.type}`}>
                        <span className="analysis-icon">
                          {err.type === 'error' ? '✗' : '⚠'}
                        </span>
                        <span className="analysis-text">{err.message}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="analysis-items">
                    <div className="analysis-item analysis-success">
                      <span className="analysis-icon">✓</span>
                      <span className="analysis-text">No errors detected</span>
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {CodeCorrector.getSuggestions(code).length > 0 && (
                  <div className="suggestions">
                    <h5>💡 Suggestions:</h5>
                    {CodeCorrector.getSuggestions(code).map((suggestion, idx) => (
                      <div key={idx} className="suggestion-item">
                        • {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="console-output">
              {output.length === 0 ? (
                <p className="empty-output">Click "Run Code" to see output here</p>
              ) : (
                output.map((line, index) => (
                  <div key={index} className={`output-line output-${line.type}`}>
                    <span className="output-prefix">
                      {line.type === 'log'
                        ? '>'
                        : line.type === 'error'
                          ? '✗'
                          : '⚠'}
                    </span>
                    {line.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
