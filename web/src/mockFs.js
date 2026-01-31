// Mock File System for demonstration purposes
// Stores files in memory and simulates Node.js fs module behavior

class MockFS {
  constructor() {
    this.files = new Map()
    this.fileDescriptors = new Map()
    this.nextFd = 3
    this.watchers = new Map()

    // Initialize with some example files
    this.files.set('/tmp/hello', 'Hello World!')
    this.files.set('/tmp/example.txt', 'This is an example file.\n')
  }

  // Asynchronous methods
  readFile(filename, encoding, callback) {
    // Handle optional encoding parameter
    if (typeof encoding === 'function') {
      callback = encoding
      encoding = 'utf8'
    }

    setTimeout(() => {
      if (this.files.has(filename)) {
        callback(null, this.files.get(filename))
      } else {
        callback(new Error(`ENOENT: no such file or directory, open '${filename}'`))
      }
    }, 10)
  }

  writeFile(filename, data, callback) {
    if (typeof callback !== 'function') {
      callback = () => {}
    }

    setTimeout(() => {
      this.files.set(filename, data)
      callback(null)
    }, 10)
  }

  appendFile(filename, data, callback) {
    if (typeof callback !== 'function') {
      callback = () => {}
    }

    setTimeout(() => {
      const current = this.files.get(filename) || ''
      this.files.set(filename, current + data)
      callback(null)
    }, 10)
  }

  unlink(filename, callback) {
    setTimeout(() => {
      if (this.files.has(filename)) {
        this.files.delete(filename)
        callback(null)
      } else {
        callback(new Error(`ENOENT: no such file or directory, unlink '${filename}'`))
      }
    }, 10)
  }

  readdir(dirname, callback) {
    setTimeout(() => {
      const files = Array.from(this.files.keys())
        .filter((f) => f.startsWith(dirname + '/'))
        .map((f) => f.replace(dirname + '/', '').split('/')[0])
      const unique = [...new Set(files)]
      if (unique.length > 0) {
        callback(null, unique)
      } else {
        callback(null, [])
      }
    }, 10)
  }

  stat(filename, callback) {
    setTimeout(() => {
      if (this.files.has(filename)) {
        const data = this.files.get(filename)
        callback(null, {
          size: data.length,
          isFile: () => true,
          isDirectory: () => false,
          mtime: new Date(),
        })
      } else {
        callback(new Error(`ENOENT: no such file or directory, stat '${filename}'`))
      }
    }, 10)
  }

  mkdir(dirname, mode, callback) {
    if (typeof mode === 'function') {
      callback = mode
    }
    setTimeout(() => {
      // Mark directory as existing
      this.files.set(dirname + '/.dir', '')
      callback(null)
    }, 10)
  }

  rmdir(dirname, callback) {
    setTimeout(() => {
      const key = dirname + '/.dir'
      if (this.files.has(key)) {
        this.files.delete(key)
        callback(null)
      } else {
        callback(new Error(`ENOENT: no such file or directory, rmdir '${dirname}'`))
      }
    }, 10)
  }

  exists(filename, callback) {
    setTimeout(() => {
      callback(this.files.has(filename))
    }, 10)
  }

  // Synchronous methods
  readFileSync(filename, encoding) {
    if (typeof encoding === 'object') {
      encoding = encoding.encoding || 'utf8'
    }
    if (this.files.has(filename)) {
      return this.files.get(filename)
    } else {
      throw new Error(`ENOENT: no such file or directory, open '${filename}'`)
    }
  }

  writeFileSync(filename, data) {
    this.files.set(filename, data)
  }

  appendFileSync(filename, data) {
    const current = this.files.get(filename) || ''
    this.files.set(filename, current + data)
  }

  unlinkSync(filename) {
    if (this.files.has(filename)) {
      this.files.delete(filename)
    } else {
      throw new Error(`ENOENT: no such file or directory, unlink '${filename}'`)
    }
  }

  readdirSync(dirname) {
    const files = Array.from(this.files.keys())
      .filter((f) => f.startsWith(dirname + '/'))
      .map((f) => f.replace(dirname + '/', '').split('/')[0])
    return [...new Set(files)]
  }

  statSync(filename) {
    if (this.files.has(filename)) {
      const data = this.files.get(filename)
      return {
        size: data.length,
        isFile: () => true,
        isDirectory: () => false,
        mtime: new Date(),
      }
    } else {
      throw new Error(`ENOENT: no such file or directory, stat '${filename}'`)
    }
  }

  mkdirSync(dirname, mode) {
    this.files.set(dirname + '/.dir', '')
  }

