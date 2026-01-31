// AI Code Correction Module

export const CodeCorrector = {
  // Analyze code for errors
  analyzeCode: (code) => {
    const errors = []

    // Check for common syntax errors
    if (!code.includes('var') && !code.includes('let') && !code.includes('const') && code.includes('=')) {
      errors.push({
        type: 'warning',
        message: 'Variable declaration keyword missing. Use var, let, or const',
        suggestion: 'var ' + code.split('\n')[0],
      })
    }

    // Check for missing semicolons
    const lines = code.split('\n')
    lines.forEach((line, idx) => {
      const trimmedLine = line.trim()
      if (
        trimmedLine &&
        !trimmedLine.endsWith(';') &&
        !trimmedLine.endsWith('{') &&
        !trimmedLine.endsWith('}') &&
        !trimmedLine.endsWith(',') &&
        !trimmedLine.endsWith('(') &&
        !trimmedLine.startsWith('//')
      ) {
        if (trimmedLine.includes('=') || trimmedLine.includes('console')) {
          errors.push({
            type: 'warning',
            line: idx + 1,
            message: `Line ${idx + 1}: Missing semicolon at end of statement`,
            suggestion: trimmedLine + ';',
          })
        }
      }
    })

    // Check for unmatched brackets
    const brackets = { '(': ')', '{': '}', '[': ']' }
    const stack = []
    for (let char of code) {
      if (brackets[char]) {
        stack.push(char)
      } else if (Object.values(brackets).includes(char)) {
        const lastOpen = stack.pop()
        if (brackets[lastOpen] !== char) {
          errors.push({
            type: 'error',
            message: 'Unmatched brackets detected',
          })
        }
      }
    }

    // Check for common typos
    const commonTypos = {
      'cosnole': 'console',
      'functino': 'function',
      'retrun': 'return',
      'varialbe': 'variable',
      'requre': 'require',
      'callbakc': 'callback',
    }

    for (const [typo, correct] of Object.entries(commonTypos)) {
      if (code.toLowerCase().includes(typo)) {
        errors.push({
          type: 'error',
          message: `Typo detected: "${typo}" should be "${correct}"`,
          suggestion: code.replace(new RegExp(typo, 'gi'), correct),
        })
      }
    }

    return errors
  },

  // Auto-correct code
  autoCorrect: (code) => {
    let corrected = code

    // Fix common typos
    const typos = {
      'cosnole': 'console',
      'functino': 'function',
      'retrun': 'return',
      'requre': 'require',
      'callbakc': 'callback',
    }

    for (const [typo, correct] of Object.entries(typos)) {
      corrected = corrected.replace(new RegExp(typo, 'gi'), correct)
    }

    // Add missing semicolons
    const lines = corrected.split('\n')
    corrected = lines
      .map((line) => {
        const trimmed = line.trim()
        if (
          trimmed &&
          !trimmed.endsWith(';') &&
          !trimmed.endsWith('{') &&
          !trimmed.endsWith('}') &&
          !trimmed.endsWith(',') &&
          !trimmed.endsWith('(') &&
          !trimmed.startsWith('//')
        ) {
          if (trimmed.includes('=') || trimmed.includes('console')) {
            return line + ';'
          }
        }
        return line
      })
      .join('\n')

    // Normalize spacing around operators
    corrected = corrected
      .replace(/(\w)(\+|-|\*|\/|=)(\w)/g, '$1 $2 $3') // Add spaces around operators
      .replace(/\s+/g, ' ') // Remove extra spaces

    return corrected
  },

  // Get code suggestions
  getSuggestions: (code) => {
    const suggestions = []

    // Check for const vs var
    if (code.includes('var ')) {
      suggestions.push(
        'Consider using "const" or "let" instead of "var" for better scope management'
      )
    }

    // Check for proper callback usage
    if (code.includes('require(\'fs\')') && !code.includes('function')) {
      suggestions.push('Use function callbacks for async fs operations')
    }

    // Check for error handling
    if (code.includes('readFile') && !code.includes('err')) {
      suggestions.push('Always check for errors in callback functions')
    }

    // Check for console.log usage in production
    if (code.split('console.log').length > 5) {
      suggestions.push('Too many console.log statements. Use only for debugging')
    }

    // Check for async patterns
    if (code.includes('setTimeout') && code.includes('var data')) {
      suggestions.push('Consider using promises or async/await for better async handling')
    }

    return suggestions
  },

  // Format code
  formatCode: (code) => {
    let formatted = code

    // Add proper indentation
    let indentLevel = 0
    const lines = formatted.split('\n')
    formatted = lines
      .map((line) => {
        const trimmed = line.trim()

        // Decrease indent for closing brackets
        if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
          indentLevel = Math.max(0, indentLevel - 1)
        }

        let indented = '  '.repeat(indentLevel) + trimmed

        // Increase indent after opening brackets
        if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
          indentLevel++
        }

        return indented
      })
      .join('\n')

    return formatted
  },
}

export default CodeCorrector
