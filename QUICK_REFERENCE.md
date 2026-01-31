# Quick Reference - Node.js Documentation Website

## 🚀 Getting Started

```bash
# Start the development server
cd /workspaces/node_js_documentation/web
npm run dev

# Open in browser
http://localhost:5174
```

## 📚 Available Modules in Sandbox

All these modules can be used with `require()`:

### File System - `require('fs')`
```javascript
fs.readFile(path, encoding, callback)
fs.writeFile(path, data, callback)
fs.appendFile(path, data, callback)
fs.mkdir(path, callback)
fs.rmdir(path, callback)
fs.unlink(path, callback)
fs.stat(path, callback)
fs.readdir(path, callback)
```

### Path - `require('path')`
```javascript
path.join(...paths)           // Join paths
path.resolve(...paths)         // Resolve to absolute
path.dirname(path)             // Get directory
path.basename(path, ext)       // Get file name
path.extname(path)             // Get extension
path.sep                       // Path separator
```

### Utilities - `require('util')`
```javascript
util.inspect(object, options)  // Convert to readable string
util.format(format, ...)       // Format string with %s, %d, %i
```

### Events - `require('events')`
```javascript
var emitter = new events.EventEmitter()
emitter.on(event, callback)    // Listen for event
emitter.once(event, callback)  // Listen once
emitter.emit(event, ...args)   // Emit event
emitter.off(event, callback)   // Stop listening
```

### Crypto - `require('crypto')`
```javascript
crypto.randomBytes(size)               // Generate random bytes
var hash = crypto.createHash(algo)     // Create hash (sha256, md5, etc)
hash.update(data)                      // Add data to hash
hash.digest(encoding)                  // Get hash result (hex, base64, etc)
```

### HTTP - `require('http')`
```javascript
http.createServer(callback)            // Create mock server
http.get(options, callback)            // Mock GET request
http.request(options, callback)        // Mock HTTP request
```

### Buffer - `require('buffer')`
```javascript
buffer.Buffer.from(string, encoding)   // Create from string
buffer.Buffer.alloc(size)              // Create empty buffer
buf.toString(encoding)                 // Convert to string
buf.length                             // Buffer size
```

## 🎨 UI Controls

| Element | Function |
|---------|----------|
| **Sidebar** | Browse and search all Node.js modules |
| **Search Bar** | Full-text search in documentation |
| **Heading Links** | Click to copy heading anchor link |
| **Try Code Button** | Open code executor slider |
| **Back to Top** | Scroll to top of page (appears on scroll) |
| **Mobile Menu** | Toggle sidebar on small screens |
| **Prev/Next** | Navigate between modules |

## ✨ Code Executor

### Layout
- **Left**: Code editor with syntax highlighting
- **Right**: Output console with colored messages

### Output Colors
- 🟢 **Blue** `>` prefix: console.log()
- 🔴 **Red** `✗` prefix: console.error()
- 🟠 **Orange** `⚠` prefix: console.warn()

### Keyboard Shortcuts
- `Ctrl/Cmd + Shift + K`: Clear console (when focused in editor)
- `Ctrl/Cmd + /`: Comment/uncomment line

## 📝 Example Programs

### 1. Read and Write Files
```javascript
var fs = require('fs');

// Write a file
fs.writeFile('/tmp/myfile.txt', 'Hello World!', function(err) {
  if (err) console.error('Write error:', err.message);
  else console.log('File written');
});

// Read it back
fs.readFile('/tmp/myfile.txt', 'utf8', function(err, data) {
  if (err) console.error('Read error:', err.message);
  else console.log('Content:', data);
});
```

### 2. Path Operations
```javascript
var path = require('path');
var fs = require('fs');

var filePath = path.join('/tmp', 'data', 'users.json');
console.log('Full path:', filePath);
console.log('Directory:', path.dirname(filePath));
console.log('Filename:', path.basename(filePath));
console.log('Extension:', path.extname(filePath));
```

### 3. Hashing Data
```javascript
var crypto = require('crypto');

function hashPassword(password) {
  var hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}

var hashedPwd = hashPassword('mySecurePassword123');
console.log('Password hash:', hashedPwd);
```

