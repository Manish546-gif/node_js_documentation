import { useEffect, useMemo, useRef, useState } from 'react'
import { marked } from 'marked'
import './App.css'
import CodeExecutor from './CodeExecutor'
import AIChat from './AIChat'

const DOCS_BASE = '/docs'

const titleFromSlug = (slug) =>
  slug
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

const extractTitle = (markdown, fallback) => {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match?.[1]?.trim() || fallback
}

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

const createSlugger = () => {
  const seen = new Map()
  return (value) => {
    const base = slugify(value)
    const count = seen.get(base) || 0
    seen.set(base, count + 1)
    return count === 0 ? base : `${base}-${count}`
  }
}

const renderMarkdown = (markdown) => {
  const slugger = createSlugger()
  const renderer = new marked.Renderer()

  renderer.heading = (text, level, raw) => {
    const id = slugger(raw)
    return `
      <h${level} id="${id}" class="doc-heading">
        <span class="heading-text">${text}</span>
        <button class="heading-anchor" data-id="${id}" aria-label="Copy link to ${text}">#</button>
      </h${level}>
    `
  }

  return marked.parse(markdown, {
    renderer,
    mangle: false,
    headerIds: true,
    gfm: true,
    breaks: false,
  })
}

const getHeadings = (markdown) => {
  const tokens = marked.lexer(markdown)
  const slugger = createSlugger()
  return tokens
    .filter((token) => token.type === 'heading' && token.depth <= 3)
    .map((token) => ({
      depth: token.depth,
      text: token.text,
      id: slugger(token.text),
    }))
}

