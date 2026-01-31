# Vercel NOT_FOUND Error - Complete Fix & Explanation

## 1. The Fix

I've created a `vercel.json` configuration file that solves the NOT_FOUND error. This file tells Vercel:

1. **Where to build**: Run the build command from the `web` directory
2. **Where the output is**: The built files are in `web/dist`
3. **How to handle routing**: Rewrite all routes to `index.html` (SPA routing)

### What Changed

**Created: `vercel.json`**
```json
{
  "buildCommand": "cd web && npm run build",
  "outputDirectory": "web/dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Alternative Configuration (if deploying from `web/` directory)

If you configure Vercel to use `web/` as the root directory, you can create `web/vercel.json` instead:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

In this case, Vercel will automatically detect the build command from `package.json` and use `dist` as the output directory.

---

## 2. Root Cause Analysis

### What Was Happening vs. What Needed to Happen

**What was happening:**
- When you visited your Vercel deployment, the server tried to find files matching the URL path
- For example, if someone visited `https://your-app.vercel.app/docs/buffer`, Vercel looked for a file at `/docs/buffer` in the build output
- Since this is a Single Page Application (SPA), that file doesn't exist—routing is handled by JavaScript in the browser
- Vercel returned a 404 NOT_FOUND error because it couldn't find the requested resource

**What needed to happen:**
- Vercel should serve `index.html` for ALL routes
- Once `index.html` loads, your React app reads the URL (query parameters in your case: `?doc=buffer`)
- Your JavaScript then fetches the appropriate content and renders it
- This is called "client-side routing" or "SPA routing"

### What Triggered the Error

The error occurred because:

1. **Missing SPA configuration**: Vercel didn't know this was a Single Page Application
2. **No rewrite rules**: Without `vercel.json`, Vercel uses default behavior: try to find a file matching the URL path
3. **Direct URL access**: The error likely appeared when:
   - Someone refreshed the page
   - Someone shared a direct link
   - Someone bookmarked a specific document
   - A search engine tried to crawl a URL

### The Misconception

The common misconception is: "If it works locally, it should work on Vercel." 

**Why this happens:**
- **Local development**: Vite's dev server (`npm run dev`) automatically handles SPA routing—it serves `index.html` for all routes
- **Production**: Vercel needs explicit configuration to know you're using client-side routing

This is a classic "works on my machine" scenario because the development environment and production environment handle routing differently.

---

## 3. Understanding the Concept

### Why This Error Exists

The NOT_FOUND error exists to protect you from:

1. **Accidental broken links**: If you delete a file, the server should return 404, not serve random content
2. **Security**: Prevents serving files that shouldn't be accessible
3. **Explicit routing**: Forces you to be intentional about what routes exist

### The Mental Model

Think of web routing in two categories:

**1. Server-Side Routing (Traditional)**
```
User requests: /about
Server looks for: /about.html or /about/index.html
Server serves: That specific file
```
- Each URL maps to a physical file
- If the file doesn't exist, return 404
- Used by: Traditional websites, Next.js (with file-based routing), PHP sites

**2. Client-Side Routing (SPA)**
```
User requests: /docs/buffer
Server serves: /index.html (always)
Browser loads: index.html
JavaScript reads: URL and decides what to show
JavaScript fetches: Content via API/fetch
JavaScript renders: The appropriate view
```
- All URLs serve the same `index.html`
- JavaScript handles routing after the page loads
- Used by: React SPAs, Vue SPAs, Angular apps

### How This Fits Into the Framework

**Vite (Your Build Tool):**
- Builds your React app into static files in `dist/`
- Creates `index.html` and bundled JavaScript
- Doesn't configure server routing (that's the deployment platform's job)

**Vercel (Your Hosting Platform):**
- Serves the built files
- Needs to know: "Should I look for files matching URLs, or always serve index.html?"
- `vercel.json` is how you tell it: "This is an SPA, always serve index.html"

**React (Your Framework):**
- Handles routing in the browser
- Your app uses query parameters (`?doc=buffer`) instead of path-based routing
- Works perfectly once `index.html` loads

---

## 4. Warning Signs & Prevention

### What to Look For

**Red Flags:**
1. ✅ App works locally but 404s on Vercel
2. ✅ Direct URL access fails (refresh breaks the app)
3. ✅ Sharing links doesn't work
4. ✅ No `vercel.json` or routing configuration
5. ✅ Using a SPA framework (React, Vue, Angular) without routing config

**Code Smells:**
- React app without React Router (or similar) but using URL-based navigation
- Build output directory not configured
- No deployment configuration file

### Similar Mistakes to Avoid

1. **Case Sensitivity Issues**
   - Vercel's filesystem is case-sensitive
   - `Buffer.md` ≠ `buffer.md`
   - **Fix**: Use consistent casing, check your file names

2. **Wrong Build Output Directory**
   - Vite builds to `dist/` by default
   - If you configure a different output, update `vercel.json`
   - **Fix**: Verify `outputDirectory` matches your actual build output

3. **Missing Public Assets**
   - Files in `public/` need to be accessible
   - **Fix**: Ensure `public/` directory is included in build output

4. **API Routes Confusion**
   - If you add API routes later, they need different handling
   - **Fix**: Use Vercel's serverless functions, not rewrites

### Prevention Checklist

Before deploying to Vercel:
- [ ] Create `vercel.json` for SPAs
- [ ] Test direct URL access (refresh the page)
- [ ] Verify build output directory
- [ ] Check that all assets are in `public/` or properly imported
- [ ] Test with a fresh browser (no cache)

---

## 5. Alternatives & Trade-offs

### Option 1: Rewrite All Routes (Current Solution) ✅

**Configuration:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Pros:**
- Simple, one-line configuration
- Works for all SPAs
- Handles all routes automatically

**Cons:**
- Every 404 serves your app (you handle 404s in React)
- Can't have actual 404 pages for missing assets

**Best for:** Pure SPAs, apps where all routing is client-side

---

### Option 2: Conditional Rewrites

**Configuration:**
```json
{
  "rewrites": [
    {
      "source": "/((?!api|_next|static|.*\\..*|favicon.ico).*)",
      "destination": "/index.html"
    }
  ]
}
```

**Pros:**
- Excludes API routes, static assets, etc.
- More precise control
- Real 404s for missing assets

**Cons:**
- More complex regex
- Need to maintain exclusion list

**Best for:** Apps with API routes, mixed static/dynamic content

---

### Option 3: Use React Router with History API

**Change your app to use path-based routing:**
```jsx
// Instead of ?doc=buffer
// Use /docs/buffer
import { BrowserRouter, Routes, Route } from 'react-router-dom'
```

**Pros:**
- Cleaner URLs (`/docs/buffer` vs `?doc=buffer`)
- Better SEO
- Standard React pattern

**Cons:**
- Requires refactoring your app
- Need to install React Router
- More setup

**Best for:** New projects, apps that need SEO

---

### Option 4: Use Next.js (Framework Change)

**Switch to Next.js which handles this automatically:**

**Pros:**
- Automatic routing configuration
- File-based routing
- Built-in optimizations
- Better for SEO

**Cons:**
- Major refactoring required
- Different mental model
- More opinionated framework

**Best for:** Starting a new project, need SSR/SSG

---

## Summary

**The Fix:** Created `vercel.json` with SPA rewrite rules

**The Cause:** Vercel didn't know to serve `index.html` for all routes

**The Concept:** SPAs need server configuration to handle client-side routing

**Prevention:** Always configure routing for SPAs on deployment platforms

**Alternatives:** Multiple valid approaches depending on your needs

Your app should now work correctly on Vercel! 🎉
