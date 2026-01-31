import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const repoRoot = path.resolve(__dirname, '..', '..')
const markdownDir = path.join(repoRoot, 'markdown')
const tocPath = path.join(repoRoot, 'toc.json')
const outputDir = path.join(repoRoot, 'web', 'public', 'docs')

const ensureDir = async (dir) => fs.mkdir(dir, { recursive: true })

const extractTitle = (markdown, fallback) => {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match?.[1]?.trim() || fallback
}

const stripMarkdown = (markdown) =>
  markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/[#>*_~\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const copyFile = async (src, dest) => {
  await ensureDir(path.dirname(dest))
  await fs.copyFile(src, dest)
}

const run = async () => {
  const tocRaw = await fs.readFile(tocPath, 'utf-8')
  const toc = JSON.parse(tocRaw)

  await fs.rm(outputDir, { recursive: true, force: true })
  await ensureDir(outputDir)

  await copyFile(tocPath, path.join(outputDir, 'toc.json'))

  const missing = []
  const searchIndex = []

  for (const slug of toc) {
    const source = path.join(markdownDir, `${slug}.markdown`)
    const target = path.join(outputDir, `${slug}.md`)

    try {
      const markdown = await fs.readFile(source, 'utf-8')
      await copyFile(source, target)

      const title = extractTitle(markdown, slug)
      const content = stripMarkdown(markdown)
      searchIndex.push({ slug, title, content })
    } catch (error) {
      missing.push(slug)
    }
  }

  await fs.writeFile(
    path.join(outputDir, 'search-index.json'),
    JSON.stringify(searchIndex, null, 2),
  )

  if (missing.length > 0) {
    console.warn(`Missing markdown files: ${missing.join(', ')}`)
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