  rmdirSync(dirname) {
    const key = dirname + '/.dir'
    if (this.files.has(key)) {
      this.files.delete(key)
    } else {
      throw new Error(`ENOENT: no such file or directory, rmdir '${dirname}'`)
    }
  }

  existsSync(filename) {
    return this.files.has(filename)
  }

  // Constants
  constants = {
    R_OK: 4,
    W_OK: 2,
    X_OK: 1,
  }
}

// Mock Events module
class MockEventEmitter {
  constructor() {
    this.events = {}
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(listener)
    return this
  }

  emit(event, ...args) {
    if (!this.events[event]) return false
    this.events[event].forEach((listener) => listener(...args))
    return true
  }

  off(event, listener) {
    if (!this.events[event]) return this
    this.events[event] = this.events[event].filter((l) => l !== listener)
    return this
  }

  once(event, listener) {
    const onceWrapper = (...args) => {
      listener(...args)
      this.off(event, onceWrapper)
    }
    this.on(event, onceWrapper)
    return this
  }
}

export const mockEvents = {
  EventEmitter: MockEventEmitter,
}

// Mock Path module
export const mockPath = {
  join: (...parts) => parts.filter(Boolean).join('/'),
  resolve: (...parts) => '/' + parts.filter(Boolean).join('/'),
  dirname: (path) => {
    const parts = path.split('/')
    return parts.slice(0, -1).join('/') || '/'
  },
  basename: (path) => {
    const parts = path.split('/')
    return parts[parts.length - 1]
  },
  extname: (path) => {
    const parts = path.split('.')
    return parts.length > 1 ? '.' + parts[parts.length - 1] : ''
  },
  sep: '/',
}

// Mock Util module
export const mockUtil = {
  inspect: (obj, options) => {
    return JSON.stringify(obj, null, 2)
  },
  format: (...args) => {
    return args.join(' ')
  },
}

// Mock HTTP module (basic)
export const mockHttp = {
  createServer: (callback) => ({
    listen: (port, cb) => {
      console.log(`Server listening on port ${port}`)
      if (cb) cb()
    },
    close: () => console.log('Server closed'),
  }),
  request: (options, callback) => ({
    end: () => console.log(`HTTP request to ${options.hostname || 'localhost'}`),
    write: (data) => console.log('Request data:', data),
  }),
  get: (url, callback) => ({
    end: () => console.log(`HTTP GET ${url}`),
  }),
}

// Mock Crypto module (basic)
export const mockCrypto = {
  randomBytes: (size) => {
    const bytes = []
    for (let i = 0; i < size; i++) {
      bytes.push(Math.floor(Math.random() * 256))
    }
    return Buffer.from(bytes)
  },
  createHash: (algorithm) => ({
    update: function(data) {
      this.data = data
      return this
    },
    digest: function(encoding) {
      return 'hash_' + this.data.slice(0, 10)
    },
  }),
}

// Mock Buffer
class MockBuffer {
  constructor(size) {
    this.data = new Uint8Array(size)
    this.length = size
  }

  static from(data) {
    const buf = new MockBuffer(data.length)
    for (let i = 0; i < data.length; i++) {
      buf.data[i] = data.charCodeAt(i)
    }
    return buf
  }

  static alloc(size) {
    return new MockBuffer(size)
  }

  toString(encoding) {
    return String.fromCharCode(...this.data)
  }
}

export const mockBuffer = {
  Buffer: MockBuffer,
}

const createPlaceholderModule = (name, extra = {}) => ({
  __name: name,
  info: () => `Module '${name}' is a sandbox placeholder`,
  notImplemented: () => console.warn(`Module '${name}' is a sandbox placeholder`),
  ...extra,
})

// Mock Assert module
class MockAssertionError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AssertionError'
  }
}

export const mockAssert = {
  AssertionError: MockAssertionError,
  ok: (value, message = 'Assertion failed') => {
    if (!value) throw new MockAssertionError(message)
  },
  equal: (actual, expected, message = 'Expected values to be equal') => {
    if (actual != expected) throw new MockAssertionError(message)
  },
  strictEqual: (actual, expected, message = 'Expected values to be strictly equal') => {
    if (actual !== expected) throw new MockAssertionError(message)
  },
  deepEqual: (actual, expected, message = 'Expected values to be deeply equal') => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new MockAssertionError(message)
    }
  },
  throws: (fn, message = 'Expected function to throw') => {
    let threw = false
    try {
      fn()
    } catch (err) {
      threw = true
    }
    if (!threw) throw new MockAssertionError(message)
  },
}

