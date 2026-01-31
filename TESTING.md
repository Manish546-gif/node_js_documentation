# Testing Guide - Node.js Documentation Website

## Starting the Application

```bash
cd /workspaces/node_js_documentation/web
npm run dev
```

The app will start at: **http://localhost:5174**

## Testing Checklist

### ✅ Documentation Reader

- [ ] **Load a module**: Click on "fs" or any module in the left sidebar
- [ ] **Read content**: Verify markdown renders correctly with proper formatting
- [ ] **Search functionality**: Type "file" in search bar and verify results appear
- [ ] **Copy link**: Click on a heading and verify "Link copied!" notification
- [ ] **Navigation**: Click previous/next buttons to navigate between modules
- [ ] **Scroll progress**: Scroll down and verify the progress bar at top updates
- [ ] **Back to top**: Click the back-to-top button at bottom right
- [ ] **Mobile menu**: Resize to mobile width and verify sidebar menu toggle works
- [ ] **Persistent state**: Refresh page and verify last opened module is still displayed

### ✅ Code Executor - Syntax Highlighting

- [ ] **Open executor**: Scroll to any section and click blue "Try Code" button
- [ ] **Syntax colors**: Verify JavaScript keywords are colored (not just black text)
- [ ] **Real-time update**: Type new code and verify colors update immediately
- [ ] **Blue strings**: Add a string like `"hello"` and verify it appears in blue
- [ ] **Green keywords**: Verify keywords like `var`, `function`, `if` are colored
- [ ] **Comments**: Add `// comment` and verify they're colored differently
- [ ] **Overlay effect**: Verify the code editor has a nice overlay appearance

### ✅ Code Executor - Module Support

**Test each module individually:**

#### 1. File System (fs)
```javascript
var fs = require('fs');
fs.readFile('/tmp/hello', 'utf8', function(err, data) {
  if (err) console.error('Error:', err.message);
  else console.log('File content:', data);
});
```
Expected: Should read the pre-initialized file `/tmp/hello`

#### 2. Path Module
```javascript
var path = require('path');
console.log('Join:', path.join('/a', '/b'));
console.log('Resolve:', path.resolve('/tmp'));
console.log('Basename:', path.basename('/tmp/file.txt'));
console.log('Dirname:', path.dirname('/tmp/file.txt'));
console.log('Extname:', path.extname('file.json'));
```
Expected: All path operations should return correct results

#### 3. Crypto Module
```javascript
var crypto = require('crypto');
var buf = crypto.randomBytes(16);
console.log('Random:', buf.toString('hex'));

var hash = crypto.createHash('sha256');
hash.update('HelloWorld');
console.log('SHA256:', hash.digest('hex'));
```
Expected: Random bytes and hash should be generated

#### 4. Events Module
```javascript
var events = require('events');
var emitter = new events.EventEmitter();
emitter.on('message', function(data) {
  console.log('Event received:', data);
});
emitter.emit('message', 'Hello from emitter!');
```
Expected: Event should be emitted and logged

#### 5. Util Module
```javascript
var util = require('util');
var obj = { name: 'test', value: 42 };
console.log('Inspect:', util.inspect(obj));
console.log('Format:', util.format('Value: %d, Name: %s', 42, 'test'));
```
Expected: Object inspection and string formatting should work

#### 6. HTTP Module
```javascript
var http = require('http');
var server = http.createServer(function(req, res) {
  console.log('Request received');
  res.write('Hello!');
  res.end();
});
console.log('Server mock created');
```
Expected: Server creation should not error

#### 7. Buffer Module
```javascript
var buffer = require('buffer');
var buf1 = buffer.Buffer.from('Hello');
console.log('Buffer:', buf1.toString());
var buf2 = buffer.Buffer.alloc(5);
console.log('Allocated:', buf2.length);
```
Expected: Buffer operations should work

### ✅ Code Executor - Output Formatting

- [ ] **Console.log**: Output should appear with blue `>` prefix
- [ ] **Console.error**: Error output should appear with red `✗` prefix and red background
- [ ] **Console.warn**: Warning output should appear with orange `⚠` prefix
- [ ] **Multiple outputs**: Run code with multiple console statements
- [ ] **Output animation**: Verify output lines animate smoothly when appearing
- [ ] **Clear output**: Click "Run Code" again and verify output is replaced

### ✅ UI/UX Elements

- [ ] **Gradient buttons**: Hover over "Run Code" button and verify color changes
- [ ] **Button animation**: Button should move up slightly on hover
- [ ] **Overlay**: When slider open, clicking overlay closes it
- [ ] **Close button**: Click X button to close slider
- [ ] **Responsive design**: 
  - [ ] Desktop (>1200px): Full-width layout
  - [ ] Tablet (768px-1200px): Adjusted padding
  - [ ] Mobile (<768px): Single column, full-width sidebar

### ✅ Error Handling

- [ ] **Syntax errors**: Type invalid JavaScript and click Run (should show error)
- [ ] **Module not found**: Try `require('nonexistent')` (should show error)
- [ ] **Timeout**: Write infinite loop `while(true){}` (should timeout after 2s)
- [ ] **File not found**: Try reading non-existent file (should show fs error)

## Performance Testing

- [ ] **Page load**: Should load in < 2 seconds
- [ ] **Search speed**: Typing search should be instant
- [ ] **Code execution**: Code should run within 2 seconds
- [ ] **Smooth scrolling**: No jank when scrolling documentation
- [ ] **Animation smoothness**: Slider, fadeIn, and output animations should be smooth

## Browser Testing

Test on these browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on Mac)
- [ ] Edge (if on Windows)
- [ ] Mobile Safari (iPhone)
- [ ] Chrome Mobile (Android)

## Expected Behavior Summary

| Feature | Expected | Pass |
|---------|----------|------|
| Doc loads on start | Shows random module | ☐ |
| Sidebar searchable | Search results appear | ☐ |
| Copy link works | "Link copied" notification | ☐ |
| Try Code opens | Slider appears from right | ☐ |
| Syntax highlighting | Code is colored | ☐ |
| Module loading | All 7 modules load | ☐ |
| Console capture | Output displays below | ☐ |
| Error handling | Errors show with red prefix | ☐ |
| Mobile responsive | Works on small screens | ☐ |
| Offline working | Works after page cache | ☐ |

## Troubleshooting

### Issue: Syntax highlighting not showing colors
- **Solution**: Make sure highlight.js CSS is loaded. Check browser DevTools (F12) > Network tab for `atom-one-dark.css`

### Issue: Modules not found error
- **Solution**: Refresh the page. If still broken, clear browser cache and reload.

### Issue: Slider doesn't appear
- **Solution**: Make sure JavaScript is enabled. Try clicking "Try Code" button again.

### Issue: Performance is slow
- **Solution**: Check if DevTools is open. Close it and try again. Large code files may run slower.

### Issue: Copy link button doesn't work
- **Solution**: Some browsers require HTTPS for clipboard access. This should work on localhost.

## Success Criteria

✅ **The website is considered fully functional when:**

1. All 40+ Node.js modules can be browsed and read
2. Search finds relevant content instantly
3. Code executor runs JavaScript safely in sandbox
4. All 7 mock modules (fs, path, util, events, http, crypto, buffer) work
5. Syntax highlighting colors code in real-time
6. Console output shows with proper colors and formatting
7. Responsive design works on all screen sizes
8. No console errors in DevTools
9. Performance is smooth (no lag)
10. User can complete a full workflow: Read → Search → Try Code → Modify → Run → See Results
