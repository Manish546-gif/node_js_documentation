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

export const mockFs = new MockFS()
