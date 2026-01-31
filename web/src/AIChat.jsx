import { useState, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import './AIChat.css'

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [hasApiKey, setHasApiKey] = useState(!!import.meta.env.VITE_GEMINI_API_KEY)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const genAIRef = useRef(null)
  const chatRef = useRef(null)

  // Initialize Gemini AI on component mount
  useEffect(() => {
    if (import.meta.env.VITE_GEMINI_API_KEY) {
      try {
        genAIRef.current = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
        const model = genAIRef.current.getGenerativeModel({ model: 'gemini-pro' })
        chatRef.current = model.startChat({
          history: [],
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          },
        })
        setHasApiKey(true)
        setApiError(null)
      } catch (error) {
        console.error('Failed to initialize Gemini:', error)
        setApiError('Failed to initialize AI')
        setHasApiKey(false)
      }
    }

    // Load chat history from sessionStorage on mount
    const savedMessages = sessionStorage.getItem('ai_chat_history')
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages))
      } catch (e) {
        console.error('Failed to load chat history:', e)
      }
    }
  }, [])

  // Save chat history to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('ai_chat_history', JSON.stringify(messages))
  }, [messages])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const generateAIResponse = async (userMessage) => {
    // If no API key, use fallback knowledge base
    if (!hasApiKey || !chatRef.current) {
      return generateFallbackResponse(userMessage)
    }

    try {
      // Send message to Gemini with Node.js context
      const systemPrompt = `You are a helpful Node.js programming assistant. Help users understand Node.js modules, functions, and best practices. 
Focus on these modules: fs, path, crypto, http, events, buffer, and util. Provide code examples when helpful.
Keep responses concise but informative. Use markdown formatting for better readability.`

      const response = await chatRef.current.sendMessage(`${systemPrompt}\n\nUser question: ${userMessage}`)
      const aiResponse = await response.response
      return aiResponse.text()
    } catch (error) {
      console.error('Gemini API error:', error)
      setApiError('Failed to get AI response')
      return generateFallbackResponse(userMessage)
    }
  }

  const generateFallbackResponse = (userMessage) => {
    const msg = userMessage.toLowerCase()
    
    // Enhanced knowledge base with better responses
    const knowledgeBase = {
      'fs|file': {
        title: 'File System (fs) Module',
        content: `The **fs** module provides file system operations in Node.js.\n\n**Key Methods:**\n• **readFile(path, encoding, callback)** - Read file contents asynchronously\n• **writeFile(path, data, callback)** - Write data to a file\n• **appendFile(path, data, callback)** - Append data to a file\n• **mkdir(path, callback)** - Create a directory\n• **readdir(path, callback)** - List directory contents\n• **unlink(path, callback)** - Delete a file\n• **stat(path, callback)** - Get file statistics\n\n**Example:**\n\`\`\`javascript\nvar fs = require('fs');\n\nfs.readFile('/tmp/hello', 'utf8', function(err, data) {\n  if (err) {\n    console.error('Error reading file:', err);\n    return;\n  }\n  console.log('File content:', data);\n});\n\nfs.writeFile('/tmp/test.txt', 'Hello World!', function(err) {\n  if (err) throw err;\n  console.log('File written!');\n});\n\`\`\`\n\n**Best Practices:**\n• Always handle errors in callbacks\n• Use async methods for better performance\n• Check file permissions before operations`
      },
      'path|route': {
        title: 'Path Module',
        content: `The **path** module provides utilities for working with file and directory paths.\n\n**Key Methods:**\n• **join(...paths)** - Join path segments together\n• **resolve(...paths)** - Resolve absolute path\n• **dirname(path)** - Get directory name from path\n• **basename(path, ext)** - Get file name from path\n• **extname(path)** - Get file extension\n• **parse(path)** - Parse path into components\n• **format(obj)** - Create path from components\n\n**Example:**\n\`\`\`javascript\nvar path = require('path');\n\n// Join paths\nconsole.log(path.join('/a', 'b', 'c')); // Output: /a/b/c\n\n// Get file name\nconsole.log(path.basename('/tmp/file.txt')); // Output: file.txt\n\n// Get directory\nconsole.log(path.dirname('/tmp/file.txt')); // Output: /tmp\n\n// Get extension\nconsole.log(path.extname('file.json')); // Output: .json\n\n// Resolve absolute path\nconsole.log(path.resolve('/a', 'b')); // Output: /a/b\n\`\`\`\n\n**Path Properties:**\n• **path.sep** - Platform-specific path separator (/ or \\)`
      },
      'crypto|hash|encrypt': {
        title: 'Crypto Module',
        content: `The **crypto** module provides cryptographic functionality for Node.js.\n\n**Key Methods:**\n• **randomBytes(size, callback)** - Generate cryptographically secure random bytes\n• **createHash(algorithm)** - Create a hash object\n• **createHmac(algorithm, key)** - Create an HMAC object\n• **pbkdf2(password, salt, iterations, keylen, digest, callback)** - Derive key\n\n**Supported Algorithms:**\n• sha256, sha512, md5, sha1, sha384, sha224\n\n**Example:**\n\`\`\`javascript\nvar crypto = require('crypto');\n\n// Generate random bytes\ncrypto.randomBytes(16, function(err, buffer) {\n  if (err) throw err;\n  console.log('Random:', buffer.toString('hex'));\n});\n\n// Create hash\nvar hash = crypto.createHash('sha256');\nhash.update('Hello World');\nhash.update('!');\nconsole.log('Hash:', hash.digest('hex'));\n\n// HMAC example\nvar hmac = crypto.createHmac('sha256', 'secret-key');\nhmac.update('data to sign');\nconsole.log('HMAC:', hmac.digest('hex'));\n\`\`\`\n\n**Security Tips:**\n• Always use 'sha256' or 'sha512' for hashing\n• Use randomBytes for generating salts\n• Never hardcode secrets in code`
      },
      'http|server|request': {
        title: 'HTTP Module',
        content: `The **http** module provides HTTP server and client functionality.\n\n**Key Methods:**\n• **createServer(callback)** - Create an HTTP server\n• **listen(port, host, callback)** - Start listening for connections\n• **request(options, callback)** - Make HTTP request\n• **get(url, callback)** - Make HTTP GET request\n\n**Server Example:**\n\`\`\`javascript\nvar http = require('http');\n\nvar server = http.createServer(function(req, res) {\n  res.statusCode = 200;\n  res.setHeader('Content-Type', 'text/plain');\n  res.end('Hello World!');\n});\n\nserver.listen(3000, function() {\n  console.log('Server running on port 3000');\n});\n\`\`\`\n\n**Making Requests:**\n\`\`\`javascript\nvar http = require('http');\n\nhttp.get('http://example.com', function(res) {\n  console.log('Status:', res.statusCode);\n  var data = '';\n  \n  res.on('data', function(chunk) {\n    data += chunk;\n  });\n  \n  res.on('end', function() {\n    console.log('Response:', data);\n  });\n});\n\`\`\`\n\n**Request Object Properties:**\n• req.method - HTTP method (GET, POST, etc.)\n• req.url - Request URL\n• req.headers - Request headers`
      },
      'event|emitter|listener': {
        title: 'Events Module (EventEmitter)',
        content: `The **events** module provides the **EventEmitter** class for event-driven programming.\n\n**Key Methods:**\n• **on(event, listener)** - Add an event listener\n• **once(event, listener)** - Add one-time listener\n• **off(event, listener)** - Remove an event listener\n• **emit(event, ...args)** - Trigger an event\n• **listeners(event)** - Get all listeners for event\n• **removeListener(event, listener)** - Remove specific listener\n\n**Example:**\n\`\`\`javascript\nvar events = require('events');\nvar emitter = new events.EventEmitter();\n\n// Add listener\nemitter.on('greet', function(name) {\n  console.log('Hello, ' + name);\n});\n\n// Add one-time listener\nemitter.once('goodbye', function() {\n  console.log('Goodbye!');\n});\n\n// Emit events\nemitter.emit('greet', 'Alice');\nemitter.emit('goodbye'); // Only fires once\n\`\`\`\n\n**Common Patterns:**\n\`\`\`javascript\n// Creating custom emitters\nfunction MyEmitter() {\n  events.EventEmitter.call(this);\n}\n\nMyEmitter.prototype = Object.create(events.EventEmitter.prototype);\n\nvar myEmitter = new MyEmitter();\nmyEmitter.emit('custom-event', 'data');\n\`\`\`\n\n**Best Practices:**\n• Use descriptive event names\n• Document which events your code emits\n• Handle errors with error listeners`
      },
      'buffer|binary': {
        title: 'Buffer Module',
        content: `The **Buffer** class provides a way to work with binary data in Node.js.\n\n**Key Methods:**\n• **Buffer.from(string, encoding)** - Create buffer from string\n• **Buffer.from(array)** - Create buffer from array\n• **Buffer.alloc(size)** - Allocate new buffer\n• **Buffer.concat(list)** - Concatenate buffers\n• **toString(encoding)** - Convert buffer to string\n• **slice(start, end)** - Extract portion of buffer\n\n**Example:**\n\`\`\`javascript\nvar buffer = require('buffer');\n\n// Create from string\nvar buf1 = buffer.Buffer.from('Hello World');\nconsole.log(buf1.toString()); // Hello World\n\n// Create empty buffer\nvar buf2 = buffer.Buffer.alloc(10);\nconsole.log(buf2.length); // 10\n\n// Convert to hex\nvar buf3 = buffer.Buffer.from('Node.js');\nconsole.log(buf3.toString('hex')); // 4e6f64652e6a73\n\n// Concatenate buffers\nvar buf4 = buffer.Buffer.concat([buf1, buf2]);\nconsole.log(buf4.length);\n\`\`\`\n\n**Encodings:**\n• utf8 - Unicode (default)\n• hex - Hexadecimal\n• base64 - Base64 encoding\n• ascii - ASCII text\n• utf16le - UTF-16 Little Endian`
      },
      'util|utility': {
        title: 'Util Module',
        content: `The **util** module provides utility functions for debugging and manipulation.\n\n**Key Methods:**\n• **inspect(object, options)** - String representation of object\n• **format(f, ...)** - Format string with %s, %d, %i, %f\n• **inherits(constructor, superConstructor)** - Prototypal inheritance\n• **types** - Type checking utilities\n\n**Example:**\n\`\`\`javascript\nvar util = require('util');\n\n// Inspect object\nvar obj = { name: 'test', value: 42, nested: { a: 1 } };\nconsole.log(util.inspect(obj));\n// Output: { name: 'test', value: 42, nested: { a: 1 } }\n\n// Format strings\nconsole.log(util.format('Hello %s, you are %d years old', 'John', 25));\n// Output: Hello John, you are 25 years old\n\n// Formatting options\nvar formatted = util.inspect(obj, { colors: false, depth: 2 });\n\`\`\`\n\n**Inspect Options:**\n• showHidden - Include non-enumerable properties\n• depth - How deep to show nested objects\n• colors - Colorize output\n• compact - Compact representation`
      },
      'error|debug|help': {
        title: 'Getting Help & Debugging',
        content: `**Common Node.js Errors & Solutions:**\n\n**1. Cannot find module**\n• Make sure the module is installed\n• Check the module name spelling\n• Use require() with correct path\n\n**2. Callback was already called**\n• Ensure callbacks are only called once\n• Use return statement after callback\n\n**3. ENOENT: no such file or directory**\n• File doesn't exist at the specified path\n• Check file path is correct\n• Ensure file has proper permissions\n\n**4. EACCES: permission denied**\n• File/directory has insufficient permissions\n• Use chmod to change permissions\n• Run with appropriate privileges\n\n**5. TypeError: callback is not a function**\n• Callback is not defined or not a function\n• Verify callback is passed as parameter\n\n**Debugging Tips:**\n• Use console.log() to trace execution\n• Check error messages carefully - they give hints\n• Use the debugger: node --inspect app.js\n• Read the full error stack trace\n• Test with simple code first\n\n**In This App:**\n• Click "Auto-Correct" button to fix code errors\n• Check the Code Analysis panel for suggestions\n• Use the console output to debug\n• Ask me specific questions about errors`
      }
    }

    // Check for matches in knowledge base
    for (const [keywords, info] of Object.entries(knowledgeBase)) {
      const keywordArray = keywords.split('|')
      if (keywordArray.some(k => msg.includes(k))) {
        return `**${info.title}**\n\n${info.content}`
      }
    }

    // Default helpful response
    return `Hi! I'm your AI Assistant. I can help you learn Node.js modules and troubleshoot code.\n\n**I can explain:**\n• **fs** - File System operations (read/write files)\n• **path** - Path utilities and manipulation\n• **http** - HTTP servers and requests\n• **crypto** - Cryptography and hashing\n• **events** - Event handling with EventEmitter\n• **buffer** - Working with binary data\n• **util** - Utility functions\n• **Errors** - Debugging and error handling\n\n**Try asking me about:**\n• "How do I read a file?"\n• "What's the EventEmitter?"\n• "How do I create a hash?"\n• "Help with error: ..."\n\nWhat would you like to know?`
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMsg = inputValue.trim()
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: userMsg,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setApiError(null)

    try {
      const aiResponse = await generateAIResponse(userMsg)

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      setApiError('Failed to send message')
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
      }
      
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = () => {
    if (window.confirm('Clear all chat messages? This action cannot be undone.')) {
      setMessages([])
      sessionStorage.removeItem('ai_chat_history')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Button - Professional Design */}
      <button
        className={`ai-chat-button ${isOpen ? 'ai-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with AI Assistant"
      >
        <span className="ai-button-icon">✨</span>
        <span className="ai-button-text">Ask AI</span>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <>
          <div className="ai-chat-overlay" onClick={() => setIsOpen(false)} />
          <div className="ai-chat-panel">
            {/* Header */}
            <div className="ai-chat-header">
              <div className="ai-header-content">
                <h3 className="ai-header-title">✨ AI Assistant</h3>
                <p className="ai-header-subtitle">Powered by Node.js Knowledge Base</p>
              </div>
              <div className="ai-chat-controls">
                <button
                  className="ai-control-btn"
                  onClick={handleClearChat}
                  title="Clear chat"
                  disabled={messages.length === 0}
                >
                  🗑️
                </button>
                <button
                  className="ai-close-btn"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="ai-chat-messages">
              {apiError && (
                <div className="ai-api-error">
                  ⚠️ {apiError}
                </div>
              )}
              
              {!hasApiKey && (
                <div className="ai-setup-info">
                  <p>🔑 <strong>Setup Required</strong></p>
                  <p>To use Gemini AI, add your API key:</p>
                  <p><code>VITE_GEMINI_API_KEY</code></p>
                  <p style={{fontSize: '11px', marginTop: '8px'}}>Get a free key at: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></p>
                  <p style={{fontSize: '12px', marginTop: '8px'}}>Until then, I'll use the built-in knowledge base.</p>
                </div>
              )}

              {messages.length === 0 ? (
                <div className="ai-welcome">
                  <div className="ai-welcome-icon">✨</div>
                  <h2 className="ai-welcome-title">Welcome to AI Assistant</h2>
                  <p className="ai-welcome-subtitle">{hasApiKey ? 'Powered by Google Gemini' : 'Using built-in knowledge base'}</p>
                  <p className="ai-welcome-subtitle">Ask me anything about Node.js modules, functions, or coding issues</p>
                  
                  <div className="ai-suggestions">
                    <p className="ai-suggestions-label">💡 Try asking:</p>
                    <button 
                      className="ai-suggestion-btn"
                      onClick={() => {
                        setInputValue('Explain the fs module')
                        setTimeout(() => inputRef.current?.focus(), 0)
                      }}
                    >
                      "Explain the fs module"
                    </button>
                    <button 
                      className="ai-suggestion-btn"
                      onClick={() => {
                        setInputValue('How do I create an HTTP server?')
                        setTimeout(() => inputRef.current?.focus(), 0)
                      }}
                    >
                      "How to create HTTP server?"
                    </button>
                    <button 
                      className="ai-suggestion-btn"
                      onClick={() => {
                        setInputValue('What is EventEmitter?')
                        setTimeout(() => inputRef.current?.focus(), 0)
                      }}
                    >
                      "What is EventEmitter?"
                    </button>
                    <button 
                      className="ai-suggestion-btn"
                      onClick={() => {
                        setInputValue('How do I work with files?')
                        setTimeout(() => inputRef.current?.focus(), 0)
                      }}
                    >
                      "How to work with files?"
                    </button>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`ai-message-wrapper ai-${msg.type}`}>
                    <div className={`ai-message ai-${msg.type}`}>
                      <div className="ai-message-content">
                        {msg.content.split('\n').map((line, idx) => {
                          // Basic markdown support
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return <strong key={idx}>{line.slice(2, -2)}</strong>
                          }
                          if (line.startsWith('• ')) {
                            return <li key={idx}>{line.slice(2)}</li>
                          }
                          if (line.startsWith('`')) {
                            return <code key={idx}>{line.slice(1, -1)}</code>
                          }
                          return <div key={idx}>{line}</div>
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="ai-message-wrapper ai-ai">
                  <div className="ai-message ai-ai ai-loading">
                    <div className="ai-typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="ai-chat-input-area">
              <div className="ai-input-wrapper">
                <textarea
                  ref={inputRef}
                  className="ai-chat-input"
                  placeholder="Ask me anything... (Shift+Enter for new line)"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  rows={1}
                />
                <button
                  className="ai-send-btn"
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  title="Send message"
                >
                  <span className="ai-send-icon">→</span>
                </button>
              </div>
              <p className="ai-input-hint">Your chat is saved while you're on this page</p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