const stripMarkdown = (markdown) =>
  markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/[#>*_~\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

function App() {
  const [toc, setToc] = useState([])
  const [currentSlug, setCurrentSlug] = useState('')
  const [docCache, setDocCache] = useState({})
  const [docHtml, setDocHtml] = useState('')
  const [docTitle, setDocTitle] = useState('')
  const [docHeadings, setDocHeadings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [searchIndex, setSearchIndex] = useState([])
  const [showExecutor, setShowExecutor] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    const loadToc = async () => {
      try {
        const response = await fetch(`${DOCS_BASE}/toc.json`)
        if (!response.ok) {
          throw new Error('Unable to load table of contents.')
        }
        const data = await response.json()
        setToc(data)

        const params = new URLSearchParams(window.location.search)
        const paramSlug = params.get('doc')
        const storedSlug = window.localStorage.getItem('node-docs:last')
        const initial = data.includes(paramSlug)
          ? paramSlug
          : data.includes(storedSlug)
            ? storedSlug
            : data[0]
        setCurrentSlug(initial)
      } catch (err) {
        setError(err.message)
        setIsLoading(false)
      }
    }

    loadToc()
  }, [])

  useEffect(() => {
    const loadSearchIndex = async () => {
      try {
        const response = await fetch(`${DOCS_BASE}/search-index.json`)
        if (!response.ok) return
        const data = await response.json()
        setSearchIndex(data)
      } catch {
        // Ignore index loading errors and fall back to on-demand search.
      }
    }

    loadSearchIndex()
  }, [])

  useEffect(() => {
    if (!currentSlug) return

    const loadDoc = async () => {
      setIsLoading(true)
      setError('')
      const url = new URL(window.location.href)
      url.searchParams.set('doc', currentSlug)
      window.history.replaceState({}, '', url)
      window.localStorage.setItem('node-docs:last', currentSlug)

      if (docCache[currentSlug]) {
        const cached = docCache[currentSlug]
        setDocHtml(cached.html)
        setDocTitle(cached.title)
        setDocHeadings(cached.headings)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`${DOCS_BASE}/${currentSlug}.md`)
        if (!response.ok) {
          throw new Error('Unable to load documentation content.')
        }

        const markdown = await response.text()
        const title = extractTitle(markdown, titleFromSlug(currentSlug))
        const html = renderMarkdown(markdown)
        const headings = getHeadings(markdown)

        setDocCache((prev) => ({
          ...prev,
          [currentSlug]: { markdown, title, html, headings },
        }))
        setDocHtml(html)
        setDocTitle(title)
        setDocHeadings(headings)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadDoc()
  }, [currentSlug, docCache])

  const ensureAllDocs = async () => {
    const missing = toc.filter((slug) => !docCache[slug])
    if (missing.length === 0) return

    for (const slug of missing) {
      try {
        const response = await fetch(`${DOCS_BASE}/${slug}.md`)
        if (!response.ok) continue
        const markdown = await response.text()
        const title = extractTitle(markdown, titleFromSlug(slug))
        const html = renderMarkdown(markdown)
        const headings = getHeadings(markdown)
        setDocCache((prev) => ({
          ...prev,
          [slug]: { markdown, title, html, headings },
        }))
      } catch {
        // Ignore individual failures.
      }
    }
  }

  useEffect(() => {
    const performSearch = async () => {
      const trimmed = query.trim()
      if (trimmed.length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      const needle = trimmed.toLowerCase()
      let results = []

      if (searchIndex.length > 0) {
        results = searchIndex
          .map((entry) => {
            const haystack = `${entry.title}\n${entry.content}`
            const index = haystack.toLowerCase().indexOf(needle)
            if (index === -1) return null
            return {
              slug: entry.slug,
              title: entry.title,
              snippet: haystack.slice(Math.max(0, index - 80), index + 120),
            }
          })
          .filter(Boolean)
          .slice(0, 25)
      } else {
        await ensureAllDocs()
        results = toc
          .map((slug) => {
            const cached = docCache[slug]
            if (!cached) return null
            const haystack = `${cached.title}\n${stripMarkdown(cached.markdown)}`
            const index = haystack.toLowerCase().indexOf(needle)
            if (index === -1) return null
            return {
              slug,
              title: cached.title,
              snippet: haystack.slice(Math.max(0, index - 80), index + 120),
            }
          })
          .filter(Boolean)
          .slice(0, 25)
      }

      setSearchResults(results)
      setIsSearching(false)
    }

    performSearch()
  }, [query, toc, docCache])

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (ticking) return
      ticking = true

      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY
        const height = document.documentElement.scrollHeight - window.innerHeight
        const progress = height > 0 ? Math.min(scrollTop / height, 1) : 0
        setScrollProgress(progress)
        setShowBackToTop(scrollTop > 300)
        ticking = false
      })
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const container = contentRef.current
    if (!container) return

    const handleClick = async (event) => {
      const button = event.target.closest('.heading-anchor')
      if (!button) return
      const id = button.getAttribute('data-id')
      if (!id) return
      const url = new URL(window.location.href)
      url.hash = id

      try {
        await navigator.clipboard.writeText(url.toString())
      } catch {
        const temp = document.createElement('input')
        temp.value = url.toString()
        document.body.appendChild(temp)
        temp.select()
        document.execCommand('copy')
        document.body.removeChild(temp)
      }

      button.classList.add('copied')
      window.history.replaceState({}, '', url)
      window.location.hash = id
      setTimeout(() => button.classList.remove('copied'), 1200)
    }

    container.addEventListener('click', handleClick)
    return () => container.removeEventListener('click', handleClick)
  }, [docHtml])

  const sidebarItems = useMemo(() => {
    return toc.map((slug) => ({
      slug,
      title: docCache[slug]?.title || titleFromSlug(slug),
    }))
  }, [toc, docCache])

  const currentIndex = toc.indexOf(currentSlug)
  const previousSlug = currentIndex > 0 ? toc[currentIndex - 1] : null
  const nextSlug = currentIndex >= 0 && currentIndex < toc.length - 1
    ? toc[currentIndex + 1]
    : null

  return (
    <div className="app-shell">
      <div className="progress-bar" style={{ width: `${scrollProgress * 100}%` }} />
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div>
            <p className="eyebrow">Node.js Documentation</p>
            <h1>Personal Library</h1>
          </div>
        </div>

        <div className="search-panel">
          <label htmlFor="search" className="search-label">
            Search
          </label>
          <input
            id="search"
            type="search"
            placeholder="Search the docs"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query.trim().length >= 2 && (
            <div className="search-status">
              {isSearching ? 'Indexing…' : `${searchResults.length} results`}
            </div>
          )}
        </div>

        <nav className="nav-list">
          {query.trim().length >= 2 ? (
            <div className="search-results">
              {searchResults.length === 0 && !isSearching && (
                <p className="muted">No results. Try another term.</p>
              )}
              {searchResults.map((result) => (
                <button
                  key={result.slug}
                  className={`nav-item ${result.slug === currentSlug ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentSlug(result.slug)
                    setQuery('')
                    setIsSidebarOpen(false)
                  }}
                >
                  <span>{result.title}</span>
                  <small>{result.snippet}…</small>
                </button>
              ))}
            </div>
          ) : (
            sidebarItems.map((item) => (
              <button
                key={item.slug}
                className={`nav-item ${item.slug === currentSlug ? 'active' : ''}`}
                onClick={() => {
                  setCurrentSlug(item.slug)
                  setIsSidebarOpen(false)
                }}
              >
                {item.title}
              </button>
            ))
          )}
        </nav>
      </aside>

      <main className="content">
        <header className="content-header">
          <div>
            <p className="eyebrow">Node.js Manual</p>
            <h2>{docTitle || 'Loading…'}</h2>
          </div>
          <div className="content-actions">
            <button
              className="ghost"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
            >
              {isSidebarOpen ? 'Close menu' : 'Open menu'}
            </button>
            <button className="ghost" onClick={() => window.print()}>
              Print
            </button>
            <button
              className="ghost"
              onClick={() => setShowExecutor((prev) => !prev)}
            >
              {showExecutor ? 'Hide' : 'Try Code'}
            </button>
          </div>
        </header>

        {error && (
          <div className="alert">
            <strong>Something went wrong.</strong>
            <p>{error}</p>
          </div>
        )}

        {isLoading && !error ? (
          <div className="loading">Loading documentation…</div>
        ) : (
          <>
            <article
              ref={contentRef}
              className="doc-body"
              dangerouslySetInnerHTML={{ __html: docHtml }}
            />
          </>
        )}

        <footer className="doc-footer">
          <div className="nav-buttons">
            <button
              className="ghost"
              disabled={!previousSlug}
              onClick={() => previousSlug && setCurrentSlug(previousSlug)}
            >
              Previous
            </button>
            <button
              className="ghost"
              disabled={!nextSlug}
              onClick={() => nextSlug && setCurrentSlug(nextSlug)}
            >
              Next
            </button>
          </div>
          <p className="muted">Saved locally · Last opened section remembers your place.</p>
        </footer>
      </main>

      <aside className="toc">
        <div className="toc-card">
          <h3>On this page</h3>
          {docHeadings.length === 0 ? (
            <p className="muted">No headings available.</p>
          ) : (
            <ul>
              {docHeadings.map((heading) => (
                <li key={heading.id} className={`depth-${heading.depth}`}>
                  <a href={`#${heading.id}`}>
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {showBackToTop && (
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Back to top
        </button>
      )}

      <CodeExecutor isOpen={showExecutor} onClose={() => setShowExecutor(false)} />
      <AIChat />
    </div>
  )
}

export default App