// Mock Child Process module
export const mockChildProcess = {
  exec: (command, callback) => {
    const emitter = new MockEventEmitter()
    setTimeout(() => {
      if (callback) callback(null, `Executed: ${command}`, '')
      emitter.emit('close', 0)
    }, 10)
    return emitter
  },
  spawn: (command, args = []) => {
    const child = new MockEventEmitter()
    child.stdout = new MockEventEmitter()
    child.stderr = new MockEventEmitter()
    child.pid = Math.floor(Math.random() * 10000)
    setTimeout(() => {
      child.stdout.emit('data', `Spawned: ${command} ${args.join(' ')}`)
      child.emit('close', 0)
    }, 10)
    child.kill = () => child.emit('close', 0)
    return child
  },
}

// Mock Cluster module
export const mockCluster = {
  isMaster: true,
  isWorker: false,
  workers: {},
  fork: () => ({
    id: Math.floor(Math.random() * 10000),
    process: { pid: Math.floor(Math.random() * 10000) },
    on: () => {},
  }),
  on: () => {},
}

// Mock Console module
export const mockConsole = {
  Console: class MockConsole {
    constructor() {}
    log(...args) {
      console.log(...args)
    }
    error(...args) {
      console.error(...args)
    }
    warn(...args) {
      console.warn(...args)
    }
  },
  log: (...args) => console.log(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args),
}

// Mock DNS module
export const mockDns = {
  lookup: (hostname, callback) => {
    setTimeout(() => callback(null, '127.0.0.1', 4), 10)
  },
  resolve: (hostname, callback) => {
    setTimeout(() => callback(null, ['127.0.0.1']), 10)
  },
  resolve4: (hostname, callback) => {
    setTimeout(() => callback(null, ['127.0.0.1']), 10)
  },
}

// Mock Domain module
export const mockDomain = {
  create: () => {
    const domain = new MockEventEmitter()
    domain.run = (fn) => fn()
    domain.add = () => {}
    domain.remove = () => {}
    domain.bind = (fn) => fn
    domain.intercept = (fn) => fn
    domain.dispose = () => {}
    return domain
  },
}

// Mock HTTPS module
export const mockHttps = {
  createServer: (callback) => ({
    listen: (port, cb) => {
      console.log(`HTTPS server listening on port ${port}`)
      if (cb) cb()
    },
    close: () => console.log('HTTPS server closed'),
  }),
  request: (options, callback) => ({
    end: () => console.log(`HTTPS request to ${options.hostname || 'localhost'}`),
    write: (data) => console.log('Request data:', data),
  }),
  get: (url, callback) => ({
    end: () => console.log(`HTTPS GET ${url}`),
  }),
}

// Mock Net module
export const mockNet = {
  createServer: (callback) => ({
    listen: (port, cb) => {
      console.log(`TCP server listening on port ${port}`)
      if (cb) cb()
    },
    close: () => console.log('TCP server closed'),
  }),
  connect: (port, host, cb) => {
    const socket = new MockEventEmitter()
    setTimeout(() => {
      socket.emit('connect')
      if (cb) cb()
    }, 10)
    socket.write = (data) => console.log('Socket write:', data)
    socket.end = () => socket.emit('end')
    return socket
  },
}

// Mock OS module
export const mockOs = {
  platform: () => 'linux',
  arch: () => 'x64',
  hostname: () => 'sandbox',
  release: () => '1.0.0',
  type: () => 'Linux',
  uptime: () => 1234,
  tmpdir: () => '/tmp',
  homedir: () => '/home/sandbox',
  cpus: () => [{ model: 'Mock CPU', speed: 1000 }],
}

// Mock Process module
export const mockProcess = {
  env: {},
  argv: ['node', 'sandbox'],
  pid: 1234,
  platform: 'linux',
  version: 'v0.0.0-sandbox',
  cwd: () => '/',
  nextTick: (fn) => setTimeout(fn, 0),
  uptime: () => 1234,
}

// Mock Globals section
export const mockGlobals = {
  global: globalThis,
  process: mockProcess,
  Buffer: MockBuffer,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
}

// Mock Punycode module
export const mockPunycode = {
  toASCII: (value) => value,
  toUnicode: (value) => value,
}

// Mock Querystring module
export const mockQuerystring = {
  parse: (str) => Object.fromEntries(new URLSearchParams(str)),
  stringify: (obj) => new URLSearchParams(obj).toString(),
}