### 4. Event Emitter Pattern
```javascript
var events = require('events');

function DataProcessor() {
  this.emitter = new events.EventEmitter();
}

var processor = new DataProcessor();

processor.emitter.on('processed', function(result) {
  console.log('Data processed:', result);
});

processor.emitter.emit('processed', { status: 'success', items: 42 });
```

### 5. Buffer Manipulation
```javascript
var buffer = require('buffer');

// Create from string
var buf = buffer.Buffer.from('Hello, Node.js!', 'utf8');
console.log('Buffer length:', buf.length);
console.log('Back to string:', buf.toString());

// Create empty and write
var empty = buffer.Buffer.alloc(10);
console.log('Empty buffer size:', empty.length);
```

## 🐛 Debugging Tips

### View Execution Details
```javascript
// Check what methods are available
var path = require('path');
var util = require('util');
console.log(util.inspect(path, { showHidden: true }));
```

### Test Error Handling
```javascript
var fs = require('fs');

// Try to read non-existent file
fs.readFile('/nonexistent.txt', 'utf8', function(err, data) {
  if (err) {
    console.error('Error type:', err.name);
    console.error('Error message:', err.message);
  }
});
```

### Capture Async Results
```javascript
var fs = require('fs');

console.log('Starting...');

fs.writeFile('/tmp/async-test.txt', 'test', function(err) {
  console.log('Write complete');
  
  fs.readFile('/tmp/async-test.txt', 'utf8', function(err, data) {
    console.log('Read result:', data);
  });
});

console.log('Requests queued');
```

## ⚙️ Limitations & Constraints

| Constraint | Details |
|-----------|---------|
| **Execution time** | Code times out after 2 seconds |
| **File system** | Only `/tmp/` directory is available |
| **Network** | HTTP module is mocked, no real requests |
| **Modules** | Only the 7 modules above are available |
| **Async delay** | Simulated with setTimeout (10ms minimum) |
| **File size** | Limited to reasonable sizes in memory |

## 🔍 Search Syntax

The search supports simple text matching:
- Search for **"fs"** → Finds all pages about file system
- Search for **"require"** → Finds usage in all modules
- Search for **"example"** → Finds code examples
- Search is **case-insensitive**

## 💾 Persistent Features

- **Last opened module**: Remembered in localStorage
- **Search history**: Not saved (fresh each session)
- **Code in executor**: Lost when page closes
- **Progress**: Scroll position per module

## 🌐 Offline Usage

✅ The website works offline:
1. Documentation is embedded as markdown
2. Search index is pre-built
3. No external API calls
4. Works after browser caching

## 📖 Documentation Structure

```
web/
├── public/docs/          # 40+ markdown files
│   ├── fs.md
│   ├── path.md
│   ├── buffer.md
│   └── ...
├── src/
│   ├── App.jsx          # Main component
│   ├── CodeExecutor.jsx # Code editor & executor
│   ├── mockFs.js        # Mock modules
│   └── *.css            # Styling
└── toc.json            # Table of contents mapping
```

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| Code not running | Check browser console (F12) for JS errors |
| Modules undefined | Make sure you spelled the module name correctly |
| No output | Click "Run Code" button after typing code |
| Syntax colors missing | Refresh page, clear cache |
| Slider won't open | Try right-clicking "Try Code" button |
| Search not working | Wait for search index to load (first load only) |

## 📱 Mobile Tips

- **Landscape mode**: Better for viewing code
- **Landscape + landscape split**: View docs and code together
- **Tap to focus**: Tap code editor to focus for keyboard
- **Menu button**: Use ≡ button to toggle sidebar
- **Two-finger zoom**: Available for all content

## 🎓 Learning Path

1. **Start** → Browse "fs" module to understand file operations
2. **Practice** → Write code to read/write files
3. **Expand** → Learn "path" module for file paths
4. **Combine** → Use fs + path together
5. **Advanced** → Explore crypto, events, http modules
6. **Build** → Create complex programs combining modules

---

**Happy coding!** 🚀 Your personal Node.js documentation and sandbox is ready to use.