// Mock Readline module
export const mockReadline = {
  createInterface: (options = {}) => {
    const rl = new MockEventEmitter()
    rl.question = (query, cb) => {
      console.log(query)
      if (cb) cb('')
    }
    rl.close = () => rl.emit('close')
    return rl
  },
}

// Mock REPL module
export const mockRepl = {
  start: (options = {}) => {
    const repl = new MockEventEmitter()
    repl.context = {}
    repl.close = () => repl.emit('exit')
    return repl
  },
}

// Mock Stream module
class MockStream extends MockEventEmitter {
  pipe(dest) {
    return dest
  }
}

export const mockStream = {
  Readable: class MockReadable extends MockStream {
    push(data) {
      this.emit('data', data)
    }
  },
  Writable: class MockWritable extends MockStream {
    write(data) {
      this.emit('write', data)
    }
    end() {
      this.emit('finish')
    }
  },
  Transform: class MockTransform extends MockStream {},
  PassThrough: class MockPassThrough extends MockStream {},
}

// Mock String Decoder module
export const mockStringDecoder = {
  StringDecoder: class MockStringDecoder {
    constructor(encoding = 'utf8') {
      this.encoding = encoding
    }
    write(value) {
      return value
    }
    end(value = '') {
      return value
    }
  },
}

// Mock Timers module
export const mockTimers = {
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  setImmediate: (fn, ...args) => setTimeout(fn, 0, ...args),
  clearImmediate: (id) => clearTimeout(id),
}

// Mock TLS module
export const mockTls = {
  createServer: (callback) => ({
    listen: (port, cb) => {
      console.log(`TLS server listening on port ${port}`)
      if (cb) cb()
    },
    close: () => console.log('TLS server closed'),
  }),
  connect: (port, host, cb) => {
    const socket = new MockEventEmitter()
    setTimeout(() => {
      socket.emit('secureConnect')
      if (cb) cb()
    }, 10)
    socket.end = () => socket.emit('end')
    return socket
  },
}

// Mock TTY module
export const mockTty = {
  isatty: () => true,
  ReadStream: class MockReadStream extends MockStream {},
  WriteStream: class MockWriteStream extends MockStream {},
}

// Mock Dgram module
export const mockDgram = {
  createSocket: (type = 'udp4') => {
    const socket = new MockEventEmitter()
    socket.bind = (port, cb) => {
      console.log(`Dgram socket bound on ${port}`)
      if (cb) cb()
    }
    socket.send = (msg, port, address, cb) => {
      console.log(`Dgram send to ${address}:${port} -> ${msg}`)
      if (cb) cb()
    }
    socket.close = () => socket.emit('close')
    return socket
  },
}

// Mock URL module
export const mockUrl = {
  parse: (value) => {
    try {
      const url = new URL(value, 'http://localhost')
      return {
        href: url.href,
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        query: Object.fromEntries(url.searchParams),
      }
    } catch {
      return { href: value }
    }
  },
  format: (obj) => {
    if (typeof obj === 'string') return obj
    const base = `${obj.protocol || 'http:'}//${obj.hostname || 'localhost'}`
    return base + (obj.pathname || '/') + (obj.search || '') + (obj.hash || '')
  },
  resolve: (from, to) => new URL(to, from).toString(),
}

// Mock VM module
export const mockVm = {
  createContext: (sandbox = {}) => ({ ...sandbox, __isContext: true }),
  isContext: (sandbox) => Boolean(sandbox && sandbox.__isContext),
  runInNewContext: (code, sandbox = {}) => {
    const context = sandbox
    // eslint-disable-next-line no-new-func
    const fn = new Function('sandbox', `with (sandbox) { ${code} }`)
    return fn(context)
  },
  runInThisContext: (code) => {
    // eslint-disable-next-line no-new-func
    const fn = new Function(code)
    return fn()
  },
}

// Mock Zlib module
export const mockZlib = {
  gzip: (input, callback) => setTimeout(() => callback(null, input), 10),
  gunzip: (input, callback) => setTimeout(() => callback(null, input), 10),
  deflate: (input, callback) => setTimeout(() => callback(null, input), 10),
  inflate: (input, callback) => setTimeout(() => callback(null, input), 10),
}

// Placeholder modules for docs-only sections
export const mockAddons = createPlaceholderModule('addons')
export const mockDebugger = createPlaceholderModule('debugger')
export const mockTracing = createPlaceholderModule('tracing')
export const mockSmalloc = createPlaceholderModule('smalloc')
export const mockDocumentation = createPlaceholderModule('documentation')
export const mockSynopsis = createPlaceholderModule('synopsis')
export const mockModule = createPlaceholderModule('module')

export const mockFs = new MockFS()
